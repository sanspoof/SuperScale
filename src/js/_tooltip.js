import { computePosition, offset, autoPlacement, shift, autoUpdate } from '@floating-ui/dom';

// the below controls all the pestips in a container on the page....
class PesTipManager {

    constructor() { 

        this.activeInstances = [];

        this.createTooltipContainer(); 

    }

    addInstance(instance) {

        this.activeInstances.push(instance);

    }

    closeAll() {

        this.activeInstances.forEach((instance) => {

            instance.hideTooltip();

        });
    }

    createTooltipContainer() {

        if (!PesTipManager.tooltipcontainer) {

            PesTipManager.tooltipcontainer = document.createElement('div');

            PesTipManager.tooltipcontainer.classList.add('pestipcontainer');
            
            document.body.appendChild(PesTipManager.tooltipcontainer);
        }

    }

    destroyTooltipContainer() {

        if (this.tooltipcontainer && document.body.contains(this.tooltipcontainer)) {

            document.body.removeChild(this.tooltipcontainer);

        }

    }


    isFloatingUIDOMAvailable() {

        return !! window.FloatingUIDOM;

    }

}

/**
 * creates a new instance of a pestip
 *
 * @category Core
 * @subcategory Web Controls
 * @param {HTMLElement} element - element with [data-tooltip] attr.
 * @example
 * const customOptions = {
 *   position: 'left',
 * };
 * const pestipItems = document.querySelectorAll('[data-tooltip]');
 * pestipItems.forEach((pestipItem) => { new PesTip(pestipItem, customOptions); });
 */

class PesTip {

    constructor(tooltipManager, element, options = { position: 'bottom' }) {

        this.button = element;

        this.pestiptxt = this.button.dataset.tooltip;

        this.tooltipManager = tooltipManager;

        const defaults = {
            offset: 6, // px offset around the element 
            padding: 5,
            position: options.position,
            
        };

        this.tooltip = this.createTooltip();

        this.options = Object.assign({}, defaults, options);

        this.button.setAttribute('aria-describedby', "tooltip");

        this.computePosition = this.computePosition.bind(this);

        this.updatePosition = this.updatePosition.bind(this);

        this.showTooltip = this.showTooltip.bind(this);

        this.hideTooltip = this.hideTooltip.bind(this);

        // adds to the global instances array if needed? not needed for now
        // if (!window.pesTipInstances) {

        //     window.pesTipInstances = [];

        // }

        // window.pesTipInstances.push(this);
        
        this.init();
    }

    computePosition() {

        const { offsetValue, padding, position } = this.options;

        return computePosition(this.button, this.tooltip, {

            // placement: 'bottom', 

            middleware: [ // look these up in the documentation 

                offset(offsetValue),

                autoPlacement({
                    allowedPlacements: [position],
                    // crossAxis: undefined,
                    // alignment: null,
                    // autoAlignment: undefined,
                }),

                shift({ padding }),

            ],

        });

    }

    createTooltip() {

        let tt = document.createElement('div');

        tt.classList.add('tooltip');

        tt.setAttribute('role', 'tooltip');

        PesTipManager.tooltipcontainer.appendChild(tt);

        return tt;

    }

    animateFadeIn() {

            const start = performance.now();

            const duration = 150; 

            const animate = (timestamp) => {

                const progress = (timestamp - start) / duration;

                this.tooltip.style.opacity = Math.min(progress, 1);

                if (progress < 1) {

                    requestAnimationFrame(animate);

                }

            };

            requestAnimationFrame(animate);
        }

        animateFadeOut() {

            const start = performance.now();

            const duration = 20; 

            const animate = (timestamp) => {

                const progress = (timestamp - start) / duration;

                this.tooltip.style.opacity = 1 - Math.min(progress, 1);

                if (progress < 1) {

                    requestAnimationFrame(animate);
                    
                } else {

                    this.tooltip.style.display = '';

                    this.initCleanup();

                }

            };

            requestAnimationFrame(animate);
        }

    updatePosition() {

        this.computePosition().then(({ x, y }) => {

            Object.assign(this.tooltip.style, {

                left: `0`,

                top: `0`,

                transform: `translate(${this.roundByDPR(x)}px,${this.roundByDPR(y)}px)`,

            });

        });

    }

    roundByDPR(value) {

        const dpr = window.devicePixelRatio || 1;

        return Math.round(value * dpr) / dpr;

    }

    showTooltip() {

        this.tooltip.innerText = this.pestiptxt;

        this.updatePosition();

        this.tooltip.style.display = 'block';

        //this.animateFadeIn();

    
    }

    hideTooltip() {

        this.tooltip.style.display = ''; // remove if animateFadeOut is used

        //this.animateFadeOut();

        this.initCleanup();

    }

    showActive() { 

        console.log("Active Instances", PesTipManager.activeInstances);

        console.log("Active Elements with instances", PesTipManager.activeElements);
        
    }

    initCleanup() {

        if(this.tooltipManager.isFloatingUIDOMAvailable()) { 

            this.cleanup = autoUpdate(

                this.button,
    
                this.tooltip,
    
                this.updatePosition
    
            );

        }

    }
 
    init() {

        [
            ['mouseenter', this.showTooltip],
            ['mouseleave', this.hideTooltip],
            ['focus', this.showTooltip],
            ['blur', this.hideTooltip],
        ].forEach(([event, listener]) => {

            this.button.addEventListener(event, listener);

        });

        this.initCleanup();

    }
    
}

export { PesTip, PesTipManager };