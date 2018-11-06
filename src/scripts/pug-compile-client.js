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

const compileHistoriesEmptyTemplate = () => {
    const historiesEmptyRenderTemplate = pug.compileFileClient(
        './src/html/client/_client_histories_empty_template.pug',
        {name: "historiesEmptyRenderTemplate"}
    );
    fs.writeFileSync('./dist/assets/js/templates/histories_empty.min.js', historiesEmptyRenderTemplate);
};

const compileClient = () => {
    initPugCompileClient();
    compileHistoriesTemplate();
    compileHistoriesEmptyTemplate();
};

(() => {
   compileClient();
})();

