import $ from 'jquery';
import MessageClient from 'background/message-client';
import { getBaseKey, getReplyKeySuffix } from 'utils/get-key';
import { debounce } from 'debounce';
import { sleep, getBytes, hasAnyContents } from 'utils/index';
import { insertRecoveryButton } from 'content/components/recovery-button';
import { insertAutoSavedSign, removeAutoSavedSign } from 'content/components/auto-saved-sign';
import { insertFailedToSaveSign } from 'content/components/failed-to-save-sign';

export default class BaseHandler {
    constructor() {
        this.messageClient = new MessageClient();
        this.messageClient.initStorage();
        this.debounceFunc = debounce(async (type, baseElement) => {
            try {
                await this.saveFormText(type, baseElement);
                insertAutoSavedSign(baseElement);
                this.displayRecoveryButton(type, baseElement);
            } catch(error) {
                this.handleSaveError(baseElement, error);
            }
        }, 2000);
        this.editorField = '.ocean-ui-editor-field';
        this.submitClass = '.ocean-ui-comments-commentform-submit';
        this.cancelClass = '.ocean-ui-comments-commentform-cancel';
        this.maimodorunButton = '.ocean-ui-editor-toolbar-maimodorun';
        this.commentsCommentForm = '.ocean-ui-comments-commentform';
    }

    getScope(type) {
        return `${this.scopePrefix}.${type}`;
    }

    bindOpenEditor(event, bindClass, type, baseDomClass) {
        $(document).on(
            event, bindClass, this.onOpenEditor(type, baseDomClass)
        );
    }

    bindSubmit(type, baseElement) {
        const submitElement = baseElement.find(this.submitClass);
        // Avoid to register dupilicated event handlers
        submitElement.off('click.maimodorun');
        submitElement.on('click.maimodorun', this.onSubmit(type, baseElement));
    }

    bindCancel(type, baseElement) {
        const cancelElement = baseElement.find(this.cancelClass);
        // Avoid to register dupilicated event handlers
        cancelElement.off('mousedown.maimodorun');
        cancelElement.on('mousedown.maimodorun', this.onCancel(type, baseElement));
    }

    bindRecover(type, baseElement) {
        const recoverElement = baseElement.find(this.maimodorunButton);
        // Avoid to register dupilicated event handlers
        recoverElement.off('click.maimodorun');
        recoverElement.on('click.maimodorun', this.onRecover(type, baseElement));
    }

    async displayRecoveryButton(type, baseElement) {
        const key = this.getKey(type, baseElement);
        // FIXME: this.messageClient.hasKeyInStorage に替える
        const value = await this.messageClient.getValueFromStorage(key);

        if (value) {
            insertRecoveryButton(baseElement);
            this.bindRecover(type, baseElement);
        }
    }

    buildFormObservers(types) {
        return types.reduce((acc, type) => {
            acc[type] = this.buildFormObserver(type);
            return acc;
        }, {});
    }

    buildFormObserver(type) {
        return new MutationObserver((mutations, observer) => {
            const baseElement = $(mutations[0].target).closest(this.commentsCommentForm);
            removeAutoSavedSign(baseElement);
            this.debounceFunc(type, baseElement);
        });
    }

    onOpenEditor(type, baseDomClass) {
        return async event => {
            const baseElement = $(event.target).closest(baseDomClass);

            await sleep(10);
            this.bindSubmit(type, baseElement);
            this.bindCancel(type, baseElement);
            this.displayRecoveryButton(type, baseElement);

            this.formObservers[type].observe(baseElement.find(this.editorField)[0], {
                childList: true,
                attributes: true,
                characterData: true,
                subtree: true
            });
        };
    }

    onSubmit(type, baseElement) {
        return async () => {
            try {
                this.debounceFunc.clear();
                await this.saveFormText(type, baseElement);
                removeAutoSavedSign(baseElement);
            } catch(error) {
                this.handleSaveError(baseElement, error);
            }
        };
    }

    onCancel(type, baseElement) {
        return async () => {
            try {
                this.debounceFunc.clear();
                await this.saveFormText(type, baseElement);
                removeAutoSavedSign(baseElement);
                // FIXME: recovery-button を消す必要あり
            } catch(error) {
                this.handleSaveError(baseElement, error);
            }
        };
    }

    onRecover(type, baseElement) {
        return async event => {
            const key = this.getKey(type, baseElement);
            const value = await this.messageClient.getValueFromStorage(key);
            $(event.target).closest(this.commentsCommentForm).find(this.editorField).html(value.contents);
        };
    }

    getKey(type, baseElement) {
        const baseKey = getBaseKey(this.pattern);
        if (!baseKey) {
            throw new Error('This page url did not match url pattern.');
        }
        const key = type === 'Reply' ? baseKey + getReplyKeySuffix(baseElement) : baseKey;

        return key;
    }

    async saveFormText(type, baseElement) {
        const commentForm = baseElement.find(this.editorField);
        if (commentForm.length === 0) throw new Error('PageTransitioned');

        const formContents = commentForm[0].innerHTML;
        if (getBytes(formContents) >= 1024 * 1024) throw new Error('ContentsSizeOver');

        if (!hasAnyContents(commentForm)) throw new Error('NoContents');

        const url = this.getKey(type, baseElement);
        if (!url) throw new Error('NotMatchURL');

        const coverImageUrl = this.getIcon();
        await this.messageClient.setValueIntoStorage(
            {
                url: url,
                scope : this.getScope(type),
                title: document.title,
                timestamp: new Date().getTime(),
                coverImageUrl: coverImageUrl,
                contents: formContents,
            }
        );
    }

    handleSaveError(baseElement, error) {
        switch (error.message) {
        case 'ContentsSizeOver':
            insertFailedToSaveSign(baseElement, '保存内容が1MBを超えているため、保存できません。');
            break;
        case 'CapacityExceededError':
            insertFailedToSaveSign(baseElement, '保存容量を超えています。保存項目を削除し、容量を確保してください。');
            break;
        case 'NoContents':
            // 空の内容を保存しようとした例外なのでスルー
            break;
        case 'PageTransitioned':
            // 保存前にページを遷移してしまったため破棄
            break;
        case 'NotMatchURL':
            // 動作対象のURLとマッチしなかったため破棄
            break;
        default:
            throw error;
            break;
        }
    }
}
