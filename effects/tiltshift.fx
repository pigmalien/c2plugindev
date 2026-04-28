#ifdef GL_ES
precision mediump float;
#endif

varying mediump vec2 vTex;
uniform lowp sampler2D samplerFront;

// Uniforms - MUST match the <uniform> tags in XML
uniform float blurAmount;
uniform float center;
uniform float spread;
uniform float hSpread;

void main(void)
{
    vec2 uv = vTex;
    vec4 color = texture2D(samplerFront, uv);

    // Calculate normalized distances
    // Distances are divided by spread to create the 'threshold' for the blur
    float distY = abs(uv.y - center) / spread;
    float distX = abs(uv.x - 0.5) / hSpread; 

    // Use max() to create a box-shaped focus area
    float maxDist = max(distY, distX);
    
    // Create the blur intensity factor
    // smoothstep(1.0, 2.0...) means anything inside the 'spread' (1.0) is sharp
    float factor = smoothstep(1.0, 2.0, maxDist) * (blurAmount * 0.005);

    // 9-Tap Blur Sampling (Diamond Pattern)
    vec4 sum = color;
    sum += texture2D(samplerFront, uv + vec2(0.0, factor));
    sum += texture2D(samplerFront, uv - vec2(0.0, factor));
    sum += texture2D(samplerFront, uv + vec2(factor * 0.5, factor * 0.5));
    sum += texture2D(samplerFront, uv - vec2(factor * 0.5, factor * 0.5));
    sum += texture2D(samplerFront, uv + vec2(factor, 0.0));
    sum += texture2D(samplerFront, uv - vec2(factor, 0.0));
    sum += texture2D(samplerFront, uv + vec2(factor * 0.5, -factor * 0.5));
    sum += texture2D(samplerFront, uv - vec2(-factor * 0.5, factor * 0.5));

    gl_FragColor = sum / 9.0;
}