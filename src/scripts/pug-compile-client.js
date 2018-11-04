const fs = require('fs');
const pug = require('pug');

const initPugCompileClient = () => {
    // templates ディレクトリがなければ作成する
    const templatesDirPath = './dist/assets/js/templates';
    if (!fs.existsSync(templatesDirPath)) {
        fs.mkdirSync(templatesDirPath);
    }
};

const compileHistoriesTemplate = () => {
    const historiesRenderTemplate = pug.compileFileClient(
        './src/html/client/_client_histories_template.pug',
        {name: "historiesRenderTemplate"}
    );
    fs.writeFileSync('./dist/assets/js/templates/histories.min.js', historiesRenderTemplate);
};

const compileClient = () => {
    initPugCompileClient();
    compileHistoriesTemplate();
};

(() => {
   compileClient();
})();

