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
    return compiledTemplate({ iconImgSrc: chrome.extension.getURL('./assets/images/icon48.png') });
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
    return compiledTemplate({ imgSrc: chrome.extension.getURL('./assets/images/error_mark.png'), message: message });
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

const hasAnyContents = (element) => {
    if (element.is('img') || element.text().trim() !== "") return true;

    let flag = false;
    element.children().each((index, child) => {
        if (flag = hasAnyContents($(child))) return false;  // false を返すと break
    });

    return flag;
};
