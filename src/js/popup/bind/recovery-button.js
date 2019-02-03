const bindRecoveryButton = messageClient => {
    const cards = document.getElementsByClassName('l-histories-list-card-container');

    Array.from(cards).forEach((card) => {
        // 削除ボタンにはイベントを付与しない
        card.childNodes.forEach((child) => {
            if (child.className == 'l-histories-list-card') {
                child.addEventListener('click', event => {
                    onRecover(event, messageClient);
                });
            }
        });
    });
};

const onRecover = async (event, messageClient) => {
    const href = event.target.offsetParent.firstChild.getAttribute('href');
    await messageClient.recoveryWithNewTab(href);
};

export default bindRecoveryButton;
