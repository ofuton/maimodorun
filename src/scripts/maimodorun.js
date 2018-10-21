const handleAutoSaveError = (element, error) => {
    switch (error.message) {
    case 'ContentsSizeOver':
        insertFailedAutoSavedSign(element, '保存内容が1MBを超えているため、保存できません。');
        break;
    case 'CapacityExceededError':
        insertFailedAutoSavedSign(element, '保存容量を超えています。保存項目を削除し、容量を確保してください。');
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

const dispatchSave = async (element) => {
    const commentForm = element.find('.ocean-ui-editor-field');

    if (commentForm.length === 0) throw new Error('PageTransitioned');

    const formContents = commentForm[0].innerHTML;
    if (getBytes(formContents) >= 1024 * 1024) throw new Error('ContentsSizeOver');

    if (!hasAnyContents(commentForm)) throw new Error('NoContents');

    const url = getRecoveryURL(element);
    if (!url) throw new Error('NotMatchURL');

    const coverImageUrl = $(coverImage).css('background-image').replace(/^url\(['"](.+)['"]\)/, '$1');
    return {
        url: url,
        scope : getScope(element),
        title: document.title,
        timestamp: new Date().getTime(),
        coverImageUrl: coverImageUrl,
        contents: formContents,
    };
};

const formObserver = new MutationObserver(async (mutations, observer) => {
    const element = $(mutations[0].target).closest('.ocean-ui-comments-commentform');
    // TODO: 変更された要素の親をたどってフォーム要素を取得し，以下の関数ではその要素を指定してビューをいじる
    try {
        removeAutoSavedSign(element);
        await debounceFunc(saveInterval);
        const payload = await dispatchSave(element);
        await setValueIntoStorage(payload);
        insertAutoSavedSign(element);
        insertMaimodorunBtn(element);
    } catch(error) {
        handleAutoSaveError(element, error);
    }
});

// FIXME: Enter で書き込まれた時に発火しなくない？
const bindSubmit = (baseEl) => {
    const submitEl = baseEl.find('.ocean-ui-comments-commentform-submit');
    submitEl.on('mousedown', async () => {
        try {
            input_event_stack = [];
            const payload = await dispatchSave(baseEl);
            await setValueIntoStorage(payload);
            removeAutoSavedSign(baseEl);
        } catch(error) {
            handleAutoSaveError(element, error);
        }
    });
};

const bindCancel = (baseEl) => {
    const cancelEl = baseEl.find('.ocean-ui-comments-commentform-cancel');
    cancelEl.on('mousedown', () => {
        removeAutoSavedSign(baseEl);
    });
};

const bindMaimodorunBtn = (baseEl) => {
    const maimodorunBtn = baseEl.find('.maimodorun-button');
    maimodorunBtn.on('mousedown', async (event) => {
        const value = await getValueFromStorage(baseEl);

        $(event.target).closest('.ocean-ui-comments-commentform').find('.ocean-ui-editor-field').html(value.contents);
    });
};

const maimodorunMainFunc = (baseDomClass) => {
    return async (event) => {
        const baseEl = $(event.target).closest(baseDomClass);

        // フォーム要素が構築されるまでちょっと待つ
        await sleep(10);

        bindSubmit(baseEl);
        bindCancel(baseEl);
        await insertMaimodorunBtn(baseEl);
        bindMaimodorunBtn(baseEl);

        formObserver.observe(baseEl.find(threadCommentForm)[0], {
            childList: true,
            attributes: true,
            characterData: true,
            subtree: true
        });
    };
};

$(window).on('load hashchange', () => {
    $(document).on(
        'focus', threadCommentTextArea,
        maimodorunMainFunc('.ocean-ui-comments-commentform')
    );

    $(document).on(
        'click', threadCommentReplyLinks,
        maimodorunMainFunc('.ocean-ui-comments-post')
    );
});
