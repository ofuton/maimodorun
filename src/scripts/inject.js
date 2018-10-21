$(() => {
    const checkTextAreaDisplay = () => {
        return new Promise(resolve => {
            const setIntervalId = setInterval(() => {
                const commentForm = $(document).find(threadCommentTextArea);
                if(commentForm.length > 0) {
                    clearInterval(setIntervalId);
                    resolve();
                }
            }, 200);
        });
    };

    const openTextArea = () =>  {
        $(document).find(threadCommentTextArea)[0].focus();
    };

    const renderContentsToForm = (contents) => {
        $(document).find(threadCommentForm).html(contents);
    };

    const recoveryProcess = async (contents) => {
        await checkTextAreaDisplay();
        openTextArea();
        await sleep(10);
        renderContentsToForm(contents);
    };

    recoveryProcess(valueFromNewTabWithRecovery);
});
