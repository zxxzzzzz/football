import{d as V,r as d,k as j,l as A,c as s,b as r,w as l,u as n,o,a as i,F as m,h as p,e as F,f as O,s as f,p as v,n as h,t as g}from"./index-55927906.js";import{L as w,A as E,d as $}from"./index-68adac58.js";import{D as y}from"./index-aa0beafb.js";import{B as M}from"./button-b464f006.js";import"./SearchOutlined-3054f0cb.js";const R={class:"flex flex-wrap mb-2"},U={class:"mb-2"},q={class:"flex flex-wrap"},G={class:"flex flex-wrap"},H={class:"flex flex-wrap mb-2"},J={class:"flex flex-wrap mb-2"},K={class:"flex flex-col"},ee=V({__name:"index",setup(P){const b=O(),c=["#78a5de","#4fb2a1","#205a13","#186174","#88b00b","#cf4b22","#9e57cd","#238910","#c18fde","#673b84","#760bbb","#557766","#557733","#337755"],C=d([]),k=d([]),L=d([]),I=d([]),S=d([]);let x;async function N(){var t,a,D,z;const u=location.origin,e=await(await fetch(`${u}/data/?p=${f.password}&token=${f.token}`)).json();if(e.code!==200){if(v.error((e==null?void 0:e.msg)||"更新出错",20),(e==null?void 0:e.code)===619)return v.info("已停止数据自动更新",10),!1;if((e==null?void 0:e.code)===601)return v.info("为了保证账号安全，已停止数据自动更新。刷新页面可开始继续自动更新",10),!1;if(e.code===401)return f.password="",localStorage.setItem("ps",""),f.token="",localStorage.setItem("token",""),console.log("goto login"),b.push({path:"/login"}),!1}return(a=(t=e.data)==null?void 0:t.matchData)!=null&&a.length&&(v.success(`数据更新 ${(D=e==null?void 0:e.data)!=null&&D.timestamp?"距离当前"+($().valueOf()-$(e.data.timestamp).valueOf())/1e3+"秒":""}, 在线人数${((z=e==null?void 0:e.data)==null?void 0:z.liveCount)||0}`,5),C.value=e.data.matchData,k.value=e.data.message1List,L.value=e.data.message2List,I.value=e.data.message3List,S.value=e.data.message4List,localStorage.setItem("token",e.data.token),f.token=e.data.token),!0}async function B(u,_){try{if(!await u())return}catch{}x=setTimeout(async()=>{try{await B(u,_)}catch{}},_)}const T=()=>{b.push({path:"/setting"})};return j(async()=>{B(async()=>document.hidden?!0:await N(),5*1e3)}),A(()=>{x&&clearTimeout(x)}),(u,_)=>(o(),s("div",null,[r(n(w),{"item-layout":"horizontal","data-source":k.value},{renderItem:l(({item:e})=>[i("div",R,[(o(!0),s(m,null,p(e.split(" "),(t,a)=>(o(),s("div",{style:h({color:c[a],margin:"0 4px"}),class:"whitespace-nowrap"},g(t),5))),256))])]),_:1},8,["data-source"]),r(n(y)),r(n(w),{"item-layout":"horizontal","data-source":L.value},{renderItem:l(({item:e})=>[i("div",U,[i("div",q,[(o(!0),s(m,null,p(e[0].split(" "),(t,a)=>(o(),s("div",{style:h({color:c[a],margin:"0 4px"}),class:"whitespace-nowrap"},g(t),5))),256))]),i("div",G,[(o(!0),s(m,null,p(e[1].split(" "),(t,a)=>(o(),s("div",{style:h({color:c[a],margin:"0 4px"}),class:"whitespace-nowrap"},g(t),5))),256))])])]),_:1},8,["data-source"]),r(n(y)),r(n(w),{"item-layout":"horizontal","data-source":I.value},{renderItem:l(({item:e})=>[i("div",H,[(o(!0),s(m,null,p(e.split(" "),(t,a)=>(o(),s("div",{style:h({color:c[a],margin:"0 4px"}),class:"whitespace-nowrap"},g(t),5))),256))])]),_:1},8,["data-source"]),r(n(y)),r(n(w),{"item-layout":"horizontal","data-source":S.value},{renderItem:l(({item:e})=>[i("div",J,[(o(!0),s(m,null,p(e.split(" "),(t,a)=>(o(),s("div",{style:h({color:c[a],margin:"0 4px"}),class:"whitespace-nowrap"},g(t),5))),256))])]),_:1},8,["data-source"]),r(n(E),{offsetBottom:400,style:{position:"absolute",right:"0px"}},{default:l(()=>[i("div",K,[r(n(M),{class:"my-2",onClick:T},{default:l(()=>[F(" 设置")]),_:1})])]),_:1})]))}});export{ee as default};
