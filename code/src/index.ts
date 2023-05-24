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
import { getStore, saveStore, saveFile, log, getLogHistory } from './util';
import cors from 'cors';

// console.log(cors);

type FirstOfGeneric<T> = T extends Promise<infer F> ? F : never;

const app = express();
app.use(cors());

export default app;

app.use(express.static('./public'));
app.use(express.json());
app.listen(9000);

app.get('/data', async (req, res) => {
  try {
    // @ts-ignore
    const username = (process.env.username || '') as string;
    const password = (process.env.password || '') as string;
    let data = await getData(username, password);
    if (data === void 0) {
      log('获取不到匹配数据，强制更新token再获取一次');
      data = await getData(username, password, true);
    }
    if (data) {
      const store = await getStore();
      const message1List = data
        .filter((d) => d?.revList?.[0]?.rev > (store.Rev || 400))
        .map((d) => {
          const rev = d.revList[0];
          return `${rev.single ? '【单】' : ''}${d.num} ${dayjs(d.dateTime, 'MM-DD HH:mm').format(
            'MM-DD\u3000HH:ss'
          )} ${d.tiCaiTeamList.join(' ')} GC:${rev.gc.toFixed(2)} VV:${rev.vv.toFixed(2)} offset:${rev.offset.toFixed(
            2
          )} rev:${rev.rev.toFixed(2)}`;
        });
      const compareDataList = compare(data, store.C, store.A, store.compareRev).slice(0, 3);
      const message2List = compareDataList.map((cd, index) => {
        return [
          `NO.${index}${cd.single1 ? '【单】' : ''} ${cd.d1.num} ${dayjs(cd.d1.dateTime, 'MM-DD HH:mm').format(
            'MM-DD\u3000HH:ss'
          )} ${cd.d1.tiCaiTeamList.join(' ')} GC:${cd.gc1.toFixed(2)} VV:${cd.vv1.toFixed(2)} offset:${cd.offset1.toFixed(
            2
          )} rev:${cd.rev1.toFixed(2)}`,
          `NO.${index}${cd.single2 ? '【单】' : ''} ${cd.d2.num} ${dayjs(cd.d2.dateTime, 'MM-DD HH:mm').format(
            'MM-DD\u3000HH:ss'
          )} ${cd.d2.tiCaiTeamList.join(' ')} GC:${cd.gc2.toFixed(2)} VV:${cd.vv2.toFixed(2)} offset:${cd.offset2.toFixed(
            2
          )} rev:${cd.rev2.toFixed(2)}`,
        ];
      });
      // console.log({ matchData: data, message1List, message2List });
      res.send({ code: 200, msg: 'success', data: { matchData: data, message1List, message2List } });
    }
  } catch (error) {
    log((error as Error).message);
    res.send({ code: '403', msg: (error as Error).message });
  }
});

app.get('/log', async (req, res) => {
  try {
    const data = await getLogHistory();
    res.send(data);
  } catch (error) {
    log((error as Error).message);
    res.send((error as Error).message);
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
let isWaitForNewData = false;
async function getData(username: string, password: string, forceUpdate = false): M {
  if (!username || !password) {
    throw Error('用户名或者密码没有填写');
    // return void 0;
  }
  const store = await getStore();
  // 如果数据长时间没变，强制更新
  if (store?.dataTimestamp && new Date().valueOf() - store.dataTimestamp > 30 * 1000 && isWaitForNewData) {
    log('长时间没更新，强制改变 isWaitForNewData');
    isWaitForNewData = false;
  }
  log('isWaitForNewData ' + isWaitForNewData);
  // 如果发现获取数据时在等待数据，直接返回旧数据
  // 数据未过期，直接返回旧数据
  if ((store?.dataTimestamp && new Date().valueOf() - store.dataTimestamp < 15 * 1000) || isWaitForNewData) {
    log('使用缓存的匹配数据');
    return store.data;
  }
  isWaitForNewData = true;
  const data = await retryLoginByNodeFetch(username, password, forceUpdate);
  log(JSON.stringify(data));
  if (!data) {
    return void 0;
  }
  const uid = data.uid || '';
  const ver = data.ver || '';
  const url = data.url || '';
  const leagueList = await retryGetLeagueListAllByNodeFetch(url, uid, ver);
  if (!leagueList?.length) {
    if (!forceUpdate) {
      log('获取不到联赛');
      // 联赛获取不到就强制获取一次
      return void 0;
    }
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
  log('匹配 ' + promiseList.length);
  const matchData = toData(tiCaiDataList, matchedGameList, store.R);
  await saveStore({
    uidTimestamp: new Date().valueOf(),
    data: matchData,
    dataTimestamp: new Date().valueOf(),
  });
  isWaitForNewData = false;
  return matchData;
}
