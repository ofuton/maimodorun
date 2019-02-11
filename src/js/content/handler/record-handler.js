import $ from 'jquery';
import { getHashName } from 'utils/location';
import parseQuery from 'utils/parse-query';
import { getBaseKey } from 'utils/get-key';
import BaseHandler from 'content/handler/base-handler';

export default class RecordHandler extends BaseHandler {
    constructor() {
        super();
        this.scopePrefix = 'Record';
        this.formObservers = this.buildFormObservers(['Body']);
        this.pattern = /^https:\/\/.+\.cybozu(-dev)?\.com\/k\/\d+\/show/;
        this.recordCommentTextArea = '.ocean-ui-comments-commentform-textarea';
        this.recordCommentReplyLinks = '.commentlist-footer-reply-gaia, .commentlist-footer-replyall-gaia';
        this.recordSidebarContent = '.gaia-argoui-app-show-sidebar-content';
        this.appIcon = '.gaia-argoui-app-titlebar-icon';
        this.spaceCover = '.gaia-argoui-app-titlebar-has-background';
    }

    run() {
        this.bindOpenEditor('focus', this.recordCommentTextArea, 'Body', this.recordSidebarContent);
        this.bindOpenEditor('click', this.recordCommentReplyLinks, 'Body', this.recordSidebarContent);
    }

    getIcon() {
        const appIcon = $(this.appIcon);
        const imgSrc = appIcon.length !== 0 ? appIcon.attr('src') : this.getCoverImg();

        return /^https:\/\//.test(imgSrc) ? imgSrc : location.origin + imgSrc;
    }

    getCoverImg() {
        return $(this.spaceCover).css('background-image').replace(/^url\(['"](.+)['"]\)/, '$1');
    }

    getKey(type, baseElement) {
        const baseKey = getBaseKey(this.pattern);
        if (!baseKey) {
            throw new Error('This page url did not match url pattern.');
        }
        const { record } = parseQuery(getHashName());

        return baseKey + `#record=${record}`;
    }
}
