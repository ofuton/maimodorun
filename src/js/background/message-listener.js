import CommandStorage from 'background/storage/command';

import messages from 'background/messages';

export default class MessageListener {
    constructor() {
        this.commandStorage = new CommandStorage();
    }

    run() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            switch (request.type) {
            case messages.STORAGE_INIT:
                this.initStorage(sendResponse);
                break;
            case messages.STORAGE_LOAD:
                this.loadFromStorage(request, sendResponse);
                break;
            case messages.STORAGE_STORE:
                this.storeRequest(request, sendResponse);
                break;
            case messages.STORAGE_LOAD_ALL:
                this.loadAllFromStorage(request, sendResponse);
                break;
            case messages.STORAGE_REMOVE:
                // FIXME: 削除したら対応するタブに消したことを通知する
                this.removeFromStorage(request, sendResponse);
                break;
            case messages.STORAGE_RECOVERY:
                this.recoveryWithNewTab(request, sendResponse);
                break;
            default:
                sendResponse({ status: 'Failed' });
                break;
            }

            return true;
        });
    }

    async initStorage(sendResponse) {
        sendResponse(await this.commandStorage.init());
    }

    async loadFromStorage(request, sendResponse) {
        sendResponse(await this.commandStorage.load(request.url));
    }

    async storeRequest(request, sendResponse) {
        const value = {
            url: request.url,
            scope: request.scope,
            title: request.title,
            timestamp: request.timestamp,
            coverImageUrl: request.coverImageUrl,
            contents: request.contents
        };

        sendResponse(await this.commandStorage.store(value));
    }

    async loadAllFromStorage(request, sendResponse) {
        sendResponse(await this.commandStorage.loadAll());
    }

    async removeFromStorage(request, sendResponse) {
        sendResponse(await this.commandStorage.remove(request.url));
    }

    async recoveryWithNewTab(request, sendResponse) {
        sendResponse(await this.commandStorage.recoveryWithNewTab(request.url));
    }
}
