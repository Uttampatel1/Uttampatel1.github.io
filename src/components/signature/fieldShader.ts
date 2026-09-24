// Procedural "signal field": topographic isolines of a slowly evolving noise surface.
// The pointer adds a smooth probe bump the contours bend around; its height shifts the
// contour level (the scrub). Reconstruction starts as raw noise and resolves into lines.

export const vertex = /* glsl */ `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

export const fragment = /* glsl */ `
#extension GL_OES_standard_derivatives : enable
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform float uRecon;     // 0 = raw noise, 1 = resolved field
uniform float uLevel;     // contour offset, driven by pointer height / scroll
uniform float uContrast;  // from the W/L dial
uniform vec3 uProbe;      // xy: pointer in px (GL coords), z: strength 0..1
uniform float uMobile;
uniform vec3 uFg;
uniform vec3 uAccent;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float noise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
                 mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                 mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p) {
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 4; i++) { s += a * noise(p); p *= 2.02; a *= 0.5; }
  return s;
}
float h21(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
// smoothstep with reversed edges is undefined in GLSL ES; this handles both directions
float sstep(float a, float b, float x) {
  float t = clamp((x - a) / (b - a), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

void main() {
  vec2 p = gl_FragCoord.xy / uRes.y;
  vec2 probe = uProbe.xy / uRes.y;
  vec2 d = p - probe;
  float bump = uProbe.z * exp(-dot(d, d) / 0.018) * 0.32;

  float h = fbm(vec3(p * 1.7, uTime * 0.025)) + bump + uLevel;

  float bands = h * 16.0;
  float f = fract(bands);
  float w = fwidth(bands) * 1.1;
  float line = 1.0 - sstep(0.0, w, min(f, 1.0 - f));
  float fm = fract(bands / 5.0);
  float wm = fwidth(bands / 5.0) * 1.6;
  float major = 1.0 - sstep(0.0, wm, min(fm, 1.0 - fm));

  // the field sits to the right on desktop so the name stays clean; softer everywhere on mobile
  float x = gl_FragCoord.x / uRes.x;
  float mask = mix(sstep(0.18, 0.62, x), 0.55, uMobile);
  float a = (line * 0.2 + major * 0.3) * (0.7 + uContrast * 0.6) * mask;

  // near the probe the lines pick up the accent and brighten
  float near = exp(-dot(d, d) / 0.03) * uProbe.z;
  vec3 col = mix(uFg, uAccent, near);
  a += (line + major) * near * 0.35;

  // reconstruction from noise
  float grain = h21(gl_FragCoord.xy + fract(uTime) * 97.0);
  float r = sstep(0.0, 1.0, uRecon);
  a = mix(grain * 0.22 * mask, a, r);
  col = mix(uFg, col, r);

  gl_FragColor = vec4(col * a, a);
}
`
