import { loadWasmModule } from './wasm_manager.js';
import { HeroController } from './loom_hero.js';
import { ButtonController } from './loom_button.js';
import { DisclosureController } from './loom_disclosures.js';
document.addEventListener('DOMContentLoaded', async () => {
  try {
    document.querySelectorAll('.hero-container').forEach(el => {
      const inst = new HeroController(el);
      el.addEventListener('mousemove', (e) => inst.onMouseMove(e));
    });
  } catch(e) { console.warn('Controller load failed for loom_hero', e); }
  try {
    const loom_button_wasm = await loadWasmModule('loom_button_logic');
    document.querySelectorAll('.loom-button').forEach(el => {
      const inst = new ButtonController(el, loom_button_wasm);
      el.addEventListener('click', (e) => inst.onClick(e));
    });
  } catch(e) { console.warn('Controller load failed for loom_button', e); }
  try {
    document.querySelectorAll('.disclosure-group').forEach(el => {
      const inst = new DisclosureController(el);
    });
  } catch(e) { console.warn('Controller load failed for loom_disclosures', e); }
});