import $ from 'jquery';
import buildHandler from 'content/handler';

const init = () => {
    const handler = buildHandler();
    if (!handler) return;

    handler.run();
};

$(window).on('load hashchange', () => {
    init();
});
