import{d as x,l as b,c as y,a as n,b as a,u as t,w as u,am as c,s as o,o as C,e as m,f as N}from"./index-e6beca46.js";import{I as r}from"./Input-236d0a23.js";import{B as g}from"./button-a984a027.js";const U={class:"pt-12 px-4"},j={class:"flex mb-4"},B=n("div",{class:"w-[13rem] text-right mr-2"},"R",-1),k={class:"flex mb-4"},A=n("div",{class:"w-[13rem] text-right mr-2"},"A",-1),V={class:"flex mb-4"},S=n("div",{class:"w-[13rem] text-right mr-2"},"C",-1),$={class:"flex mb-4"},O=n("div",{class:"whitespace-nowrap w-[13rem] text-right mr-2"},"胜平负Rev",-1),F={class:"flex mb-4"},I=n("div",{class:"whitespace-nowrap w-[13rem] text-right mr-2"},"两场比赛比较的Rev",-1),E={class:"flex mb-4"},J=n("div",{class:"whitespace-nowrap w-[13rem] text-right mr-2"},"得分Rev",-1),M={class:"flex mb-4"},T=n("div",{class:"whitespace-nowrap w-[13rem] text-right mr-2"},"半场Rev",-1),q={class:"flex mb-4 justify-end"},K=x({__name:"index",setup(z){const p=N();async function v(){const l=location.origin;let s;try{s=await fetch(`${l}/setting`)}catch(e){c.error(e.message)}if(s){const e=await s.json();e.code===200&&(o.setting={...e.data}),e.code!==200&&c.error(e.msg)}}async function f(l){const s=location.origin,i=await(await fetch(`${s}/setting`,{method:"post",body:JSON.stringify(l),headers:{"content-type":"application/json"}})).json();i.code,i.code!==200&&c.error(i.msg)}const _=()=>{p.push({path:"/home"})},h=async()=>{const l={R:"R",A:"A",C:"C",Rev:"胜平负Rev",compareRev:"两场比赛比较的Rev",scoreRev:"得分Rev",halfRev:"半场Rev"};if(Object.keys(o.setting).every(e=>{const i=o.setting[e],d=parseFloat(`${i}`);return Number.isNaN(d)?(c.error(l[e]+"填写的非法值，无法保存",10),!1):!0})){const e=Object.keys(o.setting).reduce((i,d)=>{const R=o.setting[d],w=parseFloat(`${R}`);return{...i,[d]:w}},{});await f(e),c.success("设置更新成功"),await v()}};return b(async()=>{await v()}),(l,s)=>(C(),y("div",U,[n("div",j,[B,a(t(r),{value:t(o).setting.R,"onUpdate:value":s[0]||(s[0]=e=>t(o).setting.R=e)},null,8,["value"])]),n("div",k,[A,a(t(r),{value:t(o).setting.A,"onUpdate:value":s[1]||(s[1]=e=>t(o).setting.A=e)},null,8,["value"])]),n("div",V,[S,a(t(r),{value:t(o).setting.C,"onUpdate:value":s[2]||(s[2]=e=>t(o).setting.C=e)},null,8,["value"])]),n("div",$,[O,a(t(r),{value:t(o).setting.Rev,"onUpdate:value":s[3]||(s[3]=e=>t(o).setting.Rev=e)},null,8,["value"])]),n("div",F,[I,a(t(r),{value:t(o).setting.compareRev,"onUpdate:value":s[4]||(s[4]=e=>t(o).setting.compareRev=e)},null,8,["value"])]),n("div",E,[J,a(t(r),{value:t(o).setting.scoreRev,"onUpdate:value":s[5]||(s[5]=e=>t(o).setting.scoreRev=e)},null,8,["value"])]),n("div",M,[T,a(t(r),{value:t(o).setting.halfRev,"onUpdate:value":s[6]||(s[6]=e=>t(o).setting.halfRev=e)},null,8,["value"])]),n("div",q,[a(t(g),{onClick:_,class:"mr-4"},{default:u(()=>[m(" 返回数据页 ")]),_:1}),a(t(g),{onClick:h},{default:u(()=>[m(" 保存 ")]),_:1})])]))}});export{K as default};