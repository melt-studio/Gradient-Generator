// import glslCurlNoise from "./glslCurlNoise";
import fbm from './fbm';

const fragmentShader = /* glsl */ `
  varying vec2 vUv;

  uniform float uCount; // number of colors
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
  uniform float uTime;
  uniform float PI;
  uniform float uDuration;
  uniform float uSpeed;
  uniform float uDistortion;
  uniform float uNoise;

  float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
  }

  ${fbm}

  void main() {
    float t = mod(uTime, uDuration) / uDuration;
    float u = t * PI * 2.;
    
    // vec2 vUv2 = vUv + sin(vUv.x * 4. + uTime * .5) - cos(-vUv.y * 3. + vUv.x * 0. - uTime * .333);
    // f = sin(length(vUv2) + uTime) * .5 + .5;
    // f += sin(-vUv.x * 4.- vUv.y * 2.+ length(vUv) * sin(uTime * .5) + sin(vUv.y * 4. + uTime * .25) + uTime * .5 + sin(-vUv.x * vUv.y + uTime * .5) * 2.) * .5 + .5;

    // vec2 vUv2 = vUv + sin(vUv.x * 4. + u) - cos(-vUv.y * 3. + vUv.x * 0. - u);
    // f = sin(length(vUv2) + u) * .5 + .5;
    // f += sin(-vUv.x * 4.- vUv.y * 2.+ length(vUv) * sin(u) + sin(vUv.y * 4. + u) + u + sin(-vUv.x * vUv.y + u) * 2.) * .5 + .5;

    // f = fbm(vUv2 * uDistortion * 4. + f, vUv) * .5 + .5;

    vec2 vUv2 = vUv * 2. - 1.;
    vUv2 += (sin(vUv.x * 4. + uTime * .5*uSpeed) - cos(-vUv.y * 3. + vUv.x * 0. - uTime * .333 * uSpeed)) * 0.25;
    // vUv2 *= uDistortion;
    // vUv2 = vUv * uDistortion;
    float f = fbm(vUv2, u);
    f = fbm(vUv2 + f*5. * uDistortion * 2., u);
    // f = fbm(vUv2*2. + f*2.5, vUv, -u);
    f = f*.5+.5;
    // f = sin(length(vUv * 2. - 1. - vec2(.5)) + uTime) + sin(length(vUv * 2. - 1. + vec2(.5)) + uTime);
    // f /= 2.;
    f *= 1. - pow(rand(vUv2 + f), 1.) * (uNoise * 0.5);
    f = clamp(f, 0., 1.);


    // f = pow(f, 4.);
    // f *= uDistortion;

    // f *= 1. - pow(rand(vUv2), 1.) * (uNoise * 0.5);
    // f += (pow(rand(vUv2 * 0.1), 1.)*2.-1.) * (uNoise * 0.25);
    // f /= 2.;
    // f = clamp(f, 0., 1.);

    vec3 colorA = uColor0.rgb;
    float stopA = uColor0.a;
    for (float i = 1.; i < uCount; i++) {
      vec4 cB = uColor1;
      if (i == 2.) cB = uColor2;
      if (i == 3.) cB = uColor3;
      if (i == 4.) cB = uColor4;
      if (i == 5.) cB = uColor5;
      if (i == 6.) cB = uColor6;
      if (i == 7.) cB = uColor7;
      if (i == 8.) cB = uColor8;
      if (i == 9.) cB = uColor9;
      vec3 colorB = cB.rgb;
      float stopB = cB.a;
      float fc = smoothstep(stopA , stopB, f);
      colorA = mix(colorA, colorB, fc);
      stopA = cB.a;
    }
    
    gl_FragColor = vec4(colorA, 1.);
    // gl_FragColor = vec4(vec3(f), 1.);
    // gl_FragColor = vec4(mix(vec3(1., 0., 0.), vec3(0.,0.,1.), sin(u/4.)), 1.);
  }
`;

export default fragmentShader;
