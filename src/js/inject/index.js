import $ from 'jquery';
import { sleep, waitUntilDisplay } from 'utils';

const getElementHandlerFromScope = (scope) => {
    let el;
    switch (scope) {
    case 'Thread.Body':
        el = '.ocean-ui-comments-commentform-textarea';
        return {
            wait: async () => await waitUntilDisplay(el),
            open: () => $(el)[0].focus()
        };
        break;
    case 'Thread.Reply':
        el = '.ocean-ui-comments-commentbase-comment';
        return {
            wait: async () => await waitUntilDisplay(el),
            open: () => $(el)[0].click()
        };
        break;
    default:
        el = '.ocean-ui-comments-commentform-textarea';
        return {
            wait: async () => await waitUntilDisplay(el),
            open: () => $(el)[0].focus()
        };
        break;
    };
};

const openTextArea = async (scope) =>  {
    const handler = getElementHandlerFromScope(scope);
    await handler.wait();
    handler.open();
};

const renderContentsToForm = (contents) => {
    $('.ocean-ui-editor-field').html(contents);
};

const recoveryProcess = async content => {
    await openTextArea(content.scope);
    await sleep(10);
    renderContentsToForm(content.contents);
};

recoveryProcess(CONTENT);
