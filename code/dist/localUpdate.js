"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getFootBall_1 = require("./getFootBall");
const delay = (n) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, n);
    });
};
let timeId = '';
async function cInter(cb, n) {
    try {
        const d = await cb();
        if (!d) {
            return;
        }
    }
    catch (error) {
        console.log('error', error);
        await delay(1000);
        await cInter(cb, n);
        return;
    }
    timeId = setTimeout(async () => {
        try {
            await cInter(cb, n);
        }
        catch (error) { }
    }, n);
}
// 为了节省运算资源补充本地运行
const footballUpdate = async () => {
    const { log, matchData } = await (0, getFootBall_1.getData)('MW5038', 'Aadd555', { limit: 0 });
    console.log(new Date().toString(), 'up football');
    await (0, getFootBall_1.sendDingDingMessage)(matchData);
};
const basketballUpdate = async () => {
    const { matchData: basketballData } = await (0, getFootBall_1.getBasketballData)('MW5038', 'Aadd555', { limit: 0 });
    console.log(new Date().toString(), 'up basketball');
    await (0, getFootBall_1.sendBasketballDingDingMessage)(basketballData);
};
(() => {
    cInter(async () => {
        await footballUpdate();
        await basketballUpdate();
        return true;
    }, 60 * 1000);
})();
