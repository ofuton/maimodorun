import { decreaseAvailableCount } from 'popup/render/available-count';

const bindRemoveButton = messageClient => {
    const removeButtons = document.getElementsByClassName('l-histories-list-card-remove');
    Array.from(removeButtons).forEach((button) => {
        button.addEventListener('click', event => {
            onRemove(event, messageClient);
        });
    });
};

const onRemove = (event, messageClient) => {
    const target = event.target;
    const href = target.tagName === 'BUTTON' ?
          target.firstChild.getAttribute('href') : target.parentNode.getAttribute('href');
    try {
        messageClient.removeValueInStorage(href);
        removeItemElement(target);
        decreaseAvailableCount();
    } catch(e) {
        console.error(e);
    }
};

const getItemElement = target => {
    const parent = target.parentNode;
    return parent.tagName === 'LI' ? parent : getItemElement(parent);
};

const removeItemElement = target => {
    const list = getItemElement(target);
    list.remove();
};

export default bindRemoveButton;
