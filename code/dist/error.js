"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = exports.Code = void 0;
var Code;
(function (Code) {
    Code[Code["success"] = 200] = "success";
    Code[Code["wrongAccount"] = 403] = "wrongAccount";
    Code[Code["dataFail"] = 404] = "dataFail";
    Code[Code["accountUnknownFail"] = 601] = "accountUnknownFail";
    Code[Code["maintain"] = 619] = "maintain";
    Code[Code["uidExpire"] = 801] = "uidExpire";
    Code[Code["forbidden"] = 401] = "forbidden";
})(Code = exports.Code || (exports.Code = {}));
function createError(msg, code) {
    const e = new Error(msg);
    // @ts-ignore
    e.code = code;
    return e;
}
exports.createError = createError;
