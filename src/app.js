import { SuperScaleApp } from './js/_SuperScaleClass.js';

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


