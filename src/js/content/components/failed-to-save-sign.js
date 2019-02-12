import $ from 'jquery';
import { isExists } from 'utils';
import failedToSaveSignTemplate from 'templates/failed-to-save-sign';

const createFailedToSaveSign = (message) => {
    return failedToSaveSignTemplate(
        {
            imgSrc: chrome.extension.getURL('./assets/images/error_mark.png'),
            message: message,
        }
    );
};

const insertFailedToSaveSign = (baseElement, message) => {
    if (isExists(baseElement, '.maimodorun-saved-sign')) {
        return;
    }

    baseElement.find('.ocean-ui-comments-commentform-submit').after(createFailedToSaveSign(message));
};

export {
    insertFailedToSaveSign
};
