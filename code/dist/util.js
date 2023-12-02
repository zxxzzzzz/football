"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessage2List = exports.getMessage4List = exports.getMessage3List = exports.getMessage1List = exports.getLogHistory = exports.saveStore = exports.getStore = exports.saveFile = exports.compare = exports.toData = exports.toBasketballData = exports.Score = exports.isLeagueEqual = exports.isTeamEqu = exports.sim_jaccard = void 0;
const R = __importStar(require("ramda"));
const dayjs_1 = __importDefault(require("dayjs"));
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
// @ts-ignore
const json_format_1 = __importDefault(require("json-format"));
const ali_oss_1 = __importDefault(require("ali-oss"));
let client = new ali_oss_1.default({
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
];
function sim_jaccard(s1, s2) {
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
exports.sim_jaccard = sim_jaccard;
const isMatch = (a, b) => {
    const matchList = R.range(0, Math.min(a.length, b.length)).map((index) => {
        return a[index] === b[index];
    });
    const rate1 = matchList.reduce((re, cur) => {
        return re + (cur ? 1 : 0);
    }, 0) /
        ((a.length + b.length) / 2);
    const matchList2 = R.range(0, Math.min(a.length, b.length)).map((index) => {
        if (a.length > b.length) {
            return a.includes(b[index]);
        }
        return b.includes(a[index]);
    });
    const rate2 = matchList2.reduce((re, cur) => {
        return re + (cur ? 1 : 0);
    }, 0) /
        ((a.length + b.length) / 2);
    return rate1 + rate2 * 0.1;
};
const isTeamEqu = (a, b) => {
    if (!a?.length || !b?.length) {
        return 0;
    }
    const lList = a.map((aStr) => {
        return Math.max(...b.map((bStr) => {
            return sim_jaccard(aStr, bStr);
        }));
    });
    return lList.reduce((a, b) => a + b);
};
exports.isTeamEqu = isTeamEqu;
const isLeagueEqual = (l1, l2) => {
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
        ['西班牙篮球联赛', '西班牙篮球甲级联赛'],
        ['美国职业篮球联盟', 'NBA美国职业篮球联赛'],
    ];
    const isEqual = !!equalNameList.find((d) => d.includes(l1) && d.includes(l2));
    if (isEqual) {
        return true;
    }
    const _l1 = l1.replace(/[组]/g, '级');
    const _l2 = l2.replace(/[组]/g, '级');
    return _l1 === _l2 || _l1 + '-附加赛' === _l2 || _l1 === _l2 + '-附加赛' || _l1 + '-升级附加赛' === _l2 || _l1 === _l2 + '-升级附加赛';
};
exports.isLeagueEqual = isLeagueEqual;
function getRev(tiCai, extra, R = 0.12) {
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
var Score;
(function (Score) {
    Score["noSale"] = "100";
})(Score = exports.Score || (exports.Score = {}));
function toBasketballData(tiCaiList, extraList, _R = 0.12) {
    const getRev = (a, _b) => {
        const b = _b - 1;
        const x = (10000 * a) / (1.025 * b + 0.975);
        return {
            gc: a,
            vv: b,
            offset: (10000 * a) / (1.025 * b + 0.975),
            rev: a * 10000 - 8800 - 0.975 * x,
        };
    };
    const dataList = tiCaiList
        .map((ti) => {
        let matchedExtra = extraList.find((d) => d.ecid === ti.ecid);
        if (!matchedExtra) {
            return void 0;
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
            dateTime: Math.abs((0, dayjs_1.default)(matchedExtra.dateTime).valueOf() - (0, dayjs_1.default)(ti.dateTime).add(24, 'hour').valueOf()) <= 10 * oneMinute
                ? (0, dayjs_1.default)(ti.dateTime).add(24, 'hour').format('MM-DD HH:mm')
                : (0, dayjs_1.default)(ti.dateTime).format('MM-DD HH:mm'),
            tiCaiTeamList: ti.teamList,
            extraTeamList: matchedExtra?.teamList || ti.teamList,
            tiCaiItemList: ti.itemList,
            extraItemList: matchedExtra?.itemList || [],
            revList: ti.itemList
                .filter((item) => item.oddsTitle === '让球')
                .map((item) => {
                const tiCaiItem = item;
                // 体彩主队比较
                const score = parseFloat(tiCaiItem.oddsItemList?.[0]?.[0] || '0');
                const revList1 = (matchedExtra?.itemList || [])
                    .filter((item) => {
                    const eScore = -parseFloat(item.oddsItemList?.[0]?.[0] || '0');
                    return item.oddsTitle === '让球' && eScore >= -score && eScore !== 0 && score !== 0;
                })
                    .map((extraItem) => {
                    const b = parseFloat(extraItem.oddsItemList?.[0]?.[2] || '0');
                    const a = parseFloat(tiCaiItem.oddsItemList?.[0]?.[1] || '0');
                    return {
                        ...getRev(a, b),
                        tiCaiScore: tiCaiItem.oddsItemList?.[0]?.[0] || '0',
                        extraScore: extraItem.oddsItemList?.[0]?.[0] || '0',
                        a: tiCaiItem.oddsItemList?.[0]?.[1] || '0',
                        b: extraItem.oddsItemList?.[0]?.[2] || '0',
                        tiCaiType: 'win',
                        extraType: 'lose',
                    };
                });
                // 体彩客队比较
                const revList2 = (matchedExtra?.itemList || [])
                    .filter((item) => {
                    const eScore = -parseFloat(item.oddsItemList?.[0]?.[0] || '0');
                    return item.oddsTitle === '让球' && eScore >= -score && eScore !== 0 && score !== 0;
                })
                    .map((extraItem) => {
                    const b = parseFloat(extraItem.oddsItemList?.[0]?.[1] || '0');
                    const a = parseFloat(tiCaiItem.oddsItemList?.[0]?.[2] || '0');
                    return {
                        ...getRev(a, b),
                        tiCaiScore: tiCaiItem.oddsItemList?.[0]?.[0] || '0',
                        extraScore: extraItem.oddsItemList?.[0]?.[0] || '0',
                        a: tiCaiItem.oddsItemList?.[0]?.[2] || '0',
                        b: extraItem.oddsItemList?.[0]?.[1] || '0',
                        tiCaiType: 'lose',
                        extraType: 'win',
                    };
                });
                // 独赢部分的
                const revList3 = (matchedExtra?.itemList || [])
                    .filter((item) => {
                    const eScore = -parseFloat(item.oddsItemList?.[0]?.[0] || '0');
                    return item.oddsTitle === '让球' && eScore === 0 && score === 0;
                })
                    .map((extraItem) => {
                    const b = parseFloat(extraItem.oddsItemList?.[0]?.[1] || '0');
                    const a = parseFloat(item.oddsItemList?.[0]?.[2] || '0');
                    return {
                        ...getRev(a, b),
                        tiCaiScore: tiCaiItem.oddsItemList?.[0]?.[0] || '0',
                        extraScore: extraItem.oddsItemList?.[0]?.[0] || '0',
                        a: tiCaiItem.oddsItemList?.[0]?.[2] || '0',
                        b: extraItem.oddsItemList?.[0]?.[1] || '0',
                        tiCaiType: 'lose',
                        extraType: 'win',
                    };
                });
                const revList4 = (matchedExtra?.itemList || [])
                    .filter((item) => {
                    const eScore = -parseFloat(item.oddsItemList?.[0]?.[0] || '0');
                    return item.oddsTitle === '让球' && eScore === 0 && score === 0;
                })
                    .map((extraItem) => {
                    const b = parseFloat(extraItem.oddsItemList?.[0]?.[2] || '0');
                    const a = parseFloat(item.oddsItemList?.[0]?.[1] || '0');
                    return {
                        ...getRev(a, b),
                        tiCaiScore: tiCaiItem.oddsItemList?.[0]?.[0] || '0',
                        extraScore: extraItem.oddsItemList?.[0]?.[0] || '0',
                        a: tiCaiItem.oddsItemList?.[0]?.[1] || '0',
                        b: extraItem.oddsItemList?.[0]?.[2] || '0',
                        tiCaiType: 'win',
                        extraType: 'lose',
                    };
                });
                return [...revList1, ...revList2, ...revList3, ...revList4];
            })
                .flat()
                .filter((d) => d)
                .sort((a, b) => (b?.rev || 0) - (a?.rev || 0))
                .slice(0, 1),
            scoreRevList: ti.itemList
                .filter((item) => item.oddsTitle === '总分')
                .map((item) => {
                const tiCaiItem = item;
                const tiCaiScore = parseFloat(item.oddsItemList?.[0]?.[0] || '0');
                return (matchedExtra?.itemList || [])
                    .filter((item) => item.oddsTitle === '总分')
                    .map((item) => {
                    const extraItem = item;
                    const extraScore = parseFloat(item.oddsItemList?.[0]?.[0] || '0');
                    if (tiCaiScore >= extraScore) {
                        const a = parseFloat(tiCaiItem.oddsItemList?.[0]?.[2] || '0');
                        const b = parseFloat(extraItem.oddsItemList?.[0]?.[1] || '0');
                        return {
                            ...getRev(a, b),
                            tiCaiScore: tiCaiItem.oddsItemList?.[0]?.[0] || '0',
                            extraScore: extraItem.oddsItemList?.[0]?.[0] || '0',
                            a: tiCaiItem.oddsItemList?.[0]?.[2] || '0',
                            b: extraItem.oddsItemList?.[0]?.[1] || '0',
                            tiCaiType: 'lose',
                            extraType: 'win',
                        };
                    }
                    if (tiCaiScore <= extraScore) {
                        const a = parseFloat(tiCaiItem.oddsItemList?.[0]?.[1] || '0');
                        const b = parseFloat(extraItem.oddsItemList?.[0]?.[2] || '0');
                        return {
                            ...getRev(a, b),
                            tiCaiScore: tiCaiItem.oddsItemList?.[0]?.[0] || '0',
                            extraScore: extraItem.oddsItemList?.[0]?.[0] || '0',
                            a: tiCaiItem.oddsItemList?.[0]?.[1] || '0',
                            b: extraItem.oddsItemList?.[0]?.[2] || '0',
                            tiCaiType: 'win',
                            extraType: 'lose',
                        };
                    }
                });
            })
                .flat()
                .filter((d) => d)
                .sort((a, b) => (b?.rev || 0) - (a?.rev || 0))
                .slice(0, 1),
        };
    })
        .filter((d) => d);
    return dataList;
}
exports.toBasketballData = toBasketballData;
function toData(tiCaiList, extraList, _R = 0.12) {
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
            dateTime: Math.abs((0, dayjs_1.default)(matchedExtra.dateTime).valueOf() - (0, dayjs_1.default)(ti.dateTime).add(24, 'hour').valueOf()) <= 10 * oneMinute
                ? (0, dayjs_1.default)(ti.dateTime).add(24, 'hour').format('MM-DD HH:mm')
                : (0, dayjs_1.default)(ti.dateTime).format('MM-DD HH:mm'),
            tiCaiTeamList: ti.teamList,
            extraTeamList: matchedExtra?.teamList || ti.teamList,
            tiCaiItemList: ti.itemList,
            extraItemList: (matchedExtra?.itemList || []).filter((d) => {
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
                .filter((a) => !!a)
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
                            filter: (d, isOnlyWin) => d === -0.5,
                            // 胜
                            type: 'win',
                            tiCai: oddsItem[0],
                            tiCaiOdds: parseFloat(oddsItem[1]),
                        };
                    }
                    return {
                        filter: (d, isOnlyWin) => d === 0.5,
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
                        .filter((d) => !!d?.isMatch);
                })
                    .flat();
                return matchList;
            })
                .flat()
                .filter((a) => !!a)
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
                    const filterMap = {
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
                            filter: (d, isOnlyWin) => {
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
                            filter: (d, isOnlyWin) => {
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
                        .filter((d) => !!d?.isMatch);
                })
                    .flat();
                return matchList;
            })
                .flat()
                .filter((a) => !!a)
                .sort((a, b) => b.rev - a.rev)
                .slice(0, 1),
        };
    });
    return dataList
        .filter((d) => !!d)
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
exports.toData = toData;
// 排序
function compare(dataList, c = 0.13, a = 1, cRev = 430) {
    const filterDataList = dataList
        .filter((d) => {
        return d.revList?.[0]?.rev > cRev && d.revList?.[0]?.rev < 3000;
    })
        .sort((a, b) => {
        const dy1 = (0, dayjs_1.default)(a.dateTime, 'MM-DD HH:mm').valueOf();
        const dy2 = (0, dayjs_1.default)(b.dateTime, 'MM-DD HH:mm').valueOf();
        return dy1 - dy2;
    });
    let mDataList = [];
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
exports.compare = compare;
const saveFile = async (fileName, data) => {
    const path = './';
    const pPath = (0, path_1.parse)((0, path_1.resolve)(path, fileName));
    // 如果开启了oss,保存数据到oss
    if (!fs_1.default.existsSync(pPath.dir)) {
        fs_1.default.mkdirSync(pPath.dir, { recursive: true });
    }
    if (fs_1.default.existsSync((0, path_1.resolve)(path, fileName))) {
        const _data = fs_1.default.readFileSync((0, path_1.resolve)(path, fileName), { encoding: 'utf-8' });
        // 如果数据没变 就不在保存数据
        if (data === _data) {
            return;
        }
    }
    if (client) {
        try {
            await client.put(pPath.name + `_${(0, dayjs_1.default)().add(8, 'h').format('YYYY-MM-DD')}` + pPath.ext, Buffer.from(data));
        }
        catch (error) {
            console.log(error);
        }
    }
    fs_1.default.writeFileSync((0, path_1.resolve)(path, fileName), data, { encoding: 'utf-8' });
};
exports.saveFile = saveFile;
async function getStore(p) {
    const initData = {
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
            if (p === 'basketballData') {
                const dataRes = await client.get(`basketballData.json`);
                return { ...initData, ...JSON.parse(res.content), basketballData: JSON.parse(dataRes.content) };
            }
            return { ...initData, ...JSON.parse(res.content) };
        }
        catch (error) {
            return initData;
        }
    }
    return initData;
}
exports.getStore = getStore;
const saveStore = async (s, upload = true) => {
    const store = await getStore();
    const tStore = R.pick([
        'ver',
        'uid',
        'url',
        'timestamp',
        'timeFormat',
        'R',
        'A',
        'C',
        'Rev',
        'compareRev',
        'scoreRev',
        'halfRev',
        'data',
        'accountList',
        'basketballData',
    ], {
        ...store,
        ...s,
    });
    // oss保存
    try {
        if (client && upload) {
            try {
                if (s.data) {
                    await client.put(`data.json`, Buffer.from((0, json_format_1.default)(s.data)));
                }
                if (s.basketballData) {
                    await client.put(`basketballData.json`, Buffer.from((0, json_format_1.default)(s.basketballData)));
                }
                await client.put(`store.json`, Buffer.from((0, json_format_1.default)(R.omit(['data', 'basketballData'], tStore))));
            }
            catch (error) {
                console.log(error);
            }
        }
    }
    catch (error) { }
    return tStore;
};
exports.saveStore = saveStore;
const getLogHistory = () => {
    const path = './data/log.json';
    if (!fs_1.default.existsSync(path)) {
        fs_1.default.writeFileSync(path, (0, json_format_1.default)({ data: [] }), { encoding: 'utf-8' });
    }
    const d = JSON.parse(fs_1.default.readFileSync(path, { encoding: 'utf-8' }));
    return d;
};
exports.getLogHistory = getLogHistory;
function getMessage1List(data, rev) {
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
        return `${rev.single ? '【单】' : ''}${d.num} ${(0, dayjs_1.default)(d.dateTime, 'MM-DD HH:mm').format('MM-DD\u2002HH:mm')} ${d.tiCaiTeamList.join(' ')} ${desc} GC:${rev.gc.toFixed(2)} VV:${rev.vv.toFixed(2)} offset:${rev.offset.toFixed(2)} rev:${rev.rev.toFixed(2)}`;
    });
}
exports.getMessage1List = getMessage1List;
function getMessage3List(data, scoreRev) {
    return data
        .filter((d) => d?.scoreRevList?.[0]?.rev > scoreRev)
        .sort((a, b) => {
        const rev1 = a.scoreRevList[0];
        const rev2 = b.scoreRevList[0];
        return rev2.rev - rev1.rev;
    })
        .map((d) => {
        const rev = d.scoreRevList[0];
        return `${d.num} ${(0, dayjs_1.default)(d.dateTime, 'MM-DD HH:mm').format('MM-DD\u2002HH:mm')} ${d.tiCaiTeamList.join(' ')} GC:${rev.gc.toFixed(3)} VV:${rev.vv.toFixed(2)} offset:${rev.offset.toFixed(2)} rev:${rev.rev.toFixed(2)} 0球(${rev.score?.c?.toFixed(2)})-${((rev.score?.Z || 0) * 2).toFixed(2)}\u20021球(${rev.score?.b?.toFixed(2)})-${((rev.score?.Y || 0) * 2).toFixed(2)}\u20022球(${rev.score?.a?.toFixed(2)})-${((rev.score?.X || 0) * 2).toFixed(2)}`;
    });
}
exports.getMessage3List = getMessage3List;
function getMessage4List(data, halfRev) {
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
        return `${d.num} ${(0, dayjs_1.default)(d.dateTime, 'MM-DD HH:mm').format('MM-DD\u2002HH:mm')} ${d.tiCaiTeamList.join(' ')} GC:${rev.gc.toFixed(3)} VV:${rev.vv.toFixed(2)} offset:${rev.offset.toFixed(2)} rev:${rev.rev.toFixed(2)} ${tList[0]}(${rev.score?.a?.toFixed(2)})-${((rev.score?.Z || 0) * 2)?.toFixed(2)}\u2002${tList[1]}(${rev.score?.b?.toFixed(2)})-${((rev.score?.Y || 0) * 2)?.toFixed(2)}\u2002${tList[2]}(${rev.score?.c?.toFixed(2)})-${((rev.score?.X || 0) * 2)?.toFixed(2)}`;
    });
}
exports.getMessage4List = getMessage4List;
function getMessage2List(data, C, A, compareRev) {
    const compareDataList = compare(data, C, A, compareRev).slice(0, 3);
    const messageList = compareDataList
        .filter(({ d1, d2 }) => {
        const dy1 = (0, dayjs_1.default)(d1.dateTime, 'MM-DD HH:mm');
        const dy2 = (0, dayjs_1.default)(d2.dateTime, 'MM-DD HH:mm');
        const bet = Math.abs(dy1.valueOf() - dy2.valueOf());
        const dy1Num = d1.num.slice(0, 2);
        const wl = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        // 两个比赛的日期得是一致或者连续的 且有一场在当天
        const isToday = Math.abs(dy1.date() - dy2.date()) <= 1 && dy1Num === wl[(0, dayjs_1.default)().add(8, 'hour').day()];
        return bet >= 2 * 60 * 60 * 1000 && isToday;
    })
        .map((cd, index) => {
        return [
            `NO.${index}${cd.single1 ? '【单】' : ''} ${cd.d1.num} ${(0, dayjs_1.default)(cd.d1.dateTime, 'MM-DD HH:mm').format('MM-DD\u2002HH:mm')} ${cd.d1.tiCaiTeamList.join(' ')} GC:${cd.gc1.toFixed(2)} VV:${cd.vv1.toFixed(2)} offset:${cd.offset1.toFixed(2)} rev:${cd.rev1.toFixed(2)}`,
            `NO.${index}${cd.single2 ? '【单】' : ''} ${cd.d2.num} ${(0, dayjs_1.default)(cd.d2.dateTime, 'MM-DD HH:mm').format('MM-DD\u2002HH:mm')} ${cd.d2.tiCaiTeamList.join(' ')} GC:${cd.gc2.toFixed(2)} VV:${cd.vv2.toFixed(2)} offset:${cd.offset2.toFixed(2)} rev:${cd.rev2.toFixed(2)}`,
        ];
    });
    return { messageList, compareDataList };
}
exports.getMessage2List = getMessage2List;
