import{d as O,r as m,k as E,l as M,c as s,b as r,w as i,u as n,o,a as c,F as f,h as p,e as $,f as R,s as h,p as w,n as g,t as _}from"./index-e0d4ad65.js";import{L as x,D as k,A as U,d as N}from"./index-6105a9bb.js";import{B as T}from"./button-05d9a6d4.js";import"./SearchOutlined-1d867aca.js";const q={class:"flex flex-wrap mb-2"},G={class:"mb-2"},H={class:"flex flex-wrap"},J={class:"flex flex-wrap"},K={class:"flex flex-wrap mb-2"},P={class:"flex flex-wrap mb-2"},Q={class:"flex flex-col"},te=O({__name:"index",setup(W){const y=R(),u=l=>l.split(" "),d=["#78a5de","#4fb2a1","#205a13","#186174","#88b00b","#cf4b22","#9e57cd","#238910","#c18fde","#673b84","#760bbb","#557766","#557733","#337755"],V=m([]),L=m([]),I=m([]),B=m([]),S=m([]);let b;async function j(){var t,a,z,C;const l=location.origin,e=await(await fetch(`${l}/data/?p=${h.password}&token=${h.token}`)).json();if(e.code!==200){if(w.error((e==null?void 0:e.msg)||"更新出错",20),(e==null?void 0:e.code)===619)return w.info("已停止数据自动更新",10),!1;if((e==null?void 0:e.code)===601)return w.info("为了保证账号安全，已停止数据自动更新。刷新页面可开始继续自动更新",10),!1;if(e.code===401)return h.password="",localStorage.setItem("ps",""),h.token="",localStorage.setItem("token",""),console.log("goto login"),y.push({path:"/login"}),!1}return(a=(t=e.data)==null?void 0:t.matchData)!=null&&a.length&&(w.success(`数据更新 ${(z=e==null?void 0:e.data)!=null&&z.timestamp?"距离当前"+(N().valueOf()-N(e.data.timestamp).valueOf())/1e3+"秒":""}, 在线人数${((C=e==null?void 0:e.data)==null?void 0:C.liveCount)||0}`,5),V.value=e.data.matchData,L.value=e.data.message1List,I.value=e.data.message2List,B.value=e.data.message3List,S.value=e.data.message4List,localStorage.setItem("token",e.data.token),h.token=e.data.token),!0}async function D(l,v){try{if(!await l())return}catch{}b=setTimeout(async()=>{try{await D(l,v)}catch{}},v)}const A=()=>{y.push({path:"/setting"})},F=()=>{y.push({path:"/mobile/basketball"})};return E(async()=>{D(async()=>document.hidden?!0:await j(),10*1e3)}),M(()=>{b&&clearTimeout(b)}),(l,v)=>(o(),s("div",null,[r(n(x),{"item-layout":"horizontal","data-source":L.value},{renderItem:i(({item:e})=>[c("div",q,[(o(!0),s(f,null,p(u(e),(t,a)=>(o(),s("div",{style:g({color:d[a],margin:"0 4px"}),class:"whitespace-nowrap"},_(t),5))),256))])]),_:1},8,["data-source"]),r(n(k)),r(n(x),{"item-layout":"horizontal","data-source":I.value},{renderItem:i(({item:e})=>[c("div",G,[c("div",H,[(o(!0),s(f,null,p(u(e[0]),(t,a)=>(o(),s("div",{style:g({color:d[a],margin:"0 4px"}),class:"whitespace-nowrap"},_(t),5))),256))]),c("div",J,[(o(!0),s(f,null,p(u(e[1]),(t,a)=>(o(),s("div",{style:g({color:d[a],margin:"0 4px"}),class:"whitespace-nowrap"},_(t),5))),256))])])]),_:1},8,["data-source"]),r(n(k)),r(n(x),{"item-layout":"horizontal","data-source":B.value},{renderItem:i(({item:e})=>[c("div",K,[(o(!0),s(f,null,p(u(e),(t,a)=>(o(),s("div",{style:g({color:d[a],margin:"0 4px"}),class:"whitespace-nowrap"},_(t),5))),256))])]),_:1},8,["data-source"]),r(n(k)),r(n(x),{"item-layout":"horizontal","data-source":S.value},{renderItem:i(({item:e})=>[c("div",P,[(o(!0),s(f,null,p(u(e),(t,a)=>(o(),s("div",{style:g({color:d[a],margin:"0 4px"}),class:"whitespace-nowrap"},_(t),5))),256))])]),_:1},8,["data-source"]),r(n(U),{offsetBottom:400,style:{position:"absolute",right:"0px"}},{default:i(()=>[c("div",Q,[r(n(T),{class:"my-2",onClick:A},{default:i(()=>[$(" 设置")]),_:1}),r(n(T),{class:"my-2",onClick:F},{default:i(()=>[$(" 篮球")]),_:1})])]),_:1})]))}});export{te as default};
