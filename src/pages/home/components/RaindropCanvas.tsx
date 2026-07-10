import { useEffect, useRef } from "react";

/* ------------------------------------------------------------------ */
/*  Vertex shader (shared, fullscreen quad)                            */
/* ------------------------------------------------------------------ */
const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

/* ------------------------------------------------------------------ */
/*  Mask update shader: fades previous mask, paints a stroke segment   */
/*  red channel: 0 = dirty (rain visible)  1 = clean (wiped)           */
/* ------------------------------------------------------------------ */
const MASK_FRAGMENT = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;

uniform sampler2D uPrev;
uniform vec2  uBrushStart;   // UV space [0,1], Y-up
uniform vec2  uBrushEnd;
uniform float uBrushRadius;  // UV space
uniform float uFade;         // per-frame multiplier (e.g. 0.997)
uniform float uHasBrush;     // 0 or 1
uniform float uAspect;       // width/height -> circular brush

float segDist(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float denom = max(dot(ba, ba), 1e-6);
  float h = clamp(dot(pa, ba) / denom, 0.0, 1.0);
  return length(pa - ba * h);
}

void main() {
  float mask = texture(uPrev, v_uv).r;
  mask *= uFade;

  if (uHasBrush > 0.5) {
    // correct aspect ratio so the brush stays circular on screen
    vec2 p  = vec2(v_uv.x * uAspect, v_uv.y);
    vec2 a  = vec2(uBrushStart.x * uAspect, uBrushStart.y);
    vec2 b  = vec2(uBrushEnd.x   * uAspect, uBrushEnd.y);
    float d = segDist(p, a, b);
    // wide soft falloff: core is fully clean, outer ring fades smoothly
    float paint = smoothstep(uBrushRadius, uBrushRadius * 0.25, d);
    mask = max(mask, paint);
  }

  outColor = vec4(mask, 0.0, 0.0, 1.0);
}
`;

/* ------------------------------------------------------------------ */
/*  Main rain shader. Based on "Heartfelt" by Martijn Steinrucken      */
/*  (BigWings) - shadertoy.com/view/ltffzl                             */
/* ------------------------------------------------------------------ */
const RAIN_FRAGMENT = `#version 300 es
precision highp float;
in  vec2 v_uv;
out vec4 fragColor;

uniform vec2  iResolution;
uniform float iTime;
uniform sampler2D iChannel0;   // background
uniform sampler2D uWipeMask;   // wipe mask

#define S(a, b, t) smoothstep(a, b, t)

vec3 N13(float p) {
  vec3 p3 = fract(vec3(p) * vec3(0.1031, 0.11369, 0.13787));
  p3 += dot(p3, p3.yzx + 19.19);
  return fract(vec3((p3.x + p3.y) * p3.z,
                    (p3.x + p3.z) * p3.y,
                    (p3.y + p3.z) * p3.x));
}

float N(float t) { return fract(sin(t * 12345.564) * 7658.76); }

float Saw(float b, float t) { return S(0.0, b, t) * S(1.0, b, t); }

// smooth 2D value noise -- bilinearly interpolated, no visible cells
float hash2(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  // smoothstep curve -> smooth bilinear interpolation
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash2(i);
  float b = hash2(i + vec2(1.0, 0.0));
  float c = hash2(i + vec2(0.0, 1.0));
  float d = hash2(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
// 3-octave fbm built on the smooth noise
float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 3; i++) {
    v += valueNoise(p) * amp;
    p *= 2.0;
    amp *= 0.5;
  }
  return v;
}

vec2 DropLayer2(vec2 uv, float t, float seed) {
  vec2 UV = uv;

  // per-layer base speed varies, plus tiny per-column speed jitter
  vec2 a = vec2(7.5, 1.0);
  vec2 grid = a * 2.0;

  // randomize per column so different columns of drops fall at different rates
  float colId = floor(uv.x * grid.x);
  float colSpeed = 0.7 + N(colId * 13.37 + seed * 5.5) * 0.9; // 0.7 .. 1.6
  uv.y += t * 0.65 * colSpeed;

  vec2 id = floor(uv * grid);

  // per-column horizontal shuffle (so drops in adjacent columns aren't aligned)
  float colShift = N(id.x + seed * 91.3);
  uv.y += colShift;

  id = floor(uv * grid);
  vec3 n  = N13(id.x * 35.2 + id.y * 2376.1 + seed * 17.0);
  vec3 n2 = N13(id.x * 91.7 + id.y * 521.3  + seed * 41.0);
  vec2 st = fract(uv * grid) - vec2(0.5, 0.0);

  // some cells just don't spawn a drop — makes the field feel sparser & less grid-like
  float exists = step(0.22, n2.y);

  float x = n.x - 0.5;

  // gentle horizontal wiggle (drops trickling down glass) — reduced so gravity dominates
  float y = UV.y * 20.0;
  float wiggle = sin(y + sin(y));
  // wiggle strength varies per drop so some drops trickle straight, others meander
  float wiggleAmt = 0.2 + n2.x * 0.6;
  x += wiggle * (0.5 - abs(x)) * (n.z - 0.5) * wiggleAmt;
  x *= 0.5;

  // per-drop speed offset so drops within the same cell don't all peak together
  float ti = fract(t + n.z + n2.z * 0.7);
  // Saw curve makes each drop start near the top and slide downward over time
  y = (Saw(0.85, ti) - 0.5) * 0.9 + 0.5;
  vec2 p = vec2(x, y);

  // per-drop size: a mix of small beads and bigger droplets
  float size = 0.18 + n2.x * 0.22;            // 0.18 .. 0.40
  // teardrop squish: as the drop slides faster, it stretches a bit vertically
  float speedNow = abs(0.5 - ti) * 2.0;       // 0 at extremes, 1 mid-slide
  float squish = mix(1.0, 0.6, speedNow * n2.y); // taller when sliding
  vec2 ellip = vec2(1.0, squish);

  float d = length((st - p) * a.yx * ellip);
  float mainDrop = S(size, 0.0, d) * exists;

  float r = sqrt(S(1.0, y, st.y));
  float cd = abs(st.x - x);
  // trail width varies per drop
  float trailWidth = (0.18 + n2.z * 0.12) * r;
  float trail = S(trailWidth, trailWidth * 0.65, cd);
  float trailFront = S(-0.02, 0.02, st.y - y);
  trail *= trailFront * r * r * exists;

  // little residual droplets left behind in the trail — randomize their density
  y = UV.y;
  float trail2 = S(0.2 * r, 0.0, cd);
  float droplets = max(0.0, (sin(y * (1.0 - y) * (90.0 + n2.z * 80.0)) - st.y))
                   * trail2 * trailFront * n.z;
  y = fract(y * (8.0 + n2.x * 6.0)) + (st.y - 0.5);
  float dd = length(st - vec2(x, y));
  droplets = S(0.3, 0.0, dd) * exists;
  float m = mainDrop + droplets * r * trailFront;

  return vec2(m, trail);
}

float StaticDrops(vec2 uv, float t) {
  // give the stuck droplets a slow gravity drift so they trickle downward too
  uv.y += t * 0.18;
  uv *= 55.0;
  vec2 id = floor(uv);
  uv = fract(uv) - 0.5;
  vec3 n  = N13(id.x * 107.45 + id.y * 3543.654);
  vec3 n2 = N13(id.x * 17.31  + id.y * 88.97);

  // a small per-droplet vertical drift on top of the layer drift
  vec2 p = (n.xy - 0.5) * 0.7;
  p.y -= 0.15 * fract(t * (0.3 + n2.x * 0.4) + n.z);

  // per-droplet size & elongation — some are round, some are tiny, some elongated
  float sizeR = 0.18 + n2.y * 0.18;          // 0.18 .. 0.36
  vec2  ellip = vec2(1.0, 0.8 + n2.z * 0.7); // round vs slightly stretched
  float d = length((uv - p) * ellip);

  // not every cell has a droplet — makes the pattern look more natural
  float exists = step(0.32, n2.x);

  float fade = Saw(0.025, fract(t + n.z));
  float c = S(sizeR, 0.0, d) * fract(n.z * 10.0) * fade * exists;
  return c;
}

vec2 Drops(vec2 uv, float t, float l0, float l1, float l2) {
  float s = StaticDrops(uv, t) * l0;
  // three sliding layers at different scales + seeds so the field never repeats
  vec2 m1 = DropLayer2(uv,         t, 0.0) * l1;
  vec2 m2 = DropLayer2(uv * 1.85,  t, 7.3) * l2;
  vec2 m3 = DropLayer2(uv * 0.65 + vec2(0.31, 0.0), t, 21.7) * l1 * 0.65;

  float c = s + m1.x + m2.x + m3.x;
  c = S(0.3, 1.0, c);

  return vec2(c, max(max(m1.y * l0, m2.y * l1), m3.y * l0));
}

void main() {
  vec2 fragCoord = gl_FragCoord.xy;
  vec2 uv = (fragCoord - 0.5 * iResolution) / iResolution.y;
  vec2 UV = fragCoord / iResolution;

  float T = iTime;
  float t = T * 0.14;

  // lighter overall rain: lower base + smaller oscillation
  float rainAmount = sin(T * 0.05) * 0.15 + 0.45;
  float maxBlur = mix(2.5, 5.0, rainAmount);
  float minBlur = 1.5;

  float zoom = -0.5;
  uv *= 0.7 + zoom * 0.3;
  UV = (UV - 0.5) * (0.9 + zoom * 0.1) + 0.5;

  // --- static clean interior view ---
  // The bg image is a wide ~2.4:1 panorama. We map it to screen with the
  // correct aspect (no stretching) for a static, beautiful clean home
  // interior view seen through the glass.
  const float kImgAspect = 2.4;
  float scrAspect = iResolution.x / iResolution.y;
  float xRange = scrAspect / kImgAspect;
  float scrollX = 0.0;
  vec2 bgUV = vec2(UV.x * xRange + scrollX, UV.y);

  float staticDrops = S(-0.5, 1.0, rainAmount) * 2.0;
  float layer1 = S(0.25, 0.75, rainAmount);
  float layer2 = S(0.0, 0.5, rainAmount);

  vec2 c = Drops(uv, t, staticDrops, layer1, layer2);
  vec2 e = vec2(0.001, 0.0);
  float cx = Drops(uv + e,   t, staticDrops, layer1, layer2).x;
  float cy = Drops(uv + e.yx,t, staticDrops, layer1, layer2).x;
  vec2 n = vec2(cx - c.x, cy - c.x);

  // sample wipe mask -- in screen UV
  float wipe = texture(uWipeMask, v_uv).r;
  wipe = clamp(wipe, 0.0, 1.0);

  // suppress drops & their normals in clean areas
  c *= (1.0 - wipe);
  n *= (1.0 - wipe);

  float focus = mix(maxBlur - c.y, minBlur, S(0.1, 0.2, c.x));
  focus = mix(focus, 0.0, wipe);

  vec3 col = textureLod(iChannel0, bgUV + n, focus).rgb;

  // --- atmospheric fog ---
  // smooth, low-frequency fbm so the fog has soft billowing structure -- NO visible cells
  vec2 fogUv = UV * vec2(2.0, 1.4) + vec2(T * 0.012, T * -0.006);
  float fogNoise = fbm(fogUv * 1.8);

  // denser fog near the top of the frame, lighter near the bottom
  float fogGrad = smoothstep(0.0, 1.0, 1.0 - UV.y) * 0.6 + 0.55;
  float fogAmount = clamp(fogGrad * (0.75 + fogNoise * 0.7), 0.0, 1.0);

  // fog clears more aggressively where the user wipes
  fogAmount *= mix(1.0, 0.18, wipe);

  // extra blur on the background where fog is denser — makes the scene
  // look soft and washed out, like a real misty atmosphere
  float fogBlur = fogAmount * 4.5;
  vec3 fogCol = textureLod(iChannel0, bgUV + n, focus + fogBlur).rgb;
  // slightly desaturate the foggy sample to feel atmospheric
  float fogLum = dot(fogCol, vec3(0.299, 0.587, 0.114));
  fogCol = mix(fogCol, vec3(fogLum), 0.35);
  col = mix(col, fogCol, clamp(fogAmount * 0.85, 0.0, 1.0));

  // cool, slightly desaturated haze color overlay (the actual mist tint)
  vec3 fogColor = vec3(0.82, 0.86, 0.90);
  col = mix(col, fogColor, fogAmount * 0.45);

  float vig = smoothstep(1.2, 0.4, length(UV - 0.5));
  col *= mix(0.6, 1.0, vig);

  fragColor = vec4(col, 1.0);
}
`;

/* ------------------------------------------------------------------ */
/*  GL helpers                                                         */
/* ------------------------------------------------------------------ */
function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

function link(gl: WebGL2RenderingContext, vs: WebGLShader, fs: WebGLShader) {
  const p = gl.createProgram();
  if (!p) return null;
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(p));
    return null;
  }
  return p;
}

interface FBO {
  fb: WebGLFramebuffer;
  tex: WebGLTexture;
}

function createFBO(gl: WebGL2RenderingContext, w: number, h: number): FBO | null {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  if (!fb || !tex) return null;
  return { fb, tex };
}

/* ------------------------------------------------------------------ */

interface Props {
  backgroundUrl: string;
  className?: string;
}

const BRUSH_RADIUS_UV = 0.13; // ~13% of screen height -> a touch wider, more obvious wipe
const FADE_PER_FRAME = 0.996; // wipe stays visible ~3s, then re-rains

function getMaskSize(width: number) {
  return width < 768 ? 512 : 768;
}

function getMaxDpr(width: number) {
  return width < 768 ? 1.25 : 1.75;
}

export default function RaindropCanvas({ backgroundUrl, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stateRef = useRef({
    curX: -10,
    curY: -10,
    prevX: -10,
    prevY: -10,
    hasInput: 0,
    everMoved: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      antialias: false,
      premultipliedAlpha: false,
      powerPreference: "high-performance",
    });
    if (!gl) {
      console.warn("WebGL2 not supported");
      return;
    }

    /* ---------- programs ---------- */
    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const rainFs = compile(gl, gl.FRAGMENT_SHADER, RAIN_FRAGMENT);
    const maskFs = compile(gl, gl.FRAGMENT_SHADER, MASK_FRAGMENT);
    if (!vs || !rainFs || !maskFs) return;

    const rainProg = link(gl, vs, rainFs);
    const maskProg = link(gl, vs, maskFs);
    if (!rainProg || !maskProg) return;

    /* ---------- fullscreen quad ---------- */
    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const bindQuad = (prog: WebGLProgram) => {
      const loc = gl.getAttribLocation(prog, "a_position");
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    };

    /* ---------- ping-pong mask FBOs ---------- */
    const maskSize = getMaskSize(canvas.clientWidth);
    let fboA = createFBO(gl, maskSize, maskSize);
    let fboB = createFBO(gl, maskSize, maskSize);
    if (!fboA || !fboB) return;

    // clear both to 0 (fully dirty)
    [fboA, fboB].forEach((f) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, f.fb);
      gl.viewport(0, 0, maskSize, maskSize);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    });

    /* ---------- background texture ---------- */
    const bgTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, bgTex);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([18, 18, 28, 255]),
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, bgTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      // horizontal scroll wraps with a mirror so seams are invisible
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    };
    img.src = backgroundUrl;

    /* ---------- uniform locations ---------- */
    const u_rain = {
      res: gl.getUniformLocation(rainProg, "iResolution"),
      time: gl.getUniformLocation(rainProg, "iTime"),
      tex: gl.getUniformLocation(rainProg, "iChannel0"),
      mask: gl.getUniformLocation(rainProg, "uWipeMask"),
    };
    const u_mask = {
      prev: gl.getUniformLocation(maskProg, "uPrev"),
      bStart: gl.getUniformLocation(maskProg, "uBrushStart"),
      bEnd: gl.getUniformLocation(maskProg, "uBrushEnd"),
      bRad: gl.getUniformLocation(maskProg, "uBrushRadius"),
      fade: gl.getUniformLocation(maskProg, "uFade"),
      has: gl.getUniformLocation(maskProg, "uHasBrush"),
      aspect: gl.getUniformLocation(maskProg, "uAspect"),
    };

    /* ---------- sizing ---------- */
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, getMaxDpr(canvas.clientWidth));
      const w = Math.floor(canvas.clientWidth * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    /* ---------- pointer ---------- */
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1 - (e.clientY - rect.top) / rect.height; // Y-up
      const s = stateRef.current;
      if (!s.everMoved) {
        s.prevX = x;
        s.prevY = y;
        s.everMoved = true;
      }
      s.curX = x;
      s.curY = y;
      s.hasInput = 1;
    };
    const onLeave = () => {
      stateRef.current.hasInput = 0;
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    /* ---------- render loop ---------- */
    const start = performance.now();
    let raf = 0;
    let inView = true;
    let tabVisible = !document.hidden;

    const scheduleRender = () => {
      if (raf || !inView || !tabVisible) return;
      raf = requestAnimationFrame(render);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView && tabVisible) {
          scheduleRender();
        } else {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0.05 },
    );
    io.observe(canvas);

    const onVisibility = () => {
      tabVisible = !document.hidden;
      if (tabVisible && inView) {
        scheduleRender();
      } else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const render = () => {
      raf = 0;
      if (!inView || !tabVisible) return;

      const now = performance.now();
      const t = (now - start) / 1000;
      const s = stateRef.current;

      /* --- PASS 1: update wipe mask (read A, write B) --- */
      gl.bindFramebuffer(gl.FRAMEBUFFER, fboB!.fb);
      gl.viewport(0, 0, maskSize, maskSize);
      gl.useProgram(maskProg);
      bindQuad(maskProg);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, fboA!.tex);
      gl.uniform1i(u_mask.prev, 0);

      // brush params in UV space (account for screen aspect so circles stay round)
      const aspect = canvas.clientWidth / Math.max(canvas.clientHeight, 1);
      gl.uniform2f(u_mask.bStart, s.prevX, s.prevY);
      gl.uniform2f(u_mask.bEnd, s.curX, s.curY);
      gl.uniform1f(u_mask.bRad, BRUSH_RADIUS_UV);
      // boost wipe "clarity" by lifting the painted mask toward fully clean
      gl.uniform1f(u_mask.fade, FADE_PER_FRAME);
      gl.uniform1f(u_mask.has, s.hasInput && s.everMoved ? 1 : 0);
      gl.uniform1f(u_mask.aspect, aspect);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // swap so latest mask is in fboA for next frame and for rendering
      const tmp = fboA;
      fboA = fboB;
      fboB = tmp;

      // remember last pointer pos for next segment
      s.prevX = s.curX;
      s.prevY = s.curY;

      /* --- PASS 2: rain to screen --- */
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(rainProg);
      bindQuad(rainProg);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, bgTex);
      gl.uniform1i(u_rain.tex, 0);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, fboA!.tex);
      gl.uniform1i(u_rain.mask, 1);

      gl.uniform2f(u_rain.res, canvas.width, canvas.height);
      gl.uniform1f(u_rain.time, t);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      scheduleRender();
    };
    scheduleRender();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      gl.deleteBuffer(quad);
      gl.deleteTexture(bgTex);
      [fboA, fboB].forEach((f) => {
        if (!f) return;
        gl.deleteFramebuffer(f.fb);
        gl.deleteTexture(f.tex);
      });
      gl.deleteProgram(rainProg);
      gl.deleteProgram(maskProg);
      gl.deleteShader(vs);
      gl.deleteShader(rainFs);
      gl.deleteShader(maskFs);
    };
  }, [backgroundUrl]);

  return <canvas ref={canvasRef} className={className} />;
}