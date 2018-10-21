let input_event_stack = [];
const saveInterval = 2000;

// 入力内容のバイト数計算用
const getBytes = (string) => {
    return(encodeURIComponent(string).replace(/%../g,"x").length);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getCurrentURL = () => {
    const pattern = /^https:\/\/.+\.cybozu(-dev)?\.com\/k(\/guest\/\d+)?\/#\/space\/\d+\/thread\/\d+/;
    const matches = location.href.match(pattern);

    return matches && matches[0];
};

const getValueFromStorage = () => {
    return new Promise((resolve, reject) => {
        url = getCurrentURL();
        if (!url) {
            resolve(null);
            return;
        }

        chrome.runtime.sendMessage({type: 'load', url: url}, (response) => {
            resolve(response.value);
        });
    });
};

const setValueIntoStorage = (payload) => {
    return new Promise((resolve, reject) => {
        const body = Object.assign({type: 'store'}, payload);
        chrome.runtime.sendMessage(body, (response) => {
            switch (response.status) {
            case 'OK':
                resolve();
                break;
            case 'CapacityExceeded':
                reject(new Error('CapacityExceededError'));
                break;
            case 'Failed':
                reject(new Error('StorageError'));
                break;
            }
        });
    });
};

const debounceFunc = async (interval) => {
    input_event_stack.push(1);

    await sleep(interval);
    // 「書き込む」ボタンが押され，stack が空にされた時，
    // 残った dispatch を破棄する
    if (input_event_stack.pop() === null || input_event_stack.length !== 0) {
        // 後の catch のためにエラーの種類を入れてあげる
        throw new Error('UnderInput');
    } else {
        input_event_stack = [];
        return;
    }
};
