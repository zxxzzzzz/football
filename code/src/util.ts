import * as R from 'ramda';
import { getTiCaiByFetch } from './api';
import dayjs from 'dayjs';
import fs from 'fs';
import { resolve, parse } from 'path';
// @ts-ignore
import Format from 'json-format';
import OSS from 'ali-oss';

let client = new OSS({
  // yourRegion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
  region: 'oss-cn-hangzhou',
  // 阿里云账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM用户进行API访问或日常运维，请登录RAM控制台创建RAM用户。
  accessKeyId: 'LTAI5tNpSy9xc' + 'TEcAK7M7Uxu',
  accessKeySecret: 'xJw1QUVCmOs' + 'DT5ZHqJgMssUZTtalqo',
  bucket: 'footballc',
  internal: process.env.dev ? false : true,
});
const extraTeam = [
  ['谢里夫', '舒列夫'],
  ['康斯塔查灯塔', '法乌尔'],
  // ['北安普敦', '法乌尔'],
];
export function sim_jaccard(s1: string, s2: string): number {
  const extraFind = extraTeam.find((e) => e.includes(s1));
  if (extraFind && extraFind.includes(s2)) {
    return 1;
  }
  const _s1 = new Set(s1);
  const _s2 = new Set(s2);
  const ret1 = new Set([..._s1].filter((x) => _s2.has(x)));
  const ret2 = new Set([..._s1, ..._s2]);
  return (1.0 * ret1.size) / ret2.size;
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
        return sim_jaccard(aStr, bStr);
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
    ['欧洲国家联赛', '欧洲国家联赛A'],
    ['欧洲杯预选赛', '欧洲足球锦标赛2024外围赛'],
    ['国际赛', '国际友谊赛'],
    ['国际赛', '美洲国家联赛A'],
    ['欧洲U21锦标赛', '欧洲U21青年锦标赛2023(在罗马尼亚和格鲁吉亚)'],
    ['中北美金杯赛', '美洲金杯2023(在美国和加拿大)'],
    ['欧洲冠军联赛外围赛', '欧洲冠军联赛'],
    ['女足世界杯', '女子世界杯2023(在澳大利亚和纽西兰)'],
    ['英格兰联赛锦标赛', '英格兰锦标赛'],
    ['欧罗巴联赛', '欧洲联赛'],
    ['欧罗巴联赛', '欧洲联赛外围赛'],
    ['世界杯2026南美洲外围赛', '世界杯预选赛'],
    ['亚运会男足', '亚运会2022男子足球U23(在中国)'],
    ['亚洲冠军联赛', '亚足联冠军联赛'],
    ['世界杯预选赛', '世界杯2026亚洲外围赛', '世界杯2026南美洲外围赛', '世界杯2026非洲外围赛'],
  ];
  const isEqual = !!equalNameList.find((d) => d.includes(l1) && d.includes(l2));
  if (isEqual) {
    return true;
  }
  const _l1 = l1.replace(/[组]/g, '级');
  const _l2 = l2.replace(/[组]/g, '级');
  return _l1 === _l2 || _l1 + '-附加赛' === _l2 || _l1 === _l2 + '-附加赛' || _l1 + '-升级附加赛' === _l2 || _l1 === _l2 + '-升级附加赛';
};

function getRev(tiCai: number, extra: number, R: number = 0.12) {
  const GC = tiCai;
  const VV = tiCai * extra > 3 ? extra - 1 : extra;
  const Offset = (10000 * GC) / (1.025 * VV + 0.975);
  const Rev = GC * 10000 - 10000 * (1 - R) - 0.975 * Offset;
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
    const oneMinute = 60 * 1000;
    return {
      league: ti.league,
      tiCaiLeague: ti.league,
      extraLeague: matchedExtra.league,
      num: ti.num || '',
      singleList: ti.singleList,
      // @ts-ignore
      rate: matchedExtra.rate,
      tiCaiDateTime: ti.dateTime,
      extraDateTime: matchedExtra.dateTime,
      // 体彩的时间不对，使用extra的时间作为基准
      dateTime:
        Math.abs(dayjs(matchedExtra.dateTime).valueOf() - dayjs(ti.dateTime).add(24, 'hour').valueOf()) <= 10 * oneMinute
          ? dayjs(ti.dateTime).add(24, 'hour').format('MM-DD HH:mm')
          : dayjs(ti.dateTime).format('MM-DD HH:mm'),
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
      halfRevList: ti.itemList
        .filter((item) => item.oddsTitle === '半场')
        .map((tiCaiItem) => {
          if (!matchedExtra) {
            return void 0;
          }
          const filterList = tiCaiItem.oddsItemList
            .map((oddsItem) => {
              // 体彩让球  [主胜对立面，主负对立面]
              if (oddsItem[0] === '+0.5') {
                return {
                  filter: (d: number, isOnlyWin: boolean) => d === -0.5,
                  // 胜
                  type: 'win',
                  tiCai: oddsItem[0],
                  tiCaiOdds: parseFloat(oddsItem[1]),
                };
              }
              return {
                filter: (d: number, isOnlyWin: boolean) => d === 0.5,
                type: 'lose',
                tiCai: oddsItem[0],
                // 负
                tiCaiOdds: parseFloat(oddsItem[1]),
              };
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
                    score: tiCaiItem.score,
                    teamList: matchedExtra.teamList,
                    num: ti.num,
                    ecid: matchedExtra.ecid,
                    isMatch: f.filter(r[0], item.oddsTitle === '独赢'),
                    isOnlyWin: item.oddsTitle === '独赢',
                    type: f.type,
                    tiCaiOdds: f.tiCaiOdds,
                    extraOdds: f.type === 'win' ? r[2] : r[1],
                    tiCai: f.tiCai,
                    extra: item.oddsItemList[0][0],
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
                  filter: (d: number, isOnlyWin: boolean) => {
                    // 让球大于四的忽略
                    if (Math.abs(parseFloat(oddsItem[0])) > 3) {
                      return false;
                    }
                    return isOnlyWin ? parseFloat(oddsItem[0]) === 1 : filterMap[parseFloat(oddsItem[0])][0] === d;
                  },
                  // 胜
                  type: 'win',
                  single,
                  tiCai: parseFloat(oddsItem[0]),
                  tiCaiOdds: parseFloat(oddsItem[1]),
                },
                {
                  filter: (d: number, isOnlyWin: boolean) => {
                    if (Math.abs(parseFloat(oddsItem[0])) > 3) {
                      return false;
                    }
                    return isOnlyWin ? parseFloat(oddsItem[0]) === -1 : filterMap[parseFloat(oddsItem[0])][1] === d;
                  },
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
      return d.revList?.[0]?.rev > cRev && d.revList?.[0]?.rev < 3000;
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
      const offset2 = (gc1 * gc2 * 10000) / (1.025 * vv2 + 0.975);
      const offset1 = (1.025 * vv2 * offset2 - (10000 * (1 - c) * 7) / 8) / ((1.025 * vv1) / 8 + 0.975);
      const rev1 = offset1 * vv1 * 1.025 - 10000 * (1 - c);
      const rev2 = offset2 * vv2 * 1.025 - offset1 * 0.975 - 10000 * (1 - c);
      mDataList = [...mDataList, { d1, d2, gc1, gc2, vv1, vv2, offset1, offset2, rev1, rev2, single1, single2 }];
    }
  }
  return mDataList.sort((a, b) => {
    return b.rev1 + b.rev2 - a.rev1 - a.rev2;
  });
}

export const saveFile = async (fileName: string, data: string) => {
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
    try {
      await client.put(pPath.name + `_${dayjs().add(8, 'h').format('YYYY-MM-DD')}` + pPath.ext, Buffer.from(data));
    } catch (error) {
      console.log(error);
    }
  }
  fs.writeFileSync(resolve(path, fileName), data, { encoding: 'utf-8' });
};

type Store = {
  ver: string;
  uid: string;
  url: string;
  timestamp: number;
  timeFormat: string;
  R: number;
  A: number;
  C: number;
  Rev: number;
  compareRev: number;
  scoreRev: number;
  halfRev: number;
  data: any;
  accountList: { password: string; token: string; timestamp: number }[];
};

export async function getStore(p: 'data'): Promise<Partial<Store>>;
export async function getStore(): Promise<Partial<Omit<Store, 'data'>>>;
export async function getStore(p?: 'data'): Promise<Partial<Store>> {
  const initData: Partial<Store> = {
    R: 0.12,
    A: 1,
    C: 0.13,
    Rev: 400,
    compareRev: 430,
    scoreRev: 200,
    halfRev: 400,
  };
  if (client) {
    try {
      const res = await client.get(`store.json`);
      if (p === 'data') {
        const dataRes = await client.get(`data.json`);
        return { ...initData, ...JSON.parse(res.content), data: JSON.parse(dataRes.content) };
      }
      return { ...initData, ...JSON.parse(res.content) };
    } catch (error) {
      return initData;
    }
  }
  return initData;
}

export const saveStore = async (s: Partial<Store>, upload = true) => {
  const store = await getStore();
  const tStore: Partial<Store> = { ...store, ...s };
  // oss保存
  try {
    if (client && upload) {
      try {
        if (s.data) {
          await client.put(`data.json`, Buffer.from(Format(s.data)));
        }
        await client.put(`store.json`, Buffer.from(Format(R.omit(['data'], tStore))));
      } catch (error) {
        console.log(error);
      }
    }
  } catch (error) {}
  return tStore;
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
    .filter((d) => d?.revList?.[0]?.rev > rev && d?.revList?.[0]?.rev < 3000)
    .sort((a, b) => {
      const rev1 = a.revList[0];
      const rev2 = b.revList[0];
      return rev2.rev - rev1.rev;
    })
    .map((d) => {
      const rev = d.revList[0];
      // 胜，负，让胜，让负
      const desc = rev.type === 'win' ? `${rev.tiCai === 0 ? '胜' : '让胜'}` : `${rev.tiCai === 0 ? '负' : '让负'}`;
      return `${rev.single ? '【单】' : ''}${d.num} ${dayjs(d.dateTime, 'MM-DD HH:mm').format('MM-DD\u2002HH:mm')} ${d.tiCaiTeamList.join(
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
      return `${d.num} ${dayjs(d.dateTime, 'MM-DD HH:mm').format('MM-DD\u2002HH:mm')} ${d.tiCaiTeamList.join(' ')} GC:${rev.gc.toFixed(
        3
      )} VV:${rev.vv.toFixed(2)} offset:${rev.offset.toFixed(2)} rev:${rev.rev.toFixed(2)} 0球(${rev.score?.c?.toFixed(2)})-${(
        (rev.score?.Z || 0) * 2
      ).toFixed(2)}\u20021球(${rev.score?.b?.toFixed(2)})-${((rev.score?.Y || 0) * 2).toFixed(2)}\u20022球(${rev.score?.a?.toFixed(2)})-${(
        (rev.score?.X || 0) * 2
      ).toFixed(2)}`;
    });
}
export function getMessage4List(data: ReturnType<typeof toData>, halfRev: number) {
  return data
    .filter((d) => d?.halfRevList?.[0]?.rev > halfRev && d?.halfRevList?.[0]?.rev < 1500)
    .sort((a, b) => {
      const rev1 = a.halfRevList[0];
      const rev2 = b.halfRevList[0];
      return rev2.rev - rev1.rev;
    })
    .map((d) => {
      const rev = d.halfRevList[0];
      const tList = rev.type === 'win' ? ['胜胜', '平胜', '负胜'] : ['胜负', '平负', '负负'];
      return `${d.num} ${dayjs(d.dateTime, 'MM-DD HH:mm').format('MM-DD\u2002HH:mm')} ${d.tiCaiTeamList.join(' ')} GC:${rev.gc.toFixed(
        3
      )} VV:${rev.vv.toFixed(2)} offset:${rev.offset.toFixed(2)} rev:${rev.rev.toFixed(2)} ${tList[0]}(${rev.score?.a?.toFixed(2)})-${(
        (rev.score?.Z || 0) * 2
      )?.toFixed(2)}\u2002${tList[1]}(${rev.score?.b?.toFixed(2)})-${((rev.score?.Y || 0) * 2)?.toFixed(2)}\u2002${
        tList[2]
      }(${rev.score?.c?.toFixed(2)})-${((rev.score?.X || 0) * 2)?.toFixed(2)}`;
    });
}
export function getMessage2List(data: ReturnType<typeof toData>, C: number, A: number, compareRev: number) {
  const compareDataList = compare(data, C, A, compareRev).slice(0, 3);
  const messageList = compareDataList
    .filter(({ d1, d2 }) => {
      const dy1 = dayjs(d1.dateTime, 'MM-DD HH:mm');
      const dy2 = dayjs(d2.dateTime, 'MM-DD HH:mm');
      const bet = Math.abs(dy1.valueOf() - dy2.valueOf());
      const dy1Num = d1.num.slice(0, 2);
      const wl = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      // 两个比赛的日期得是一致或者连续的 且有一场在当天
      const isToday = Math.abs(dy1.date() - dy2.date()) <= 1 && dy1Num === wl[dayjs().add(8, 'hour').day()];
      return bet >= 2 * 60 * 60 * 1000 && isToday;
    })
    .map((cd, index) => {
      return [
        `NO.${index}${cd.single1 ? '【单】' : ''} ${cd.d1.num} ${dayjs(cd.d1.dateTime, 'MM-DD HH:mm').format(
          'MM-DD\u2002HH:mm'
        )} ${cd.d1.tiCaiTeamList.join(' ')} GC:${cd.gc1.toFixed(2)} VV:${cd.vv1.toFixed(2)} offset:${cd.offset1.toFixed(
          2
        )} rev:${cd.rev1.toFixed(2)}`,
        `NO.${index}${cd.single2 ? '【单】' : ''} ${cd.d2.num} ${dayjs(cd.d2.dateTime, 'MM-DD HH:mm').format(
          'MM-DD\u2002HH:mm'
        )} ${cd.d2.tiCaiTeamList.join(' ')} GC:${cd.gc2.toFixed(2)} VV:${cd.vv2.toFixed(2)} offset:${cd.offset2.toFixed(
          2
        )} rev:${cd.rev2.toFixed(2)}`,
      ];
    });
  return { messageList, compareDataList };
}
