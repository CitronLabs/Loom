import HTMLActionFactory from './button_logic.js';

/**
 * Initializes the button logic by connecting the WASM module
 * to the DOM elements.
 */
export async function initButton() {
    try {
        console.log("🚀 Initializing Button WASM...");
        const Module = await HTMLActionFactory();
        const increment = Module.cwrap('increment', 'number', []);

        const btn = document.getElementById('increment-btn');
        const display = document.getElementById('count-display');

        if (btn && display) {
            btn.addEventListener('click', () => {
                const newCount = increment();
                display.innerText = newCount;
                console.log("New count from C:", newCount);
            });
            console.log("✅ Button logic attached.");
        } else {
            console.warn("⚠️ Button elements not found on this page.");
        }
    } catch (err) {
        console.error("❌ Failed to initialize Button component:", err);
    }
}
