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

const insertMaimodorunBtn = async (target) => {
    const value = await getValueFromStorage(target);
    const el = target.find('.maimodorun-button');
    if (el.length !== 0 || !value) return;

    target.find('.goog-toolbar').append(createMaimodorunBtnEl());
};

const insertAutoSavedSign = (target) => {
    const el = target.find('.maimodorun-saved-sign');
    if (el.length !== 0) return;

    target.find('.ocean-ui-comments-commentform-submit').after(createAutoSavedSign());
};

const removeAutoSavedSign = (target) => {
    const el = target.find('.maimodorun-saved-sign');
    if (el.length === 0)  return;

    el.remove();
};

const insertFailedAutoSavedSign = (target, message) => {
    const el = target.find('.maimodorun-saved-sign');
    if (el.length !== 0) return;

    target.find('.ocean-ui-comments-commentform-submit').after(createFailedAutoSavedSign(message));
};

const hasAnyContents = (element) => {
    if (element.is('img') || element.text().trim() !== "") return true;

    let flag = false;
    element.children().each((index, child) => {
        if (flag = hasAnyContents($(child))) return false;  // false を返すと break
    });

    return flag;
};
