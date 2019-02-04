import historiesTemplate from 'templates/histories';
import { unixtimeToDate, filterHTML } from 'utils';

const adjustmentTitleLength = (title) => {
    let titles = title.split('-');
    const slicedTitles = titles.map((title) => {
        if(title.length < 21) return title;
        return `${title.slice(0, 21)}...`;
    });
    return slicedTitles.join(' - ');
};

const adjustmentBodyLength = (contents) => {
    if(contents.length < 37) return contents;
    return `${contents.slice(0, 37)}...`;
};

const renderList = contents => {
    const histories = contents.map((content) => {
        const history = {
            url: content.url,
            imageUrl: content.coverImageUrl,
            title: adjustmentTitleLength(content.title),
            body: adjustmentBodyLength(filterHTML(content.contents)),
            scope: content.scope,
            fromNow: unixtimeToDate(content.timestamp)
        };
        return history;
    });
    const html = historiesTemplate({ histories: histories });
    document.getElementById('l-histories').insertAdjacentHTML('beforeend', html);
};

export default renderList;
