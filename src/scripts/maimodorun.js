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
