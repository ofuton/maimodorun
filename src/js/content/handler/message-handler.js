import $ from 'jquery';
import BaseHandler from 'content/handler/base-handler';

export default class MessageHandler extends BaseHandler {
    constructor() {
        super();
        this.scopePrefix = 'Message';
        this.formObservers = this.buildFormObservers(['Body']);
        this.pattern = /^https:\/\/.+\.cybozu(-dev)?\.com\/k\/#\/message\/\d+;\d+/;
        this.messageCommentTextArea = '.ocean-ui-comments-commentform-textarea';
        this.messageCommentsCommentForm = '.ocean-ui-comments-commentform';
        this.userIcon = '.ocean-message-header-photo';
    }

    run() {
        this.bindOpenEditor('focus', this.messageCommentTextArea, 'Body', this.messageCommentsCommentForm);
    }

    getIcon() {
        return $(this.userIcon).css('background-image').replace(/^url\(['"](.+)['"]\)/, '$1');
    }
}
