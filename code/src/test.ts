import {getLeagueListAllByNodeFetch, loginByNodeFetch} from './api';
import {getStore} from './util';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

(async ()=>{
  // const store = getStore()
  // console.log(store);
  // const l = await getLeagueListAllByNodeFetch(store.store.url || '', store.store.uid||'',store.store.ver||'')
  // console.log(l);
  loginByNodeFetch('XDivan4', 'Jxd9061912')

})()