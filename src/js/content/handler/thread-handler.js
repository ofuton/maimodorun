import $ from 'jquery';
import BaseHandler from 'content/handler/base-handler';

export default class ThreadHandler extends BaseHandler {
    constructor() {
        super();
        this.scopePrefix = 'Thread';
        this.formObservers = this.buildFormObservers(['Body', 'Reply']);
        this.pattern = /^https:\/\/.+\.cybozu(-dev)?\.com\/k(\/guest\/\d+)?\/#\/space\/\d+\/thread\/\d+/;
        this.threadCommentTextArea = '.ocean-ui-comments-commentform-textarea';
        this.threadCommentReplyLinks = '.ocean-ui-comments-commentbase-comment, .ocean-ui-comments-commentbase-commentall';
        this.threadCommentsCommentForm = '.ocean-ui-comments-commentform';
        this.threadCommentsPost = '.ocean-ui-comments-post';
        this.spaceCover = '.gaia-argoui-space-spacelayout-cover';
    }

    run() {
        this.bindOpenEditor('focus', this.threadCommentTextArea, 'Body', this.threadCommentsCommentForm);
        this.bindOpenEditor('click', this.threadCommentReplyLinks, 'Reply', this.threadCommentsPost);
    }

    getIcon() {
        return $(this.spaceCover).css('background-image').replace(/^url\(['"](.+)['"]\)/, '$1');
    }
}
