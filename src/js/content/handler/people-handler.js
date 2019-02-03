import $ from 'jquery';
import BaseHandler from 'content/handler/base-handler';

export default class PeopleHandler extends BaseHandler {
    constructor() {
        super();
        this.scopePrefix = 'People';
        this.formObservers = this.buildFormObservers(['Body', 'Reply']);
        this.pattern = /^https:\/\/.+\.cybozu(-dev)?\.com\/k\/#\/people\/user\/[^/]+/;
        this.peopleCommentTextArea = '.ocean-ui-comments-commentform-textarea';
        this.peopleCommentReplyLinks = '.ocean-ui-comments-commentbase-comment, .ocean-ui-comments-commentbase-commentall';
        this.peopleCommentsCommentForm = '.ocean-ui-comments-commentform';
        this.peopleCommentsPost = '.ocean-ui-comments-post';
        this.userIcon = '.gaia-argoui-people-cover-icon';
    }

    run() {
        this.bindOpenEditor('focus', this.peopleCommentTextArea, 'Body', this.peopleCommentsCommentForm);
        this.bindOpenEditor('click', this.peopleCommentReplyLinks, 'Reply', this.peopleCommentsPost);
    }

    getIcon() {
        return $(this.userIcon).css('background-image').replace(/^url\(['"](.+)['"]\)/, '$1');
    }
}
