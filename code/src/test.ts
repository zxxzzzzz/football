import {getLeagueListAllByNodeFetch, loginByNodeFetch} from './api';
import {getStore} from './util';
import OSS from 'ali-oss';

let client = new OSS({
  // yourRegion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
  region: 'oss-cn-hangzhou',
  // 阿里云账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM用户进行API访问或日常运维，请登录RAM控制台创建RAM用户。
  accessKeyId: 'LTAI5tS4sZVkgTbcfkeQZYtW',
  accessKeySecret: 'uTMm6eu2yk5eVZMnuWIGfOXN6OJtDF',
  bucket:'footballc'
  
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

(async ()=>{
  const result = await client.put('store.txt', './store.json')
  console.log(result);
  // const store = getStore()
  // console.log(store);
  // const l = await getLeagueListAllByNodeFetch(store.store.url || '', store.store.uid||'',store.store.ver||'')
  // console.log(l);
  // loginByNodeFetch('XDivan4', 'Jxd9061912')

})()