// import glslCurlNoise from "./glslCurlNoise";

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
  uniform float uDistortion;
  uniform float uNoise;

  float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
  }

  //
// Description : Array and textureless GLSL 2D/3D/4D simplex 
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : stegu
//     Lastmod : 20201014 (stegu)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//               https://github.com/stegu/webgl-noise
// 

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+10.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v)
  { 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

// Permutations
  i = mod289(i); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients: 7x7 points over a square, mapped onto an octahedron.
// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 105.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
    float f = 1. - vUv.y;
    f = vUv.x;

    float t = mod(uTime, uDuration) / uDuration;
    float u = t * PI * 2.;
    
    // vec2 vUv2 = vUv + sin(vUv.x * 4. + uTime * .5) - cos(-vUv.y * 3. + vUv.x * 0. - uTime * .333);
    // f = sin(length(vUv2) + uTime) * .5 + .5;
    // f += sin(-vUv.x * 4.- vUv.y * 2.+ length(vUv) * sin(uTime * .5) + sin(vUv.y * 4. + uTime * .25) + uTime * .5 + sin(-vUv.x * vUv.y + uTime * .5) * 2.) * .5 + .5;

    vec2 vUv2 = vUv + sin(vUv.x * 4. + u) - cos(-vUv.y * 3. + vUv.x * 0. - u);
    f = sin(length(vUv2) + u) * .5 + .5;
    f += sin(-vUv.x * 4.- vUv.y * 2.+ length(vUv) * sin(u) + sin(vUv.y * 4. + u) + u + sin(-vUv.x * vUv.y + u) * 2.) * .5 + .5;
    // f *= uDistortion;

    f *= 1. - pow(rand(vUv2), 1.) * uNoise;
    f /= 2.;

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
  }
`;

export default fragmentShader;
