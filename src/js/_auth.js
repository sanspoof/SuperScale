
import { createClient } from '@supabase/supabase-js';
import { SuperScaleApp } from './_SuperScaleClass.js';
import { funcAnimateLoginLogo } from '../main.js';
import { setUserSettings, waitForUserSettings } from './_globals.js';
import { _s } from './_Utils.js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseTable = import.meta.env.VITE_SUPABASE_TABLE;
const supabase = createClient(supabaseUrl, supabaseKey); 
let userName = document.getElementById('email');
let userPass = document.getElementById('password');
let elSignInButton = document.getElementById('signInButton');
let elSignUpButton = document.getElementById('signUpButton');
let elSuperScaleForm = document.getElementById('SuperScaleForm');
let elAccentColourInput = document.getElementById('accentColor');
let elFeedback = document.getElementById('feedback');
let superScaleApp;
let strUser = document.querySelector('[data-role="user"]');
let elSignUpStatement = _s('sign-up-statement'); 
let elSignInStatement = _s('sign-in-statement'); 
let elPasswordFeedbackContainer = _s('password-feedback-container');
let elPasswordFeedbackUppercase = _s('password-feedback-uppercase');
let elPasswordFeedbackLowercase = _s('password-feedback-lowercase');
let elPasswordFeedbackNumber = _s('password-feedback-number');
let elPasswordFeedbackLength = _s('password-feedback-length');
let signInFlag = true;
let currentKeydownButton = null;

export async function funcInitAuthUI() {

    document.body.classList.add('authentication--checking');

    // Check if the user is already authenticated
    const { data: { session } } = await supabase.auth.getSession();

    const updateAuthUI = async (session) => {

        if (!session) {
            // User is not logged in
            
            document.body.classList.add('visible');

            document.body.classList.add('authentication--out');

            document.body.classList.remove('authentication--in');

            document.body.classList.remove('authentication--checking');

            funcAnimateLoginLogo();

            funcDestroySuperScale();

            return;
        }

        // User is logged in

        document.body.classList.add('visible');

        document.body.classList.add('authentication--in');

        document.body.classList.remove('authentication--out');
        
        document.body.classList.remove('authentication--checking');

        funcStartSuperScale();

        // Fetch user data
        await funcGetData();

        // Update UI with user details
        funcUpdateUIWithUserDetails();
    };

    // Update the UI based on the current session
    await updateAuthUI(session);

    // Listen for auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
        
        if (event === 'INITIAL_SESSION') {
            // handle initial session
          } else if (event === 'SIGNED_IN') {
            
            await funcLogSignIn();
            
          } else if (event === 'SIGNED_OUT') {
            
            console.log('SIGNED_OUT', session);
        
            // Clear local and session storage
            [
                window.localStorage,
                window.sessionStorage,
            ].forEach((storage) => {
                Object.keys(storage).forEach((key) => {
                    storage.removeItem(key);
                });
            });

          } else if (event === 'PASSWORD_RECOVERY') {
            // handle password recovery event
          } else if (event === 'TOKEN_REFRESHED') {
            // handle token refreshed event
          } else if (event === 'USER_UPDATED') {
            // handle user updated event
          }

        await updateAuthUI(session);

    });
}

function funcStartSuperScale() {

    if (typeof superScaleApp !== "undefined" && superScaleApp !== null) return;

    superScaleApp = new SuperScaleApp();

    superScaleApp.init();  

    console.log(superScaleApp.loadSettingsFromStorage());

}

function funcDestroySuperScale() { 

    if (!superScaleApp) return;

    superScaleApp.destroy();
}

async function signUpWithEmail(email, password) {

    let strLoading = "loading";

    let signUpButton = elSignUpButton;

    signUpButton.classList.add(strLoading);

    const { data, error } = await supabase.auth.signUp({
        email,
        password
    });

    if (error) {

        console.error('Sign-up error:', error.message);

        alert("Something went wrong during sign-up. Please try again.");

        signUpButton.classList.remove(strLoading);

        return;

    }

    const user = data.user;

    // If identities array is empty, 
    // the user likely already exists but is unconfirmed
    if (user && user.identities.length === 0) {

        console.warn("User already registered but not confirmed.");

        // resend is done automatically by Supabase
        funcShowLoginPageFeedback("It looks like you've already signed up");

        signUpButton.classList.remove(strLoading);

        return;

    }

    // Otherwise, normal flow
    funcShowLoginPageFeedback("Sign-up successful! Please check your email to confirm your account before logging in.  Be Sure to check your spam folder as well.");

    signUpButton.classList.remove(strLoading);

}

async function signInWithEmail(email, password) { 

    let strLoading = "loading";

    let signInButton = elSignInButton;

    signInButton.classList.add(strLoading);

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {

        console.error('Error signing in:', error.message);

       let errorMessage = error.message;

       let removePhone = errorMessage.replace("missing email or phone", "missing email");

        funcShowLoginPageFeedback(removePhone);

        signInButton.classList.remove(strLoading);

        return;

    }

    console.log('Sign in successful');

    signInButton.classList.remove(strLoading);

}


export function funcSignUpToService() {

    let userNameVal = userName.value;

    let userPassVal = userPass.value;

    funcValidateAndSignUp(userNameVal, userPassVal);

}

function funcValidateAndSignUp(email, pass) {

    const reemail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const repass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

    if(reemail.test(email) && repass.test(pass)) {

        signUpWithEmail(email, pass);

    } else {

        funcShowLoginPageFeedback("Invalid Signup Details");

    }

}

export function funcSignInWithExistingEmail() {

    let userNameVal = userName.value;

    let userPassVal = userPass.value;

    signInWithEmail(userNameVal, userPassVal);

} 


export async function signOutUser() {

    

    try {

        const { error } = await supabase.auth.signOut({scope: 'global'});

        if (error) {

            console.error('Error signing out:', error.message);

            return;
        }

        funcShowLoginPageFeedback('Signed out successfully', 'success');

    } catch (err) {

        console.error('Unexpected error during sign out:', err);

        funcShowLoginPageFeedback('Unexpected error during sign out', 'error');

    } finally {

        if (strUser) strUser.innerHTML = '';

    }

}

export async function funcGetData() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            console.error('No user is signed in or error fetching user:', error?.message);
            funcShowLoginPageFeedback(error.message);
            return;
        }

        const { data, error: fetchError } = await supabase
            .from(supabaseTable)
            .select('*')
            .eq('user_id', user.id) // If you're filtering by user
            .single(); // Use .single() if expecting one row

        if (fetchError) {
            console.error('Error fetching data:', fetchError.message);
            return;
        }

        console.log('Fetched user settings:', data);

        setUserSettings({
            email: user.email,
            accentColor: data.accent_color
        });

    } catch (err) {
        console.error('Error fetching data:', err.message);
    }
}

function funcShowLoginPageFeedback(message) { 
    
    elFeedback.innerHTML = message;

}


async function funcUpdateUIWithUserDetails() {

    const { email, accentColor } = await waitForUserSettings();

    strUser.innerHTML = email;
    
    elAccentColourInput.value = accentColor;

}

export async function funcUpdateUserSettings() {

    const darkMode = document.getElementById('DarkMode').checked;
  
    try {

      const {

        data: { user },

        error: userError

      } = await supabase.auth.getUser();
  
      if (userError || !user) {

        console.error('No user is signed in or error fetching user:', userError?.message);

        return;
      }
  
      const userId = user.id;
  
      const { error: updateError } = await supabase

        .from(supabaseTable)

        .update({ 
            dark_mode: darkMode 
        }) 

        .eq('user_id', userId); // match the row by user_id
  
      if (updateError) {

        console.error('Error updating data:', updateError.message);

        return;

      }
  
      console.log('User settings updated successfully');

    } catch (err) {

      console.error('Error updating data:', err.message);

    }

  }

export function funcSwitchSignInMode() {

    let _this = this;

    let elDataCmd = _this.getAttribute('data-cmd');

    elFeedback.innerHTML = "";

    if (elDataCmd === "show-sign-up") {

        signInFlag = false;

        signUpButton.style.display = "block";

        signInButton.style.display = "none";
        
        elSignInStatement.style.display = "block";

        elSignUpStatement.style.display = "none";

        elPasswordFeedbackContainer.style.display = "block";

        userName.setAttribute("placeholder", "Your Email Address");

        addPasswordFieldFeedbackListeners();

    } else if (elDataCmd === "show-sign-in") {

        signInFlag = true;

        signUpButton.style.display = "none";

        signInButton.style.display = "block";

        elPasswordFeedbackContainer.style.display = "none";

        elSignUpStatement.style.display = "block";
        
        elSignInStatement.style.display = "none";

        userName.setAttribute("placeholder", "The Email You Used to Register");

        removePasswordFieldFeedbackListeners();
    }

    funcRemoveEventListeners();

    funcAddEventListenersToForm();

}

function keydownHandler(e) {

  if (e.key === 'Enter') {

    e.preventDefault();

    if (currentKeydownButton) {

      currentKeydownButton.click();

    }

  }

}


// Add keydown listeners with the named handler
function funcKeydownEventListener(button) {

  currentKeydownButton = button;

  elSuperScaleForm.querySelectorAll('input').forEach(input => {

    input.addEventListener('keydown', keydownHandler);

  });

}

// Remove keydown listeners with the same named handler
function funcRemoveEventListeners() {

  elSuperScaleForm.querySelectorAll('input').forEach(input => {

    input.removeEventListener('keydown', keydownHandler);

  });

}

export function funcAddEventListenersToForm() {

    if (signInFlag) {

        funcKeydownEventListener(elSignInButton);

    } else {

        funcKeydownEventListener(elSignUpButton);

    }

}

function handlePasswordInput() {

    const value = userPass.value;
    elPasswordFeedbackUppercase.classList.toggle('valid', /[A-Z]/.test(value));
    elPasswordFeedbackLowercase.classList.toggle('valid', /[a-z]/.test(value));
    elPasswordFeedbackNumber.classList.toggle('valid', /\d/.test(value));
    elPasswordFeedbackLength.classList.toggle('valid', value.length >= 6);

}


function addPasswordFieldFeedbackListeners() {

    userPass.addEventListener('input', handlePasswordInput);

}


function removePasswordFieldFeedbackListeners() {

    userPass.removeEventListener('input', handlePasswordInput);

}

async function funcLogSignIn() {

    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error('Error getting user:', userError?.message);
        } else {
            const { error: updateError } = await supabase
                .from(supabaseTable)
                .update({ last_signed_in: new Date().toISOString() })
                .eq('user_id', user.id); // Use your column that stores user ID

            if (updateError) {
                console.error('Failed to update last signed in:', updateError.message);
            } else {
                console.log('Last signed in timestamp updated.');
            }
        }
    } catch (err) {
        console.error('Unexpected error updating last signed in:', err);
    }

}