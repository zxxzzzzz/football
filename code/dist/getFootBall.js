"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDataByHttp = void 0;
// @ts-ignore
const json_format_1 = __importDefault(require("json-format"));
const util_1 = require("./util");
const dayjs_1 = __importDefault(require("dayjs"));
const api_1 = require("./api");
// import { say } from './chaty';
const util_2 = require("./util");
const error_1 = require("./error");
// console.log(cors);
process.env.username = 'peng902';
process.env.password = 'Jxd9061912';
const accountList = [
    { password: 'XD_ivan', token: '', timestamp: 0 },
    { password: 'XD_ivan1', token: '', timestamp: 0 },
    { password: 'XD_ivan2', token: '', timestamp: 0 },
    { password: 'LJ111', token: '', timestamp: 0 },
    { password: 'LJ222', token: '', timestamp: 0 },
    { password: 'LJ333', token: '', timestamp: 0 },
    { password: 'XIAO222', token: '', timestamp: 0 },
    { password: 'XIAO8888', token: '', timestamp: 0 },
    { password: 'XIAO9999', token: '', timestamp: 0 },
    { password: 'XIAO0000', token: '', timestamp: 0 },
    { password: 'test_123@', token: '', timestamp: 0 },
    { password: 'trigger_123@', token: '', timestamp: 0 },
];
let isWait = false;
const getDataByHttp = async (reqData) => {
    console.log(accountList.map((a) => {
        const t = a.timestamp;
        return `${a.password} ${t === 0 ? 0 : (0, dayjs_1.default)(t).add(8, 'hour').format('YYYY-MM-DD HH:mm:ss')} ${a.token}`;
    }));
    // 清除过期token
    accountList.forEach((account) => {
        const t = account.timestamp;
        // 5min清除一次token
        if ((0, dayjs_1.default)().valueOf() - t > 5 * 60 * 1000) {
            account.token = '';
            account.timestamp = 0;
        }
    });
    const cookiePassword = reqData.password;
    const token = reqData.token;
    const account = accountList.find((a) => a.password === cookiePassword);
    if (!account) {
        return { code: error_1.Code.forbidden, msg: '该通行码不存在，请重新登陆' };
    }
    if (account.token && account.token !== token && account.password !== 'trigger_123@') {
        return { code: error_1.Code.forbidden, msg: `该通行码正在被使用，请重新登陆换个通行码 ${account.token} ${token}` };
    }
    account.timestamp = (0, dayjs_1.default)().valueOf();
    const liveCount = accountList.filter((a) => a.token).length;
    const username = (process.env.username || '');
    const password = (process.env.password || '');
    const store = await (0, util_2.getStore)();
    return store;
    const data = store.data;
    // 对于定时器的请求，如果有其他人在用，提前结束
    if (account.password === 'trigger_123@' && data && (0, dayjs_1.default)().valueOf() - (store.timestamp || 0) < 60 * 1000) {
        return {
            code: 200,
        };
    }
    // 如果在等待数据 直接返回缓存数据
    if (isWait && data && (0, dayjs_1.default)().valueOf() - (store.timestamp || 0) < 60 * 1000) {
        const store = await (0, util_2.getStore)();
        const message1List = (0, util_2.getMessage1List)(data, store.Rev || 400);
        const message3List = (0, util_2.getMessage3List)(data, store.scoreRev || 200);
        const message4List = (0, util_2.getMessage4List)(data, store.halfRev || 400);
        const { messageList: message2List, compareDataList } = (0, util_2.getMessage2List)(data, store.C || 0.13, store.A || 1, store.compareRev || 430);
        if (!account.token) {
            account.token = (Math.random() + 10).toString();
        }
        return {
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
        };
    }
    // store缓存不存在  或者 数据过期后，更新数据
    if (!data || (data && (0, dayjs_1.default)().valueOf() - (store.timestamp || 0) > 60 * 1000)) {
        isWait = true;
        try {
            const _data = await getData(username, password);
            await (0, util_2.saveStore)({
                timestamp: (0, dayjs_1.default)().valueOf(),
                data: _data,
            });
            const store = await (0, util_2.getStore)();
            const message1List = (0, util_2.getMessage1List)(_data, store.Rev || 400);
            const message3List = (0, util_2.getMessage3List)(_data, store.scoreRev || 200);
            const message4List = (0, util_2.getMessage4List)(_data, store.halfRev || 400);
            const { messageList: message2List, compareDataList } = (0, util_2.getMessage2List)(_data, store.C || 0.13, store.A || 1, store.compareRev || 430);
            if (!data) {
                const _message1List = (0, util_2.getMessage1List)(_data, 650);
                const _message3List = (0, util_2.getMessage3List)(_data, 400);
                const _message4List = (0, util_2.getMessage4List)(_data, 400);
                const _list = [..._message1List, ..._message3List, ..._message4List];
                if (_list?.length) {
                    for (const _item of _list) {
                        await (0, api_1.retrySendDingDing)(_item);
                    }
                }
            }
            else {
                const list1 = _data
                    .filter((d) => {
                    return d?.revList?.[0]?.rev > 650 && d?.revList?.[0]?.rev < 3000;
                })
                    .filter((d) => {
                    const findD = data.find((_d) => _d.num === d.num);
                    if (!findD)
                        return true;
                    return d?.revList?.[0]?.rev > findD?.revList?.[0]?.rev;
                });
                const list3 = _data
                    .filter((d) => {
                    return d?.scoreRevList?.[0]?.rev > 400;
                })
                    .filter((d) => {
                    const findD = data.find((_d) => _d.num === d.num);
                    if (!findD)
                        return true;
                    return d?.scoreRevList?.[0]?.rev > findD?.scoreRevList?.[0]?.rev;
                });
                const list4 = _data
                    .filter((d) => {
                    return d?.halfRevList?.[0]?.rev > 400 && d?.halfRevList?.[0]?.rev < 1500;
                })
                    .filter((d) => {
                    const findD = data.find((_d) => _d.num === d.num);
                    if (!findD)
                        return true;
                    return d?.halfRevList?.[0]?.rev > findD?.halfRevList?.[0]?.rev;
                });
                const _message1List = (0, util_2.getMessage1List)(list1, 650);
                const _message3List = (0, util_2.getMessage3List)(list3, 400);
                const _message4List = (0, util_2.getMessage4List)(list4, 400);
                const _list = [..._message1List, ..._message3List, ..._message4List];
                if (_list?.length) {
                    for (const _item of _list) {
                        await (0, api_1.retrySendDingDing)(_item);
                    }
                }
            }
            if (!account.token) {
                account.token = (Math.random() + 10).toString();
            }
            isWait = false;
            return {
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
            };
        }
        catch (error) {
            isWait = false;
            return { code: error.code, msg: error.message + ' \r\n' + error.stack };
        }
    }
    if (data) {
        const store = await (0, util_2.getStore)();
        const message1List = (0, util_2.getMessage1List)(data, store.Rev || 400);
        const message3List = (0, util_2.getMessage3List)(data, store.scoreRev || 200);
        const message4List = (0, util_2.getMessage4List)(data, store.halfRev || 400);
        const { messageList: message2List, compareDataList } = (0, util_2.getMessage2List)(data, store.C || 0.13, store.A || 1, store.compareRev || 430);
        if (!account.token) {
            account.token = (Math.random() + 10).toString();
        }
        return {
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
        };
    }
    return {
        code: 500,
        msg: '默认更新错误',
    };
};
exports.getDataByHttp = getDataByHttp;
// app.get('/setting', async (req, res) => {
//   try {
//     const store = await getStore();
//     res.send({
//       code: 200,
//       msg: 'success',
//       data: {
//         R: store.R,
//         A: store.A,
//         C: store.C,
//         Rev: store.Rev,
//         compareRev: store.compareRev,
//         scoreRev: store.scoreRev,
//         halfRev: store.halfRev,
//       },
//     });
//   } catch (error) {
//     res.send({ code: 500, msg: (error as Error).message });
//   }
// });
// app.post('/setting', async (req, res) => {
//   try {
//     const body = req.body;
//     await saveStore(body);
//     res.status(200).send({ code: 200, msg: 'success' });
//   } catch (error) {
//     res.send({ code: 500, msg: (error as Error).message });
//   }
// });
const delay = (n) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, n);
    });
};
// type M = Promise<ReturnType<typeof toData> | undefined>;
//是否在更新数据
async function getData(username, password) {
    if (!username || !password) {
        throw (0, error_1.createError)('用户名或者密码没有填写', error_1.Code.wrongAccount);
    }
    const store = await (0, util_2.getStore)();
    let uid = store.uid;
    let ver = store.ver;
    let url = store.url;
    if (!uid || !ver || !url) {
        const d = await (0, api_1.retryLoginByNodeFetch)(username, password);
        await (0, util_2.saveStore)(d);
        console.log('uid不存在，更新uid后 存储到store');
        uid = d.uid;
        ver = d.ver;
        url = d.url;
    }
    let leagueList = [];
    try {
        console.log('请求联赛', { url, uid, ver });
        leagueList = await (0, api_1.retryGetLeagueListAllByNodeFetch)(url, uid, ver);
    }
    catch (error) {
        if (error.code === error_1.Code.uidExpire) {
            const d = await (0, api_1.retryLoginByNodeFetch)(username, password);
            await (0, util_2.saveStore)(d);
            console.log({ uid, ver, url }, 'uid过期，更新uid后 存储到store', d);
            uid = d.uid;
            ver = d.ver;
            url = d.url;
            console.log('uid重新获取后请求联赛', { url, uid, ver });
            leagueList = await (0, api_1.retryGetLeagueListAllByNodeFetch)(url, uid, ver);
        }
        else {
            console.log(error);
            throw error;
        }
    }
    const tiCaiDataList = await (0, api_1.retryGetTiCaiByFetch)();
    const matchedLeagueList = leagueList
        .map((l) => {
        if (tiCaiDataList.find((t) => (0, util_1.isLeagueEqual)(t.league, l.name))) {
            return l;
        }
        return void 0;
    })
        .filter((d) => !!d)
        .reduce((re, cur) => {
        // 去除重复联赛
        if (re.find((r) => r.id === cur.id)) {
            return re;
        }
        return [...re, cur];
    }, []);
    const extraGameList = (await Promise.all(matchedLeagueList.map((m) => {
        return (0, api_1.retryGetGameListByNodeFetch)(url || '', ver || '', uid || '', m.id);
    }))).flat();
    const promiseList = tiCaiDataList
        .map((tiCai) => {
        const _extraGameList = extraGameList
            .filter((d) => !!d)
            .map((extra) => {
            const teamRate = (0, util_1.isTeamEqu)(tiCai.teamList, extra.teamList);
            const tDateTime = (0, dayjs_1.default)(tiCai.dateTime, 'MM-DD HH:mm');
            const eDateTime = (0, dayjs_1.default)(extra.dateTime, 'MM-DD HH:mm');
            const oneMinute = 60 * 1000;
            // 时间是否匹配,上下十分钟的范围
            const isTime1 = Math.abs(eDateTime.valueOf() - tDateTime.valueOf()) <= 10 * oneMinute;
            // 有时体彩的时间会落后extra的时间24小时
            const isTime2 = Math.abs(eDateTime.valueOf() - tDateTime.add(24, 'hour').valueOf()) <= 10 * oneMinute;
            const isTime = isTime1 || isTime2;
            // 联赛是否匹配
            const isLeague = (0, util_1.isLeagueEqual)(tiCai.league, extra.league);
            const rate = (isLeague ? 100 : 0) + (isTime ? 10 : 0) + teamRate;
            // 联赛必须匹配上
            const re = [extra, rate];
            return re;
        })
            .filter(([_, rate]) => rate >= 110);
        // 选出匹配度最高的一场比赛
        const game = _extraGameList.reduce((re, cur) => {
            if (re[1] < cur[1]) {
                return cur;
            }
            return re;
        }, [{}, -Infinity]);
        if (!game?.[0]?.ecid) {
            return void 0;
        }
        tiCai.ecid = game[0].ecid;
        return game;
    })
        .filter((g) => !!g)
        .map(async ([g, rate]) => {
        // 填充 更多细节数据
        const itemList = await (0, api_1.retryGetGameOBTByNodeFetch)(url || '', ver || '', uid || '', g?.ecid);
        return {
            ...g,
            rate,
            itemList: [...(g.itemList || []), ...(itemList || [])],
        };
    });
    let matchedGameList = [];
    for (const p of promiseList) {
        const data = await p;
        if (data) {
            matchedGameList = [...matchedGameList, data];
        }
    }
    // 数据保存，便于找问题
    (0, util_2.saveFile)('./data/tiCaiData.json', (0, json_format_1.default)(tiCaiDataList));
    (0, util_2.saveFile)('./data/leagueList.json', (0, json_format_1.default)(leagueList));
    (0, util_2.saveFile)('./data/matchedLeagueList.json', (0, json_format_1.default)(matchedLeagueList));
    (0, util_2.saveFile)('./data/gameList.json', (0, json_format_1.default)(extraGameList));
    (0, util_2.saveFile)('./data/matchedGameList.json', (0, json_format_1.default)(matchedGameList));
    const matchData = (0, util_1.toData)(tiCaiDataList, matchedGameList, store.R);
    return matchData;
}
