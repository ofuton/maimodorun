import messages from 'background/messages';

export default class MessageClient {
    initStorage() {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ type: messages.STORAGE_INIT }, response => {
                if (response.status === messages.STATUS_OK) {
                    resolve(response);
                } else {
                    reject(new Error(response.status));
                }
            });
        });
    }

    getValueFromStorage(key) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ type: messages.STORAGE_LOAD, url: key }, response => {
                if (response.status === messages.STATUS_OK) {
                    resolve(response.value);
                } else {
                    reject(new Error(response.status));
                }
            });
        });
    }

    getAllValueFromStorage() {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ type: messages.STORAGE_LOAD_ALL }, response => {
                if (response.status === messages.STATUS_OK) {
                    resolve(response.value);
                } else {
                    reject(new Error(response.status));
                }
            });
        });
    }

    getValuesFromStorage(offsets, limits) {
        return new Promise((resolve, reject) => {
            const body = {
                type: messages.STORAGE_LOAD_ITEMS,
                offsets: offsets,
                limits: limits,
            };
            chrome.runtime.sendMessage(body, response => {
                if (response.status === messages.STATUS_OK) {
                    resolve(response.value);
                } else {
                    reject(new Error(response.status));
                }
            });
        });
    }

    setValueIntoStorage(payload) {
        return new Promise((resolve, reject) => {
            const body = Object.assign({ type: messages.STORAGE_STORE }, payload);
            chrome.runtime.sendMessage(body, response => {
                if (response.status === messages.STATUS_OK) {
                    resolve(response.value);
                } else {
                    reject(new Error(response.status));
                }
            });
        });
    }

    removeValueInStorage(key) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ type: messages.STORAGE_REMOVE, url: key }, response => {
                if (response.status === messages.STATUS_OK) {
                    resolve();
                } else {
                    reject(new Error(response.status));
                }
            });
        });
    }

    recoveryWithNewTab(key) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ type: messages.STORAGE_RECOVERY, url: key }, response => {
                if (response.status === messages.STATUS_OK) {
                    resolve();
                } else {
                    reject(new Error(response.status));
                }
            });
        });
    }
}
