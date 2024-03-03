"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getFootBall_1 = require("./getFootBall");
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
    }
    timeId = setTimeout(async () => {
        await cInter(cb, n);
    }, n);
}
// 为了节省运算资源补充本地运行
const footballUpdate = async () => {
    const { log, matchData } = await (0, getFootBall_1.getData)('MW5038', 'Add5555', { limit: 0 });
    console.log('up football');
    await (0, getFootBall_1.sendDingDingMessage)(matchData);
};
const basketballUpdate = async () => {
    const { matchData: basketballData } = await (0, getFootBall_1.getBasketballData)('MW5038', 'Add5555', { limit: 0 });
    console.log('up basketball');
    await (0, getFootBall_1.sendBasketballDingDingMessage)(basketballData);
};
(() => {
    cInter(async () => {
        await footballUpdate();
        await basketballUpdate();
        return true;
    }, 90 * 1000);
})();
