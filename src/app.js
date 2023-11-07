import { SuperScaleApp } from './js/_SuperScaleClass.js';

let superScaleApp = new SuperScaleApp();

superScaleApp.init();  

console.log(superScaleApp.loadSettingsFromStorage());

document.querySelector('#clearLocalStorage').addEventListener('click', (event) => { 

    superScaleApp.funcClearSettings();

});

document.querySelector('#getLocalStorage').addEventListener('click', (event) => { 

    console.log(superScaleApp.loadSettingsFromStorage());

});

