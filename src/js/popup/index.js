import render from 'popup/render';
import MessageClient from 'background/message-client';
import { sortToDescendingOrderUnixtime } from 'utils';
import bindRemoveButton from 'popup/bind/remove-button';
import bindRecoveryButton from 'popup/bind/recovery-button';

const init = async () => {
    const messageClient = new MessageClient();

    // FIXME; データ取ってくる時にソートしたい
    // FIXME: ALL ではなくて数を指定して取ってきたい．
    const contents = await messageClient.getAllValueFromStorage();
    // FIXME: IndexedDB からデータを取ってくる際にソートすればこのメソッドは不必要
    sortToDescendingOrderUnixtime(contents);
    render(contents);

    bindRemoveButton(messageClient);
    bindRecoveryButton(messageClient);
};

init();
