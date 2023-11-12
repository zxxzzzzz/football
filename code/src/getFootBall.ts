// @ts-ignore
import Format from 'json-format';
import { isTeamEqu, isLeagueEqual, toData } from './util';
import dayjs from 'dayjs';
import {
  retryGetLeagueListAllByNodeFetch,
  retryGetGameListByNodeFetch,
  retryGetGameOBTByNodeFetch,
  retryGetTiCaiByFetch,
  retryLoginByNodeFetch,
  retrySendDingDing,
} from './api';
// import { say } from './chaty';
import { getStore, saveStore, saveFile, getMessage1List, getMessage2List, getMessage3List, getMessage4List } from './util';
import { CError, Code, createError } from './error';

type FirstOfGeneric<T> = T extends Promise<infer F> ? F : never;

const accountList = [
  { password: 'XD_ivan', token: '', timestamp: 0 },
  { password: 'XD_ivan1', token: '', timestamp: 0 },
  { password: 'XD_ivan2', token: '', timestamp: 0 },
  { password: 'LJ111', token: '', timestamp: 0 },
  { password: 'LJ222', token: '', timestamp: 0 },
  { password: 'LJ333', token: '', timestamp: 0 },
  { password: 'XIAO222', token: '', timestamp: 0 },
  { password: 'XIAO8888', token: '', timestamp: 0 },
  { password: 'XIAO9999', token: '', timestamp: 0 },
  { password: 'XIAO0000', token: '', timestamp: 0 },
  { password: 'test_123@', token: '', timestamp: 0 },
  { password: 'trigger_123@', token: '', timestamp: 0 },
];

type PromiseType<T> = T extends Promise<infer U> ? U : never;
export const getDataByHttp = async (reqData: { password: string; token: string }) => {
  const store = await getStore();
  const data: PromiseType<ReturnType<typeof getData>> | undefined = store.data;
  if (data) {
    const message1List = getMessage1List(data, store.Rev || 400);
    const message3List = getMessage3List(data, store.scoreRev || 200);
    const message4List = getMessage4List(data, store.halfRev || 400);
    const { messageList: message2List, compareDataList } = getMessage2List(data, store.C || 0.13, store.A || 1, store.compareRev || 430);
    return {
      code: 200,
      msg: 'success',
      data: {
        timestamp: store.timestamp || 0,
        matchData: data,
        message1List,
        message2List,
        message3List,
        compareDataList,
        message4List,
        liveCount: 1,
        token: '123',
      },
    };
  }
  return {
    code: 500,
    msg: '默认更新错误',
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

const delay = (n: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, n);
  });
};
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
    console.log('uid不存在，更新uid后 存储到store');
    uid = d.uid;
    ver = d.ver;
    url = d.url;
  }
  return {a:1} as any
  let leagueList: { name: string; id: string }[] = [];
  try {
    console.log('请求联赛', { url, uid, ver });
    leagueList = await retryGetLeagueListAllByNodeFetch(url, uid, ver);
  } catch (error) {
    if ((error as CError).code === Code.uidExpire) {
      const d = await retryLoginByNodeFetch(username, password);
      await saveStore(d);
      console.log({ uid, ver, url }, 'uid过期，更新uid后 存储到store', d);
      uid = d.uid;
      ver = d.ver;
      url = d.url;
      console.log('uid重新获取后请求联赛', { url, uid, ver });
      leagueList = await retryGetLeagueListAllByNodeFetch(url, uid, ver);
    } else {
      console.log(error);
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
  return matchData;
}
