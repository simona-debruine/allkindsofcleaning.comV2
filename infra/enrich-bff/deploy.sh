#!/usr/bin/env bash
# Deploy Amplify enrich BFF (Function URL) and print wiring instructions.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BFF="$(cd "$(dirname "$0")" && pwd)"
cd "$BFF"

export PATH="${HOME}/.local/bin:${PATH}"
REGION="${AWS_REGION:-us-east-1}"
STACK="${STACK_NAME:-allkinds-enrich-bff}"

# Load key from site .env.local if not already in env
if [[ -z "${PROPERTY_ENRICHMENT_API_KEY:-}" && -f "$ROOT/.env.local" ]]; then
  # shellcheck disable=SC1091
  set -a
  # only export enrichment vars
  PROPERTY_ENRICHMENT_URL="$(grep -E '^PROPERTY_ENRICHMENT_URL=' "$ROOT/.env.local" | cut -d= -f2- || true)"
  PROPERTY_ENRICHMENT_API_KEY="$(grep -E '^PROPERTY_ENRICHMENT_API_KEY=' "$ROOT/.env.local" | cut -d= -f2- || true)"
  set +a
fi

PROPERTY_ENRICHMENT_URL="${PROPERTY_ENRICHMENT_URL:-https://9ug42crh6h.execute-api.us-east-1.amazonaws.com/prod}"

if [[ -z "${PROPERTY_ENRICHMENT_API_KEY:-}" ]]; then
  echo "PROPERTY_ENRICHMENT_API_KEY is required (env or $ROOT/.env.local)" >&2
  exit 1
fi

if ! command -v sam >/dev/null 2>&1; then
  echo "sam not found. Install with: pipx install aws-sam-cli" >&2
  exit 1
fi

echo "==> AWS identity"
aws sts get-caller-identity --region "$REGION"

echo "==> sam build"
sam build --template template.yaml --cached

echo "==> sam deploy ($STACK)"
sam deploy \
  --template-file .aws-sam/build/template.yaml \
  --stack-name "$STACK" \
  --region "$REGION" \
  --capabilities CAPABILITY_IAM \
  --resolve-s3 \
  --no-confirm-changeset \
  --no-fail-on-empty-changeset \
  --parameter-overrides \
    "PropertyEnrichmentUrl=${PROPERTY_ENRICHMENT_URL}" \
    "PropertyEnrichmentApiKey=${PROPERTY_ENRICHMENT_API_KEY}" \
  --tags "project=allkindsofcleaning.comV2 service=enrich-bff"

URL="$(aws cloudformation describe-stacks \
  --stack-name "$STACK" \
  --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='FunctionUrl'].OutputValue" \
  --output text)"

# Strip trailing slash for consistency
URL="${URL%/}"

echo
echo "==> Deployed Function URL:"
echo "    $URL"
echo
echo "Wire Amplify (Hosting → Environment variables):"
echo "    VITE_ENRICH_BFF_URL=$URL"
echo
echo "Then trigger a new Amplify build so the SPA picks up the URL."
echo
echo "Optional same-origin rewrite in amplify.yml (before the SPA catch-all):"
echo "  - source: /api/property/enrich"
echo "    target: ${URL}/"
echo "    status: \"200\""
echo
echo "Smoke:"
echo "  curl -s -X POST \"$URL/\" -H 'content-type: application/json' \\"
echo "    -d '{\"address\":\"17228 River Road, Hahnville, LA\",\"parish\":\"st_charles\"}'"
