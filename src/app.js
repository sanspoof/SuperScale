
import { PesTip, PesTipManager } from './js/_tooltip.js';
import { funcSignUpToService, funcSignInWithExistingEmail, signOutUser, funcInitAuthUI, funcGetData, funcSwitchSignInMode, funcUpdateUserSettings }  from './js/_auth.js';
import { funcReturnEnharmonicEquivalent } from './js/_SuperScaleHelpers.js';
import { _s } from './js/_Utils.js';

const dialog = document.getElementById("betaModal");
const elAccentColor = document.getElementById('accentColor');


document.addEventListener('DOMContentLoaded', function() {

    funcInitAuthUI();
 
    funcStartToolTips();

    document.addEventListener('visibilitychange', funcHandleVisibilityChange);

    elAccentColor.addEventListener('input', function(e) {

        console.log("Accent Color: ", e.target.value);

     });

     document.addEventListener('click', function (e) {

        const button = e.target.closest('[data-cmd]');

        if (!button) return;

    
        const cmd = button.getAttribute('data-cmd'); 

        switch (cmd) {
            case 'toggle-lightmode':

                console.log('Toggle Lightmode');

                break;
    
            case 'open-beta-modal':

                dialog.showModal();

                break;
    
            case 'sign-up':

                funcSignUpToService();

                break;
    
            case 'close-beta-modal':

                dialog.close();

                break;

    
            case 'sign-in':

                funcSignInWithExistingEmail();

                break;

    
            case 'sign-out':

                signOutUser();

                break;

    
            case 'get-user-settings':

                funcGetData();

                break;

    
            case 'show-sign-in':

            case 'show-sign-up':

                funcSwitchSignInMode.call(button);
                break;
    
            case 'update-user-settings':
                funcUpdateUserSettings();
                break;
        }
    });

});

export function funcAnimateLoginLogo() {

    const polygons = document.querySelectorAll(".logotiles");

    const logodots = document.querySelector(".dots");

    const logorootdots = document.querySelector(".rootdots");

    const polygonDelay = 100;

    polygons.forEach((polygon, index) => {

        polygon.style.opacity = 0; // Start hidden
  
        polygon.style.transition = "opacity 0.5s ease";
  
        setTimeout(() => {
  
          polygon.style.opacity = 1;
  
        }, index * polygonDelay);
  
      });


      [logorootdots, logodots].forEach(el => {

        el.style.transform = "translate(0px, 6px)";

        el.style.opacity = 0;

      });

        setTimeout(() => {

            [logorootdots, logodots].forEach(el => { 

                el.style.transform = "translate(0px, 0px)";

                el.style.opacity = 1;

                el.style.transition = "all 0.5s ease";

            });

        }, polygons.length * polygonDelay);

}

function funcHandleVisibilityChange() { 

    console.log("Visibility Change: ", document.visibilityState);

    if(document.body.classList.contains('authentication--out')) { 
        
        return;
    }
    
    if (document.visibilityState === 'visible') {

      location.reload();

    } else if( document.visibilityState === 'hidden') {

      document.body.classList.remove('visible');

    }

}

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