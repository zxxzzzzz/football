import * as R from 'ramda';
import { getTiCaiByFetch, retryGetGameListByNodeFetch } from './api';
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

// const keyList = [['RB莱比锡', '莱红牛']];
// rate加权
const isMatch = (a: string, b: string): number => {
  // const matchedEl = keyList.find((k) => k.includes(a));
  // if (matchedEl && matchedEl.includes(b)) {
  //   return 1;
  // }
  // if (a.includes(b) || b.includes(a)) {
  //   return 1;
  // }
  // const flag = R.range(0, Math.max(a.length, b.length)).every((index) => {
  //   return a[index] === b[index];
  // });
  // if (flag) {
  //   return 1;
  // }
  const matchList = R.range(0, Math.min(a.length, b.length)).map((index) => {
    return a[index] === b[index];
  });
  return (
    matchList.reduce((re, cur) => {
      return re + (cur ? 1 : 0);
    }, 0) /
    ((a.length + b.length) / 2)
  );
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
  ];
  const isEqual = !!equalNameList.find((d) => d.includes(l1) && d.includes(l2));
  if (isEqual) {
    return true;
  }
  return (
    l1 === l2 ||
    l1.replace(/[组]/g, '级') === l2 ||
    l2.replace(/[组]/g, '级') === l1 ||
    l1 + '-附加赛' === l2 ||
    l1 === l2 + '-附加赛' ||
    l1 + '-升级附加赛' === l2 ||
    l1 === l2 + '-升级附加赛'
  );
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
type TiCaiList = FirstOfGeneric<ReturnType<typeof getTiCaiByFetch>>;
export function toData(tiCaiList: TiCaiList, extraList: TiCaiList, _R = 0.12) {
  return tiCaiList
    .map((ti) => {
      const matchedExtra = extraList.find((d) => d.ecid === ti.ecid);
      if (!matchedExtra) {
        return {
          league: ti.league,
          num: ti.num || '',
          singleList: ti.singleList,
          dateTime: ti?.dateTime || '',
          tiCaiTeamList: ti.teamList,
          extraTeamList: ti.teamList,
          tiCaiItemList: ti.itemList,
          extraItemList: [],
          revList: [],
        };
      }
      return {
        league: ti.league,
        num: ti.num || '',
        singleList: ti.singleList,
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
        revList: ti.itemList
          .map((item) => {
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
                  .filter((d) => d.isMatch);
              })
              .flat();
            return matchList;
          })
          .flat()
          .sort((a, b) => b.rev - a.rev)
          .slice(0, 1),
      };
    })
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
  return mDataList
    .filter(({ d1, d2 }) => {
      const dy1 = dayjs(d1.dateTime, 'MM-DD HH:mm');
      const dy2 = dayjs(d2.dateTime, 'MM-DD HH:mm');
      const now = dayjs();
      const bet = Math.abs(dy1.valueOf() - dy2.valueOf());
      const isToday = Math.abs(dy1.date() - now.date()) + Math.abs(dy2.date() - now.date()) <= 1;
      return bet > 2 * 60 * 60 * 1000 && isToday;
    })
    .sort((a, b) => {
      return b.rev1 + b.rev2 - a.rev1 - a.rev2;
    });
}

export const saveFile = (fileName: string, data: string) => {
  const path = './';
  const pPath = parse(resolve(path, fileName));
  // 如果开启了oss,保存数据到oss
  if (client) {
    client.put(pPath.name + pPath.ext, Buffer.from(data));
  }
  if (!fs.existsSync(pPath.dir)) {
    fs.mkdirSync(pPath.dir, { recursive: true });
  }
  fs.writeFileSync(resolve(path, fileName), data, { encoding: 'utf-8' });
};

type Store = {
  ver: string;
  uid: string;
  url: string;
  uidTimestamp: number;
  dataTimestamp: number;
  R: number;
  A: number;
  C: number;
  Rev: number;
  compareRev: number;
  data: any;
};
export async function getStore() {
  let status = 200;
  let d: Partial<Store> | undefined = void 0;
  const initData: Partial<Store> = {
    R: 0.12,
    A: 1,
    C: 0.13,
    Rev: 400,
    compareRev: 430,
  };
  const path = './data/store.json';
  // 首先查看本地是否有数据,如果本地有数据，直接使用本地数据
  if (fs.existsSync(path)) {
    const store: Partial<Store> = JSON.parse(fs.readFileSync(path, { encoding: 'utf-8' }));
    return store;
  }
  // 如果本地没有数据，请求oss里的数据
  try {
    if (client) {
      const res = await client.get('store.json');
      d = JSON.parse(res.content);
      log('获取 oss store数据成功');
    } else {
      d = initData;
    }
  } catch (error) {
    // @ts-ignore
    status = error.status;
  }
  // oss文件不存在, 把init数据存储到oss
  if (status === 404 && client) {
    await client.put('store.json', Buffer.from(JSON.stringify(initData)), {});
    d = initData;
  }
  // oss没有权限
  if (status === 403) {
    log('获取oss store数据无权限');
  }
  // 本地备份下oss里的数据
  fs.writeFileSync(path, JSON.stringify(d), { encoding: 'utf-8', flag: 'w' });
  if (d) {
    return d;
  }
  return initData;
}

export const saveStore = async (s: Partial<Store>) => {
  // 本地先存
  const path = './data/store.json';
  const store = await getStore();
  fs.writeFileSync(path, Format({ ...store, ...s }), { encoding: 'utf-8' });
  // oss保存
  try {
    if (client) {
      await client.put('store.json', Buffer.from(JSON.stringify({ ...store, ...s })));
      log('store存储到oss');
    }
  } catch (error) {}
  return { ...store, ...s };
};

export const log = (msg: string) => {
  const path = './data/log.json';
  if (!fs.existsSync(path)) {
    fs.writeFileSync(path, JSON.stringify({ data: [] }), { encoding: 'utf-8' });
  }
  const d = JSON.parse(fs.readFileSync(path, { encoding: 'utf-8' })) as { data: { dateTime: string; msg: string }[] };
  const l = [...d.data, { dateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'), msg }];
  console.log({ dateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'), msg });
  if (client) {
    client.put('log.json', Buffer.from(JSON.stringify(l)), { headers: { 'x-oss-tagging': 'history=0' } });
  }
  fs.writeFileSync(path, Format({ data: l.slice(Math.max(l.length - 1000, 0)) }));
};
export const getLogHistory = () => {
  const path = './data/log.json';
  if (!fs.existsSync(path)) {
    fs.writeFileSync(path, JSON.stringify({ data: [] }), { encoding: 'utf-8' });
  }
  const d = JSON.parse(fs.readFileSync(path, { encoding: 'utf-8' })) as { data: { dateTime: string; msg: string }[] };
  return d;
};
