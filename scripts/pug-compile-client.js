const fs = require('fs');
const pug = require('pug');

const initPugCompileClient = () => {
    // templates ディレクトリがなければ作成する
    const templatesDirPath = './src/js/templates';
    if (!fs.existsSync(templatesDirPath)) {
        fs.mkdirSync(templatesDirPath);
    }
};

const compileRecoveryButton = () => {
    const recoveryButtonTemplate = pug.compileFileClient(
        './src/templates/recovery-button.pug',
        {
            name: 'recoveryButtonTemplate',
            module: true,
            compileDebug: false
        });
    fs.writeFileSync('./src/js/templates/recovery-button.pjs', recoveryButtonTemplate);
};

const compileAutoSavedSign = () => {
    const autoSavedSignTemplate = pug.compileFileClient(
        './src/templates/auto-saved-sign.pug',
        {
            name: 'autoSavedSignTemplate',
            module: true,
            compileDebug: false
        });
    fs.writeFileSync('./src/js/templates/auto-saved-sign.pjs', autoSavedSignTemplate);
};

const compileFailedToSaveSign = () => {
    const failedToSaveSignTemplate = pug.compileFileClient(
        './src/templates/failed-to-save-sign.pug',
        {
            name: 'failedToSaveSignTemplate',
            module: true,
            compileDebug: false
        });
    fs.writeFileSync('./src/js/templates/failed-to-save-sign.pjs', failedToSaveSignTemplate);
};

const compileHistoriesTemplate = () => {
    const historiesTemplate = pug.compileFileClient(
        './src/templates/histories.pug',
        {
            name: "historiesTemplate",
            module: true,
            compileDebug: false
        }
    );
    fs.writeFileSync('./src/js/templates/histories.pjs', historiesTemplate);
};

const compileHistoryEmptyTemplate = () => {
    const historyEmptyTemplate = pug.compileFileClient(
        './src/templates/history-empty.pug',
        {
            name: "historyEmptyTemplate",
            module: true,
            compileDebug: false
        }
    );
    fs.writeFileSync('./src/js/templates/history-empty.pjs', historyEmptyTemplate);
};

const compileClient = () => {
    initPugCompileClient();
    compileRecoveryButton();
    compileAutoSavedSign();
    compileHistoriesTemplate();
    compileHistoryEmptyTemplate();
    compileFailedToSaveSign();
};

(() => {
   compileClient();
})();
