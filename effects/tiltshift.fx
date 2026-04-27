#ifdef GL_ES
precision mediump float;
#endif

varying mediump vec2 vTex;
uniform lowp sampler2D samplerFront;

// Uniforms must match the XML exactly
uniform float blurAmount;
uniform float center;
uniform float spread;
uniform float hSpread;

void main(void)
{
    vec2 uv = vTex;
    vec4 color = texture2D(samplerFront, uv);

    // 1. Calculate distances from the center (0.5, center)
    // We divide by the spread to normalize the distance values
    float distY = abs(uv.y - center) / spread;
    float distX = abs(uv.x - 0.5) / hSpread; 

    // 2. Combine them. max() creates a box shape. 
    // If you used length(vec2(distX, distY)), it would be an oval.
    float maxDist = max(distY, distX);
    
    // 3. Smooth the transition and set intensity
    // 0.005 is a magic number to keep the 9-tap blur from 'splitting'
    float factor = smoothstep(1.0, 2.0, maxDist) * (blurAmount * 0.005);

    // 4. 9-Tap Diamond Blur Sampling
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