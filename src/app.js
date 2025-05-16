
import { PesTip, PesTipManager } from './js/_tooltip.js';
import { funcSignUpToService, funcSignInWithExistingEmail, signOutUser, funcInitAuthUI, funcGetData, funcSwitchSignInMode }  from './js/_auth.js';

const dialog = document.getElementById("betaModal");

document.addEventListener('DOMContentLoaded', function() {

    funcInitAuthUI();

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

                    funcSwitchSignInMode.call(this);

                break;

                case 'show-sign-up':

                    funcSwitchSignInMode.call(this);

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