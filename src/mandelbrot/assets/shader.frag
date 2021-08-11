// casey conchinha - @kcconch ( https://github.com/kcconch )
// louise lessel - @louiselessel ( https://github.com/louiselessel )
// more p5.js + shader examples: https://itp-xstory.github.io/p5js-shaders/

#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265358979323846

uniform vec2 u_resolution;
uniform float u_time;
uniform int u_iterations;
uniform float u_threshold;
uniform float u_zoom;
uniform vec2 u_offset;

// this is the same variable we declared in the vertex shader
// we need to declare it here too!
varying vec2 vTexCoord;

float map(float value, float startA, float endA, float startB, float endB) {
    float val = ((value - startA) / (endA - startA));

    return val * (endB - startB) + startB;
}

float mag(float x, float y) {
    return sqrt(x * x + y * y);
}

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

    // copy the vTexCoord
    // vTexCoord is a value that goes from 0.0 - 1.0 depending on the pixels location
    // we can use it to access every pixel on the screen
    vec2 coord = vTexCoord;

    float x0 = map(coord.x, 0.0, 1.0, -u_zoom, u_zoom) + u_offset.x;
    float y0 = map(coord.y, 0.0, 1.0, -u_zoom, u_zoom) + u_offset.y;

    // Now we test, as we iterate z = z^2 + cm does z tend towards infinity?
    float x = 0.0;
    float y = 0.0;
    float x2 = 0.0;
    float y2 = 0.0;
    float n = 0.0;

    float f_iterations = float(u_iterations);
    int i_iterations = int(u_iterations);

//    for(int i = 0; i < 100000; i++)
//    {
//        float aa = x * x;
//        float bb = y * y;
//        float twoab = 2.0 * x * y;
//        x = aa - bb + x0;
//        y = twoab + y0;
//        // Infinty in our finite world is simple, let's just consider it 16
//        if (mag(aa, bb) > u_threshold || i > u_iterations) {
//            break;
//        }
//        n++;
//    }

    for(int i = 0; i < 100000; i++) {
        y = (x + x) * y + y0;
        x = x2 - y2 + x0;
        x2 = x * x;
        y2 = y * y;

        if (x2 + y2 > u_threshold || i > u_iterations) {
            break;
        }

        n++;
    }

    if (n < f_iterations) {
        float log_zn = log(x2 + y2) / 2.0;
        float nu = log(log_zn / log(2.0)) / log(2.0);
        n = n + 1.0 - nu;
    }

    // We color each pixel based on how long it takes to get to infinity
    // If we never got there, let's pick the color black
//    float bright = pow(map(n, 0.0, f_iterations, 0.0, 1.0), 1.0 / 8.0);

    float m = 30.0;
    float hue = map(mod(n, m), 0.0, m, 0.0, 1.0);
    vec3 hsv = vec3(hue, 1.0, 1.0);

    if (n >= f_iterations) {
        hsv = vec3(0.0, 0.0, 0.0);
    }

    vec3 color = hsv2rgb(hsv);
    gl_FragColor = vec4(color, 1.0);
//
//    vec3 color1 = vec3(0.0, 0.0, bright);
//    float bright2 = (bright - 0.5) * 2.0;
//    vec3 color2 = vec3(bright2, bright2, 1.0);
//
//    if (bright < 0.5) {
//        gl_FragColor = vec4(color1, 1.0);
//    } else {
//        gl_FragColor = vec4(color2, 1.0);
//    }
}
