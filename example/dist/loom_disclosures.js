export class DisclosureController {
    constructor(element) {
        this.el = element;
        this.init();
    }

    init() {
        this.el.addEventListener('click', (e) => {
            // Check if we clicked the header or something inside it
            const header = e.target.closest('.accordion-header');
            if (!header) return;

            const targetId = header.getAttribute('data-toggle');
            const targetContent = this.el.querySelector(`#${targetId}`);

            if (targetContent) {
                const isExpanded = header.getAttribute('aria-expanded') === 'true';
                
                // Toggle attributes
                header.setAttribute('aria-expanded', !isExpanded);
                
                // Toggle visibility
                if (isExpanded) {
                    targetContent.setAttribute('hidden', '');
                } else {
                    targetContent.removeAttribute('hidden');
                }

                console.log(`Toggled ${targetId}: ${!isExpanded}`);
            }
        });
    }
}
