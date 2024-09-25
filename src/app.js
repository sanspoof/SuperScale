import { SuperScaleApp } from './js/_SuperScaleClass.js';
import { PesTip, PesTipManager } from './js/_tooltip.js';
 
let superScaleApp = new SuperScaleApp();

superScaleApp.init();  

console.log(superScaleApp.loadSettingsFromStorage());

// document.querySelector('#clearLocalStorage').addEventListener('click', (event) => { 

//     superScaleApp.funcClearSettings();

// });

// document.querySelector('#getLocalStorage').addEventListener('click', (event) => { 

//     console.log(superScaleApp.loadSettingsFromStorage());

// });

const dialog = document.getElementById("betaModal");

document.addEventListener('DOMContentLoaded', function() {

    funcStartToolTips();

    var buttons = document.querySelectorAll('[data-cmd]');

    buttons.forEach(function(button) {

        button.addEventListener('click', function() {

            var cmd = button.getAttribute('data-cmd');

            switch (cmd) {

                case 'toggle-lightmode':

                    console.log('Toggle Lightmode');

                    break;
                
                case 'open-beta-modal':

                dialog.showModal(); 

                break;

                case 'close-beta-modal':

                dialog.close();

                break;

            }
        });
    });
});

function funcStartToolTips() {

    const tooltipItems = document.querySelectorAll('[data-tooltip]');

    let tooltipManager;

    if (tooltipItems.length === 0) {

        console.log("No tooltips found on the page.");
          
    } else {
        
        tooltipManager = new PesTipManager();
    
        tooltipItems.forEach((tooltipItem) => {

            if (tooltipItem._PesTip == undefined) {

                let val = tooltipItem.dataset.tooltipPosition;

                if (val) {

                    let opts = {
                        position: val
                    }

                    tooltipItem._PesTip = new PesTip(tooltipManager, tooltipItem, opts);

                } else {

                    tooltipItem._PesTip = new PesTip(tooltipManager, tooltipItem);

                    console.log(tooltipItem._PesTip)

                }

            }

        });
    }

}