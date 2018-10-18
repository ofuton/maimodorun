const executeScriptIntoTab = (tabId, obj) => {
    return new Promise((resolve) => chrome.tabs.executeScript(tabId, obj, resolve));
};

const newStorage = () => {
    return new Storage({
        db: 'maimodorun',
        store: {
            name: 'formText',
            keyPath: 'url',
        },
        indexes: [{
            name: 'url',
            property: 'url',
            unique: true
        }, {
            name: 'timestamp',
            property: 'timestamp',
            unique: false
        }]
    });
};

const execStore = async (request, storage, sendResponse) => {
    const value = {
        url: request.url,
        title: request.title,
        timestamp: request.timestamp,
        coverImageUrl: request.coverImageUrl,
        contents: request.contents
    };

    let response;
    try {
        await storage.init();
        await storage.setItem(value);
        response = { status: 'OK' };
    } catch (error) {
        console.error(error);
        response = { status: error.message };
    }

    sendResponse(response);
};

const execLoad = async (request, storage, sendResponse) => {
    let response;
    try {
        await storage.init();
        response = { status: 'OK', value: await storage.getItem(request.url) };
    } catch (error) {
        console.error(error);
        response = { status: error.message, value: {contents: ''} }
    }

    sendResponse(response);
};

const execLoadAll = async (request, storage, sendResponse) => {
    let response;
    try {
        await storage.init();
        response = { status: 'OK', values: await storage.getAllItems() };
    } catch (error) {
        console.error(error);
        response = { status: error.message, value: [] }
    }

    sendResponse(response);
};

const execRemove = async (request, storage, sendResponse) => {
    let response;
    try {
        await storage.init();
        await storage.removeItem(request.url);
        response = { status: 'OK' };
    } catch (error) {
        console.error(error);
        response = { status: error.message }
    }

    sendResponse(response);
};

const newTabWithRecovery = async (request, storage, sendResponse) => {
    await storage.init();
    const valueFromLocalStorage = await storage.getItem(request.url);
    const tab = await new Promise((resolve) => chrome.tabs.create({url: request.url}, (tab) => resolve(tab)));

    await executeScriptIntoTab(tab.id, { file: './assets/vendors/jquery-3.2.1.min.js' });
    await executeScriptIntoTab(tab.id, { code: 'const valueFromNewTabWithRecovery = \'' + valueFromLocalStorage.contents + '\''});
    await executeScriptIntoTab(tab.id, { file: './assets/js/inject.min.js' });
};


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const storage = newStorage();
    switch (request.type) {
    case 'store':
        execStore(request, storage, sendResponse);
        break;
    case 'load':
        execLoad(request, storage, sendResponse);
        break;
    case 'loadAll':
        execLoadAll(request, storage, sendResponse);
        break;
    case 'remove':
        // FIXME: 削除したら対応するタブに消したことを通知する
        execRemove(request, storage, sendResponse);
        break;
    case 'newTabWithRecovery':
        newTabWithRecovery(request, storage, sendResponse);
        break;
    default:
        sendResponse({status: 'Failed'});
        break;
    }

    return true;
});
