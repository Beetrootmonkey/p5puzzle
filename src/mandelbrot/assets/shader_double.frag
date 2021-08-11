// casey conchinha - @kcconch ( https://github.com/kcconch )
// louise lessel - @louiselessel ( https://github.com/louiselessel )
// more p5.js + shader examples: https://itp-xstory.github.io/p5js-shaders/

#ifdef GL_ES
precision highp float;
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

vec2 DoubleAdd( vec2 a, vec2 b) {
    vec2 c;
    c.x = a.x + b.x;
    c.y = a.y + b.y;
    return c;
}

vec2 DoubleMul( vec2 a, vec2 b ) {
    vec2 c;
    // c = a*b
    // (c.y+c.x) = (a.x+a.y)*(b.x+b.y);
    c.y = a.y*b.y; // smallest part
    float l = a.x*b.x; // largest part
    float r = a.x*b.y + a.y*b.x; // part in-between.
    // if we add it to the big, it might lose precision in the middle of the number
    // which would be as bad as a float, so:

    // trying out some ideas to make the "doubles" more robust:

    // try to add it to c.x, and detect how much underflowed to add to c.y
    // I don't expect this will work, because the compiler will optimise it out
    /*c.x = l+r;
    float rf = c.x-l; // the part of r that actually made it after rounding.
    r = r - rf;
    c.y += r;*/
    // note that a.x*b.x already underflows, so using the full precision will make that a more serious problem.
    // => need upper & lower halfs of .x's... uh...

    c.x = l;
    c.y += r;

    /*
    This introduces more errors!
    could try taking the difference between c.x and c.x+r, and that remainder is the value to add to c.y
    // do something more robust, otherwise the vals can both lose too much precision
        float cp = log2(abs(c.x));
        float rp = log2(abs(r));
        const float precis = 20.0;
        if ( rp > cp-precis )
        {
            // chop rp up into 2 bits, put the bigger bits in the top val
            float cut = exp2(cp-precis);
            float r2 = fract(r/cut)*cut;
            c.y += r2;
            c.x += r-r2;
        }
        else
        {
            c.y += r;
        }
    */
    return c;
}

// coord.x, 0.0, 1.0, -u_zoom, u_zoom
float map(float value, float startA, float endA, float startB, float endB) {
    float val = ((value - startA) / (endA - startA));

    return val * (endB - startB) + startB;
}
vec2 map2(float value, float startB, float endB) {
    vec2 vValue = vec2(0.0, value);
    vec2 vStartB = vec2(0.0, startB);
    vec2 vEndB = vec2(0.0, endB);
    return DoubleAdd(DoubleMul(vValue, DoubleAdd(vEndB, -vStartB)), vStartB);
}

//float map(vec2 value, vec2 startA, vec2 endA, vec2 startB, vec2 endB) {
//    float val = DoubleMul((DoubleAdd(value, -startA)), DoubleAdd(endA, -startA));
//
//    return DoubleAdd(DoubleMul(val, DoubleAdd(endB, -startB)) + startB);
//}

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
    vec4 Z = vec4(0), C = vec4(0);
    int n;
    bool ignore = false;

    vec2 x0 = DoubleAdd(map2(coord.x, -u_zoom, u_zoom), vec2(u_offset.x, 0.0));
    vec2 y0 = DoubleAdd(map2(coord.y, -u_zoom, u_zoom), vec2(u_offset.y, 0.0));
    vec4 pixel = vec4(x0.x, y0.x, x0.y, y0.y);
    C = pixel;
    int i_iterations = int(u_iterations);

    for (int i = 0; i < 256; i++) {
        if (ignore)
        break;

        // complex number operations
        // Z = Z*Z + C
        vec4 Z2;
        //Z.x * Z.x - Z.y * Z.y,
        Z2.xz = DoubleMul(Z.xz,Z.xz) - DoubleMul(Z.yw,Z.yw);
        Z2.yw = 2.0*DoubleMul(Z.xz,Z.yw);
        Z = Z2 + C; // apply panning

        // stop immediately if the point is outside a radius of 2 from (0,0) (the bounds of the mandelbrot set)
        //if ( dot((DoubleMul(Z.xz,Z.xz) + DoubleMul(Z.yw,Z.yw)),vec2(1)) > 4.0 ) // smooth
        if ( max(abs(dot(Z.xz,vec2(1))),abs(dot(Z.yw,vec2(1)))) > 2.0 ) // scallops
        ignore = true;

        n = i;
    }

    float m = 30.0;
    float hue = map(mod(float(n), m), 0.0, m, 0.0, 1.0);
    vec3 hsv = vec3(hue, 1.0, 1.0);

    if (n >= i_iterations - 1) {
        hsv = vec3(0.0, 0.0, 0.0);
    }

    vec3 color = hsv2rgb(hsv);
    gl_FragColor = vec4(color, 1.0);
}
