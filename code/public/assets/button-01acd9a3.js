import{i as b,E as kt,v as Lt,ae as Ft,n as Mt,_ as bt,q as j,I as ot,L as tt,d as R,N as ht,H as W,k as Tt,l as Ct,U as St,aw as ut,P as Bt,b as E,ad as lt,T as Ot,r as P,p as _t,g as Pt,$ as zt,M as Dt,z as y,a9 as jt,D as Wt}from"./index-7efe1ffd.js";var Rt=function(t,a){var i=b({},t);return Object.keys(a).forEach(function(o){var u=i[o];if(u)u.type||u.default?u.default=a[o]:u.def?u.def(a[o]):i[o]={type:u,default:a[o]};else throw new Error("not have ".concat(o," prop"))}),i};const Ut=Rt;var xt=function(t){return setTimeout(t,16)},wt=function(t){return clearTimeout(t)};typeof window<"u"&&"requestAnimationFrame"in window&&(xt=function(t){return window.requestAnimationFrame(t)},wt=function(t){return window.cancelAnimationFrame(t)});var st=0,nt=new Map;function It(e){nt.delete(e)}function J(e){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:1;st+=1;var a=st;function i(o){if(o===0)It(a),e();else{var u=xt(function(){i(o-1)});nt.set(a,u)}}return i(t),a}J.cancel=function(e){var t=nt.get(e);return It(t),wt(t)};function tn(e,t){for(var a=kt({},e),i=0;i<t.length;i+=1){var o=t[i];delete a[o]}return a}function nn(e){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},a=arguments.length>2&&arguments[2]!==void 0?arguments[2]:!0,i=arguments.length>3&&arguments[3]!==void 0?arguments[3]:!1,o=e;if(Array.isArray(e)&&(o=Lt(e)[0]),!o)return null;var u=Ft(o,t,i);return u.props=a?b(b({},u.props),t):u.props,Mt(bt(u.props.class)!=="object","class must be string"),u}function $t(e){e.target.composing=!0}function ct(e){e.target.composing&&(e.target.composing=!1,Vt(e.target,"input"))}function Vt(e,t){var a=document.createEvent("HTMLEvents");a.initEvent(t,!0,!0),e.dispatchEvent(a)}function K(e,t,a,i){e.addEventListener(t,a,i)}var Ht={created:function(t,a){(!a.modifiers||!a.modifiers.lazy)&&(K(t,"compositionstart",$t),K(t,"compositionend",ct),K(t,"change",ct))}};const en=Ht;var Q=Symbol("ContextProps"),X=Symbol("InternalContextProps"),Y={id:j(function(){}),onFieldBlur:function(){},onFieldChange:function(){},clearValidate:function(){}},Z={addFormItemField:function(){},removeFormItemField:function(){}},an=function(){var t=ot(X,Z),a=Symbol("FormItemFieldKey"),i=ht();return t.addFormItemField(a,i.type),tt(function(){t.removeFormItemField(a)}),W(X,Z),W(Q,Y),ot(Q,Y)};R({compatConfig:{MODE:3},name:"AFormItemRest",setup:function(t,a){var i=a.slots;return W(X,Z),W(Q,Y),function(){var o;return(o=i.default)===null||o===void 0?void 0:o.call(i)}}});var q={transitionstart:{transition:"transitionstart",WebkitTransition:"webkitTransitionStart",MozTransition:"mozTransitionStart",OTransition:"oTransitionStart",msTransition:"MSTransitionStart"},animationstart:{animation:"animationstart",WebkitAnimation:"webkitAnimationStart",MozAnimation:"mozAnimationStart",OAnimation:"oAnimationStart",msAnimation:"MSAnimationStart"}},G={transitionend:{transition:"transitionend",WebkitTransition:"webkitTransitionEnd",MozTransition:"mozTransitionEnd",OTransition:"oTransitionEnd",msTransition:"MSTransitionEnd"},animationend:{animation:"animationend",WebkitAnimation:"webkitAnimationEnd",MozAnimation:"mozAnimationEnd",OAnimation:"oAnimationEnd",msAnimation:"MSAnimationEnd"}},N=[],k=[];function Kt(){var e=document.createElement("div"),t=e.style;"AnimationEvent"in window||(delete q.animationstart.animation,delete G.animationend.animation),"TransitionEvent"in window||(delete q.transitionstart.transition,delete G.transitionend.transition);function a(i,o){for(var u in i)if(i.hasOwnProperty(u)){var v=i[u];for(var m in v)if(m in t){o.push(v[m]);break}}}a(q,N),a(G,k)}typeof window<"u"&&typeof document<"u"&&Kt();function dt(e,t,a){e.addEventListener(t,a,!1)}function ft(e,t,a){e.removeEventListener(t,a,!1)}var qt={startEvents:N,addStartEventListener:function(t,a){if(N.length===0){setTimeout(a,0);return}N.forEach(function(i){dt(t,i,a)})},removeStartEventListener:function(t,a){N.length!==0&&N.forEach(function(i){ft(t,i,a)})},endEvents:k,addEndEventListener:function(t,a){if(k.length===0){setTimeout(a,0);return}k.forEach(function(i){dt(t,i,a)})},removeEndEventListener:function(t,a){k.length!==0&&k.forEach(function(i){ft(t,i,a)})}};const z=qt;var S;function vt(e){return!e||e.offsetParent===null}function Gt(e){var t=(e||"").match(/rgba?\((\d*), (\d*), (\d*)(, [\.\d]*)?\)/);return t&&t[1]&&t[2]&&t[3]?!(t[1]===t[2]&&t[2]===t[3]):!0}const Jt=R({compatConfig:{MODE:3},name:"Wave",props:{insertExtraNode:Boolean,disabled:Boolean},setup:function(t,a){var i=a.slots,o=a.expose,u=ht(),v=Tt("",t),m=v.csp,h=v.prefixCls;o({csp:m});var L=null,M=null,w=null,T=!1,g=null,p=!1,C=function(n){if(!p){var r=ut(u);!n||n.target!==r||T||A(r)}},F=function(n){!n||n.animationName!=="fadeEffect"||A(n.target)},I=function(){var n=t.insertExtraNode;return n?"".concat(h.value,"-click-animating"):"".concat(h.value,"-click-animating-without-extra-node")},U=function(n,r){var s=t.insertExtraNode,l=t.disabled;if(!(l||!n||vt(n)||n.className.indexOf("-leave")>=0)){g=document.createElement("div"),g.className="".concat(h.value,"-click-animating-node");var c=I();if(n.removeAttribute(c),n.setAttribute(c,"true"),S=S||document.createElement("style"),r&&r!=="#ffffff"&&r!=="rgb(255, 255, 255)"&&Gt(r)&&!/rgba\(\d*, \d*, \d*, 0\)/.test(r)&&r!=="transparent"){var x;(x=m.value)!==null&&x!==void 0&&x.nonce&&(S.nonce=m.value.nonce),g.style.borderColor=r,S.innerHTML=`
        [`.concat(h.value,"-click-animating-without-extra-node='true']::after, .").concat(h.value,`-click-animating-node {
          --antd-wave-shadow-color: `).concat(r,`;
        }`),document.body.contains(S)||document.body.appendChild(S)}s&&n.appendChild(g),z.addStartEventListener(n,C),z.addEndEventListener(n,F)}},A=function(n){if(!(!n||n===g||!(n instanceof Element))){var r=t.insertExtraNode,s=I();n.setAttribute(s,"false"),S&&(S.innerHTML=""),r&&g&&n.contains(g)&&n.removeChild(g),z.removeStartEventListener(n,C),z.removeEndEventListener(n,F)}},$=function(n){if(!(!n||!n.getAttribute||n.getAttribute("disabled")||n.className.indexOf("disabled")>=0)){var r=function(l){if(!(l.target.tagName==="INPUT"||vt(l.target))){A(n);var c=getComputedStyle(n).getPropertyValue("border-top-color")||getComputedStyle(n).getPropertyValue("border-color")||getComputedStyle(n).getPropertyValue("background-color");M=setTimeout(function(){return U(n,c)},0),J.cancel(w),T=!0,w=J(function(){T=!1},10)}};return n.addEventListener("click",r,!0),{cancel:function(){n.removeEventListener("click",r,!0)}}}};return Ct(function(){St(function(){var d=ut(u);d.nodeType===1&&(L=$(d))})}),tt(function(){L&&L.cancel(),clearTimeout(M),p=!0}),function(){var d;return(d=i.default)===null||d===void 0?void 0:d.call(i)[0]}}});var Qt=function(){return{prefixCls:String,type:String,htmlType:{type:String,default:"button"},shape:{type:String},size:{type:String},loading:{type:[Boolean,Object],default:function(){return!1}},disabled:{type:Boolean,default:void 0},ghost:{type:Boolean,default:void 0},block:{type:Boolean,default:void 0},danger:{type:Boolean,default:void 0},icon:Bt.any,href:String,target:String,title:String,onClick:{type:Function},onMousedown:{type:Function}}};const Xt=Qt;var mt=function(t){t&&(t.style.width="0px",t.style.opacity="0",t.style.transform="scale(0)")},gt=function(t){St(function(){t&&(t.style.width="".concat(t.scrollWidth,"px"),t.style.opacity="1",t.style.transform="scale(1)")})},pt=function(t){t&&t.style&&(t.style.width=null,t.style.opacity=null,t.style.transform=null)};const Yt=R({compatConfig:{MODE:3},name:"LoadingIcon",props:{prefixCls:String,loading:[Boolean,Object],existIcon:Boolean},setup:function(t){return function(){var a=t.existIcon,i=t.prefixCls,o=t.loading;if(a)return E("span",{class:"".concat(i,"-loading-icon")},[E(lt,null,null)]);var u=!!o;return E(Ot,{name:"".concat(i,"-loading-icon-motion"),onBeforeEnter:mt,onEnter:gt,onAfterEnter:pt,onBeforeLeave:gt,onLeave:function(m){setTimeout(function(){mt(m)})},onAfterLeave:pt},{default:function(){return[u?E("span",{class:"".concat(i,"-loading-icon")},[E(lt,null,null)]):null]}})}}});var yt=/^[\u4e00-\u9fa5]{2}$/,Et=yt.test.bind(yt);function D(e){return e==="text"||e==="link"}const rn=R({compatConfig:{MODE:3},name:"AButton",inheritAttrs:!1,__ANT_BUTTON:!0,props:Ut(Xt(),{type:"default"}),slots:["icon"],setup:function(t,a){var i=a.slots,o=a.attrs,u=a.emit,v=Tt("btn",t),m=v.prefixCls,h=v.autoInsertSpaceInButton,L=v.direction,M=v.size,w=P(null),T=P(void 0),g=!1,p=P(!1),C=P(!1),F=j(function(){return h.value!==!1}),I=j(function(){return bt(t.loading)==="object"&&t.loading.delay?t.loading.delay||!0:!!t.loading});_t(I,function(n){clearTimeout(T.value),typeof I.value=="number"?T.value=setTimeout(function(){p.value=n},I.value):p.value=n},{immediate:!0});var U=j(function(){var n,r=t.type,s=t.shape,l=s===void 0?"default":s,c=t.ghost,x=t.block,V=t.danger,f=m.value,B={large:"lg",small:"sm",middle:void 0},O=M.value,_=O&&B[O]||"";return n={},y(n,"".concat(f),!0),y(n,"".concat(f,"-").concat(r),r),y(n,"".concat(f,"-").concat(l),l!=="default"&&l),y(n,"".concat(f,"-").concat(_),_),y(n,"".concat(f,"-loading"),p.value),y(n,"".concat(f,"-background-ghost"),c&&!D(r)),y(n,"".concat(f,"-two-chinese-chars"),C.value&&F.value),y(n,"".concat(f,"-block"),x),y(n,"".concat(f,"-dangerous"),!!V),y(n,"".concat(f,"-rtl"),L.value==="rtl"),n}),A=function(){var r=w.value;if(!(!r||h.value===!1)){var s=r.textContent;g&&Et(s)?C.value||(C.value=!0):C.value&&(C.value=!1)}},$=function(r){if(p.value||t.disabled){r.preventDefault();return}u("click",r)},d=function(r,s){var l=s?" ":"";if(r.type===jt){var c=r.children.trim();return Et(c)&&(c=c.split("").join(l)),E("span",null,[c])}return r};return Pt(function(){Wt(!(t.ghost&&D(t.type)),"Button","`link` or `text` button can't be a `ghost` button.")}),Ct(A),zt(A),tt(function(){T.value&&clearTimeout(T.value)}),function(){var n,r,s=t.icon,l=s===void 0?(n=i.icon)===null||n===void 0?void 0:n.call(i):s,c=Dt((r=i.default)===null||r===void 0?void 0:r.call(i));g=c.length===1&&!l&&!D(t.type);var x=t.type,V=t.htmlType,f=t.disabled,B=t.href,O=t.title,_=t.target,At=t.onMousedown,Nt=p.value?"loading":l,H=b(b({},o),{},{title:O,disabled:f,class:[U.value,o.class,y({},"".concat(m.value,"-icon-only"),c.length===0&&!!Nt)],onClick:$,onMousedown:At});f||delete H.disabled;var et=l&&!p.value?l:E(Yt,{existIcon:!!l,prefixCls:m.value,loading:!!p.value},null),at=c.map(function(rt){return d(rt,g&&F.value)});if(B!==void 0)return E("a",b(b({},H),{},{href:B,target:_,ref:w}),[et,at]);var it=E("button",b(b({},H),{},{ref:w,type:V}),[et,at]);return D(x)?it:E(Jt,{ref:"wave",disabled:!!p.value},{default:function(){return[it]}})}}});export{rn as B,en as a,Xt as b,nn as c,Ut as i,tn as o,an as u,J as w};
