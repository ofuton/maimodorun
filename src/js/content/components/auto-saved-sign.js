import $ from 'jquery';
import { isExists } from 'utils';
import autoSavedSignTemplate from 'templates/auto-saved-sign';

const createAutoSavedSign = () => {
    return autoSavedSignTemplate();
};

const insertAutoSavedSign = baseElement => {
    if (isExists(baseElement, '.maimodorun-saved-sign')) {
        return;
    }

    baseElement.find('.ocean-ui-comments-commentform-submit').after(createAutoSavedSign());
};

const removeAutoSavedSign = baseElement => {
    if (!isExists(baseElement, '.maimodorun-saved-sign')) {
        return;
    }

    baseElement.find('.maimodorun-saved-sign').remove();
};

export {
    insertAutoSavedSign,
    removeAutoSavedSign
}
