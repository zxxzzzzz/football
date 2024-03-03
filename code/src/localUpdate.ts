import { getBasketballData, getData, sendBasketballDingDingMessage, sendDingDingMessage } from './getFootBall';

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
    await cInter(cb, n);
  }, n);
}

// 为了节省运算资源补充本地运行
const footballUpdate = async () => {
  const { log, matchData } = await getData('MW5038', 'Aadd555', { limit: 0 });
  console.log('up football');
  await sendDingDingMessage(matchData);
};

const basketballUpdate = async () => {
  const { matchData: basketballData } = await getBasketballData('MW5038', 'Aadd555', { limit: 0 });
  console.log('up basketball');
  await sendBasketballDingDingMessage(basketballData);
};

(() => {
  cInter(async () => {
    await footballUpdate();
    await basketballUpdate();
    return true;
  }, 60 * 1000);
})();
