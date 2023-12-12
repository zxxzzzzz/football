"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrySendDingDing = exports.sendDingDing = exports.retryLoginByNodeFetch = exports.loginByNodeFetch = exports.retryGetBasketballLeagueList = exports.getBasketballLeagueList = exports.retryGetLeagueListAllByNodeFetch = exports.getLeagueListAllByNodeFetch = exports.retryGetGameOBTByNodeFetch = exports.getGameOBTByNodeFetch = exports.retryGetGameListByNodeFetch = exports.retryGetBasketballGameList = exports.getBasketballGameList = exports.getBasketballMore = exports.retryGetTiCaiBasketballByFetch = exports.getTiCaiBasketballByFetch = exports.retryGetTiCaiByFetch = exports.getTiCaiByFetch = exports.retryWrap = void 0;
const xml_js_1 = __importDefault(require("xml-js"));
const dayjs_1 = __importDefault(require("dayjs"));
const axios_1 = __importDefault(require("axios"));
// import _fetch from;
// const _fetch = import('node-fetch');
const error_1 = require("./error");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
function obj2Str(bodyObj) {
    const bodyStr = Object.keys(bodyObj)
        .map((key) => {
        return `${key}=${bodyObj[key]}`;
    })
        .join('&');
    return bodyStr;
}
function retryWrap(cb, count) {
    return async (...args) => {
        let _error = Error('wrap默认错误');
        for (let index = 0; index < count; index++) {
            try {
                const d = await cb(...args);
                return d;
            }
            catch (error) {
                _error = error;
            }
        }
        throw _error;
    };
}
exports.retryWrap = retryWrap;
async function getTiCaiByFetch() {
    let data = void 0;
    try {
        const res = await axios_1.default.get('https://webapi.sporttery.cn/gateway/jc/football/getMatchCalculatorV1.qry?poolCode=hhad,had,ttg,hafu&channel=c', {
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
        });
        data = res.data;
    }
    catch (error) {
        throw (0, error_1.createError)('获取体彩数据失败', error_1.Code.dataFail);
    }
    const matchInfoList = data?.value?.matchInfoList;
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
            const get25G = (a, b, c) => {
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
            const get2G = (a, b, c) => {
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
                dateTime: (0, dayjs_1.default)(m.businessDate + ' ' + m.matchTime, 'YYYY-MM-DD HH:mm:ss').format('MM-DD HH:mm'),
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
                ],
                ecid: '',
            };
        });
        return dataList;
    }
    return [];
}
exports.getTiCaiByFetch = getTiCaiByFetch;
exports.retryGetTiCaiByFetch = retryWrap(getTiCaiByFetch, 3);
async function getTiCaiBasketballByFetch() {
    let data = void 0;
    try {
        // https://webapi.sporttery.cn/gateway/jc/basketball/getMatchCalculatorV1.qry?poolCode=hdc&channel=c
        const res = await axios_1.default.get('https://webapi.sporttery.cn/gateway/jc/basketball/getMatchCalculatorV1.qry?poolCode=hdc,hilo,mnl&channel=c', {
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
        });
        data = res.data;
    }
    catch (error) {
        throw (0, error_1.createError)('获取体彩足球数据失败', error_1.Code.dataFail);
    }
    const matchInfoList = data?.value?.matchInfoList;
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
                dateTime: (0, dayjs_1.default)(m.businessDate + ' ' + m.matchTime, 'YYYY-MM-DD HH:mm:ss').format('MM-DD HH:mm'),
                num: m.matchNumStr,
                league: leagueAllName,
                source: 'tiCai',
                teamList: [m.homeTeamAllName, m.awayTeamAllName],
                singleList: [false, false],
                itemList: [
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
                ].filter((d) => d.oddsItemList[0][1] != '0'),
                ecid: '',
            };
        });
        return dataList;
    }
    return [];
}
exports.getTiCaiBasketballByFetch = getTiCaiBasketballByFetch;
exports.retryGetTiCaiBasketballByFetch = retryWrap(getTiCaiBasketballByFetch, 3);
async function getBasketballMore(url, ver, uid, lid, gid) {
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
        const res = await axios_1.default.post(`${_url.origin}/transform.php?ver=${ver}`, bodyStr, {
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
    }
    catch (error) {
        // @ts-ignore
        throw (0, error_1.createError)('获取basketball more比赛数据失败 网络问题' + error.message, error_1.Code.dataFail);
    }
    if (!text) {
        throw (0, error_1.createError)('获取basketball more比赛数据失败,数据空', error_1.Code.dataFail);
    }
    const mixObj = xml_js_1.default.xml2js(text, { compact: true });
    if (mixObj?.serverresponse?.code?._text === 'error') {
        throw (0, error_1.createError)('uid过期', error_1.Code.uidExpire);
    }
    const gameList = (mixObj?.serverresponse?.game || []).filter((g) => !g?.ms?._text);
    return gameList
        .map((game) => {
        const strong = game?.strong?._text;
        return [
            {
                oddsTitle: '让球',
                oddsItemList: [[(strong === 'H' ? '-' : '+') + game?.ratio?._text, game?.ior_PRH?._text, game?.ior_PRC?._text]],
            },
            {
                oddsTitle: '总分',
                oddsItemList: [
                    [
                        game?.ratio_o?._text,
                        game?.ior_POUC?._text,
                        game?.ior_POUH?._text,
                    ],
                ],
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
exports.getBasketballMore = getBasketballMore;
const delay = (n) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, n);
    });
};
async function getBasketballGameList(url, ver, uid, lid) {
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
    let text = void 0;
    try {
        const res = await axios_1.default.post(`${_url.origin}/transform.php?ver=${ver}`, bodyStr, {
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
    }
    catch (error) {
        // @ts-ignore
        throw (0, error_1.createError)('获取basketball比赛数据失败 网络问题' + error.message, error_1.Code.dataFail);
    }
    if (!text) {
        throw (0, error_1.createError)('获取basketball比赛数据失败,数据空', error_1.Code.dataFail);
    }
    const mixObj = xml_js_1.default.xml2js(text, { compact: true });
    if (mixObj?.serverresponse?.code?._text === 'error') {
        throw (0, error_1.createError)('uid过期', error_1.Code.uidExpire);
    }
    const gameList = []
        .concat(mixObj?.serverresponse?.ec)
        .filter((e) => e)
        .map((ec) => {
        const game = ec.game;
        const vDateTime = game.DATETIME._text.slice(0, -1) + ' ' + game.DATETIME._text.slice(-1)[0] + 'm';
        return {
            league: game.LEAGUE._text || '',
            source: 'extra',
            ecid: game.GID._text,
            num: '',
            singleList: [false, false],
            strong: game.STRONG._text,
            dateTime: (0, dayjs_1.default)(vDateTime, 'MM-DD HH:mm a').add(12, 'hour').format('MM-DD HH:mm'),
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
exports.getBasketballGameList = getBasketballGameList;
exports.retryGetBasketballGameList = retryWrap(getBasketballGameList, 3);
async function getGameListByNodeFetch(url, ver, uid, lid) {
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
    let text = void 0;
    try {
        const res = await axios_1.default.post(`${_url.origin}/transform.php?ver=${ver}`, bodyStr, {
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
    }
    catch (error) {
        // @ts-ignore
        throw (0, error_1.createError)('获取extra 比赛数据失败 网络问题' + error.message, error_1.Code.dataFail);
    }
    if (!text) {
        throw (0, error_1.createError)('获取extra 比赛数据失败,数据空', error_1.Code.dataFail);
    }
    const mixObj = xml_js_1.default.xml2js(text, { compact: true });
    if (mixObj?.serverresponse?.code?._text === 'error') {
        throw (0, error_1.createError)('uid过期', error_1.Code.uidExpire);
    }
    const gameList = []
        .concat(mixObj?.serverresponse?.ec)
        .filter((e) => e)
        .map((ec) => {
        const game = ec.game;
        const vDateTime = game.DATETIME._text.slice(0, -1) + ' ' + game.DATETIME._text.slice(-1)[0] + 'm';
        return {
            league: game.LEAGUE._text || '',
            source: 'extra',
            ecid: game.ECID._text,
            num: '',
            singleList: [false, false],
            strong: game.STRONG._text,
            dateTime: (0, dayjs_1.default)(vDateTime, 'MM-DD HH:mm a').add(12, 'hour').format('MM-DD HH:mm'),
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
exports.retryGetGameListByNodeFetch = retryWrap(getGameListByNodeFetch, 3);
async function getGameOBTByNodeFetch(url, ver, uid, ecid) {
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
    let text = void 0;
    try {
        const res = await axios_1.default.post(`${_url.origin}/transform.php?ver=${ver}`, bodyStr2, {
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
    }
    catch (error) {
        throw (0, error_1.createError)('获取extra 补充数据失败', error_1.Code.dataFail);
    }
    if (!text) {
        throw (0, error_1.createError)('获取extra 补充数据失败', error_1.Code.dataFail);
    }
    let mixObj = xml_js_1.default.xml2js(text, { compact: true });
    if (mixObj?.serverresponse?.code?._text === 'error') {
        throw (0, error_1.createError)('uid过期', error_1.Code.uidExpire);
    }
    if (!mixObj?.serverresponse?.ec?.game) {
        try {
            const res = await axios_1.default.post(`${_url.origin}/transform.php?ver=${ver}`, bodyStr, {
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
        }
        catch (error) {
            throw (0, error_1.createError)('获取extra 补充数据失败', error_1.Code.dataFail);
        }
        if (!text) {
            throw (0, error_1.createError)('获取extra 补充数据失败', error_1.Code.dataFail);
        }
        mixObj = xml_js_1.default.xml2js(text, { compact: true });
    }
    let gameList = mixObj?.serverresponse?.ec?.game;
    if (gameList?.LEAGUE) {
        gameList = [gameList];
    }
    const itemList = (gameList || []).map((g) => {
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
exports.getGameOBTByNodeFetch = getGameOBTByNodeFetch;
exports.retryGetGameOBTByNodeFetch = retryWrap(getGameOBTByNodeFetch, 3);
async function getLeagueListAllByNodeFetch(url, uid, ver) {
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
    let text = void 0;
    try {
        const res = await axios_1.default.post(`${_url.origin}/transform.php?ver=${ver}`, bodyStr, {
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
    }
    catch (error) {
        // @ts-ignore
        throw (0, error_1.createError)('获取extra 联赛数据失败 网络问题' + error.message, error_1.Code.dataFail);
    }
    if (!text) {
        throw (0, error_1.createError)('获取extra 联赛数据失败 数据空', error_1.Code.dataFail);
    }
    const mixObj = xml_js_1.default.xml2js(text, { compact: true });
    if (mixObj?.serverresponse?.code?._text === 'error') {
        throw (0, error_1.createError)('uid过期', error_1.Code.uidExpire);
    }
    return (mixObj?.serverresponse?.classifier?.region || [])
        .map((r) => {
        const league = r.league?.length ? r.league : [r.league];
        return league.map((l) => {
            const name = l._attributes.name;
            const id = l._attributes.id;
            return { name, id };
        });
    })
        .flat();
}
exports.getLeagueListAllByNodeFetch = getLeagueListAllByNodeFetch;
exports.retryGetLeagueListAllByNodeFetch = retryWrap(getLeagueListAllByNodeFetch, 3);
async function getBasketballLeagueList(url, uid, ver) {
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
    let text = void 0;
    try {
        const res = await axios_1.default.post(`${_url.origin}/transform.php?ver=${ver}`, bodyStr, {
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
    }
    catch (error) {
        // @ts-ignore
        throw (0, error_1.createError)('获取extra 联赛数据失败 网络问题' + error.message, error_1.Code.dataFail);
    }
    if (!text) {
        throw (0, error_1.createError)('获取extra 联赛数据失败 数据空', error_1.Code.dataFail);
    }
    const mixObj = xml_js_1.default.xml2js(text, { compact: true });
    if (mixObj?.serverresponse?.code?._text === 'error') {
        throw (0, error_1.createError)('uid过期', error_1.Code.uidExpire);
    }
    return (mixObj?.serverresponse?.classifier?.region || [])
        .map((r) => {
        const league = r.league?.length ? r.league : [r.league];
        return league.map((l) => {
            const name = l._attributes.name;
            const id = l._attributes.id;
            return { name, id };
        });
    })
        .flat();
}
exports.getBasketballLeagueList = getBasketballLeagueList;
exports.retryGetBasketballLeagueList = retryWrap(getBasketballLeagueList, 3);
async function getServiceMainget(ver) {
    let text2 = void 0;
    try {
        const res = await axios_1.default.post(`https://61.14.172.140/transform.php?ver=${ver}`, `p=service_mainget&ver=${ver}&langx=zh-cn&login=N`, {
            headers: {
                accept: '*/*',
                'accept-language': 'zh-CN,zh;q=0.9',
                'cache-control': 'no-cache',
                'content-type': 'application/x-www-form-urlencoded',
                pragma: 'no-cache',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                Referer: 'https://61.14.172.140/',
                'Referrer-Policy': 'strict-origin-when-cross-origin',
            },
        });
        text2 = res.data;
    }
    catch (error) {
        throw (0, error_1.createError)('获取extra状态失败', error_1.Code.dataFail);
    }
    if (!text2) {
        throw (0, error_1.createError)('获取extra状态失败', error_1.Code.dataFail);
    }
    const mixObj = xml_js_1.default.xml2js(text2, { compact: true });
    const code = mixObj?.serverresponse?.code?._text;
    const maintain_time = mixObj?.serverresponse?.maintain_time?._text;
    return { code: 200, msg: '' };
}
async function loginByNodeFetch(username, password) {
    const res = await axios_1.default.post('https://61.14.172.140/', 'detection=Y', {
        headers: {
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
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
        throw (0, error_1.createError)('获取ver失败', error_1.Code.dataFail);
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
        userAgent: 'TW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzExMy4wLjAuMCBTYWZhcmkvNTM3LjM2',
    };
    const res2 = await axios_1.default.post(`https://61.14.172.140/transform.php?ver=${ver}`, obj2Str(body2), {
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
    const mixObj = xml_js_1.default.xml2js(text2, { compact: true });
    const uid = mixObj?.serverresponse?.uid?._text;
    const _username = mixObj?.serverresponse?.username?._text;
    if (!uid) {
        const d = await getServiceMainget(ver);
        if (d.code === 619) {
            throw (0, error_1.createError)(d.msg, error_1.Code.maintain);
        }
        throw (0, error_1.createError)('不知道什么原因， uid获取失败', error_1.Code.accountUnknownFail);
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
        const res3 = await axios_1.default.post(`https://61.14.172.140/transform.php?ver=${ver}`, obj2Str(body3), {
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
        const mixObj3 = xml_js_1.default.xml2js(text3, { compact: true });
        const domain = mixObj3?.serverresponse?.new_domain?._text;
        if (!domain) {
            throw (0, error_1.createError)('获取extra domain失败', error_1.Code.dataFail);
        }
        return domain;
    }, 3);
    const domain = await getDomain();
    return {
        uid,
        ver,
        url: `https://${domain}/`,
    };
}
exports.loginByNodeFetch = loginByNodeFetch;
exports.retryLoginByNodeFetch = retryWrap(loginByNodeFetch, 3);
async function sendDingDing(msg) {
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
        await axios_1.default.post(`https://oapi.dingtalk.com/robot/send?access_token=${prefix}e6dcc3ca34d569e6b3a54a425ff19d2dfdfa78e716e4c3cda890`, JSON.stringify(body), {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    catch (error) {
        console.log(error, 'dingding');
    }
}
exports.sendDingDing = sendDingDing;
exports.retrySendDingDing = retryWrap(sendDingDing, 3);
