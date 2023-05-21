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

app.use(express.static('./public'));
app.use(express.json());
app.listen(80);
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

// (async () => {
//   const cluster = await Cluster.launch({
//     puppeteer,
//     concurrency: Cluster.CONCURRENCY_PAGE,
//     maxConcurrency: 1,
//     timeout: 2147483647,
//     monitor: true,
//     puppeteerOptions: {
//       executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
//       // executablePath: 'C:/Users/jiangxudong/AppData/Local/Google/Chrome/Application/chrome.exe',
//       // executablePath: 'C:/Users/jiangxudong/AppData/Local/Google/Chrome/Application/chrome.exe',
//       // executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
//       headless: false,
//     },
//   });
//   cluster.on('taskerror', (err, data, willRetry) => {
//     if (willRetry) {
//       console.warn(`Encountered an error while crawling ${data.url}. ${err.message}\nThis job will be retried`);
//     } else {
//       console.error(`Failed to crawl ${data.url}: ${err.message}`);
//     }
//   });
//   cluster.task(async ({ page, data }) => {
//     await page.goto(`https://extraa.com/`);
//     await delay(5000);
//     // while (true) {
//     //   const lan = await page.$('#lang_cn');
//     //   if (lan) {
//     //     await lan.click();
//     //   }
//     //   await delay(2000);
//     //   const isLanOn = await page.$('#lang_cn.on');
//     //   if (isLanOn) {
//     //     break;
//     //   }
//     // }
//     while (true) {
//       await delay(1000);
//       const usr = await page.$('#usr');
//       const pwd = await page.$('#pwd');
//       const logBtn = await page.$('#btn_login');
//       if (usr && pwd && logBtn) {
//         await usr?.type(config.name);
//         await pwd?.type(config.password);
//         await logBtn?.click();
//         break;
//       }
//     }
//     // while (true) {
//     //   const errorText = await page.$('#text_error');
//     //   if (errorText) {
//     //     const msg = await errorText.evaluate((el) => (el as HTMLDivElement).textContent);
//     //     if (msg) {
//     //       console.log(msg);
//     //     }
//     //   }
//     //   await delay(1 * 1000);
//     //   const cancel = await page.$('#C_no_btn');
//     //   try {
//     //     if (cancel) {
//     //       await cancel.click();
//     //       break;
//     //     }
//     //   } catch (error) { }
//     // }
//     try {
//       await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 3 * 60 * 1000 });
//     } catch (error) {
//       await page.reload({ waitUntil: 'domcontentloaded', timeout: 3 * 60 * 1000 });
//     }
//     const request = await page.waitForRequest(
//       (req) => {
//         return req.url().includes('transform.php');
//       },
//       { timeout: 10 * 1000 }
//     );
//     const body = request.postData() || '';
//     const url = new URL('?' + body, 'http://home.com');
//     // 网站的api接口参数
//     const GVer = url.searchParams.get('ver') || '';
//     const GUid = url.searchParams.get('uid') || '';
//     store.store.ver = GVer;
//     store.store.uid = GUid;
//     store.store.url = request.url();
//     store.save();
//     await delay(2 * 1000);
//     let message1Cache = '';
//     let message2Cache = '';
//     while (true) {
//       const startTime = new Date().valueOf();
//       const leagueList = await retryGetLeagueListAll(page, GUid, GVer);
//       // 什么联赛都没获取到，就重新登录
//       if (!leagueList?.length) {
//         console.log('联赛获取失败，重新登录');
//         return;
//       }
//       await delay(200);
//       const tiCaiDataList = await retryGetTiCaiByFetch();
//       if (!tiCaiDataList?.length) {
//         console.log('体彩获取失败，重新登录');
//         return;
//       }
//       await delay(200);
//       const matchedLeagueList = tiCaiDataList
//         .map((t) => {
//           const t1 = leagueList.find((l) => {
//             return isLeagueEqual(t.league, l.name);
//           }) || { name: t.league, id: '' };
//           return { ...t1 };
//         })
//         .filter((d) => d.id)
//         .reduce((re, cur) => {
//           // 去除重复联赛
//           if (re.find((r) => r.id === cur.id)) {
//             return re;
//           }
//           return [...re, cur];
//         }, [] as { name: string; id: string }[]);
//       await delay(200);
//       // 获取匹配的所有联赛数据
//       const extraGameList = (
//         await Promise.all(
//           matchedLeagueList.map((m) => {
//             return retryGetGameList(page, GVer, GUid, m.id);
//           })
//         )
//       ).flat();
//       await delay(500);
//       // const gameList = tGameList.flat();
//       // 体彩 和 extra 的比赛匹配
//       const promiseList = tiCaiDataList
//         .map((tiCai) => {
//           type Game = Exclude<(typeof extraGameList)[0], undefined>;
//           const _extraGameList = extraGameList
//             .filter((d): d is Game => !!d)
//             .map((extra) => {
//               const teamRate = isTeamEqu(tiCai.teamList, extra.teamList);
//               const tDateTime = dayjs(tiCai.dateTime, 'MM-DD HH:mm');
//               const gDateTime = dayjs(extra.dateTime, 'MM-DD HH:mm');
//               // 时间是否匹配,上下十分钟的范围
//               const isTime =
//                 Math.abs(tDateTime.valueOf() - gDateTime.valueOf()) <= 10 * 60 * 1000 ||
//                 (Math.abs(tDateTime.valueOf() - gDateTime.valueOf()) >= 12 * 60 * 60 * 1000 - 10 * 60 * 1000 &&
//                   Math.abs(tDateTime.valueOf() - gDateTime.valueOf()) <= 12 * 60 * 60 * 1000 + 10 * 60 * 1000);
//               // 联赛是否匹配
//               const isLeague = isLeagueEqual(tiCai.league, extra.league);
//               const re: [typeof extra, number] = [extra, isLeague ? (isTime && isLeague ? 1 : 0) + teamRate : 0];
//               return re;
//             });
//           // 选出匹配度最高的一场比赛
//           const game = _extraGameList.reduce(
//             (re, cur) => {
//               if (re[1] < cur[1]) {
//                 return cur;
//               }
//               return re;
//             },
//             [{}, 0] as [Game, number]
//           );
//           if (!game[0]) {
//             return void 0;
//           }
//           if (game[1] !== 0) {
//             tiCai.ecid = game[0].ecid;
//           }
//           return game[0];
//         })
//         .filter((g) => g?.ecid)
//         .map(async (g) => {
//           if (g) {
//             // 填充 更多细节数据
//             const itemList = await retryGetGameOBT(page, GVer, GUid, g?.ecid);
//             return {
//               ...g,
//               itemList: [...(g.itemList || []), ...(itemList || [])],
//             };
//           }
//           return g;
//         });
//       type G = Exclude<FirstOfGeneric<(typeof promiseList)[0]>, undefined>;
//       let matchedGameList: G[] = [];
//       for (const p of promiseList) {
//         const data = await p;
//         if (data) {
//           matchedGameList = [...matchedGameList, data];
//         }
//         await delay(400);
//       }
//       // 数据保存，便于找问题
//       fs.writeFileSync('./data/tiCaiData.json', Format(tiCaiDataList));
//       fs.writeFileSync('./data/leagueList.json', Format(leagueList));
//       fs.writeFileSync('./data/matchedLeagueList.json', Format(matchedLeagueList));
//       fs.writeFileSync('./data/gameList.json', Format(extraGameList));
//       fs.writeFileSync('./data/matchedGameList.json', Format(matchedGameList));
//       console.log(promiseList.length);
//       const matchData = toData(tiCaiDataList, matchedGameList, config.R);
//       const message1 = matchData
//         .filter((d) => d.revList?.[0]?.rev > config.Rev)
//         .map((d) => {
//           const rev = d.revList[0];
//           return `${rev.single ? '【单】 ' : ''}${d.num} ${d.tiCaiTeamList.join(' ')} GC:${rev.gc.toFixed(2)} VV:${rev.vv.toFixed(
//             2
//           )} offset:${rev.offset.toFixed(2)} rev:${rev.rev.toFixed(2)}`;
//         })
//         .join('\r\n');
//       if (message1Cache !== message1) {
//         message1Cache = message1;
//         for (const alias of config.aliasList || []) {
//           await say(alias, message1);
//         }
//       }
//       const compareDataList = compare(matchData, config.C, config.A, config.compareRev).slice(0, 3);
//       const message2 = compareDataList
//         .map((cd, index) => {
//           return (
//             `NO.${index}${cd.single1 ? ' 【单】 ' : ' '}${cd.d1.num} ${cd.d1.tiCaiTeamList.join(' ')} GC:${cd.gc1.toFixed(
//               2
//             )} VV:${cd.vv1.toFixed(2)} offset:${cd.offset1.toFixed(2)} rev:${cd.rev1.toFixed(2)}` +
//             '\r\n' +
//             `NO.${index}${cd.single2 ? '【单】 ' : ' '}${cd.d2.num} ${cd.d2.tiCaiTeamList.join(' ')} GC:${cd.gc2.toFixed(
//               2
//             )} VV:${cd.vv2.toFixed(2)} offset:${cd.offset2.toFixed(2)} rev:${cd.rev2.toFixed(2)}`
//           );
//         })
//         .join('\r\n');
//       console.log(message1);
//       console.log(message2);
//       if (message2Cache !== message2) {
//         message2Cache = message2;
//         for (const alias of config.aliasList || []) {
//           await say(alias, message2);
//         }
//       }
//       ee.emit('updateData', matchData);
//       const endTime = new Date().valueOf();
//       // 动态20s 更新
//       await delay(Math.max(20 * 1000 - (endTime - startTime), 0));
//     }
//   });
//   cluster.queue({
//     url: `extra`,
//   });
//   cluster.queue({
//     url: `extra`,
//   });
//   cluster.queue({
//     url: `extra`,
//   });
//   await cluster.idle();
//   await cluster.close();
// })();
