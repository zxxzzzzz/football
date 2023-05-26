enum Code {
  maintain = 619,
  success = 200,
  wrongAccount = 403,
}

export function createError(msg: string, code: Code) {
  const e = new Error(msg);
  // @ts-ignore
  e.code = code;
  return e;
}
