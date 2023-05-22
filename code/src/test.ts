import { getLeagueListAllByNodeFetch, loginByNodeFetch } from './api';
import fs from 'fs';
// import {getStore} from './util';
// @ts-ignore
import Format from 'json-format';
import OSS from 'ali-oss';

let client = new OSS({
  // yourRegion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
  region: 'oss-cn-hangzhou',
  // 阿里云账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM用户进行API访问或日常运维，请登录RAM控制台创建RAM用户。
  accessKeyId: 'LTAI5tGF62xD8uzWQhVwTe2v',
  accessKeySecret: 'YV6rmA6tpr2mJR1TolGq8UQBZc4wyx',
  bucket: 'footballc',
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

type Store = {
  ver: string;
  uid: string;
  url: string;
  uidTimestamp: number;
  dataTimestamp: number;
  name: string;
  password: string;
  R: number;
  A: number;
  C: number;
  Rev: number;
  compareRev: number;
  aliasList: string[];
  data: any;
};

async function getStore() {
  let status = 200;
  let d: Partial<Store> | undefined = void 0;
  const initData = {
    name: 'XDivan4',
    password: 'Jxd9061912',
    R: 0.12,
    A: 1,
    C: 0.13,
    Rev: 400,
    compareRev: 430,
    aliasList: ['XDivan', 'Xiao'],
  };
  const path = './data/store.json';
  // 首先查看本地是否有数据,如果本地有数据，直接使用本地数据
  if (fs.existsSync(path)) {
    const store: Partial<Store> = JSON.parse(fs.readFileSync(path, { encoding: 'utf-8' }));
    return store;
  }
  // 如果本地没有数据，请求oss里的数据
  try {
    const res = await client.get('store.json');
    d = JSON.parse(res.content);
  } catch (error) {
    status = error.status;
  }
  // oss文件获取成功
  if (status === 200 && d) {
  }
  // oss文件不存在, 把init数据存储到oss
  if (status === 404) {
    await client.put('store.json', Buffer.from(JSON.stringify(initData)), {});
    d = initData;
  }
  // oss没有权限
  if (status === 403) {
  }
  // 本地备份下oss里的数据
  fs.writeFileSync(path, JSON.stringify(d), { encoding: 'utf-8', flag: 'w' });
  return d;
}

const saveStore = async (s: Partial<Store>) => {
  // 本地先存
  const path = './data/store.json';
  const store = await getStore();
  fs.writeFileSync(path, Format({ ...store, ...s }), { encoding: 'utf-8' });
  // oss保存
  try {
    await client.put('store.json', Buffer.from(JSON.stringify({ ...store, ...s })));
  } catch (error) {}
  return { ...store, ...s };
};

(async () => {
  const result = await getStore();
  await saveStore({ data: [] });
  console.log(result);
})();
