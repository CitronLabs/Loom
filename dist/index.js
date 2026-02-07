// Import the component logic from the file copied by dev.js
import { initButton } from './button.js';

/**
 * Main entry point for the Home page
 */
async function main() {
    console.log("🌐 Home page script loaded.");

    // Initialize the button component
    await initButton();
}

// Run the page logic
main();
