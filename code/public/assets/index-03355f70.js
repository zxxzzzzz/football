import{d as k,r as m,h as C,E as T,c as a,b as o,w as u,u as n,o as r,a as c,F as f,O as p,e as V,f as $,N as h,M as _}from"./index-e6ff94ba.js";import{o as x,q as D,A}from"./index-199eb645.js";import{B as E,m as g}from"./button-3f9f4897.js";import"./SearchOutlined-9e2d80d3.js";const F={class:"flex flex-wrap mb-2"},M={class:"mb-2"},P={class:"flex flex-wrap"},R={class:"flex flex-wrap"},U={class:"flex flex-wrap mb-2"},j={class:"flex flex-col"},K=k({__name:"index",setup(q){const I=$(),d=["#78a5de","#4fb2a1","#205a13","#186174","#88b00b","#cf4b22","#9e57cd","#238910","#c18fde","#673b84","#760bbb","#557766","#557733","#337755"],z=m([]),v=m([]),y=m([]),b=m([]);let w;async function N(){var s,B;const l=location.origin,i=new URL(location.href),e=await(await fetch(`${l}/data?username=${i.searchParams.get("username")||""}&password=${i.searchParams.get("password")||""}`)).json();if(e.code!==200){if(g.error((e==null?void 0:e.msg)||"更新出错",20),(e==null?void 0:e.code)===619)return g.info("已停止数据自动更新",10),!1;if((e==null?void 0:e.code)===401)return g.info("为了保证账号安全，已停止数据自动更新。刷新页面可开始继续自动更新",10),!1}return(B=(s=e.data)==null?void 0:s.matchData)!=null&&B.length&&(g.success("数据更新成功"),z.value=e.data.matchData,v.value=e.data.message1List,y.value=e.data.message2List,b.value=e.data.message3List),!0}async function L(l,i){try{if(!await l())return}catch{}w=setTimeout(async()=>{try{await L(l,i)}catch{}},i)}const S=()=>{I.push({path:"/setting"})};return C(async()=>{L(async()=>document.hidden?!0:await N(),5*1e3)}),T(()=>{w&&clearTimeout(w)}),(l,i)=>(r(),a("div",null,[o(n(x),{"item-layout":"horizontal","data-source":v.value},{renderItem:u(({item:t})=>[c("div",F,[(r(!0),a(f,null,p(t.split(" "),(e,s)=>(r(),a("div",{style:h({color:d[s],margin:"0 4px"}),class:"whitespace-nowrap"},_(e),5))),256))])]),_:1},8,["data-source"]),o(n(D)),o(n(x),{"item-layout":"horizontal","data-source":y.value},{renderItem:u(({item:t})=>[c("div",M,[c("div",P,[(r(!0),a(f,null,p(t[0].split(" "),(e,s)=>(r(),a("div",{style:h({color:d[s],margin:"0 4px"}),class:"whitespace-nowrap"},_(e),5))),256))]),c("div",R,[(r(!0),a(f,null,p(t[1].split(" "),(e,s)=>(r(),a("div",{style:h({color:d[s],margin:"0 4px"}),class:"whitespace-nowrap"},_(e),5))),256))])])]),_:1},8,["data-source"]),o(n(D)),o(n(x),{"item-layout":"horizontal","data-source":b.value},{renderItem:u(({item:t})=>[c("div",U,[(r(!0),a(f,null,p(t.split(" "),(e,s)=>(r(),a("div",{style:h({color:d[s],margin:"0 4px"}),class:"whitespace-nowrap"},_(e),5))),256))])]),_:1},8,["data-source"]),o(n(A),{offsetBottom:400,style:{position:"absolute",right:"0px"}},{default:u(()=>[c("div",j,[o(n(E),{class:"my-2",onClick:S},{default:u(()=>[V(" 设置")]),_:1})])]),_:1})]))}});export{K as default};
