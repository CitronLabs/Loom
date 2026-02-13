export class ButtonController {
    constructor(element, wasm) {
        this.el = element;
        this.wasm = wasm;
        this.power = 0;
    }

    onClick(event) {
        if (this.wasm._calculate_power) {
            const nextPower = this.wasm._calculate_power(this.power);
            
            // Trigger Reset Behavior
            if (this.power === 100 && nextPower === 0) {
                this.handleReset();
            } 
            // Trigger Overload Behavior
            else if (nextPower === 100) {
                this.handleOverload();
            }

            this.power = nextPower;
            this.updateUI();
        }
    }

    handleOverload() {
        this.el.classList.add('shake-active');
        console.log("JS: Critical power level reached!");
    }

    handleReset() {
        this.el.classList.remove('shake-active');
        this.el.style.transform = "scale(1)";
        console.log("JS: Power sequence reset.");
    }

    updateUI() {
        this.el.innerText = this.power === 0 ? "Execute C Logic" : `Power: ${this.power}%`;
        
        if (this.power > 0 && this.power < 100) {
            const scale = 1 + (this.power / 500);
            const hue = this.power * 1.5;
            this.el.style.transform = `scale(${scale})`;
            this.el.style.filter = `hue-rotate(${hue}deg)`;
        }
    }
}
