import $ from 'jquery';
import { sleep, waitUntilDisplay } from 'utils';

/* globals CONTENT */

const getElementHandlerFromScope = scope => {
    let el;
    switch (scope) {
        case 'Thread.Body':
        case 'People.Body':
        case 'Message.Body':
        case 'Record.Body':
            el = '.ocean-ui-comments-commentform-textarea';
            return {
                wait: async () => await waitUntilDisplay(el),
                open: () => $(el)[0].focus(),
            };
        case 'Thread.Reply':
        case 'People.Reply':
            el = '.ocean-ui-comments-commentbase-comment';
            return {
                wait: async () => await waitUntilDisplay(el),
                open: () => $(el)[0].click(),
            };
        default:
            el = '.ocean-ui-comments-commentform-textarea';
            return {
                wait: async () => await waitUntilDisplay(el),
                open: () => $(el)[0].focus(),
            };
    }
};

const openTextArea = async scope => {
    const handler = getElementHandlerFromScope(scope);
    await handler.wait();
    handler.open();
};

const renderContentsToForm = contents => {
    $('.ocean-ui-editor-field').html(contents);
};

const recoveryProcess = async content => {
    await openTextArea(content.scope);
    await sleep(10);
    renderContentsToForm(content.contents);
};

recoveryProcess(CONTENT);
