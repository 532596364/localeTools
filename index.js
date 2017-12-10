const fs = require("fs");
const uuidv4 = require('uuid/v4');


/**
 * 中文英文配置文件格式  转换成json格式的对象
 * @param {*} arr
 */
const getLocaleConfigJson = function (arr) {

    let localeConfigJson = {};

    arr.forEach((item) => {
        const itemArr = item.split(':');
        const key = itemArr[0];
        const value = item.slice(key.length + 1);

        localeConfigJson[key] = value;
    })

    return localeConfigJson;
}

/**
 * 去除换行符
 */
const delBr = function (arr) {
    return arr.map((item) => {
        return item.slice(0, -2);
    })
}

/**
 * 得到换行符组成的新的数组
 */
const getLocaleConfigArr = function (string) {
    const rgExp = /([\s\S]*?):([\s\S]*?\n)/g;
    return string.match(rgExp);
}

/**
 * 得到html中过滤出来的中文，转换成一下格式
 * [{
 *      key: 'uuid或者已存在的',
 *      value: '中文'
 * }, ......]
 *
 */
const getLocaleArr = function (filterCN, localeConfigJson) {

    let localeArr = [];

    filterCN.forEach((item) => {
        let isExsit = false;
        let configKey;

        // 查找是否已经存在国际化配置
        for (let key in localeConfigJson) {
            if (localeConfigJson.hasOwnProperty(key) === true) {
                if (item == localeConfigJson[key]) {
                    isExsit = true;
                    configKey = key;
                }
            }
        }

        // 存在对应的key
        if (isExsit) {
            localeArr.push({
                key: configKey,
                value: item
            })
        } else {
            let uuid = uuidv4()
            localeArr.push({
                key: uuid,
                value: item
            })

            //国际化配置文件增加对应的key value
            localeConfigJson[uuid] = item;
        }
    })

    return {
        localeConfigJson,
        localeArr
    }

}


const getLocalePropertiesStr = function (localeConfigJson) {
    let localePropertiesStr = '';

    for (let key in localeConfigJson) {
        if (localeConfigJson.hasOwnProperty(key) === true) {
            localeConfigJson = key + ':' + localeConfigJson(key) + '/n';
        }
    }

    return localePropertiesStr;
}


fs.readFile('./files/test.html', (err, data) => {
    if (err) {
        return console.error(err);
    }

    let oldHtml = data.toString();
    const rgExp = /<!--([\s\S]*?)(?=-->)/g;
    const filters = oldHtml.match(rgExp);

    if (!filters) {
        return;
    }

    const filterCN = filters.map((item) => item.slice(5, -1));


    // 国际化配置文件 => json格式
    // 得到当前html文件需要翻译的部分
    fs.readFile('./files/supplier-zh-CN.properties', (err, data) => {
        if (err) {
            return console.error(err);
        }

        let localeConfigStr = data.toString();

        let localeConfigArr;            //国际化配置文件正则匹配出的数组
        let localeConfigArrWithOutBr;   //去除换行符的数组
        let localeConfigJson;           //国际化配置文件 => json格式
        let localeArr;                  //当前html文件需要翻译的部分

        localeConfigArr = getLocaleConfigArr(localeConfigStr);
        localeConfigArrWithOutBr = delBr(localeConfigArr);
        localeConfigJson = getLocaleConfigJson(localeConfigArrWithOutBr);
        console.log('localeConfigJson', localeConfigJson);

        localeConfigJson = getLocaleArr(filterCN, localeConfigJson).localeConfigJson;
        console.log('locallocaleConfigJsoneArr', localeConfigJson);

        localeArr = getLocaleArr(filterCN, localeConfigJson).getLocaleArr;
        console.log('localeArr', localeArr);


        // json格式 => 国际化配置文件


        //写入
        fs.writeFile('./files/translate/supplier-zh-CN.properties', getLocalePropertiesStr(localeConfigJson), function (err) {
            if (err) {
                return console.error(err);
            }
            console.log("数据写入成功！");

        });


        // 特殊字符添加反斜杠
        const rules = ['\\', '/', '^', '$', '*', '+', '?', '|', '[', ']', '(', ')']

        let newHtml;

        localeArr.forEach((item) => {
            const newNameArr = item.value.split('');


            //对特殊字符进行处理
            const newFilerItem = newNameArr.map((item) => {
                if (rules.indexOf(item) != -1) {
                    return item = '\\' + item;
                }
                return item;
            })

            const newReg = new RegExp(newFilerItem.join('') + `(?!\\s-->)`);

            newHtml = oldHtml.replace(newReg, `{$t('`+ item.key + `')}`);

        })


        //写入
        fs.writeFile('./files/translate/test.html', newHtml, function (err) {
            if (err) {
                return console.error(err);
            }
            console.log("数据写入成功！");

        });


    });

});


