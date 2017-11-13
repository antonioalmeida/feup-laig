#ifdef GL_ES
precision highp float;
#endif

varying vec4 vFinalColor;

uniform float timeFactor;

void main() {
	gl_FragColor = mix(vFinalColor, vec4(1.0,0.0,0.0,1), timeFactor);
}
