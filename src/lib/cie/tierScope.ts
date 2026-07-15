import type { PricingTier } from "./quote";

/** Stacked scope: each tier includes every task from lighter tiers. */
export const tierScopeTasks = {
  refresh: [
    "Dusting",
    "Kitchen counter & sink tidy",
    "Bathroom counter & sink tidy",
    "Streak free mirrors",
    "Toilet disinfect & shower tidy",
    "Sweep, vacuum & mop floors",
    "Trash removal",
  ],
  standard: [
    "Deep surface sanitizing",
    "Door knobs & wall switch wipe down",
    "Appliance exterior cleaning",
    "Baseboard & trim detail",
    "Ceiling fans & light fixtures",
  ],
  deep: [
    "Inside appliances & cabinets",
    "Grout & tile scrubbing",
    "Behind & under furniture",
    "Blinds & Interior window sills",
  ],
} as const;

const tierOrder: PricingTier[] = ["refresh", "standard", "deep"];

export type ScopedTask = {
  text: string;
  band: PricingTier;
};

/** Full stacked checklist for a selected tier (includes lighter tiers). */
export function getStackedScope(tier: PricingTier): string[] {
  return getStackedScopeItems(tier).map((item) => item.text);
}

/** Stacked checklist with which band each task belongs to (for color coding). */
export function getStackedScopeItems(tier: PricingTier): ScopedTask[] {
  const tasks: ScopedTask[] = [];
  for (const t of tierOrder) {
    for (const text of tierScopeTasks[t]) {
      tasks.push({ text, band: t });
    }
    if (t === tier) break;
  }
  return tasks;
}

export function getIncrementalScope(tier: PricingTier): readonly string[] {
  return tierScopeTasks[tier];
}
