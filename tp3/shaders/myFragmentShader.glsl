#ifdef GL_ES
precision highp float;
#endif

varying vec4 vFinalColor;
varying vec2 vTextureCoord;

uniform sampler2D uSampler;

uniform float timeFactor;

uniform bool uUseTexture;

void main() {
	if (uUseTexture) {
		vec4 textureColor = texture2D(uSampler, vTextureCoord);
		gl_FragColor = textureColor * mix(vFinalColor, vec4(1.0,0.0,0.0,1), timeFactor);
	}
	else
		gl_FragColor = mix(vFinalColor, vec4(1.0,0.0,0.0,1), timeFactor);

}
