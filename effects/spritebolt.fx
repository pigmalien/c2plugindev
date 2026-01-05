// Sprite Bolt Effect (GLSL version 6)
// by Gemini

precision mediump float;
precision mediump int;

// --- Uniforms ---
uniform float boltWidth;
uniform float wonkiness;
uniform float boltColorR;
uniform float boltColorG;
uniform float boltColorB;
uniform float boltColorA;

// --- Built-in variables (from rainbowshimmer.fx) ---
uniform lowp sampler2D samplerFront;
varying mediump vec2 vTex;
uniform mediump float seconds;

// --- Simplex Noise (from web search, Ashima Arts & Stefan Gustavson) ---
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x*34.0)+1.0)*x);
}

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m;
  m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x           + h.x  * x0.y;
  g.yz = a0.yz * x12.xz         + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// --- Fractal Brownian Motion (fBm) ---
float fbm_noise(vec2 v) {
    float f = 0.0;
    f += 0.5000 * snoise(v); v = v * 2.02;
    f += 0.2500 * snoise(v); v = v * 2.03;
    f += 0.1250 * snoise(v); v = v * 2.01;
    f += 0.0625 * snoise(v);
    return f / 0.9375; // Normalize to [-1, 1]
}


// --- Main Shader ---
void main()
{
	// Get texture color
	vec4 original_color = texture2D(samplerFront, vTex);

	// Bolt properties (hardcoded to center)
	vec2 start_pos = vec2(0.5, 0.0);
	vec2 end_pos = vec2(0.5, 1.0);
	vec4 bolt_color = vec4(boltColorR, boltColorG, boltColorB, boltColorA);

	// Vector from start to end
	vec2 bolt_vec = end_pos - start_pos;
	float bolt_length = length(bolt_vec);
	vec2 bolt_dir = normalize(bolt_vec);

	// Vector from start to current pixel
	vec2 pixel_vec = vTex - start_pos;

	// Project pixel_vec onto bolt_vec to find the closest point on the infinite line
	float projection = dot(pixel_vec, bolt_dir);
	
	// Clamp the projection to the line segment
	projection = clamp(projection, 0.0, bolt_length);
	
	vec2 closest_point = start_pos + bolt_dir * projection;

	// --- Noise-based displacement ---
	// Perpendicular direction for displacement
	vec2 perpendicular_dir = vec2(-bolt_dir.y, bolt_dir.x);

	// Noise input based on position along the bolt and time
    float noise_coord = projection / bolt_length;
    float noise_val = fbm_noise(vec2(noise_coord * 8.0, seconds * 3.0)); // Increased frequency and speed

	// Displace the line using the 'wonkiness' parameter
    vec2 displaced_point = closest_point + perpendicular_dir * noise_val * wonkiness;

	// Calculate distance from pixel to the displaced line
	float dist_to_line = distance(vTex, displaced_point);

	// --- Final color calculation ---
	float bolt_intensity = 1.0 - smoothstep(0.0, boltWidth, dist_to_line);

	// Add a core glow
	float core_width = boltWidth * 0.3;
	float core_intensity = 1.0 - smoothstep(0.0, core_width, dist_to_line);
	
	// Combine base bolt and core glow
	vec4 final_bolt_color = bolt_color * bolt_intensity + vec4(1.0, 1.0, 1.0, 1.0) * core_intensity;
	
	// Mix with original texture color, but only if the original pixel was not transparent
    gl_FragColor = original_color.a == 0.0 ? vec4(0.0, 0.0, 0.0, 0.0) : mix(original_color, final_bolt_color, final_bolt_color.a);
}