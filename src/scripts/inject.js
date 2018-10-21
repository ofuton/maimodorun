$(() => {
    // FIXME: スレッド以外のページに対応する場合，ここの処理が繰り返されるケースが出てくる
    const waitUntilDisplay = (element) => {
        return new Promise(resolve => {
            const setIntervalId = setInterval(() => {
                const target = $(element);
                if(target.length > 0) {
                    clearInterval(setIntervalId);
                    resolve();
                }
            }, 200);
        });
    };

    const getElementHandlerFromScope = (scope) => {
        let el;
        switch (scope) {
        case 'Thread.Body':
            el = '.ocean-ui-comments-commentform-textarea';
            return {
                wait: async () => await waitUntilDisplay(el),
                open: () => $(el)[0].focus()
            };
            break;
        case 'Thread.Reply':
            el = '.ocean-ui-comments-commentbase-comment';
            return {
                wait: async () => await waitUntilDisplay(el),
                open: () => $(el)[0].click()
            };
            break;
        default:
            el = '.ocean-ui-comments-commentform-textarea';
            return {
                wait: async () => await waitUntilDisplay(el),
                open: () => $(el)[0].focus()
            };
            break;
        };
    };

    const openTextArea = async (scope) =>  {
        const handler = getElementHandlerFromScope(scope);
        await handler.wait();
        handler.open();
    };

    const renderContentsToForm = (contents) => {
        $('.ocean-ui-editor-field').html(contents);
    };

    const recoveryProcess = async (valueForRecovery) => {
        await openTextArea(valueForRecovery.scope);
        await sleep(10);
        renderContentsToForm(valueForRecovery.contents);
    };

    recoveryProcess(valueFromNewTabWithRecovery);
});
