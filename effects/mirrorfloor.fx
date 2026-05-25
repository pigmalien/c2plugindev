#ifdef GL_ES
precision mediump float;
#endif

// Using only the standard varying that C2 ALWAYS guarantees to declare
varying mediump vec2 vTex;
uniform lowp sampler2D samplerFront;
uniform lowp sampler2D samplerBack;

uniform float mirrorY;
uniform float opacity;

void main(void)
{
    // Standard texture coordinate of the floor object
    vec2 uv = vTex;

    // Flip the Y mapping relative to the mirror line
    vec2 flippedUV = vec2(uv.x, mirrorY - (uv.y - mirrorY));

    // Sample the background layer through the flipped coordinates
    vec4 reflection = texture2D(samplerBack, flippedUV);
    
    // Sample the texture of the floor itself (if you want color tinting)
    vec4 floorColor = texture2D(samplerFront, uv);

    // Mix them safely
    gl_FragColor = mix(floorColor, reflection, opacity * floorColor.a);
}