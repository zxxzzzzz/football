import{d as c,r as d,c as i,a as t,b as o,u as a,w as p,s as r,o as m,e as f,f as v}from"./index-e6beca46.js";import"./index-8a4837d6.js";import{I as _}from"./Input-236d0a23.js";import{B as h}from"./button-a984a027.js";import"./SearchOutlined-82c67e61.js";const x={class:"flex justify-center items-center h-[100vh]"},w=t("div",{class:"mr-4"},"通行码",-1),b=c({__name:"index",setup(B){const n=v(),e=d(""),l=()=>{r.password=e.value,localStorage.setItem("ps",r.password),n.push({path:"/home"})};return(k,s)=>(m(),i("div",x,[w,t("div",null,[o(a(_),{value:e.value,"onUpdate:value":s[0]||(s[0]=u=>e.value=u)},null,8,["value"])]),t("div",null,[o(a(h),{onClick:l},{default:p(()=>[f("登录")]),_:1})])]))}});export{b as default};