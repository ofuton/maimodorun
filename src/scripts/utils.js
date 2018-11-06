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

const getRecoveryURL = (element) => {
    const url = getCurrentURL();
    if (!url) return null;

    const commentsPostElement = element.closest('.ocean-ui-comments-post');
    if (commentsPostElement.length === 0) return url;

    const pattern = /ocean-ui-comments-post-id-(\d+)/;
    const matches = commentsPostElement.attr('class').match(pattern);

    return matches ? url + '/' + matches[1] : url;
};

const getScope = (element) => {
    // TODO: Thread 以外が増えたら対応
    const prefix = 'Thread';

    const commentsPostElement = element.closest('.ocean-ui-comments-post');
    const suffix = commentsPostElement.length === 0 ? 'Body' : 'Reply';

    return prefix + '.' + suffix;
};

const initStorage = () => {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({type: 'init'}, (response) => {
            resolve(response);
        });
    });
};

const getValueFromStorage = (baseEl) => {
    return new Promise((resolve, reject) => {
        const url = getRecoveryURL(baseEl);
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
