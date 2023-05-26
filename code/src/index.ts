import * as R from 'ramda';
// @ts-ignore
import Format from 'json-format';
import { isTeamEqu, isLeagueEqual, toData, compare } from './util';
import dayjs from 'dayjs';
import express from 'express';
import {
  retryGetLeagueListAllByNodeFetch,
  retryGetGameListByNodeFetch,
  retryGetGameOBTByNodeFetch,
  retryGetTiCaiByFetch,
  retryLoginByNodeFetch,
} from './api';
// import { say } from './chaty';
import { getStore, saveStore, saveFile, log, getLogHistory, getMessage1List, getMessage2List, getMessage3List } from './util';
import cors from 'cors';
import { Code, createError } from './error';

// console.log(cors);
process.env.username = 'XDivan4';
process.env.password = 'Jxd9061912';

type FirstOfGeneric<T> = T extends Promise<infer F> ? F : never;

const app = express();
app.use(cors());

export default app;

app.use(express.static('./public'));
app.use(express.json());
app.listen(9000);

let isWait = false
app.get('/data', async (req, res) => {
  try {
    // @ts-ignore
    const username = (process.env.username || '') as string;
    const password = (process.env.password || '') as string;
    type PromiseType<T> = T extends Promise<infer U> ? U : never;
    const store = await getStore();
    let data: PromiseType<ReturnType<typeof getData>> = store.data;
    // 数据过期后，异步更新数据。保证请求不阻碍
    if (data && dayjs().valueOf() - (store.timestamp || 0) > 15 * 1000 && !isWait) {
      setTimeout(async () => {
        log('异步更新数据')
        isWait = true
        try {
          const data = await getData(username, password);
          if (data === void 0) {
            log('获取不到匹配数据，强制更新token再获取一次');
            await getData(username, password, true);
          }
          isWait = false
          log('异步更新数据成功')
        } catch (error) {
          isWait = false
        }
      }, 0);
    }
    // store里没数据，获取数据。
    if (!data) {
      log('store没有数据，更新数据')
      data = await getData(username, password);
    }
    // 还没获取到，强制更新token后更新数据
    if (!data) {
      log('获取不到匹配数据，强制更新token再获取一次');
      data = await getData(username, password, true);
    }
    if (data) {
      const store = await getStore();
      const message1List = getMessage1List(data, store.Rev || 400);
      const message3List = getMessage3List(data, store.scoreRev || 200);
      const message2List = getMessage2List(data, store.C || 0.13, store.A || 1, store.compareRev || 430);
      res.send({ code: 200, msg: 'success', data: { matchData: data, message1List, message2List, message3List } });
    }
  } catch (error) {
    log((error as Error).message);
    // @ts-ignore
    res.send({ code: error?.code || 500, msg: (error as Error).message });
  }
});

app.get('/setting', async (req, res) => {
  try {
    const store = await getStore();
    res.send({
      code: 200,
      msg: 'success',
      data: {
        R: store.R,
        A: store.A,
        C: store.C,
        Rev: store.Rev,
        compareRev: store.compareRev,
        scoreRev: store.scoreRev,
      },
    });
  } catch (error) {
    log((error as Error).message);
    res.send({ code: 500, msg: (error as Error).message });
  }
});
app.post('/setting', async (req, res) => {
  try {
    const body = req.body;
    await saveStore(body);
    res.status(200).send({ code: 200, msg: 'success' });
  } catch (error) {
    log((error as Error).message);
    res.send({ code: 500, msg: (error as Error).message });
  }
});

const delay = (n: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, n);
  });
};
type M = Promise<ReturnType<typeof toData> | undefined>;

//是否在更新数据
async function getData(username: string, password: string, forceUpdate = false): M {
  if (!username || !password) {
    throw createError('用户名或者密码没有填写', Code.wrongAccount);
  }
  const data = await retryLoginByNodeFetch(username, password, forceUpdate);
  if (!data) {
    return void 0;
  }
  const uid = data.uid || '';
  const ver = data.ver || '';
  const url = data.url || '';
  const leagueList = await retryGetLeagueListAllByNodeFetch(url, uid, ver);
  if (!leagueList?.length) {
    return void 0;
  }
  const tiCaiDataList = await retryGetTiCaiByFetch();
  if (!tiCaiDataList?.length) {
    return void 0;
  }
  const matchedLeagueList = tiCaiDataList
    .map((t) => {
      const t1 = leagueList.find((l) => {
        return isLeagueEqual(t.league, l.name);
      }) || { name: t.league, id: '' };
      return { ...t1 };
    })
    .filter((d) => d.id)
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
        return retryGetGameListByNodeFetch(url, ver, uid, m.id);
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
        });
      // 选出匹配度最高的一场比赛
      const game = _extraGameList.reduce(
        (re, cur) => {
          if (re[1] < cur[1]) {
            return cur;
          }
          return re;
        },
        [{}, 0] as [Game, number]
      );
      if (!game[0]) {
        return void 0;
      }
      if (game[1] !== 0) {
        tiCai.ecid = game[0].ecid;
      }
      return game[0];
    })
    .filter((g) => g?.ecid)
    .map(async (g) => {
      if (g) {
        // 填充 更多细节数据
        const itemList = await retryGetGameOBTByNodeFetch(url, ver, uid, g?.ecid);
        return {
          ...g,
          itemList: [...(g.itemList || []), ...(itemList || [])],
        };
      }
      return g;
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
  log('匹配到 ' + promiseList.length + ' 条数据');
  const store = await getStore();
  const matchData = toData(tiCaiDataList, matchedGameList, store.R);
  await saveStore({
    data: matchData,
  });
  return matchData;
}
