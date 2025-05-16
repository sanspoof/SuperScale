let userEmail = null;

let resolveEmailPromise;

const emailReady = new Promise((resolve) => {

    resolveEmailPromise = resolve;

});

export function setUserEmail(email) {

    userEmail = email;
    
    resolveEmailPromise(email);

}

export function getUserEmail() {

    return userEmail;

}

//  async getter
export async function waitForUserEmail() {
    return emailReady;
}