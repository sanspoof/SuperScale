function createDeferred() {
    let resolve;
    const promise = new Promise((res) => (resolve = res));
    return { promise, resolve };
}

const userSettingsDeferred = createDeferred();

let userSettings = null;

export function setUserSettings(settings) {
    userSettings = settings;
    userSettingsDeferred.resolve(settings);
}

export function getUserSettings() {
    return userSettings;
}

export function waitForUserSettings() {
    return userSettingsDeferred.promise;
}