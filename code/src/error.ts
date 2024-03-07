export enum Code {
  success = 200,
  wrongAccount = 403,
  dataFail = 404,
  accountUnknownFail = 601,
  maintain = 619,
  uidExpire = 801,
  forbidden = 401
}

export function createError(msg: string, code: Code) {
  const e = new Error(msg);
  // @ts-ignore
  e.code = code;
  return e;
}

export type CError = Error & { code: Code };
