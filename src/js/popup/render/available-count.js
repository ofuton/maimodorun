import renderHistoryEmpty from 'popup/render/history-empty';

const renderAvailableCount = (count) => {
    const availableCount = `${count}個のアクティビティ`;
    document.getElementById('l-header-available-count').textContent = availableCount;
};

const decreaseAvailableCount = () => {
    const element = document.getElementById('l-header-available-count').innerText;
    const now = parseInt(element, 10);

    if (now <= 1) {
        document.getElementById('l-header-available-count').remove();
        renderHistoryEmpty();
        return;
    }

    document.getElementById('l-header-available-count').textContent = `${now - 1}個のアクティビティ`;
};

export {
    renderAvailableCount,
    decreaseAvailableCount
};
