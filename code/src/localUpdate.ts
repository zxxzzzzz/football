import { getBasketballData, getData, sendBasketballDingDingMessage, sendDingDingMessage } from './getFootBall';
import { saveStore } from './util';

const delay = (n: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, n);
  });
};

let timeId = '' as any;
async function cInter(cb: () => Promise<boolean>, n: number) {
  try {
    const d = await cb();
    if (!d) {
      return;
    }
  } catch (error) {
    console.log('error', error);
  }
  timeId = setTimeout(async () => {
    try {
      await cInter(cb, n);
    } catch (error) {}
  }, n);
}

// 为了节省运算资源补充本地运行
const footballUpdate = async () => {
  // 只支持uid登录
  const { log, matchData } = await getData('', '', { limit: -1 });
  console.log(new Date().toString(), 'up football');
  await sendDingDingMessage(matchData);
};

const basketballUpdate = async () => {
  // 只支持uid登录
  const { matchData: basketballData } = await getBasketballData('', '', { limit: -1 });
  console.log(new Date().toString(), 'up basketball');
  await sendBasketballDingDingMessage(basketballData);
};

(() => {
  cInter(async () => {
    await footballUpdate();
    await basketballUpdate();
    await saveStore({ localRunTimestamp: new Date().valueOf() });
    return true;
  }, 60 * 1000);
})();
