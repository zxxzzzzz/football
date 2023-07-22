// @ts-ignore
import Format from 'json-format';
import { isTeamEqu, isLeagueEqual, toData } from './util';
import dayjs from 'dayjs';
import express from 'express';
import {
  retryGetLeagueListAllByNodeFetch,
  retryGetGameListByNodeFetch,
  retryGetGameOBTByNodeFetch,
  retryGetTiCaiByFetch,
  retryLoginByNodeFetch,
  sendDingDing,
} from './api';
// import { say } from './chaty';
import { getStore, saveStore, saveFile, getMessage1List, getMessage2List, getMessage3List, getMessage4List } from './util';
import cors from 'cors';
import { CError, Code, createError } from './error';
import compression from 'compression';
import cookieParser from 'cookie-parser';

// console.log(cors);
process.env.username = 'nuo1234567';
process.env.password = 'Jxd9061912';

type FirstOfGeneric<T> = T extends Promise<infer F> ? F : never;

const app = express();
app.use(cors({ origin: true, credentials: true, allowedHeaders: ['Cookie'] }));
app.use(compression());
app.use(cookieParser());

export default app;

app.use(express.static('./public'));
app.use(express.json());
app.listen(9000);

const accountList = [
  { password: 'XD_ivan', token: '', timestamp: 0 },
  { password: 'XD_ivan1', token: '', timestamp: 0 },
  { password: 'XD_ivan2', token: '', timestamp: 0 },
  { password: 'LJ111', token: '', timestamp: 0 },
  { password: 'LJ222', token: '', timestamp: 0 },
  { password: 'LJ333', token: '', timestamp: 0 },
  { password: 'XIAO111', token: '', timestamp: 0 },
  { password: 'XIAO222', token: '', timestamp: 0 },
  { password: 'test_123@', token: '', timestamp: 0 },
  { password: 'trigger_123@', token: '', timestamp: 0 },
];
let isWait = false;
app.get('/data', async (req, res) => {
  console.log(
    accountList.map((a) => {
      const t = a.timestamp;
      return `${a.password} ${t === 0 ? 0 : dayjs(t).add(8, 'hour').format('YYYY-MM-DD HH:mm:ss')} ${a.token}`;
    })
  );
  // 清除过期token
  accountList.forEach((account) => {
    const t = account.timestamp;
    // 5min清除一次token
    if (dayjs().valueOf() - t > 5 * 60 * 1000) {
      account.token = '';
      account.timestamp = 0;
    }
  });
  const cookiePassword = req.query.p;
  const token = req.query.token as string;
  const account = accountList.find((a) => a.password === cookiePassword);
  if (!account) {
    res.send({ code: Code.forbidden, msg: '该通行码不存在，请重新登陆' });
    return;
  }
  if (account.token && account.token !== token && account.password !== 'trigger_123@') {
    res.send({ code: Code.forbidden, msg: `该通行码正在被使用，请重新登陆换个通行码 ${account.token} ${token}` });
    return;
  }
  account.timestamp = dayjs().valueOf();
  const liveCount = accountList.filter((a) => a.token).length;
  const username = (process.env.username || '') as string;
  const password = (process.env.password || '') as string;
  type PromiseType<T> = T extends Promise<infer U> ? U : never;
  const store = await getStore();
  const data: PromiseType<ReturnType<typeof getData>> | undefined = store.data;
  // 对于定时器的请求，如果有其他人在用，提前结束
  if (account.password === 'trigger_123@' && data && dayjs().valueOf() - (store.timestamp || 0) < 60 * 1000) {
    res.send({
      code: 200,
    });
    return;
  }
  // 如果在等待数据 直接返回缓存数据
  if (isWait && data && dayjs().valueOf() - (store.timestamp || 0) < 60 * 1000) {
    const store = await getStore();
    const message1List = getMessage1List(data, store.Rev || 400);
    const message3List = getMessage3List(data, store.scoreRev || 200);
    const message4List = getMessage4List(data, store.halfRev || 400);
    const { messageList: message2List, compareDataList } = getMessage2List(data, store.C || 0.13, store.A || 1, store.compareRev || 430);
    if (!account.token) {
      account.token = (Math.random() + 10).toString();
    }
    res.send({
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
        liveCount,
        token: account.token,
      },
    });
    return;
  }
  // store缓存不存在  或者 数据过期后，更新数据
  if (!data || (data && dayjs().valueOf() - (store.timestamp || 0) > 60 * 1000)) {
    isWait = true;
    try {
      const _data = await getData(username, password);
      await saveStore({
        timestamp: dayjs().valueOf(),
        data: _data,
      });
      const store = await getStore();
      const message1List = getMessage1List(_data, store.Rev || 400);
      const message3List = getMessage3List(_data, store.scoreRev || 200);
      const message4List = getMessage4List(_data, store.halfRev || 400);
      const { messageList: message2List, compareDataList } = getMessage2List(_data, store.C || 0.13, store.A || 1, store.compareRev || 430);
      if (!data) {
        if (dayjs().add(8, 'hour').hour() < 11) {
          return;
        }
        const _message1List = getMessage1List(_data, 650);
        const _message3List = getMessage3List(_data, 400);
        const _message4List = getMessage4List(_data, 400);
        const _list = [..._message1List, ..._message3List, ..._message4List];
        if (_list?.length) {
          for (const _item of _list) {
            await sendDingDing(_item);
          }
        }
      } else {
        if (dayjs().add(8, 'hour').hour() < 11) {
          return;
        }
        const list1 = _data
          .filter((d) => {
            return d?.revList?.[0]?.rev > 650 && d?.revList?.[0]?.rev < 3000;
          })
          .filter((d) => {
            const findD = data.find((_d) => _d.num === d.num);
            if (!findD) return true;
            return d?.revList?.[0]?.rev > findD?.revList?.[0]?.rev;
          });
        const list3 = _data
          .filter((d) => {
            return d?.scoreRevList?.[0]?.rev > 400;
          })
          .filter((d) => {
            const findD = data.find((_d) => _d.num === d.num);
            if (!findD) return true;
            return d?.scoreRevList?.[0]?.rev > findD?.scoreRevList?.[0]?.rev;
          });
        const list4 = _data
          .filter((d) => {
            return d?.halfRevList?.[0]?.rev > 400 && d?.halfRevList?.[0]?.rev < 1500;
          })
          .filter((d) => {
            const findD = data.find((_d) => _d.num === d.num);
            if (!findD) return true;
            return d?.halfRevList?.[0]?.rev > findD?.halfRevList?.[0]?.rev;
          });

        const _message1List = getMessage1List(list1, 650);
        const _message3List = getMessage3List(list3, 400);
        const _message4List = getMessage4List(list4, 400);
        const _list = [..._message1List, ..._message3List, ..._message4List];
        if (_list?.length) {
          for (const _item of _list) {
            await sendDingDing(_item);
          }
        }
      }
      if (!account.token) {
        account.token = (Math.random() + 10).toString();
      }
      res.send({
        code: 200,
        msg: 'success',
        data: {
          timestamp: store.timestamp || 0,
          matchData: _data,
          message1List,
          message2List,
          message3List,
          compareDataList,
          message4List,
          liveCount,
          token: account.token,
        },
      });
      isWait = false;
      return;
    } catch (error) {
      res.send({ code: (error as CError).code, msg: (error as CError).message });
      isWait = false;
      return;
    }
  }
  if (data) {
    const store = await getStore();
    const message1List = getMessage1List(data, store.Rev || 400);
    const message3List = getMessage3List(data, store.scoreRev || 200);
    const message4List = getMessage4List(data, store.halfRev || 400);
    const { messageList: message2List, compareDataList } = getMessage2List(data, store.C || 0.13, store.A || 1, store.compareRev || 430);
    if (!account.token) {
      account.token = (Math.random() + 10).toString();
    }
    res.send({
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
        liveCount,
        token: account.token,
      },
    });
    return;
  }
  res.send({
    code: 500,
    msg: '默认更新错误',
  });
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
        halfRev: store.halfRev,
      },
    });
  } catch (error) {
    res.send({ code: 500, msg: (error as Error).message });
  }
});
app.post('/setting', async (req, res) => {
  try {
    const body = req.body;
    await saveStore(body);
    res.status(200).send({ code: 200, msg: 'success' });
  } catch (error) {
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
// type M = Promise<ReturnType<typeof toData> | undefined>;

//是否在更新数据
async function getData(username: string, password: string) {
  if (!username || !password) {
    throw createError('用户名或者密码没有填写', Code.wrongAccount);
  }
  const store = await getStore();
  let uid = store.uid;
  let ver = store.ver;
  let url = store.url;
  if (!uid || !ver || !url) {
    const d = await retryLoginByNodeFetch(username, password);
    await saveStore(d);
    console.log('uid不存在，更新uid后 存储到store');
    uid = d.uid;
    ver = d.ver;
    url = d.url;
  }
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
  // const matchedLeagueList = tiCaiDataList
  //   .map((t) => {
  //     const t1 = leagueList.find((l) => {
  //       return isLeagueEqual(t.league, l.name);
  //     }) || { name: t.league, id: '' };
  //     return { ...t1 };
  //   })
  //   .filter((d) => d.id)
  //   .reduce((re, cur) => {
  //     // 去除重复联赛
  //     if (re.find((r) => r.id === cur.id)) {
  //       return re;
  //     }
  //     return [...re, cur];
  //   }, [] as { name: string; id: string }[]);
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
  return matchData;
}
