#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265358979323846

uniform float u_time;
uniform sampler2D u_texture;

float texelSize = 1.0 / 16.0;

varying vec2 vTexCoord;

// All components are in the range [0…1], including hue.
vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

// All components are in the range [0…1], including hue.
vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {

    vec2 coord = (vTexCoord - vec2(1.0 / 18.0, 1.0 / 18.0)) * 72.0 / 64.0;

    vec4 sourceColor = texture2D(u_texture, coord);
	if (coord.x < 0.0 || coord.x >= 1.0 || coord.y < 0.0 || coord.y >= 1.0) {
		sourceColor = vec4(0.0, 0.0, 0.0, 0.0);
	}
    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);
	
	if (sourceColor.w == 0.0) {
		bool foundSolid = false;
		vec2 check[4];
		check[0] = vec2(-texelSize, 0.0);
		check[1] = vec2(texelSize, 0.0);
		check[2] = vec2(0.0, -texelSize);
		check[3] = vec2(0.0, texelSize);
		
		for(int i = 0; i < 4; i++) {
			vec2 pos = coord + check[i];
			vec4 col = texture2D(u_texture, pos);
			if (pos.x < 0.0 || pos.x >= 1.0 || pos.y < 0.0 || pos.y >= 1.0) {
				col = vec4(0.0, 0.0, 0.0, 0.0);
			}
			if (col.w > 0.0) {
				foundSolid = true;
				break;
			}
		}
		if (foundSolid) {
			//color = vec4(1.0, 1.0, sin(u_time * 4.0) * 0.5 + 0.5, 1.0);
			color = vec4(hsv2rgb(vec3((u_time + coord.x + coord.y) / 10.0, 1.0, 1.0)), 1.0);
		}
	} else {
	  color = vec4(hsv2rgb(vec3((u_time + coord.x + coord.y) / 10.0, 1.0, 1.0)), 0.25);
	}

    gl_FragColor = color;
}
