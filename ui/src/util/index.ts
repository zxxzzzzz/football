import * as R from 'ramda';

const keyList = [['RB莱比锡', '莱红牛']];
// rate加权
const isMatch = (a: string, b: string) => {
  const matchedEl = keyList.find((k) => k.includes(a));
  if (matchedEl) {
    return matchedEl.includes(b);
  }
  if (a.includes(b) || b.includes(a)) {
    return true;
  }
  const flag = R.range(0, Math.max(a.length, b.length)).every((index) => {
    return a[index] === b[index];
  });
  if (flag) {
    return flag;
  }
  const matchList = R.range(0, Math.min(a.length, b.length)).map((index) => {
    return a[index] === b[index];
  });
  if (matchList?.[0]) {
    return true;
  }
  return false;
};
export const isTeamEqu = (a: string[], b: string[]) => {
  if (!a?.length || !b?.length) {
    return false;
  }
  return a.every((aStr) => {
    return b.some((bStr) => {
      return isMatch(aStr, bStr);
    });
  });
};
