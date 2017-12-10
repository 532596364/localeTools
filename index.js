const fs = require("fs");

fs.readFile('./files/test.html', (err, data) => {
    if (err) {
        return console.error(err);
    }

    let text = data.toString();
    const rgExp = /<!--([\s\S]*?)(?=-->)/g;
    const filters = text.match(rgExp);
    const newfilters = filters.map((item) => item.slice(5, -1));

    const a = newfilters[2];
    // 特殊字符添加反斜杠
    const rules = ['\\', '/', '^', '$', '*', '+', '?', '|', '[', ']', '(', ')']

    let newHtml;

    newfilters.forEach((item) => {
        const filterItem = item.split('');

        const newFilerItem = filterItem.map((item) => {
            if (rules.indexOf(item) != -1) {
                return item = '\\' + item;
            }
            return item;
        })

        const newReg = new RegExp(newFilerItem.join('') + `(?!\\s-->)`);

        text = text.replace(newReg, `{$t('hahah')}`);

    })

    console.log(text);

});


console.log("程序执行完毕。");