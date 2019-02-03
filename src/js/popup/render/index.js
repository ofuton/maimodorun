import $ from 'jquery';
import renderHistoryEmpty from 'popup/render/history-empty';
import { renderAvailableCount } from 'popup/render/available-count';
import renderList from 'popup/render/list';

const render = contents => {
    if (contents.length <= 0) {
        renderHistoryEmpty();
        return;
    }

    renderAvailableCount(contents.length);
    renderList(contents);
};

export default render;
