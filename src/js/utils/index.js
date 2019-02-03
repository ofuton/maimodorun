import $ from 'jquery';
import moment from 'moment';

const sleep = ms => new Promise((resolve) => setTimeout(resolve, ms));

const getBytes = string => encodeURIComponent(string).replace(/%../g,"x").length;

const hasAnyContents = element => {
    if (element.is('img') || element.text().trim() !== "") return true;

    let flag = false;
    element.children().each((index, child) => {
        if (flag = hasAnyContents($(child))) return false;  // false を返すと break
    });

    return flag;
};

const waitUntilDisplay = className => {
    return new Promise(resolve => {
        const setIntervalId = setInterval(() => {
            const target = $(className);
            if(target.length > 0) {
                clearInterval(setIntervalId);
                resolve();
            }
        }, 200);
    });
};

const unixtimeToDate = unixtime => {
    moment.locale('ja');
    const m = moment(unixtime);
    return m.fromNow();
};

const filterHTML = string => string.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'');

// FIXME: IndexedDB からデータを取ってくる際にソートすればこのメソッドは不必要
const sortToDescendingOrderUnixtime = items => {
    items.sort((a, b) => {
        if(a.timestamp > b.timestamp) return -1;
        if(a.timestamp < b.timestamp) return 1;
        return 0;
    });
};

const isExists = (baseElement, klass) => baseElement.find(klass).length !== 0;

export {
    sleep,
    getBytes,
    hasAnyContents,
    waitUntilDisplay,
    unixtimeToDate,
    filterHTML,
    sortToDescendingOrderUnixtime,
    isExists,
};
