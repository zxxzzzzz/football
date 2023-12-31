// @ts-ignore
import Format from 'json-format';
import { isTeamEqu, isLeagueEqual, toData, toBasketballData, getBasketballMessage1List, getBasketballMessage2List } from './util';
import dayjs from 'dayjs';
import {
  retryGetLeagueListAllByNodeFetch,
  retryGetGameListByNodeFetch,
  retryGetGameOBTByNodeFetch,
  retryGetTiCaiByFetch,
  retryLoginByNodeFetch,
  retrySendDingDing,
  retryGetBasketballLeagueList,
  retryGetTiCaiBasketballByFetch,
  retryGetBasketballGameList,
} from './api';
// import { say } from './chaty';
import { getStore, saveStore, saveFile, getMessage1List, getMessage2List, getMessage3List, getMessage4List } from './util';
import { CError, Code, createError } from './error';

type FirstOfGeneric<T> = T extends Promise<infer F> ? F : never;

const _accountList = [
  { password: 'XD_ivan', token: '', timestamp: 0 },
  { password: 'XD_ivan1', token: '', timestamp: 0 },
  { password: 'XD_ivan2', token: '', timestamp: 0 },
  { password: 'LJ111', token: '', timestamp: 0 },
  { password: 'LJ333', token: '', timestamp: 0 },
  { password: 'XIAO222', token: '', timestamp: 0 },
  { password: 'XIAO8888', token: '', timestamp: 0 },
  { password: 'XIAO9999', token: '', timestamp: 0 },
  { password: 'XIAO0000', token: '', timestamp: 0 },
  { password: 'test_123@', token: '', timestamp: 0 },
];

type PromiseType<T> = T extends Promise<infer U> ? U : never;
export const getCacheData = async (reqData: { password: string; token: string }) => {
  const store = await getStore('data');
  const accountList = (store?.accountList || _accountList).filter((ac) => _accountList.some((_ac) => _ac.password === ac.password));
  const currentAccount = accountList.find((ac) => ac.password === reqData.password);
  if (!currentAccount) {
    return { code: Code.forbidden, msg: '该通行码不存在，请重新登陆' };
  }
  if (currentAccount?.token && currentAccount?.token !== reqData.token && dayjs().valueOf() - currentAccount.timestamp < 5 * 60 * 1000) {
    return {
      code: Code.forbidden,
      msg: '该通行码正在被使用，请重新登陆换个通行码' + ' ' + currentAccount.token + ' ' + currentAccount.timestamp,
    };
  }
  if (!currentAccount.token) {
    currentAccount.token = Math.random().toString();
  }
  currentAccount.timestamp = dayjs().valueOf();
  await saveStore({ accountList });
  const data: PromiseType<ReturnType<typeof getData>>['matchData'] | undefined = store.data;
  if (data) {
    const message1List = getMessage1List(data, store.Rev || 400);
    const message3List = getMessage3List(data, store.scoreRev || 200);
    const message4List = getMessage4List(data, store.halfRev || 400);
    const { messageList: message2List, compareDataList } = getMessage2List(data, store.C || 0.13, store.A || 1, store.compareRev || 430);
    return {
      code: 200,
      msg: 'success',
      data: {
        timestamp: store.timestamp,
        matchData: data,
        message1List,
        message2List,
        message3List,
        compareDataList,
        message4List,
        liveCount: accountList.filter((ac) => dayjs().valueOf() - ac.timestamp < 5 * 60 * 1000)?.length,
        token: currentAccount.token,
      },
    };
  }
  return {
    code: 500,
    msg: '默认更新错误',
  };
};
export const getBasketballCacheData = async (reqData: { password: string; token: string }) => {
  const store = await getStore('basketballData');
  const accountList = (store?.accountList || _accountList).filter((ac) => _accountList.some((_ac) => _ac.password === ac.password));
  const currentAccount = accountList.find((ac) => ac.password === reqData.password);
  if (!currentAccount) {
    return { code: Code.forbidden, msg: '该通行码不存在，请重新登陆' };
  }
  if (currentAccount?.token && currentAccount?.token !== reqData.token && dayjs().valueOf() - currentAccount.timestamp < 5 * 60 * 1000) {
    return {
      code: Code.forbidden,
      msg: '该通行码正在被使用，请重新登陆换个通行码' + ' ' + currentAccount.token + ' ' + currentAccount.timestamp,
    };
  }
  if (!currentAccount.token) {
    currentAccount.token = Math.random().toString();
  }
  currentAccount.timestamp = dayjs().valueOf();
  await saveStore({ accountList });
  const data: PromiseType<ReturnType<typeof getBasketballData>>['matchData'] | undefined = store?.basketballData;
  if (data) {
    const message1List = getBasketballMessage1List(data, store.Rev || 400);
    const message2List = getBasketballMessage2List(data, store.Rev || 400);
    // const message4List = getMessage4List(data, store.halfRev || 400);
    // const { messageList: message2List, compareDataList } = getMessage2List(data, store.C || 0.13, store.A || 1, store.compareRev || 430);
    return {
      code: 200,
      msg: 'success',
      data: {
        timestamp: store.timestamp,
        matchData: data,
        message1List,
        message2List,
        // message2List,
        // message3List,
        // compareDataList,
        // message4List,
        liveCount: accountList.filter((ac) => dayjs().valueOf() - ac.timestamp < 5 * 60 * 1000)?.length,
        token: currentAccount.token,
      },
    };
  }
  return {
    code: 500,
    msg: '默认更新错误',
    data: {
      token: currentAccount.token,
    },
  };
};

// app.get('/setting', async (req, res) => {
//   try {
//     const store = await getStore();
//     res.send({
//       code: 200,
//       msg: 'success',
//       data: {
//         R: store.R,
//         A: store.A,
//         C: store.C,
//         Rev: store.Rev,
//         compareRev: store.compareRev,
//         scoreRev: store.scoreRev,
//         halfRev: store.halfRev,
//       },
//     });
//   } catch (error) {
//     res.send({ code: 500, msg: (error as Error).message });
//   }
// });
// app.post('/setting', async (req, res) => {
//   try {
//     const body = req.body;
//     await saveStore(body);
//     res.status(200).send({ code: 200, msg: 'success' });
//   } catch (error) {
//     res.send({ code: 500, msg: (error as Error).message });
//   }
// });
// type M = Promise<ReturnType<typeof toData> | undefined>;

//是否在更新数据
export async function getData(username: string, password: string) {
  if (!username || !password) {
    throw createError('用户名或者密码没有填写', Code.wrongAccount);
  }
  const store = await getStore();
  let uid = store.uid;
  let ver = store.ver || '';
  let url = store.url;
  if (!uid || !ver || !url) {
    const d = await retryLoginByNodeFetch(username, password);
    await saveStore(d);
    uid = d.uid;
    ver = d.ver;
    url = d.url;
  }
  let leagueList: { name: string; id: string }[] = [];
  try {
    leagueList = await retryGetLeagueListAllByNodeFetch(url, uid, ver);
  } catch (error) {
    if ((error as CError).code === Code.uidExpire) {
      const d = await retryLoginByNodeFetch(username, password);
      await saveStore(d);
      uid = d.uid;
      ver = d.ver;
      url = d.url;
      leagueList = await retryGetLeagueListAllByNodeFetch(url, uid, ver);
    } else {
      throw error;
    }
  }
  const tiCaiDataList = await retryGetTiCaiByFetch();
  const matchedLeagueList = leagueList
    .map((l) => {
      if (tiCaiDataList.find((t) => isLeagueEqual(t.league, l.name))) {
        return l;
      }
      return void 0;
    })
    .filter((d): d is Exclude<typeof d, undefined> => !!d)
    .reduce((re, cur) => {
      // 去除重复联赛
      if (re.find((r) => r.id === cur.id)) {
        return re;
      }
      return [...re, cur];
    }, [] as { name: string; id: string }[]);
  const extraGameList = (
    await Promise.all(
      matchedLeagueList.map((m) => {
        return retryGetGameListByNodeFetch(url || '', ver || '', uid || '', m.id);
      })
    )
  ).flat();
  const promiseList = tiCaiDataList
    .map((tiCai) => {
      type Game = Exclude<(typeof extraGameList)[0], undefined>;
      const _extraGameList = extraGameList
        .filter((d): d is Game => !!d)
        .map((extra) => {
          const teamRate = isTeamEqu(tiCai.teamList, extra.teamList);
          const tDateTime = dayjs(tiCai.dateTime, 'MM-DD HH:mm');
          const eDateTime = dayjs(extra.dateTime, 'MM-DD HH:mm');
          const oneMinute = 60 * 1000;
          // 时间是否匹配,上下十分钟的范围
          const isTime1 = Math.abs(eDateTime.valueOf() - tDateTime.valueOf()) <= 10 * oneMinute;
          // 有时体彩的时间会落后extra的时间24小时
          const isTime2 = Math.abs(eDateTime.valueOf() - tDateTime.add(24, 'hour').valueOf()) <= 10 * oneMinute;
          const isTime = isTime1 || isTime2;
          // 联赛是否匹配
          const isLeague = isLeagueEqual(tiCai.league, extra.league);
          const rate = (isLeague ? 100 : 0) + (isTime ? 10 : 0) + teamRate;
          // 联赛必须匹配上
          const re: [typeof extra, number] = [extra, rate];
          return re;
        })
        .filter(([_, rate]) => rate >= 110);
      // 选出匹配度最高的一场比赛
      const game = _extraGameList.reduce(
        (re, cur) => {
          if (re[1] < cur[1]) {
            return cur;
          }
          return re;
        },
        [{}, -Infinity] as [Game, number]
      );
      if (!game?.[0]?.ecid) {
        return void 0;
      }
      tiCai.ecid = game[0].ecid;
      return game;
    })
    .filter((g): g is Exclude<typeof g, undefined> => !!g)
    .map(async ([g, rate]) => {
      // 填充 更多细节数据
      const itemList = await retryGetGameOBTByNodeFetch(url || '', ver || '', uid || '', g?.ecid);
      return {
        ...g,
        rate,
        itemList: [...(g.itemList || []), ...(itemList || [])],
      };
    });

  type G = Exclude<FirstOfGeneric<(typeof promiseList)[0]>, undefined>;
  let matchedGameList: G[] = [];
  for (const p of promiseList) {
    const data = await p;
    if (data) {
      matchedGameList = [...matchedGameList, data];
    }
  }
  // 数据保存，便于找问题
  saveFile('./data/tiCaiData.json', Format(tiCaiDataList));
  saveFile('./data/leagueList.json', Format(leagueList));
  saveFile('./data/matchedLeagueList.json', Format(matchedLeagueList));
  saveFile('./data/gameList.json', Format(extraGameList));
  saveFile('./data/matchedGameList.json', Format(matchedGameList));
  const matchData = toData(tiCaiDataList, matchedGameList, store.R);
  await saveStore({
    timestamp: dayjs().valueOf(),
    timeFormat: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    data: matchData,
  });
  return {
    matchData,
    log: {
      timestamp: dayjs().valueOf(),
      timeFormat: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    },
  };
}

// 篮球
export async function getBasketballData(username: string, password: string) {
  if (!username || !password) {
    throw createError('用户名或者密码没有填写', Code.wrongAccount);
  }
  const store = await getStore();
  let uid = store.uid;
  let ver = store.ver || '';
  let url = store.url;
  if (!uid || !ver || !url) {
    const d = await retryLoginByNodeFetch(username, password);
    await saveStore(d);
    uid = d.uid;
    ver = d.ver;
    url = d.url;
  }
  let leagueList: { name: string; id: string }[] = [];
  try {
    leagueList = await retryGetBasketballLeagueList(url, uid, ver);
  } catch (error) {
    if ((error as CError).code === Code.uidExpire) {
      const d = await retryLoginByNodeFetch(username, password);
      await saveStore(d);
      uid = d.uid;
      ver = d.ver;
      url = d.url;
      leagueList = await retryGetBasketballLeagueList(url, uid, ver);
    } else {
      throw error;
    }
  }
  const tiCaiDataList = await retryGetTiCaiBasketballByFetch();
  const matchedLeagueList = leagueList
    .map((l) => {
      if (tiCaiDataList.find((t) => isLeagueEqual(t.league, l.name))) {
        return l;
      }
      return void 0;
    })
    .filter((d): d is Exclude<typeof d, undefined> => !!d)
    .reduce((re, cur) => {
      // 去除重复联赛
      if (re.find((r) => r.id === cur.id)) {
        return re;
      }
      return [...re, cur];
    }, [] as { name: string; id: string }[]);
  const extraGameList = (
    await Promise.all(
      matchedLeagueList.map((m) => {
        return retryGetBasketballGameList(url || '', ver || '', uid || '', m.id);
      })
    )
  ).flat();
  const promiseList = tiCaiDataList
    .map((tiCai) => {
      type Game = Exclude<(typeof extraGameList)[0], undefined>;
      const _extraGameList = extraGameList
        .filter((d): d is Game => !!d)
        .map((extra) => {
          const teamRate = isTeamEqu(tiCai.teamList, extra.teamList);
          const tDateTime = dayjs(tiCai.dateTime, 'YYYY-MM-DD HH:mm');
          const eDateTime = dayjs(extra.dateTime, 'YYYY-MM-DD HH:mm');
          const oneMinute = 60 * 1000;
          // 时间是否匹配,上下十分钟的范围
          const isTime1 = Math.abs(eDateTime.valueOf() - tDateTime.valueOf()) <= 10 * oneMinute;
          // 有时体彩的时间会落后extra的时间24小时
          const isTime2 = Math.abs(eDateTime.valueOf() - tDateTime.valueOf() - 24 * 60 * 60 * 1000) <= 10 * oneMinute;
          const isTime = isTime1 || isTime2;
          // 联赛是否匹配
          const isLeague = isLeagueEqual(tiCai.league, extra.league);
          const rate = (isLeague ? 100 : 0) + (isTime ? 10 : 0) + teamRate;
          // 联赛必须匹配上
          const re: [typeof extra, number] = [extra, rate];
          return re;
        })
        .filter(([_, rate]) => rate >= 110);
      // 选出匹配度最高的一场比赛
      const game = _extraGameList.reduce(
        (re, cur) => {
          if (re[1] < cur[1]) {
            return cur;
          }
          return re;
        },
        [{}, -Infinity] as [Game, number]
      );
      if (!game?.[0]?.ecid) {
        return void 0;
      }
      tiCai.ecid = game[0].ecid;
      return game;
    })
    .filter((g): g is Exclude<typeof g, undefined> => !!g)
    .map(async ([g, rate]) => {
      return {
        ...g,
        rate,
      };
    });

  type G = Exclude<FirstOfGeneric<(typeof promiseList)[0]>, undefined>;
  let matchedGameList: G[] = [];
  for (const p of promiseList) {
    const data = await p;
    if (data) {
      matchedGameList = [...matchedGameList, data];
    }
  }
  // 数据保存，便于找问题
  saveFile('./data/basketballTiCaiData.json', Format(tiCaiDataList));
  saveFile('./data/basketballLeagueList.json', Format(leagueList));
  saveFile('./data/basketballMatchedLeagueList.json', Format(matchedLeagueList));
  saveFile('./data/basketballGameList.json', Format(extraGameList));
  saveFile('./data/basketballMatchedGameList.json', Format(matchedGameList));
  const matchData = toBasketballData(tiCaiDataList, matchedGameList, store.R);
  await saveStore({
    timestamp: dayjs().valueOf(),
    timeFormat: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    basketballData: matchData,
  });
  return {
    matchData,
    log: {
      timestamp: dayjs().valueOf(),
      timeFormat: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    },
  };
}

export const sendDingDingMessage = async (data: any) => {
  if (data) {
    const _message1List = getMessage1List(data, 650);
    const _message3List = getMessage3List(data, 400);
    const _message4List = getMessage4List(data, 400);
    const _list = [..._message1List, ..._message3List, ..._message4List];
    if (_list?.length) {
      for (const _item of _list) {
        await retrySendDingDing(_item);
      }
    }
  }
};
export const sendBasketballDingDingMessage = async (data: any) => {
  if (data) {
    const _basketballMessage1List = getBasketballMessage1List(data, 400);
    const _basketballMessage2List = getBasketballMessage2List(data, 400);
    const _list = [..._basketballMessage1List, ..._basketballMessage2List];
    if (_list?.length) {
      for (const _item of _list) {
        await retrySendDingDing(_item);
      }
    }
  }
};

export const getSetting = async () => {
  try {
    const store = await getStore();
    return {
      code: 200,
      msg: 'success',
      data: {
        R: store.R,
        A: store.A,
        C: store.C,
        Rev: store.Rev,
        compareRev: store.compareRev,
        scoreRev: store.scoreRev,
        halfRev: store.halfRev,
      },
    };
  } catch (error) {
    return { code: 500, msg: (error as Error).message };
  }
};

export const setSetting = async (body: any) => {
  try {
    await saveStore(body);
    return { code: 200, msg: 'success', data: body };
  } catch (error) {
    return { code: 500, msg: (error as Error).message };
  }
};
