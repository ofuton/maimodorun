const renderHistoriesEmptyView = () => {
    const html = historiesEmptyRenderTemplate();
    document.getElementById('l-histories').insertAdjacentHTML('beforeend', html);
};

const renderAvailableCount = (values) => {
    const availableString = `${values.length}個のアクティビティ`;
    document.getElementById('l-header-available-count').textContent = availableString;
};

const renderDecrementAvailableCount = () => {
    const element = document.getElementById('l-header-available-count').innerText;
    const now = parseInt(element, 10);
    // 一つもアクティビティが存在しない場合は Empty View を表示する
    if (now <= 1) {
        document.getElementById('l-header-available-count').remove();
        renderHistoriesEmptyView();
        return;
    }
    document.getElementById('l-header-available-count').textContent = `${now - 1}個のアクティビティ`;
};

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

const renderLists = (values) => {
    const histories = values.map((value) => {
        const history = {
            url: value.url,
            imageUrl: value.coverImageUrl,
            title: adjustmentTitleLength(value.title),
            body: adjustmentBodyLength(filterHTML(value.contents)),
            scope: value.scope,
            fromNow: unixtimeToDate(value.timestamp)
        };
        return history;
    });
    const html = historiesRenderTemplate({ histories: histories });
    document.getElementById('l-histories').insertAdjacentHTML('beforeend', html);
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

const recoveryEvent = (event) => {
    const href = event.target.offsetParent.firstChild.getAttribute('href');
    const value = getValue(href);
    if (!value) return;
    const payload = {
        type: 'newTabWithRecovery',
        url: href
    };
    chrome.runtime.sendMessage(payload);
};

const registrationRecoveryButtonEvent = () => {
    const cards = document.getElementsByClassName('l-histories-list-card-container');
    Array.from(cards).forEach((card) => {
        // 削除ボタンにはイベントを付与しない
        card.childNodes.forEach((child) => {
            if (child.className == 'l-histories-list-card') {
                child.addEventListener('click', recoveryEvent);
            }
        });
    });
};

const getOwnListElement = (target) => {
    const parent = target.parentNode;
    return parent.tagName == 'LI' ? parent : getOwnListElement(parent);
};

const removeItemEvent = (event) => {
    const href = event.target.tagName == 'BUTTON' ?
        event.target.firstChild.getAttribute('href') : event.target.parentNode.getAttribute('href');
    const value = getValue(href);
    if (!value) return;
    const payload = {
        type: 'remove',
        url: href
    };
    chrome.runtime.sendMessage(payload, (response) => {
        switch (response.status) {
            case 'OK':
                const list = getOwnListElement(event.target);
                list.remove();
                renderDecrementAvailableCount();
        }
    });
};

const removeItemButtonEvent = () => {
    const optionMenus = document.getElementsByClassName('l-histories-list-card-remove');
    Array.from(optionMenus).forEach((menu) => {
        menu.addEventListener('click', removeItemEvent);
    });
};

const constructPopupScreen = async () => {
    const values = await getValues();
    // アクティビティがなければ EmptyView を表示するのみ
    if (values.length <= 0) {
        renderHistoriesEmptyView();
        return;
    }

    sortToDescendingOrderUnixtime(values);
    renderAvailableCount(values);
    renderLists(values);
    registrationRecoveryButtonEvent();
    removeItemButtonEvent();
};

$(() => {
    constructPopupScreen();
});
