import './scss/style.scss';

import { PesTip, PesTipManager } from './js/_tooltip.js';
import { funcSignUpToService, funcSignInWithExistingEmail, signOutUser, funcInitAuthUI, funcGetData, funcSwitchSignInMode, funcUpdateUserSettings, funcAddEventListenersToForm }  from './js/_auth.js';
import { _s } from './js/_Utils.js';
import { gsap } from 'gsap';

const dialog = document.getElementById("betaModal");
const elAccentColor = document.getElementById('accentColor');
const elAppSettings = document.getElementById('Settings');

//TODO: Move Animations to another file
//TODO: Allow user to change accent color
//TODO: Improve signup experience and email

document.addEventListener('DOMContentLoaded', function() {

    funcInitAuthUI();
 
    funcStartToolTips();

    funcAddEventListenersToForm();

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

            case 'app-settings':

                funcShowAppSettings();

                break;

            case 'close-settings':

                funcCloseAppSettings();

            break;

    
            case 'show-sign-in':

                funcSwitchSignInMode.call(button);

            break;

            case 'show-sign-up':

                funcSwitchSignInMode.call(button);

            break;
    
            case 'update-user-settings':

                funcUpdateUserSettings();

            break;
        }
    });

});


function funcShowAppSettings() {
    gsap.to(elAppSettings, {
        duration: 0.4,
        opacity: 1,
        bottom: 0,
        ease: "power2.out",
        onStart: () => {
            elAppSettings.style.pointerEvents = 'auto';
        }
    });
}

function funcCloseAppSettings() {
    gsap.to(elAppSettings, {
        duration: 0.1,
        opacity: 0,
        bottom: '-100px',
        ease: "power2.in",
        onComplete: () => {
            elAppSettings.style.pointerEvents = 'none';
        }
    });
}

export function funcAnimateLoginLogo() {

    const polygons = document.querySelectorAll(".logotiles");

    const logodots = document.querySelector(".dots");

    const logorootdots = document.querySelector(".rootdots");

    const polygonDelay = 0.03; 

    gsap.set(polygons, { x:-10, opacity: 0});
    
    gsap.to(polygons, {
        x: 0,
        opacity: 1,
        ease: "power3.out",
        stagger: polygonDelay
    });

    // the dots
    gsap.set([logodots, logorootdots], { y: 10, opacity: 0 });

    gsap.to([logodots, logorootdots], {
        y: 0,
        opacity: 1,
        duration: 2,
        ease: "elastic.out",
        delay: polygons.length * polygonDelay,
        stagger: {
            amount: 0.1,
            from: "start"
        }
    });

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