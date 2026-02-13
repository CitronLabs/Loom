#include <emscripten.h>
#include <stdio.h>

EMSCRIPTEN_KEEPALIVE
int calculate_power(int current) {
    if (current >= 100) {
        return 0; // The JS will see this transition and stop the shake
    }
    return current + 10;
}
