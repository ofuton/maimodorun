$(() => {
    const recoveryProcess = async (contents) => {
        await checkTextAreaDisplay();
        openTextArea();
        await sleep(10);
        renderContentsToForm(contents);
    };

    const contents = valueFromNewTabWithRecovery;
    recoveryProcess(contents)
});
