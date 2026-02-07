#include <emscripten.h>

int count = 0;

EMSCRIPTEN_KEEPALIVE
int increment() {
    count++;
    return count;
}
