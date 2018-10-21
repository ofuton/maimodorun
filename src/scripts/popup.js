const sortToDescendingOrderUnixtime = (values) => {
    values.sort((a, b) => {
        if(a.timestamp > b.timestamp) return -1;
        if(a.timestamp < b.timestamp) return 1;
        return 0;
    });
};

const unixtimeToDate = (unixtime) => {
    moment.locale('ja');
    const m = moment(unixtime);
    return m.fromNow();
};

const filterHTML = (string) => {
    return string.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'');
};

const sliceContents = (contents) => {
    if(contents.length < 100) return contents;
    return `${contents.slice(0, 100)}...`;
}

const renderLists = (values) => {
    const formattedValues = values.map((value, index, array) => {
        const formattedValue = {
            timestamp: unixtimeToDate(value.timestamp),
            title: filterHTML(value.title),
            coverImageUrl: value.coverImageUrl,
            contents: sliceContents(filterHTML(value.contents)),
            url: value.url
        };
        return formattedValue;
    })
    const template = $('#item_lists').html();
    const compiledTemplate = _.template(template);
    const html = compiledTemplate({ lists: formattedValues });
    $('.recovery-data-body-ul').html(html);
};

const getValues = () => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({type: 'loadAll'}, (response) => {
            resolve(response.values);
        });
    });
};

const getValue = (url) => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({type: 'load', url: url}, (response) => {
            resolve(response.values);
        });
    });
};

const registrationRecoveryButtonEvent = () => {
    $('.popup-recovery-btn').on('click', (event) => {
        const href = $(event.currentTarget).attr('href');
        const value = getValue(href);
        if (!value) return;
        const payload = {
            type: 'newTabWithRecovery',
            url: href
        }
        chrome.runtime.sendMessage(payload);
    });
};

const removeItemButtonEvent = () => {
    $('.popup-li-remove-btn').on('click', (event) => {
        const element = $(event.currentTarget);
        const href = element.attr('href');
        const payload = {
            type: 'remove',
            url: href
        }
        chrome.runtime.sendMessage(payload, (response) => {
            switch (response.status) {
                case 'OK':
                    const item = element.parents('.popup-li');
                    item.remove();
                default:
                    throw new Error('削除に失敗しました');
            }
        });
    })
};

const constructPopupScreen = async () => {
    const values = await getValues();
    if (values.length <= 0) return;

    sortToDescendingOrderUnixtime(values);
    renderLists(values);
    registrationRecoveryButtonEvent();
    removeItemButtonEvent();
};

$(() => {
    constructPopupScreen();
});
