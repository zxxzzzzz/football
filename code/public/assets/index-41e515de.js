import{d as c,r as d,c as i,a as s,b as t,u as o,w as p,s as r,o as m,e as f,f as v}from"./index-d0693814.js";import{m as _}from"./FormItemContext-f593cf69.js";import{I as h,B as x}from"./index-2481d75b.js";const w={class:"flex justify-center items-center h-[100vh]"},B=s("div",{class:"mr-4"},"通行码",-1),V=c({__name:"index",setup(g){const n=v(),e=d(""),l=()=>{if(["XDivan"].includes(e.value)){r.password=e.value,localStorage.setItem("ps",r.password),n.push({path:"/home"});return}_.error("通行码错误")};return(k,a)=>(m(),i("div",w,[B,s("div",null,[t(o(h),{value:e.value,"onUpdate:value":a[0]||(a[0]=u=>e.value=u)},null,8,["value"])]),s("div",null,[t(o(x),{onClick:l},{default:p(()=>[f("登录")]),_:1})])]))}});export{V as default};
