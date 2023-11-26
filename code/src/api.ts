import Convert from 'xml-js';
import dayjs from 'dayjs';
import { BasketballMatchInfo, MatchInfo } from './type';
import axios from 'axios';
// import _fetch from;
// const _fetch = import('node-fetch');
import { Code, createError } from './error';
import { writeFileSync } from 'fs';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

function obj2Str(bodyObj: { [key: string]: string | number }) {
  const bodyStr = Object.keys(bodyObj)
    .map((key) => {
      return `${key}=${bodyObj[key]}`;
    })
    .join('&');
  return bodyStr;
}

export function retryWrap<T extends any[], R>(cb: (...args: T) => R, count: number) {
  return async (...args: T) => {
    let _error = Error('wrap默认错误');
    for (let index = 0; index < count; index++) {
      try {
        const d = await cb(...args);
        return d;
      } catch (error) {
        _error = error as Error;
      }
    }
    throw _error;
  };
}

type Game = {
  league: string;
  source: 'extra';
  ecid: string;
  strong: string;
  num: string;
  singleList: boolean[];
  dateTime: string;
  itemList: {
    oddsTitle: string;
    oddsItemList: string[][];
  }[];
  teamList: string[];
};

export async function getTiCaiByFetch() {
  let data: any = void 0;
  try {
    const res = await axios.get(
      'https://webapi.sporttery.cn/gateway/jc/football/getMatchCalculatorV1.qry?poolCode=hhad,had,ttg,hafu&channel=c',
      {
        headers: {
          accept: 'application/json, text/javascript, */*; q=0.01',
          'accept-language': 'zh-CN,zh;q=0.9',
          'cache-control': 'no-cache',
          pragma: 'no-cache',
          'sec-ch-ua': '"Google Chrome";v="111", "Not(A:Brand";v="8", "Chromium";v="111"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-site',
          Referer: 'https://www.sporttery.cn/',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
        },
      }
    );
    data = res.data as any;
  } catch (error) {
    throw createError('获取体彩数据失败', Code.dataFail);
  }
  const matchInfoList: MatchInfo[] = data?.value?.matchInfoList;
  if (matchInfoList) {
    const dataList = matchInfoList
      .map((match) => {
        return match.subMatchList;
      })
      .flat()
      .map((m) => {
        const leagueAllName = m.leagueAllName;
        // 得分计算
        const ttg = m.ttg;
        const a = parseFloat(ttg.s2);
        const b = parseFloat(ttg.s1);
        const c = parseFloat(ttg.s0);
        const get25G = (a: number, b: number, c: number) => {
          if (!a || !b || !c) {
            return void 0;
          }
          if (Number.isNaN(a) || Number.isNaN(b) || Number.isNaN(c)) {
            return void 0;
          }
          // X+aX/b+aX/c=5000  aX=bY=cZ X+Y+Z=5000
          const X = 5000 / (1 + a / b + a / c);
          const Y = (a / b) * X;
          const Z = (a / c) * X;
          return { rate: ((X * a * 2) / 10000).toFixed(3), X, Y, Z };
        };
        const get2G = (a: number, b: number, c: number) => {
          if (!a || !b || !c) {
            return void 0;
          }
          if (Number.isNaN(a) || Number.isNaN(b) || Number.isNaN(c)) {
            return void 0;
          }
          const X = 9200 / 2 / a;
          // Y+Z = 5000 - X  bY = cZ  Z=bY/c   Y+bY/c = 5000 -X  Y = (5000-X)/(1+b/c)
          const Y = (5000 - X) / (1 + b / c);
          const Z = (b * Y) / c;
          return { rate: ((Y * b * 2) / 10000).toFixed(3), X, Y, Z };
        };
        const _25G = get25G(a, b, c);
        const _2G = get2G(a, b, c);
        // 半场计算 胜胜 平胜 负胜
        const { hh, dh, ah, ha, da, aa } = m.hafu || {};
        const _05Plus = get25G(parseFloat(hh), parseFloat(dh), parseFloat(ah));
        // 半场计算 胜负 平负 负负
        const _05Minus = get25G(parseFloat(ha), parseFloat(da), parseFloat(aa));
        return {
          dateTime: dayjs(m.businessDate + ' ' + m.matchTime, 'YYYY-MM-DD HH:mm:ss').format('MM-DD HH:mm'),
          num: m.matchNumStr,
          league: leagueAllName,
          source: 'tiCai',
          teamList: [m.homeTeamAllName, m.awayTeamAllName],
          singleList: [!!m.poolList.find((d) => d.poolCode === 'HAD')?.single, !!m.poolList.find((d) => d.poolCode === 'HHAD')?.single],
          itemList: [
            {
              oddsTitle: '胜平负',
              oddsItemList: [
                [m.had.goalLine === void 0 ? '100' : m.had.goalLine || '0', m.had.h || '0', m.had.d || '0', m.had.a || '0'],
                [m.hhad.goalLine === void 0 ? '100' : m.hhad.goalLine || '0', m.hhad.h || '0', m.hhad.d || '0', m.hhad.a || '0'],
              ],
            },
            {
              oddsTitle: '得分',
              oddsItemList: [[`+2.5`, _25G?.rate || '0']],
              score: { a, b, c, X: _25G?.X || 0, Y: _25G?.Y || 0, Z: _25G?.Z || 0 },
            },
            {
              oddsTitle: '得分',
              oddsItemList: [[`+2`, _2G?.rate || '0']],
              score: { a, b, c, X: _2G?.X || 0, Y: _2G?.Y || 0, Z: _2G?.Z || 0 },
            },
            {
              oddsTitle: '半场',
              oddsItemList: [['+0.5', _05Plus?.rate || '0']],
              score: {
                a: parseFloat(hh),
                b: parseFloat(dh),
                c: parseFloat(ah),
                X: _05Plus?.X || 0,
                Y: _05Plus?.Y || 0,
                Z: _05Plus?.Z || 0,
              },
            },
            {
              oddsTitle: '半场',
              oddsItemList: [['-0.5', _05Minus?.rate || '0']],
              score: {
                a: parseFloat(ha),
                b: parseFloat(da),
                c: parseFloat(aa),
                X: _05Minus?.X || 0,
                Y: _05Minus?.Y || 0,
                Z: _05Minus?.Z || 0,
              },
            },
          ] as {
            oddsTitle: string;
            oddsItemList: string[][];
            score?: { a: number; b: number; c: number; X: number; Y: number; Z: number };
          }[],
          ecid: '',
        };
      });
    return dataList;
  }
  return [];
}
export const retryGetTiCaiByFetch = retryWrap(getTiCaiByFetch, 3);
export async function getTiCaiBasketballByFetch() {
  let data: any = void 0;
  try {
    // https://webapi.sporttery.cn/gateway/jc/basketball/getMatchCalculatorV1.qry?poolCode=hdc&channel=c
    const res = await axios.get(
      'https://webapi.sporttery.cn/gateway/jc/basketball/getMatchCalculatorV1.qry?poolCode=hdc,hilo,mnl&channel=c',
      {
        headers: {
          accept: 'application/json, text/javascript, */*; q=0.01',
          'accept-language': 'zh-CN,zh;q=0.9',
          'cache-control': 'no-cache',
          pragma: 'no-cache',
          'sec-ch-ua': '"Google Chrome";v="111", "Not(A:Brand";v="8", "Chromium";v="111"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-site',
          Referer: 'https://www.sporttery.cn/',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
        },
      }
    );
    data = res.data as any;
  } catch (error) {
    throw createError('获取体彩足球数据失败', Code.dataFail);
  }
  const matchInfoList = (data as BasketballMatchInfo)?.value?.matchInfoList;
  if (matchInfoList) {
    const dataList = matchInfoList
      .map((match) => {
        return match.subMatchList;
      })
      .flat()
      .map((m) => {
        const leagueAllName = m.leagueAllName;
        const g = m.hdc.goalLine || '0';
        return {
          dateTime: dayjs(m.businessDate + ' ' + m.matchTime, 'YYYY-MM-DD HH:mm:ss').format('MM-DD HH:mm'),
          num: m.matchNumStr,
          league: leagueAllName,
          source: 'tiCai',
          teamList: [m.homeTeamAllName, m.awayTeamAllName],
          singleList: [false, false],
          itemList: (
            [
              {
                oddsTitle: '让球',
                oddsItemList: [
                  // 让分 主胜 主负
                  [g, m.hdc.h || '0', m.hdc.a || '0'],
                ],
              },
              {
                oddsTitle: '让球',
                oddsItemList: [
                  // 让分 主胜 主负
                  ['0', m.mnl.h || '0', m.mnl.a || '0'],
                ],
              },
              {
                oddsTitle: '总分',
                oddsItemList: [
                  // 让分 主胜 主负
                  [parseFloat(m.hilo.goalLine).toString(), m.hilo.h || '0', m.hilo.l || '0'],
                ],
              },
            ] as {
              oddsTitle: string;
              oddsItemList: string[][];
            }[]
          ).filter((d) => d.oddsItemList[0][1] != '0'),
          ecid: '',
        };
      });
    return dataList;
  }
  return [];
}
export const retryGetTiCaiBasketballByFetch = retryWrap(getTiCaiBasketballByFetch, 3);

export async function getBasketballMore(url: string, ver: string, uid: string, lid: string, gid: string) {
  const body = {
    uid: uid,
    ver: ver,
    langx: 'zh-cn',
    p: 'get_game_more',
    gtype: 'bk',
    showtype: 'parlay',
    ltype: 3,
    isRB: 'N',
    lid: lid,
    specialClick: '',
    mode: 'NORMAL',
    filter: 'Main',
    ts: new Date().valueOf(),
    gid: gid,
  };
  const _url = new URL(url);
  const bodyStr = obj2Str(body);
  let text = '';
  try {
    const res = await axios.post(`${_url.origin}/transform.php?ver=${ver}`, bodyStr, {
      headers: {
        accept: '*/*',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
        'content-type': 'application/x-www-form-urlencoded',
        'sec-ch-ua': '"Chromium";v="112", "Microsoft Edge";v="112", "Not:A-Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
    });
    text = res.data;
  } catch (error) {
    // @ts-ignore
    throw createError('获取basketball more比赛数据失败 网络问题' + error.message, Code.dataFail);
  }
  if (!text) {
    throw createError('获取basketball more比赛数据失败,数据空', Code.dataFail);
  }
  const mixObj = Convert.xml2js(text, { compact: true }) as any;
  if (mixObj?.serverresponse?.code?._text === 'error') {
    throw createError('uid过期', Code.uidExpire);
  }
  const gameList = (mixObj?.serverresponse?.game || []).filter((g: any) => !g?.ms?._text) as any[];
  return gameList
    .map((game: any) => {
      const strong = game?.strong?._text;
      return [
        {
          oddsTitle: '让球',
          oddsItemList: [[(strong === 'H' ? '-' : '+') + game?.ratio?._text, game?.ior_PRH?._text, game?.ior_PRC?._text]],
        },

        {
          oddsTitle: '总分',
          oddsItemList: [[game?.ratio_o?._text, game?.ior_POUH?._text, game?.ior_POUC?._text]],
        },

        {
          oddsTitle: '让球',
          oddsItemList: [['0', game?.ior_MH?._text, game?.ior_MC?._text]],
        },
      ];
    })
    .flat()
    .filter((d) => !d.oddsItemList?.[0]?.[1] || d.oddsItemList?.[0]?.[1] !== '0')
    .sort((a, b) => (a.oddsItemList[0][0] == '0' ? 1 : -1));
}

const delay = (n: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, n);
  });
};
export async function getBasketballGameList(url: string, ver: string, uid: string, lid: string): Promise<Game[]> {
  const body = {
    uid: uid,
    ver: ver,
    langx: 'zh-cn',
    p: 'get_game_list',
    p3type: '',
    date: 'all',
    gtype: 'bk',
    showtype: 'parlay',
    rtype: 'r',
    ltype: 3,
    lid: lid,
    action: 'click_league',
    sorttype: 'L',
    specialClick: '',
    isFantasy: 'N',
    ts: new Date().valueOf(),
  };
  const _url = new URL(url);
  const bodyStr = obj2Str(body);
  let text: string | undefined = void 0;
  try {
    const res = await axios.post(`${_url.origin}/transform.php?ver=${ver}`, bodyStr, {
      headers: {
        accept: '*/*',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
        'content-type': 'application/x-www-form-urlencoded',
        'sec-ch-ua': '"Chromium";v="112", "Microsoft Edge";v="112", "Not:A-Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
    });
    text = res.data;
  } catch (error) {
    // @ts-ignore
    throw createError('获取basketball比赛数据失败 网络问题' + error.message, Code.dataFail);
  }
  if (!text) {
    throw createError('获取basketball比赛数据失败,数据空', Code.dataFail);
  }
  const mixObj = Convert.xml2js(text, { compact: true }) as any;
  if (mixObj?.serverresponse?.code?._text === 'error') {
    throw createError('uid过期', Code.uidExpire);
  }
  const gameList: Game[] = ([] as any[])
    .concat(mixObj?.serverresponse?.ec)
    .filter((e) => e)
    .map((ec): Game => {
      const game = ec.game;
      const vDateTime = game.DATETIME._text.slice(0, -1) + ' ' + game.DATETIME._text.slice(-1)[0] + 'm';
      return {
        league: game.LEAGUE._text || '',
        source: 'extra',
        ecid: game.GID._text,
        num: '',
        singleList: [false, false],
        strong: game.STRONG._text,
        dateTime: dayjs(vDateTime, 'MM-DD HH:mm a').add(12, 'hour').format('MM-DD HH:mm'),
        itemList: [],
        teamList: [game.TEAM_H._text, game.TEAM_C._text],
      };
    });

  for (const game of gameList) {
    game.itemList = await getBasketballMore(url, ver, uid, lid, game.ecid);
    await delay(500);
  }
  return gameList;
}
export const retryGetBasketballGameList = retryWrap(getBasketballGameList, 3);
async function getGameListByNodeFetch(url: string, ver: string, uid: string, lid: string): Promise<Game[]> {
  const body = {
    uid: uid,
    ver: ver,
    langx: 'zh-cn',
    p: 'get_game_list',
    p3type: '',
    date: 'all',
    gtype: 'ft',
    showtype: 'parlay',
    rtype: 'rb',
    ltype: 3,
    lid: lid,
    action: 'click_league',
    sorttype: 'L',
    specialClick: '',
    isFantasy: 'N',
    ts: new Date().valueOf(),
  };
  const _url = new URL(url);
  const bodyStr = obj2Str(body);
  let text: string | undefined = void 0;
  try {
    const res = await axios.post(`${_url.origin}/transform.php?ver=${ver}`, bodyStr, {
      headers: {
        accept: '*/*',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
        'content-type': 'application/x-www-form-urlencoded',
        'sec-ch-ua': '"Chromium";v="112", "Microsoft Edge";v="112", "Not:A-Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
    });
    text = res.data;
  } catch (error) {
    // @ts-ignore
    throw createError('获取extra 比赛数据失败 网络问题' + error.message, Code.dataFail);
  }
  if (!text) {
    throw createError('获取extra 比赛数据失败,数据空', Code.dataFail);
  }
  const mixObj = Convert.xml2js(text, { compact: true }) as any;
  if (mixObj?.serverresponse?.code?._text === 'error') {
    throw createError('uid过期', Code.uidExpire);
  }
  const gameList: Game[] = ([] as any[])
    .concat(mixObj?.serverresponse?.ec)
    .filter((e) => e)
    .map((ec): Game => {
      const game = ec.game;
      const vDateTime = game.DATETIME._text.slice(0, -1) + ' ' + game.DATETIME._text.slice(-1)[0] + 'm';
      return {
        league: game.LEAGUE._text || '',
        source: 'extra',
        ecid: game.ECID._text,
        num: '',
        singleList: [false, false],
        strong: game.STRONG._text,
        dateTime: dayjs(vDateTime, 'MM-DD HH:mm a').add(12, 'hour').format('MM-DD HH:mm'),
        itemList: [
          {
            oddsTitle: '独赢',
            // 0 1 和
            oddsItemList: [[game?.IOR_MH?._text || '0'], [game?.IOR_MC?._text || '0'], [game?.IOR_MN?._text || '0']],
          },
        ],
        teamList: [game.TEAM_H._text, game.TEAM_C._text],
      };
    });
  return gameList;
}
export const retryGetGameListByNodeFetch = retryWrap(getGameListByNodeFetch, 3);

export async function getGameOBTByNodeFetch(
  url: string,
  ver: string,
  uid: string,
  ecid: string
): Promise<{ oddsTitle: string; oddsItemList: string[][] }[]> {
  const body = {
    uid: uid,
    ver: ver,
    langx: 'zh-cn',
    p: 'get_game_OBT',
    gtype: 'ft',
    showtype: 'parlay',
    isSpecial: '',
    isEarly: 'N',
    model: 'OU|MIX',
    isETWI: 'N',
    ecid: ecid,
    ltype: 3,
    is_rb: 'N',
    ts: new Date().valueOf(),
    isClick: 'Y',
  };
  const body2 = {
    uid: uid,
    ver: ver,
    langx: 'zh-cn',
    p: 'get_game_OBT',
    gtype: 'ft',
    showtype: 'parlay',
    isSpecial: '',
    isEarly: 'Y',
    model: 'OU|MIX',
    isETWI: 'N',
    ecid: ecid,
    ltype: 3,
    is_rb: 'N',
    ts: new Date().valueOf(),
    isClick: 'Y',
  };
  const _url = new URL(url);
  const bodyStr = obj2Str(body);
  const bodyStr2 = obj2Str(body2);
  let text: string | undefined = void 0;
  try {
    const res = await axios.post(`${_url.origin}/transform.php?ver=${ver}`, bodyStr2, {
      headers: {
        accept: '*/*',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
        'content-type': 'application/x-www-form-urlencoded',
        'sec-ch-ua': '"Chromium";v="112", "Microsoft Edge";v="112", "Not:A-Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
    });
    text = res.data;
  } catch (error) {
    throw createError('获取extra 补充数据失败', Code.dataFail);
  }
  if (!text) {
    throw createError('获取extra 补充数据失败', Code.dataFail);
  }
  let mixObj = Convert.xml2js(text, { compact: true }) as any;
  if (mixObj?.serverresponse?.code?._text === 'error') {
    throw createError('uid过期', Code.uidExpire);
  }
  if (!mixObj?.serverresponse?.ec?.game) {
    try {
      const res = await axios.post(`${_url.origin}/transform.php?ver=${ver}`, bodyStr, {
        headers: {
          accept: '*/*',
          'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
          'content-type': 'application/x-www-form-urlencoded',
          'sec-ch-ua': '"Chromium";v="112", "Microsoft Edge";v="112", "Not:A-Brand";v="99"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
        },
      });
      text = res.data;
    } catch (error) {
      throw createError('获取extra 补充数据失败', Code.dataFail);
    }
    if (!text) {
      throw createError('获取extra 补充数据失败', Code.dataFail);
    }
    mixObj = Convert.xml2js(text, { compact: true }) as any;
  }
  let gameList = mixObj?.serverresponse?.ec?.game;
  if (gameList?.LEAGUE) {
    gameList = [gameList];
  }
  const itemList = (gameList || []).map((g: any) => {
    const strong = g?.STRONG?._text;
    return [
      strong === 'H'
        ? {
            oddsTitle: '让球',
            oddsItemList: [
              [`-${(g?.RATIO_R?._text || '').replace(/[\s]/g, '')}`, g?.IOR_RH?._text],
              [`+${(g?.RATIO_R?._text || '').replace(/[\s]/g, '')}`, g?.IOR_RC?._text],
            ],
          }
        : {
            oddsTitle: '让球',
            oddsItemList: [
              [`+${(g?.RATIO_R?._text || '').replace(/[\s]/g, '')}`, g?.IOR_RH?._text],
              [`-${(g?.RATIO_R?._text || '').replace(/[\s]/g, '')}`, g?.IOR_RC?._text],
            ],
          },
      {
        oddsTitle: '得分',
        oddsItemList: [
          [`-${(g?.RATIO_OUO?._text || '').replace(/[\s]/g, '')}`, g?.IOR_OUC?._text || ''],
          [`+${(g?.RATIO_OUU?._text || '').replace(/[\s]/g, '')}`, g?.IOR_OUH?._text || ''],
        ],
      },
    ];
  });
  return itemList.flat();
}
export const retryGetGameOBTByNodeFetch = retryWrap(getGameOBTByNodeFetch, 3);

export async function getLeagueListAllByNodeFetch(url: string, uid: string, ver: string): Promise<{ name: string; id: string }[]> {
  const body = {
    p: 'get_league_list_All',
    uid: uid,
    ver: ver,
    langx: 'zh-cn',
    gtype: 'FT',
    FS: 'N',
    showtype: 'p3',
    date: 'all',
    ts: new Date().valueOf(),
    nocp: 'N',
  };
  const _url = new URL(url);
  const bodyStr = obj2Str(body);
  let text: string | undefined = void 0;
  try {
    const res = await axios.post(`${_url.origin}/transform.php?ver=${ver}`, bodyStr, {
      headers: {
        accept: '*/*',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
        'content-type': 'application/x-www-form-urlencoded',
        'sec-ch-ua': '"Chromium";v="112", "Microsoft Edge";v="112", "Not:A-Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
    });
    text = res.data;
  } catch (error) {
    // @ts-ignore
    throw createError('获取extra 联赛数据失败 网络问题' + error.message, Code.dataFail);
  }
  if (!text) {
    throw createError('获取extra 联赛数据失败 数据空', Code.dataFail);
  }
  const mixObj = Convert.xml2js(text, { compact: true }) as any;
  if (mixObj?.serverresponse?.code?._text === 'error') {
    throw createError('uid过期', Code.uidExpire);
  }
  return (mixObj?.serverresponse?.classifier?.region || [])
    .map((r: any) => {
      const league = r.league?.length ? r.league : [r.league];
      return league.map((l: any) => {
        const name = l._attributes.name;
        const id = l._attributes.id;
        return { name, id };
      });
    })
    .flat();
}
export const retryGetLeagueListAllByNodeFetch = retryWrap(getLeagueListAllByNodeFetch, 3);
export async function getBasketballLeagueList(url: string, uid: string, ver: string): Promise<{ name: string; id: string }[]> {
  const body = {
    p: 'get_league_list_All',
    uid: uid,
    ver: ver,
    langx: 'zh-cn',
    gtype: 'BK',
    FS: 'N',
    showtype: 'p3',
    date: 'all',
    ts: new Date().valueOf(),
    nocp: 'N',
  };
  const _url = new URL(url);
  const bodyStr = obj2Str(body);
  let text: string | undefined = void 0;
  try {
    const res = await axios.post(`${_url.origin}/transform.php?ver=${ver}`, bodyStr, {
      headers: {
        accept: '*/*',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
        'content-type': 'application/x-www-form-urlencoded',
        'sec-ch-ua': '"Chromium";v="112", "Microsoft Edge";v="112", "Not:A-Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
    });
    text = res.data;
  } catch (error) {
    // @ts-ignore
    throw createError('获取extra 联赛数据失败 网络问题' + error.message, Code.dataFail);
  }
  if (!text) {
    throw createError('获取extra 联赛数据失败 数据空', Code.dataFail);
  }
  const mixObj = Convert.xml2js(text, { compact: true }) as any;
  if (mixObj?.serverresponse?.code?._text === 'error') {
    throw createError('uid过期', Code.uidExpire);
  }
  return (mixObj?.serverresponse?.classifier?.region || [])
    .map((r: any) => {
      const league = r.league?.length ? r.league : [r.league];
      return league.map((l: any) => {
        const name = l._attributes.name;
        const id = l._attributes.id;
        return { name, id };
      });
    })
    .flat();
}
export const retryGetBasketballLeagueList = retryWrap(getBasketballLeagueList, 3);

async function getServiceMainget(ver: string) {
  let text2: string | undefined = void 0;
  try {
    const res = await axios.post(`https://66.133.91.116/transform.php?ver=${ver}`, `p=service_mainget&ver=${ver}&langx=zh-cn&login=N`, {
      headers: {
        accept: '*/*',
        'accept-language': 'zh-CN,zh;q=0.9',
        'cache-control': 'no-cache',
        'content-type': 'application/x-www-form-urlencoded',
        pragma: 'no-cache',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        Referer: 'https://66.133.91.116/',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    });
    text2 = res.data;
  } catch (error) {
    throw createError('获取extra状态失败', Code.dataFail);
  }
  if (!text2) {
    throw createError('获取extra状态失败', Code.dataFail);
  }
  const mixObj = Convert.xml2js(text2, { compact: true }) as any;
  const code = mixObj?.serverresponse?.code?._text as string;
  const maintain_time = mixObj?.serverresponse?.maintain_time?._text as string;
  return { code: 200, msg: '' };
}

export async function loginByNodeFetch(username: string, password: string) {
  const res = await axios.post('https://61.14.172.140/', 'detection=Y', {
    headers: {
      accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'accept-language': 'zh-CN,zh;q=0.9',
      'cache-control': 'no-cache',
      'content-type': 'application/x-www-form-urlencoded',
      pragma: 'no-cache',
      'sec-ch-ua': '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1',
      Referer: 'https://extraa.com/',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
    timeout: 10000,
  });
  const text = res.data;
  const m = text.match(/top\.ver = '([^']+?)'/);
  if (!m?.[1]) {
    throw createError('获取ver失败', Code.dataFail);
  }
  const ver = m[1];
  const body2 = {
    p: 'chk_login',
    langx: 'zh-cn',
    ver: ver,
    username: username,
    password: password,
    app: 'N',
    auto: 'HDIHBD',
    blackbox: '',
    userAgent:
      'TW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzExMy4wLjAuMCBTYWZhcmkvNTM3LjM2',
  };

  const res2 = await axios.post(`https://61.14.172.140/transform.php?ver=${ver}`, obj2Str(body2), {
    headers: {
      accept: '*/*',
      'accept-language': 'zh-CN,zh;q=0.9',
      'cache-control': 'no-cache',
      'content-type': 'application/x-www-form-urlencoded',
      pragma: 'no-cache',
      'sec-ch-ua': '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      Referer: 'https://extraa.com/',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
    timeout: 5000,
  });
  const text2 = res2.data;
  const mixObj = Convert.xml2js(text2, { compact: true }) as any;
  const uid = mixObj?.serverresponse?.uid?._text as string;
  const _username = mixObj?.serverresponse?.username?._text;
  if (!uid) {
    const d = await getServiceMainget(ver);
    if (d.code === 619) {
      throw createError(d.msg, Code.maintain);
    }
    throw createError('不知道什么原因， uid获取失败', Code.accountUnknownFail);
  }
  const body3 = {
    p: 'check_login_domain',
    ver: ver,
    username: _username,
    uid: uid,
    langx: 'zh-cn',
    code: 663,
  };
  const getDomain = retryWrap(async () => {
    const res3 = await axios.post(`https://61.14.172.140/transform.php?ver=${ver}`, obj2Str(body3), {
      headers: {
        accept: '*/*',
        'accept-language': 'zh-CN,zh;q=0.9',
        'cache-control': 'no-cache',
        'content-type': 'application/x-www-form-urlencoded',
        pragma: 'no-cache',
        'sec-ch-ua': '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        Referer: 'https://extraa.com/',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
      timeout: 5000,
    });
    const text3 = res3.data;
    const mixObj3 = Convert.xml2js(text3, { compact: true }) as any;
    const domain = mixObj3?.serverresponse?.new_domain?._text;
    if (!domain) {
      throw createError('获取extra domain失败', Code.dataFail);
    }
    return domain as string;
  }, 3);
  const domain = await getDomain();
  return {
    uid,
    ver,
    url: `https://${domain}/`,
  };
}

export const retryLoginByNodeFetch = retryWrap(loginByNodeFetch, 3);

export async function sendDingDing(msg: string) {
  const body = {
    msgtype: 'markdown',
    markdown: {
      title: '足足',
      text: msg,
    },
  };
  // https://oapi.dingtalk.com/robot/send?access_token=7bf309975269e6dcc3ca34d569e6b3a54a425ff19d2dfdfa78e716e4c3cda890
  const prefix = '7bf309975269';
  try {
    await axios.post(
      `https://oapi.dingtalk.com/robot/send?access_token=${prefix}e6dcc3ca34d569e6b3a54a425ff19d2dfdfa78e716e4c3cda890`,
      JSON.stringify(body),
      {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.log(error, 'dingding');
  }
}
export const retrySendDingDing = retryWrap(sendDingDing, 3);
