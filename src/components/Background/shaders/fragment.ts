export const fragmentShader = /* glsl */ `
  varying vec2 vUv;

  uniform vec4 uResolution;
  uniform float uTime;
  uniform float PI;
  uniform float uColors;
  uniform float uDrips;
  uniform float uSpeed;
  uniform float uGrain;
  uniform float uNoise;
  uniform float uColorMode;
  uniform float uCount;
  uniform vec4 uColor0;
  uniform vec4 uColor1;
  uniform vec4 uColor2;
  uniform vec4 uColor3;
  uniform vec4 uColor4;
  uniform vec4 uColor5;
  uniform vec4 uColor6;
  uniform vec4 uColor7;
  uniform vec4 uColor8;
  uniform vec4 uColor9;
  uniform float uDistortion;

  float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
  }
  
  float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
  }

  float smin(float a, float b, float k) {
    k *= 1.0;
    float r = exp2(-a/k) + exp2(-b/k);
    return -k*log2(r);
  }

  float brightness(vec3 c) {
    return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
  }

  vec3 zuc(float w, float k) {
    float x = (w - 400.) / 300.;
    if (x < 0.) x = 0.;
    if (x > 1.) x = 1.;

    vec4 color = vec4(0.0, 0.0, 0.0, 1.0);

    vec3 cs = vec3(3.54541723, 2.86670055, 2.29421995);
    vec3 xs = vec3(0.69548916, 0.49416934, 0.28269708);
    vec3 ys = vec3(0.02320775, 0.15936245, 0.53520021);
    
    vec3 z = vec3(x - xs[0], x - xs[1], x - xs[2]);

    vec3 z1 = vec3(0.0);
    for (int i = 0; i < 3; i++) {
      z1[i] = cs[i] * z[i];
    }

    z1[0] = cs[1] * z[1];
    z1[1] = cs[2] * z[2];
    z1[2] = cs[0] * z[0];
    
    if (k == 1.) {
      z1[0] = cs[1] * z[0];
      z1[1] = cs[2] * z[1];
      z1[2] = cs[0] * z[2];
    }

    if (k == 2.) {
      z1[0] = cs[0] * z[2];
      z1[1] = cs[2] * z[1];
      z1[2] = cs[1] * z[0];
    }

    vec3 z2 = vec3(0.0);
    for (int i = 0; i < 3; i++) {
      z2[i] = 1. - (z1[i] * z1[i]);
    }

    if (k == 2.) {
      z2[0] = 1. - (z1[1] * z1[0]);
      z2[1] = 1. - (z1[2] * z1[1]);
      z2[2] = 1. - (z1[0] * z1[2]);
    }

    for (int i = 0; i < 3; i++) {
      color[i] = z2[i] - ys[i];
    }

    color[0] = z2[0] - ys[1];
    color[1] = z2[1] - ys[2];
    color[2] = z2[2] - ys[0];

    if (k == 2.) {
      color[0] = z2[2] - ys[1];
      color[1] = z2[0] - ys[2];
      color[2] = z2[1] - ys[0];
    }

    return color.rgb;
  }
  
  void main() {
    vec2 aspectS = vec2(
      uResolution.x > uResolution.y ? uResolution.x / uResolution.y : 1., 
      uResolution.x > uResolution.y ? 1. : uResolution.y / uResolution.x 
    );

    float time = uTime * .2 * uSpeed;

    float ld = 2.;

    float distort = uDistortion;
    distort *= mix(smoothstep(0., 1., 1.-vUv.y), 1., smoothstep(.5, 1., distort));
    distort = smoothstep(0., .5, distort);

    vec2 uv = vUv;

    vec2 vignetteCoords = fract(vUv * vec2(1.0, 1.0));
    float v1 = smoothstep(0.5, 0.2, abs(vignetteCoords.x - 0.5));
    float v2 = smoothstep(0.5, 0.2, abs(vignetteCoords.y - 0.5));
    float vignetteAmount = v1 * v2;
    vignetteAmount = pow(vignetteAmount, 0.5);
    vignetteAmount = map(vignetteAmount, 0.0, 1.0, 0., 1.0);
    float d3 = 1. - vignetteAmount;
    float vf = 1. - smoothstep(.5, 1., 1. - vUv.y);
    d3 = pow(d3, 4.);
    d3 *= mix(vf, 1., smoothstep(.25, .75, uDistortion));

    vec2 p = vUv * 5.;
    for (float i = 0.0; i < 8.; i++) {
      p.x += sin(p.y + i + time * .5);
      p *= mat2(6, -8, 8, 6) / 8.;
      vec2 q = vec2(time, -time / 2.);
      q *= 8. / mat2(6, -8, 8, 6);
      p -= q * .5;
    }

    vec2 p2 = vUv * 5.;
    for (float i = 0.0; i < 8.; i++) {
      p2.x += sin(p2.y + i + time * .5 + 0.2);
      p2 *= mat2(6, -8, 8, 6) / 8.;
      vec2 q = vec2(time, -time / 2.);
      q *= 8. / mat2(6, -8, 8, 6);
      p2 -= q * .5;
    }

    vec3 colx = (sin(vec4(p.y, p2.x, p2.xy) * .6) * .5 + .5).xyz;

    float xx = colx.r;
    
    float d = (((pow(1. - uv.y * 2. + 1., .5))) - (sin(uv.x * PI * 1.5 - PI * .25)));
    float d_ = (((pow(1. - uv.y * 2. + 1., .5))) - (sin(uv.x * PI * 1.)) + sin(uv.x * 3.5 * PI) * .5 + sin(uv.x * 8. * PI) * .25 + sin(uv.x * 15. * PI) * .125);
    d = mix(d, d_, uDrips);
    
    d = mix(d, xx, distort);

    float d2 = length(vUv - .5)  + .75;
    d = smin(d, d2, .2);
    
    d += rand(vUv + d) * .01 * mix(0., 5., uGrain);
    float t = mod(time - d, ld) / ld;
    t = mix(t, xx, distort);

    float wav = t * mix(290., 100., d3) + mix(400., 500., d3);
    vec3 col = zuc(wav, 0.);
    col = mix(col, zuc(wav, 1.), smoothstep(0., .3333, uColors));
    col = mix(col, zuc(wav, 2.), smoothstep(.3333, .6666, uColors));

    float b = sin(t * PI + d3);
    vec3 yellow = vec3(0.8588, 0.9882, 0.3216);
    vec3 gray = vec3(0.7569);
    vec4 pColor0 = vec4(vec3(0.15), 0.);
    vec4 pColor1 = vec4(gray, .6);
    vec4 pColor2 = vec4(yellow, .75);
    vec4 pColor3 = vec4(clamp(yellow * 1.1, 0., 1.), .85);
    vec4 pColor4 = vec4(gray, .9);
    vec4 pColor5 = vec4(yellow, 1.);
    vec3 colorA = pColor0.rgb;
    float stopA = pColor0.a;
    for (float i = 1.; i < 6.; i++) {
      vec4 cB = pColor1;
      if (i == 2.) cB = pColor2;
      if (i == 3.) cB = pColor3;
      if (i == 4.) cB = pColor4;
      if (i == 5.) cB = pColor5;
      vec3 colorB = cB.rgb;
      float stopB = cB.a;
      float fc = smoothstep(stopA, stopB, b);
      colorA = mix(colorA, colorB, fc);
      stopA = cB.a;
    }
    col = mix(col, colorA, smoothstep(.6666, 1., uColors));

    vec3 cColorA = uColor0.rgb;
    float cStopA = uColor0.a;
    for (float i = 1.; i < uCount; i++) {
      vec4 cB = uColor1;
      if (i == 2.) cB = uColor2;
      if (i == 3.) cB = uColor3;
      if (i == 4.) cB = uColor4;
      if (i == 5.) cB = uColor5;
      if (i == 6.) cB = uColor5;
      if (i == 7.) cB = uColor6;
      if (i == 8.) cB = uColor7;
      if (i == 9.) cB = uColor8;
      if (i == 10.) cB = uColor9;
      vec3 colorB = cB.rgb;
      float cStopB = cB.a;
      float fc = smoothstep(cStopA, cStopB, b);
      cColorA = mix(cColorA, colorB, fc);
      cStopA = cB.a;
    }

    col = mix(col, cColorA, uColorMode);

    col += rand(vUv) * .05 * uNoise;

    gl_FragColor = vec4(col, 1.);
  }
`;
