import * as R from 'ramda';
import fs from 'fs-extra';
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
import config from './config';
// import { say } from './chaty';
import { getStore } from './util';

type FirstOfGeneric<T> = T extends Promise<infer F> ? F : never;

const app = express();
export default app

app.use(express.static('./public'));
app.use(express.json());
app.listen(9000);

app.get('/data', async (req, res) => {
  const data = await getData();
  res.send(data || '');
});


const delay = (n: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, n);
  });
};

async function getData() {
  const { store, save } = getStore();
  if (store?.dataTimestamp && new Date().valueOf() - store.dataTimestamp < 15 * 1000) {
    return store.data
  }
  const data = await retryLoginByNodeFetch('XDivan4', 'Jxd9061912');
  if (!data) {
    return void 0;
  }
  const uid = data.uid || '';
  const ver = data.ver || '';
  const url = data.url || '';
  const leagueList = await retryGetLeagueListAllByNodeFetch(url, uid, ver);
  if (!leagueList) {
    return void 0;
  }
  const tiCaiDataList = await retryGetTiCaiByFetch();
  if (!tiCaiDataList) {
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
          const gDateTime = dayjs(extra.dateTime, 'MM-DD HH:mm');
          // 时间是否匹配,上下十分钟的范围
          const isTime =
            Math.abs(tDateTime.valueOf() - gDateTime.valueOf()) <= 10 * 60 * 1000 ||
            (Math.abs(tDateTime.valueOf() - gDateTime.valueOf()) >= 12 * 60 * 60 * 1000 - 10 * 60 * 1000 &&
              Math.abs(tDateTime.valueOf() - gDateTime.valueOf()) <= 12 * 60 * 60 * 1000 + 10 * 60 * 1000);
          // 联赛是否匹配
          const isLeague = isLeagueEqual(tiCai.league, extra.league);
          const re: [typeof extra, number] = [extra, isLeague ? (isTime && isLeague ? 1 : 0) + teamRate : 0];
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
  fs.writeFileSync('./data/tiCaiData.json', Format(tiCaiDataList));
  fs.writeFileSync('./data/leagueList.json', Format(leagueList));
  fs.writeFileSync('./data/matchedLeagueList.json', Format(matchedLeagueList));
  fs.writeFileSync('./data/gameList.json', Format(extraGameList));
  fs.writeFileSync('./data/matchedGameList.json', Format(matchedGameList));
  console.log('匹配',promiseList.length);
  const matchData = toData(tiCaiDataList, matchedGameList, config.R);
  const message1 = matchData
    .filter((d) => d.revList?.[0]?.rev > config.Rev)
    .map((d) => {
      const rev = d.revList[0];
      return `${rev.single ? '【单】 ' : ''}${d.num} ${d.tiCaiTeamList.join(' ')} GC:${rev.gc.toFixed(2)} VV:${rev.vv.toFixed(
        2
      )} offset:${rev.offset.toFixed(2)} rev:${rev.rev.toFixed(2)}`;
    })
    .join('\r\n');
  if (store.message1 !== message1) {
    store.message1 = message1;
    save();
    // for (const alias of config.aliasList || []) {
    //   await say(alias, message1);
    // }
  }
  const compareDataList = compare(matchData, config.C, config.A, config.compareRev).slice(0, 3);
  const message2 = compareDataList
    .map((cd, index) => {
      return (
        `NO.${index}${cd.single1 ? ' 【单】 ' : ' '}${cd.d1.num} ${cd.d1.tiCaiTeamList.join(' ')} GC:${cd.gc1.toFixed(
          2
        )} VV:${cd.vv1.toFixed(2)} offset:${cd.offset1.toFixed(2)} rev:${cd.rev1.toFixed(2)}` +
        '\r\n' +
        `NO.${index}${cd.single2 ? '【单】 ' : ' '}${cd.d2.num} ${cd.d2.tiCaiTeamList.join(' ')} GC:${cd.gc2.toFixed(
          2
        )} VV:${cd.vv2.toFixed(2)} offset:${cd.offset2.toFixed(2)} rev:${cd.rev2.toFixed(2)}`
      );
    })
    .join('\r\n');
  if (store.message2 !== message2) {
    store.message2 = message2;
    // for (const alias of config.aliasList || []) {
    //   await say(alias, message2);
    // }
    save();
  }
  store.uidTimestamp = new Date().valueOf();
  store.data = matchData;
  store.dataTimestamp = new Date().valueOf();
  save();
  return matchData;
}