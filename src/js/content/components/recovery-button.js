import $ from 'jquery';
import { isExists } from 'utils';
import recoveryButtonTemplate from 'templates/recovery-button';

const createRecoveryButton = () => {
    return recoveryButtonTemplate(
        { iconImgSrc: chrome.extension.getURL('./assets/images/icon48.png') }
    );
};

const insertToolBarPartition = toolbar => {
    const lastButton = toolbar.find('.goog-toolbar-button').last();
    lastButton.addClass('goog-toolbar-button-right-border');
};

const insertRecoveryButton = baseElement => {
    if (isExists(baseElement, '.maimodorun-button')) {
        return;
    }

    const toolbar = baseElement.find('.goog-toolbar');
    insertToolBarPartition(toolbar);
    toolbar.append(createRecoveryButton());
};

export {
    insertRecoveryButton
};
