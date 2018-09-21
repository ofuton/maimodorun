let input_event_stack = [];
const saveInterval = 2000;
const threadCommentFormWrap = '.ocean-space-thread-body + .ocean-ui-comments-commentform';
const threadCommentForm = '.ocean-space-thread-body + .ocean-ui-comments-commentform .ocean-ui-editor-field';
const threadCommentSubmit = '.ocean-space-thread-body + .ocean-ui-comments-commentform .ocean-ui-comments-commentform-submit';
const threadCommentCancel = '.ocean-space-thread-body + .ocean-ui-comments-commentform .ocean-ui-comments-commentform-cancel';
const threadCommentToolBar = '.ocean-space-thread-body + .ocean-ui-comments-commentform .goog-toolbar';
const threadCommentTextArea = '.ocean-ui-comments-commentform-textarea';
const threadCommentInlineBlock = '.goog-inline-block';
const threadCommentRemoveFormatIcon = '.tr-removeFormat';
const threadCommentInTopRightOfFormMaimodorunBtn = '.ocean-ui-comments-commentform-maimodorun-button-wrap';
const coverImage = '.gaia-argoui-space-spacelayout-cover';

// 入力内容のバイト数計算用
const getBytes = (string) => {
    return(encodeURIComponent(string).replace(/%../g,"x").length);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const checkTextAreaDisplay = () => {
    return new Promise(resolve => {
        const setIntervalId = setInterval(() => {
            const commentForm = $(document).find(threadCommentTextArea);
            if(commentForm.length > 0) {
                clearInterval(setIntervalId);
                resolve();
            }
        }, 200);
    });
};

const insertMaimodorunBtnInTopRightOfForm = () => {
    $(document).find(threadCommentFormWrap).prepend(createMaimodorunBtnElInTopRightOfForm);
};

const createMaimodorunBtnElInTopRightOfForm = () => {
    const template = [
        "<div class=\"<%= btnClass %>\">",
            "<img src=\"<%= src %>\" class=\"maimodorun-button-in-top-right-of-form\">",
        '</div>',
    ].join('');
    const compiledTemplate = _.template(template);
    return compiledTemplate({ btnClass: threadCommentInTopRightOfFormMaimodorunBtn.slice(1), src: chrome.extension.getURL('img/icon48.png') });
};

const removeMaimodorunBtnInTopRightOfForm = () => {
    if ($(threadCommentInTopRightOfFormMaimodorunBtn).length === 0) return;
    $(threadCommentInTopRightOfFormMaimodorunBtn).remove();
};

const recoveryFromTopRightOfForm = async () => {
    openTextArea();
    await sleep(10);
    const value = await getValueFromStorage();
    renderContentsToForm(value.contents);
};

const openTextArea = () =>  {
    $(document).find(threadCommentTextArea)[0].focus();
};

const renderContentsToForm = (contents) => {
    $(document).find(threadCommentForm).html(contents);
};

const checkCommentFormProcess = async () => {
    const value = await getValueFromStorage();
    if (!value) return;
    await checkTextAreaDisplay();
    insertMaimodorunBtnInTopRightOfForm();
    $(document).on('mousedown', '.maimodorun-button-in-top-right-of-form', recoveryFromTopRightOfForm);
};

const createMaimodorunBtnEl = () => {
    createMaimodorunBtnLeftBorder();
    const template = [
        '<div class="goog-inline-block goog-toolbar-button ocean-ui-editor-toolbar-maimodorun" title="保存内容を復元する" role="button" id="+oceanMaimodorun">',
          '<div class="goog-inline-block goog-toolbar-button-outer-box">',
            '<div class="goog-inline-block goog-toolbar-button-inner-box goog-toolbar-button-inner-box-maimodorun">',
              '<div class="ocean-ui-editor-toolbar-maimodorun-button">',
                "<img src=\"<%= iconImgSrc %>\" class=\"maimodorun-button\">",
              '</div>',
            '</div>',
          '</div>',
        '</div>',
    ].join('');
    const compiledTemplate = _.template(template);
    return compiledTemplate({ iconImgSrc: chrome.extension.getURL('img/icon48.png') });
};

const createMaimodorunBtnLeftBorder = () => {
    $(threadCommentRemoveFormatIcon).parent().addClass('goog-toolbar-button-right-border');
};

const createAutoSavedSign = () => {
    const template = [
        '<div class="maimodorun-saved-sign">',
            '<span>保存しました</span>',
        '</div>',
    ].join('');
    return _.template(template);
};

const createFailedAutoSavedSign = (message) => {
    const template = [
        '<div class="maimodorun-saved-sign maimodorun-saved-sign-failed">',
            "<img class=\"maimodorun-saved-sign-img\" src=\"<%= imgSrc %>\">",
            "<span data-maimodorun-tooltip=\"<%= message %>\">",
                '保存に失敗しました',
            '</span>',
        '</div>',
    ].join('');
    const compiledTemplate = _.template(template);
    return compiledTemplate({ imgSrc: chrome.extension.getURL('img/error_mark.png'), message: message });
};

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

const hasAnyContents = (element) => {
    if (element.is('img') || element.text().trim() !== "") return true;

    let flag = false;
    element.children().each((index, child) => {
        if (flag = hasAnyContents($(child))) return false;  // false を返すと break
    });

    return flag;
};

const dispatchSave = async () => {
    const commentForm = $(threadCommentForm);

    if (commentForm.length === 0) throw new Error('PageTransitioned');

    const formContents = commentForm[0].innerHTML;
    if (getBytes(formContents) >= 1024 * 1024) throw new Error('ContentsSizeOver');

    if (!hasAnyContents(commentForm)) throw new Error('NoContents');

    const url = getCurrentURL();
    if (!url) throw new Error('NotMatchURL');

    const coverImageUrl = $(coverImage).css('background-image').replace(/^url\(['"](.+)['"]\)/, '$1');
    return {
        url: getCurrentURL(),
        title: document.title,
        timestamp: new Date().getTime(),
        coverImageUrl: coverImageUrl,
        contents: formContents,
    };
};

const insertMaimodorunBtn = async () => {
    const value = await getValueFromStorage();
    if ($('.maimodorun-button').length !== 0 || !value) return;

    $(threadCommentToolBar).append(createMaimodorunBtnEl());
};

const insertAutoSavedSign = () => {
    // FIXME: v0.1.0 ではこれでいいが，返信にも対応するならば，唯一の要素を指すようにする必要あり
    if ($('.maimodorun-saved-sign').length !== 0) return;

    $(threadCommentSubmit).after(createAutoSavedSign());
};

const removeAutoSavedSign = () => {
    // FIXME: v0.1.0 ではこれでいいが，返信にも対応するならば，唯一の要素を指すようにする必要あり
    if ($('.maimodorun-saved-sign').length === 0)  return;

    $('.maimodorun-saved-sign').remove();
};

const insertFailedAutoSavedSign = (message) => {
    // FIXME: v0.1.0 ではこれでいいが，返信にも対応するならば，唯一の要素を指すようにする必要あり
    if ($('.maimodorun-saved-sign').length !== 0) return;
    $(threadCommentSubmit).after(createFailedAutoSavedSign(message));
};

const handleAutoSaveError = (error) => {
    switch (error.message) {
    case 'ContentsSizeOver':
        insertFailedAutoSavedSign('保存内容が1MBを超えているため、保存できません。');
        break;
    case 'CapacityExceededError':
        insertFailedAutoSavedSign('保存容量を超えています。保存項目を削除し、容量を確保してください。');
        break;
    case 'NoContents':
        // 空の内容を保存しようとした例外なのでスルー
        break;
    case 'UnderInput':
        // 入力中なので保存処理せずに破棄
        break;
    case 'PageTransitioned':
        // 3秒の間にページを遷移してしまったため破棄
        break;
    case 'NotMatchURL':
        // 動作対象のURLとマッチしなかったため破棄
        break;
    default:
        throw error;
        break;
    }
};

const formObserver = new MutationObserver(async (MutationRecords, MutationObserver) => {
    try {
        removeAutoSavedSign();
        await debounceFunc(saveInterval);
        const payload = await dispatchSave();
        await setValueIntoStorage(payload);
        insertAutoSavedSign();
        insertMaimodorunBtn();
    } catch(error) {
        handleAutoSaveError(error);
    }
});

$(window).on('load hashchange', () => {
    // FIXME: Enter で書き込まれた時に発火しなくない？
    $(document).on('mousedown', threadCommentSubmit, async () => {
        try {
            input_event_stack = [];
            const payload = await dispatchSave();
            await setValueIntoStorage(payload);
            removeAutoSavedSign();
            checkCommentFormProcess();
        } catch(error) {
            handleAutoSaveError(error);
        }
    });

    $(document).on('mousedown', threadCommentCancel, () => {
        removeAutoSavedSign;
        checkCommentFormProcess();
    });

    $(document).on('focus', threadCommentTextArea, async (event) => {
        // フォーム要素が構築されるまでちょっと待つ
        await sleep(10);

        removeMaimodorunBtnInTopRightOfForm();
        insertMaimodorunBtn();
        formObserver.observe($(threadCommentForm)[0], {
            childList: true,
            attributes: true,
            characterData: true,
            subtree: true
        });
    });

    $(document).on('mousedown', '.maimodorun-button', async () => {
        const value = await getValueFromStorage();
        $(threadCommentForm).html(value.contents);
    });

    checkCommentFormProcess();
});
