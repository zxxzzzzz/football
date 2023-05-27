import * as R from 'ramda';
import { getTiCaiByFetch } from './api';
import dayjs from 'dayjs';
import fs from 'fs';
import { resolve, parse } from 'path';
// @ts-ignore
import Format from 'json-format';
import OSS from 'ali-oss';

let client: OSS | undefined = void 0;
if (process.env.key) {
  client = new OSS({
    // yourRegion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
    region: 'oss-cn-hangzhou',
    // 阿里云账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM用户进行API访问或日常运维，请登录RAM控制台创建RAM用户。
    accessKeyId: process.env.key || '',
    accessKeySecret: process.env.secret || '',
    bucket: 'footballc',
  });
}

const isMatch = (a: string, b: string): number => {
  const matchList = R.range(0, Math.min(a.length, b.length)).map((index) => {
    return a[index] === b[index];
  });
  const rate1 =
    matchList.reduce((re, cur) => {
      return re + (cur ? 1 : 0);
    }, 0) /
    ((a.length + b.length) / 2);
  const matchList2 = R.range(0, Math.min(a.length, b.length)).map((index) => {
    if (a.length > b.length) {
      return a.includes(b[index]);
    }
    return b.includes(a[index]);
  });
  const rate2 =
    matchList2.reduce((re, cur) => {
      return re + (cur ? 1 : 0);
    }, 0) /
    ((a.length + b.length) / 2);
  return rate1 + rate2 * 0.1;
};

export const isTeamEqu = (a: string[], b: string[]) => {
  if (!a?.length || !b?.length) {
    return 0;
  }
  const lList = a.map((aStr) => {
    return Math.max(
      ...b.map((bStr) => {
        return isMatch(aStr, bStr);
      })
    );
  });
  return lList.reduce((a, b) => a + b);
};

export const isLeagueEqual = (l1: string, l2: string) => {
  const equalNameList = [
    ['日本职业联赛杯', '日本联赛杯'],
    ['澳大利亚超级联赛', '澳大利亚甲组联赛-附加赛', '澳大利亚甲组联赛'],
    ['欧罗巴联赛', '欧洲联赛'],
    ['韩国K甲组联赛', '韩国职业联赛'],
    ['日本J1联赛', '日本职业联赛'],
    ['日本J2联赛', '日本职业乙级联赛', '日本乙级联赛'],
    ['英格兰冠军联赛-附加赛', '英格兰冠军联赛'],
    ['世界U20锦标赛', 'U20世界杯2023(在阿根廷)'],
    ['美国公开赛冠军杯', '美国公开赛杯'],
    ['南美解放者杯', '南美自由杯'],
  ];
  const isEqual = !!equalNameList.find((d) => d.includes(l1) && d.includes(l2));
  if (isEqual) {
    return true;
  }
  const _l1 = l1.replace(/[组]/g, '级');
  const _l2 = l2.replace(/[组]/g, '级');
  return _l1 === _l2 || _l1 + '-附加赛' === _l2 || _l1 === _l2 + '-附加赛' || _l1 + '-升级附加赛' === _l2 || _l1 === _l2 + '-升级附加赛';
};

// console.log(isTeamEqu(['阿尔克马尔', '海伦维恩'], ['阿尔克马','海伦芬']));

function getRev(tiCai: number, extra: number, R: number = 0.12) {
  const GC = tiCai;
  const VV = tiCai * extra > 3 ? extra - 1 : extra;
  const Offset = (10000 * GC) / (1.028 * VV + 0.972);
  const Rev = GC * 10000 - 10000 * (1 - R) - 0.972 * Offset;
  return {
    GC,
    VV,
    Offset,
    Rev,
  };
}

export enum Score {
  noSale = '100',
}

type FirstOfGeneric<T> = T extends Promise<infer F> ? F : never;
type TiCaiItem = FirstOfGeneric<ReturnType<typeof getTiCaiByFetch>>[0];
type ExtraItem = TiCaiItem & { rate: number };
export function toData(tiCaiList: TiCaiItem[], extraList: ExtraItem[], _R = 0.12) {
  const dataList = tiCaiList.map((ti) => {
    let matchedExtra = extraList.find((d) => d.ecid === ti.ecid);
    if (!matchedExtra) {
      return void 0;
    }
    // 处理队伍错位的情况
    if (matchedExtra.teamList[0] === ti.teamList[1]) {
      matchedExtra = {
        ...matchedExtra,
        teamList: [matchedExtra.teamList[1], matchedExtra.teamList[0]],
        itemList: matchedExtra.itemList.map((item) => {
          if (item.oddsTitle === '独赢') {
            return {
              ...item,
              oddsItemList: [item.oddsItemList[1], item.oddsItemList[0], item.oddsItemList[2]],
            };
          }
          return {
            ...item,
            oddsItemList: [item.oddsItemList[1], item.oddsItemList[0]],
          };
        }),
      };
    }
    return {
      league: ti.league,
      num: ti.num || '',
      singleList: ti.singleList,
      // @ts-ignore
      rate: matchedExtra.rate,
      // 体彩的时间不对，使用extra的时间作为基准
      dateTime: matchedExtra?.dateTime || '',
      tiCaiTeamList: ti.teamList,
      extraTeamList: matchedExtra?.teamList || ti.teamList,
      tiCaiItemList: ti.itemList,
      extraItemList: (matchedExtra?.itemList || []).filter((d: any) => {
        if (d.oddsTitle === '得分') {
          return d.oddsItemList[0][0].slice(1) === '2' || d.oddsItemList[0][0].slice(1) === '2.5';
        }
        return true;
      }),
      scoreRevList: ti.itemList
        .filter((item) => item.oddsTitle === '得分')
        .map((tItem) => {
          if (!matchedExtra) {
            return void 0;
          }
          const [tiOddTitle, tiOdd] = tItem.oddsItemList[0];
          const extra = matchedExtra.itemList
            .filter((item) => item.oddsTitle === '得分')
            .map((item) => item.oddsItemList)
            .flat()
            .find((item) => item[0] === tiOddTitle.replace(/[+]/g, '-'));
          if (!extra) {
            return void 0;
          }
          const [eOddTitle, eOdd] = extra;
          const { GC, VV, Offset, Rev } = getRev(parseFloat(tiOdd), parseFloat(eOdd), _R);
          return {
            score: tItem.score,
            teamList: matchedExtra.teamList,
            num: ti.num,
            ecid: matchedExtra.ecid,
            tiCaiOdds: parseFloat(tiOdd),
            extraOdds: parseFloat(eOdd),
            tiCai: tiOddTitle,
            extra: eOddTitle,
            rev: Rev,
            gc: GC,
            vv: VV,
            r: _R,
            offset: Offset,
          };
        })
        .filter((a): a is Exclude<typeof a, undefined> => !!a)
        .sort((a, b) => b.rev - a.rev)
        .slice(0, 1),
      revList: ti.itemList
        .filter((item) => item.oddsTitle === '胜平负')
        .map((item) => {
          if (!matchedExtra) {
            return void 0;
          }
          const filterList = item.oddsItemList
            .map((d, index) => ({ single: ti.singleList[index], oddsItem: d }))
            .filter(({ oddsItem }) => oddsItem[0] !== Score.noSale)
            .map(({ oddsItem, single }) => {
              // 体彩让球  [主胜对立面，主负对立面]
              const filterMap: { [key: string | number]: [number, number] } = {
                '3': [+2.5, +3.5],
                '2': [+1.5, +2.5],
                '1': [+0.5, +1.5],
                '0': [-0.5, +0.5],
                '-1': [-1.5, -0.5],
                '-2': [-2.5, -1.5],
                '-3': [-3.5, -2.5],
              };
              return [
                {
                  filter: (d: number, isOnlyWin: boolean) =>
                    isOnlyWin ? parseFloat(oddsItem[0]) === 1 : filterMap[parseFloat(oddsItem[0])][0] === d,
                  // 胜
                  type: 'win',
                  single,
                  tiCai: parseFloat(oddsItem[0]),
                  tiCaiOdds: parseFloat(oddsItem[1]),
                },
                {
                  filter: (d: number, isOnlyWin: boolean) =>
                    isOnlyWin ? parseFloat(oddsItem[0]) === -1 : filterMap[parseFloat(oddsItem[0])][1] === d,
                  type: 'lose',
                  single,
                  tiCai: parseFloat(oddsItem[0]),
                  // 负
                  tiCaiOdds: parseFloat(oddsItem[3]),
                },
              ];
            })
            .flat();
          const matchList = matchedExtra.itemList
            .filter((item) => {
              const r = [parseFloat(item.oddsItemList[0][0]), parseFloat(item.oddsItemList[0][1]), parseFloat(item.oddsItemList[1][1])];
              if (!['让球', '独赢'].includes(item.oddsTitle)) {
                return false;
              }
              if (item.oddsItemList[0][0]?.includes('/')) {
                return false;
              }
              if (r[0] === Math.round(r[0])) {
                return false;
              }
              return true;
            })
            .map((item) => {
              // 比分 胜 负
              let r = [parseFloat(item.oddsItemList[0][0]), parseFloat(item.oddsItemList[0][1]), parseFloat(item.oddsItemList[1][1])];
              if (item.oddsTitle === '独赢') {
                // 独赢没有让球，随便填个值
                r = [0, parseFloat(item.oddsItemList[0][0]), parseFloat(item.oddsItemList[1][0])];
              }
              return filterList
                .map((f) => {
                  if (!matchedExtra) {
                    return void 0;
                  }
                  const { GC, VV, Offset, Rev } = getRev(f.tiCaiOdds, f.type === 'win' ? r[2] : r[1], _R);
                  return {
                    teamList: matchedExtra.teamList,
                    num: ti.num,
                    single: f.single,
                    ecid: matchedExtra.ecid,
                    isMatch: f.filter(r[0], item.oddsTitle === '独赢'),
                    isOnlyWin: item.oddsTitle === '独赢',
                    type: f.type,
                    tiCaiOdds: f.tiCaiOdds,
                    extraOdds: f.type === 'win' ? r[2] : r[1],
                    tiCai: f.tiCai,
                    extra: r[0],
                    rev: Rev,
                    gc: GC,
                    vv: VV,
                    r: _R,
                    offset: Offset,
                  };
                })
                .filter((d): d is Exclude<typeof d, undefined> => !!d?.isMatch);
            })
            .flat();
          return matchList;
        })
        .flat()
        .filter((a): a is Exclude<typeof a, undefined> => !!a)
        .sort((a, b) => b.rev - a.rev)
        .slice(0, 1),
    };
  });
  return dataList
    .filter((d): d is Exclude<typeof d, undefined> => !!d)
    .sort((a, b) => {
      const rev1 = a.revList.reduce((re, cur) => {
        if (cur.isMatch && cur.rev > re) {
          return cur.rev;
        }
        return re;
      }, 0);
      const rev2 = b.revList.reduce((re, cur) => {
        if (cur.isMatch && cur.rev > re) {
          return cur.rev;
        }
        return re;
      }, 0);
      return rev2 - rev1;
    });
}

export function compare(dataList: ReturnType<typeof toData>, c = 0.13, a = 1, cRev = 430) {
  const filterDataList = dataList
    .filter((d) => {
      return d.revList?.[0]?.rev > cRev;
    })
    .sort((a, b) => {
      const dy1 = dayjs(a.dateTime, 'MM-DD HH:mm').valueOf();
      const dy2 = dayjs(b.dateTime, 'MM-DD HH:mm').valueOf();
      return dy1 - dy2;
    });
  let mDataList: {
    d1: (typeof dataList)[0];
    d2: (typeof dataList)[0];
    gc1: number;
    gc2: number;
    vv1: number;
    vv2: number;
    offset1: number;
    offset2: number;
    rev1: number;
    rev2: number;
    single1: boolean;
    single2: boolean;
  }[] = [];
  for (let i = 0; i < filterDataList.length; i++) {
    for (let j = i; j < filterDataList.length; j++) {
      const d1 = filterDataList[i];
      const d2 = filterDataList[j];
      const single1 = d1.revList[0].single;
      const single2 = d2.revList[0].single;
      const gc1 = d1.revList[0].gc;
      const vv1 = d1.revList[0].vv;
      const vv2 = d2.revList[0].vv;
      const gc2 = d2.revList[0].gc;
      const offset2 = (gc1 * gc2 * 10000) / (1.028 * vv2 + 0.972);
      const offset1 = (1.028 * vv2 * offset2 - (10000 * (1 - c) * 7) / 8) / ((1.028 * vv1) / 8 + 0.972);
      const rev1 = offset1 * vv1 * 1.028 - 10000 * (1 - c);
      const rev2 = offset2 * vv2 * 1.028 - offset1 * 0.972 - 10000 * (1 - c);
      mDataList = [...mDataList, { d1, d2, gc1, gc2, vv1, vv2, offset1, offset2, rev1, rev2, single1, single2 }];
    }
  }
  return mDataList.sort((a, b) => {
    return b.rev1 + b.rev2 - a.rev1 - a.rev2;
  });
}

export const saveFile = (fileName: string, data: string) => {
  const path = './';
  const pPath = parse(resolve(path, fileName));
  // 如果开启了oss,保存数据到oss
  if (!fs.existsSync(pPath.dir)) {
    fs.mkdirSync(pPath.dir, { recursive: true });
  }
  const _data = fs.readFileSync(resolve(path, fileName), { encoding: 'utf-8' });
  // 如果数据没变 就不在保存数据
  if (data === _data) {
    return;
  }
  if (client) {
    client.put(pPath.name + `_${dayjs().add(8, 'h').format('YYYY-MM-DD')}` + pPath.ext, Buffer.from(data));
  }
  fs.writeFileSync(resolve(path, fileName), data, { encoding: 'utf-8' });
};

type Store = {
  ver: string;
  uid: string;
  url: string;
  timestamp: number;
  R: number;
  A: number;
  C: number;
  Rev: number;
  compareRev: number;
  scoreRev: number;
  data: any;
};
export async function getStore() {
  let status = 200;
  const initData: Partial<Store> = {
    R: 0.12,
    A: 1,
    C: 0.13,
    Rev: 400,
    compareRev: 430,
    scoreRev: 200,
  };
  const path = './data/store.json';
  // 首先查看本地是否有数据,如果本地有数据，直接使用本地数据
  let localStore: Partial<Store> | undefined = void 0;
  if (fs.existsSync(path)) {
    localStore = JSON.parse(fs.readFileSync(path, { encoding: 'utf-8' }));
  }
  // 本地数据如果在30s之内
  if (localStore && dayjs().valueOf() - (localStore?.timestamp || 0) < 30 * 1000) {
    log('local数据在30s更新过，直接使用local数据');
    return localStore;
  }
  let ossStore: Partial<Store> | undefined = void 0;
  // 请求oss里的数据
  try {
    if (client) {
      const res = await client.get(`store.json`);
      ossStore = JSON.parse(res.content);
    }
  } catch (error) {
    // @ts-ignore
    status = error.status;
  }
  // oss没有权限
  if (status === 403) {
    log('获取oss store数据无权限');
  }
  let store: Partial<Store> | undefined = void 0;
  if (!localStore && ossStore) {
    store = ossStore;
    log('local数据不存在，使用oss数据');
  }
  if (!localStore && !ossStore) {
    store = initData;
    log('local oss数据都不存在，使用初始化数据');
  }
  if (localStore && !ossStore) {
    store = localStore;
    log('oss数据不存在，使用本地数据');
  }
  if (localStore?.timestamp && ossStore?.timestamp && (localStore?.timestamp || 0) > (ossStore?.timestamp || 0)) {
    store = localStore;
    log('local数据比较新，使用本地数据');
  }
  if (localStore?.timestamp && ossStore?.timestamp && (localStore?.timestamp || 0) < (ossStore?.timestamp || 0)) {
    log('oss数据比较新，使用oss数据');
    store = ossStore;
  }
  if (store) {
    return store;
  }
  return initData;
}

export const saveStore = async (s: Partial<Store>, updateTimestamp = true) => {
  // 本地先存
  const path = './data/store.json';
  const store = await getStore();
  const tStore: Partial<Store> = { ...store, ...s, timestamp: dayjs().valueOf() }
  fs.writeFileSync(path, Format(tStore), { encoding: 'utf-8' });
  // oss保存
  try {
    if (client) {
      await client.put(`store.json`, Buffer.from(Format(tStore)));
      log({ msg: 'store存储到oss', data: s });
    }
  } catch (error) {}
  return tStore;
};

export const log = (msg: any) => {
  const path = './data/log.json';
  if (!fs.existsSync(path)) {
    fs.writeFileSync(path, Format({ data: [] }), { encoding: 'utf-8' });
  }
  const d = JSON.parse(fs.readFileSync(path, { encoding: 'utf-8' })) as { data: { dateTime: string; msg: any }[] };
  const l = [{ dateTime: dayjs().add(8, 'h').format('YYYY-MM-DD HH:mm:ss'), msg }, ...d.data];
  console.log({ dateTime: dayjs().add(8, 'h').format('YYYY-MM-DD HH:mm:ss'), msg });
  fs.writeFileSync(path, Format({ data: l.slice(Math.max(l.length - 1000, 0)) }));
};

export const getLogHistory = () => {
  const path = './data/log.json';
  if (!fs.existsSync(path)) {
    fs.writeFileSync(path, Format({ data: [] }), { encoding: 'utf-8' });
  }
  const d = JSON.parse(fs.readFileSync(path, { encoding: 'utf-8' })) as { data: { dateTime: string; msg: any }[] };
  return d;
};

export function getMessage1List(data: ReturnType<typeof toData>, rev: number) {
  return data
    .filter((d) => d?.revList?.[0]?.rev > rev)
    .sort((a, b) => {
      const rev1 = a.revList[0];
      const rev2 = b.revList[0];
      return rev2.rev - rev1.rev;
    })
    .map((d) => {
      const rev = d.revList[0];
      // 胜，负，让胜，让负
      const desc = rev.type === 'win' ? `${rev.tiCai === 0 ? '胜' : '让胜'}` : `${rev.tiCai === 0 ? '负' : '让负'}`;
      return `${rev.single ? '【单】' : ''}${d.num} ${dayjs(d.dateTime, 'MM-DD HH:mm').format('MM-DD\u2002HH:ss')} ${d.tiCaiTeamList.join(
        ' '
      )} ${desc} GC:${rev.gc.toFixed(2)} VV:${rev.vv.toFixed(2)} offset:${rev.offset.toFixed(2)} rev:${rev.rev.toFixed(2)}`;
    });
}
export function getMessage3List(data: ReturnType<typeof toData>, scoreRev: number) {
  return data
    .filter((d) => d?.scoreRevList?.[0]?.rev > scoreRev)
    .sort((a, b) => {
      const rev1 = a.scoreRevList[0];
      const rev2 = b.scoreRevList[0];
      return rev2.rev - rev1.rev;
    })
    .map((d) => {
      const rev = d.scoreRevList[0];
      return `${d.num} ${dayjs(d.dateTime, 'MM-DD HH:mm').format('MM-DD\u2002HH:ss')} ${d.tiCaiTeamList.join(' ')} GC:${rev.gc.toFixed(
        2
      )} VV:${rev.vv.toFixed(2)} offset:${rev.offset.toFixed(2)} rev:${rev.rev.toFixed(2)} 0球(${rev.score?.c?.toFixed(
        2
      )})-${rev.score?.Z?.toFixed(2)}\u20021球(${rev.score?.b?.toFixed(2)})-${rev.score?.Y?.toFixed(2)}\u20022球(${rev.score?.a?.toFixed(
        2
      )})-${rev.score?.X?.toFixed(2)}`;
    });
}
export function getMessage2List(data: ReturnType<typeof toData>, C: number, A: number, compareRev: number) {
  const compareDataList = compare(data, C, A, compareRev).slice(0, 3);
  const messageList = compareDataList
    .filter(({ d1, d2 }) => {
      const dy1 = dayjs(d1.dateTime, 'MM-DD HH:mm');
      const dy2 = dayjs(d2.dateTime, 'MM-DD HH:mm');
      const bet = Math.abs(dy1.valueOf() - dy2.valueOf());
      const dy1Num = d1.num.slice(0,2)
      const wl = ['周日','周一','周二','周三','周四','周五','周六']
      // 两个比赛的日期得是一致或者连续的 且有一场在当天
      const isToday =
        Math.abs(dy1.date() - dy2.date()) <= 1 && dy1Num === wl[dayjs().add(8, 'hour').day()];
      return bet > 2 * 60 * 60 * 1000 && isToday;
    })
    .map((cd, index) => {
      return [
        `NO.${index}${cd.single1 ? '【单】' : ''} ${cd.d1.num} ${dayjs(cd.d1.dateTime, 'MM-DD HH:mm').format(
          'MM-DD\u2002HH:ss'
        )} ${cd.d1.tiCaiTeamList.join(' ')} GC:${cd.gc1.toFixed(2)} VV:${cd.vv1.toFixed(2)} offset:${cd.offset1.toFixed(
          2
        )} rev:${cd.rev1.toFixed(2)}`,
        `NO.${index}${cd.single2 ? '【单】' : ''} ${cd.d2.num} ${dayjs(cd.d2.dateTime, 'MM-DD HH:mm').format(
          'MM-DD\u2002HH:ss'
        )} ${cd.d2.tiCaiTeamList.join(' ')} GC:${cd.gc2.toFixed(2)} VV:${cd.vv2.toFixed(2)} offset:${cd.offset2.toFixed(
          2
        )} rev:${cd.rev2.toFixed(2)}`,
      ];
    });
  return { messageList, compareDataList };
}


export async function cInter(cb: () => Promise<boolean>, n: number) {
  try {
    const d = await cb();
    if (!d) {
      return;
    }
  } catch (error) {}
  setTimeout(async () => {
    try {
      await cInter(cb, n);
    } catch (error) {}
  }, n);
}