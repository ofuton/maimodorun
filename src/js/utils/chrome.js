const createNewTab = url => {
    return new Promise(resolve => chrome.tabs.create({ url: url }, tab => resolve(tab)));
};

const executeScriptIntoTab = (tabId, object) => {
    return new Promise((resolve) => chrome.tabs.executeScript(tabId, object, resolve));
};

export {
    createNewTab,
    executeScriptIntoTab
};
