import historyEmptyTemplate from 'templates/history-empty';

const renderHistoryEmpty = () => {
    const html = historyEmptyTemplate();
    document.getElementById('l-histories').insertAdjacentHTML('beforeend', html);
};

export default renderHistoryEmpty;
