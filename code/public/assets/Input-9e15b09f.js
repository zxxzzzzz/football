import{P as m,_ as S,m as N,p as f,X as se,d as oe,C as ce,r as W,b as A,aq as ve,E as pe,i as ne,h as ye,x as me,a5 as be,q as ge,z as xe,L as he,n as J,A as we}from"./index-4fa17585.js";import{o as Q,c as L,u as Be,a as Ae}from"./button-35bd9e6f.js";var ue=function(){return{id:String,prefixCls:String,inputPrefixCls:String,defaultValue:m.oneOfType([m.string,m.number]),value:{type:[String,Number,Symbol],default:void 0},placeholder:{type:[String,Number]},autocomplete:String,type:{type:String,default:"text"},name:String,size:{type:String},disabled:{type:Boolean,default:void 0},readonly:{type:Boolean,default:void 0},addonBefore:m.any,addonAfter:m.any,prefix:m.any,suffix:m.any,autofocus:{type:Boolean,default:void 0},allowClear:{type:Boolean,default:void 0},lazy:{type:Boolean,default:!0},maxlength:Number,loading:{type:Boolean,default:void 0},bordered:{type:Boolean,default:void 0},showCount:{type:[Boolean,Object]},htmlSize:Number,onPressEnter:Function,onKeydown:Function,onKeyup:Function,onFocus:Function,onBlur:Function,onChange:Function,onInput:Function,"onUpdate:value":Function,valueModifiers:Object,hidden:Boolean}};const Ce=ue;var Pe=function(){return S(S({},Q(ue(),["prefix","addonBefore","addonAfter","suffix"])),{},{rows:Number,autosize:{type:[Boolean,Object],default:void 0},autoSize:{type:[Boolean,Object],default:void 0},onResize:{type:Function},onCompositionstart:Function,onCompositionend:Function,valueModifiers:Object})};function le(t,e,v,r,o){var p;return N(t,(p={},f(p,"".concat(t,"-sm"),v==="small"),f(p,"".concat(t,"-lg"),v==="large"),f(p,"".concat(t,"-disabled"),r),f(p,"".concat(t,"-rtl"),o==="rtl"),f(p,"".concat(t,"-borderless"),!e),p))}var K=function(e){return e!=null&&(Array.isArray(e)?se(e).length:!0)};function _e(t){return K(t.prefix)||K(t.suffix)||K(t.allowClear)}function ee(t){return K(t.addonBefore)||K(t.addonAfter)}var Se=["text","input"];const $e=oe({compatConfig:{MODE:3},name:"ClearableLabeledInput",inheritAttrs:!1,props:{prefixCls:String,inputType:m.oneOf(ce("text","input")),value:m.any,defaultValue:m.any,allowClear:{type:Boolean,default:void 0},element:m.any,handleReset:Function,disabled:{type:Boolean,default:void 0},direction:{type:String},size:{type:String},suffix:m.any,prefix:m.any,addonBefore:m.any,addonAfter:m.any,readonly:{type:Boolean,default:void 0},focused:{type:Boolean,default:void 0},bordered:{type:Boolean,default:!0},triggerFocus:{type:Function},hidden:Boolean},setup:function(e,v){var r=v.slots,o=v.attrs,p=W(),P=function(n){var d;if((d=p.value)!==null&&d!==void 0&&d.contains(n.target)){var i=e.triggerFocus;i==null||i()}},y=function(n){var d,i=e.allowClear,u=e.value,l=e.disabled,h=e.readonly,b=e.handleReset,C=e.suffix,g=C===void 0?r.suffix:C;if(!i)return null;var _=!l&&!h&&u,x="".concat(n,"-clear-icon");return A(ve,{onClick:b,onMousedown:function(w){return w.preventDefault()},class:N((d={},f(d,"".concat(x,"-hidden"),!_),f(d,"".concat(x,"-has-suffix"),!!g),d),x),role:"button"},null)},Y=function(n){var d,i=e.suffix,u=i===void 0?(d=r.suffix)===null||d===void 0?void 0:d.call(r):i,l=e.allowClear;return u||l?A("span",{class:"".concat(n,"-suffix")},[y(n),u]):null},U=function(n,d){var i,u,l,h=e.focused,b=e.value,C=e.prefix,g=C===void 0?(i=r.prefix)===null||i===void 0?void 0:i.call(r):C,_=e.size,x=e.suffix,F=x===void 0?(u=r.suffix)===null||u===void 0?void 0:u.call(r):x,w=e.disabled,z=e.allowClear,j=e.direction,D=e.readonly,R=e.bordered,E=e.hidden,q=e.addonAfter,Z=q===void 0?r.addonAfter:q,c=e.addonBefore,a=c===void 0?r.addonBefore:c,s=Y(n);if(!_e({prefix:g,suffix:F,allowClear:z}))return L(d,{value:b});var I=g?A("span",{class:"".concat(n,"-prefix")},[g]):null,B=N("".concat(n,"-affix-wrapper"),(l={},f(l,"".concat(n,"-affix-wrapper-focused"),h),f(l,"".concat(n,"-affix-wrapper-disabled"),w),f(l,"".concat(n,"-affix-wrapper-sm"),_==="small"),f(l,"".concat(n,"-affix-wrapper-lg"),_==="large"),f(l,"".concat(n,"-affix-wrapper-input-with-clear-btn"),F&&z&&b),f(l,"".concat(n,"-affix-wrapper-rtl"),j==="rtl"),f(l,"".concat(n,"-affix-wrapper-readonly"),D),f(l,"".concat(n,"-affix-wrapper-borderless"),!R),f(l,"".concat(o.class),!ee({addonAfter:Z,addonBefore:a})&&o.class),l));return A("span",{ref:p,class:B,style:o.style,onMouseup:P,hidden:E},[I,L(d,{style:null,value:b,class:le(n,R,_,w)}),s])},k=function(n,d){var i,u,l,h=e.addonBefore,b=h===void 0?(i=r.addonBefore)===null||i===void 0?void 0:i.call(r):h,C=e.addonAfter,g=C===void 0?(u=r.addonAfter)===null||u===void 0?void 0:u.call(r):C,_=e.size,x=e.direction,F=e.hidden;if(!ee({addonBefore:b,addonAfter:g}))return d;var w="".concat(n,"-group"),z="".concat(w,"-addon"),j=b?A("span",{class:z},[b]):null,D=g?A("span",{class:z},[g]):null,R=N("".concat(n,"-wrapper"),w,f({},"".concat(w,"-rtl"),x==="rtl")),E=N("".concat(n,"-group-wrapper"),(l={},f(l,"".concat(n,"-group-wrapper-sm"),_==="small"),f(l,"".concat(n,"-group-wrapper-lg"),_==="large"),f(l,"".concat(n,"-group-wrapper-rtl"),x==="rtl"),l),o.class);return A("span",{class:E,style:o.style,hidden:F},[A("span",{class:R},[j,L(d,{style:null}),D])])},T=function(n,d){var i,u=e.value,l=e.allowClear,h=e.direction,b=e.bordered,C=e.hidden,g=e.addonAfter,_=g===void 0?r.addonAfter:g,x=e.addonBefore,F=x===void 0?r.addonBefore:x;if(!l)return L(d,{value:u});var w=N("".concat(n,"-affix-wrapper"),"".concat(n,"-affix-wrapper-textarea-with-clear-btn"),(i={},f(i,"".concat(n,"-affix-wrapper-rtl"),h==="rtl"),f(i,"".concat(n,"-affix-wrapper-borderless"),!b),f(i,"".concat(o.class),!ee({addonAfter:_,addonBefore:F})&&o.class),i));return A("span",{class:w,style:o.style,hidden:C},[L(d,{style:null,value:u}),y(n)])};return function(){var $,n=e.prefixCls,d=e.inputType,i=e.element,u=i===void 0?($=r.element)===null||$===void 0?void 0:$.call(r):i;return d===Se[0]?T(n,u):k(n,U(n,u))}}});function te(t){return typeof t>"u"||t===null?"":String(t)}function re(t,e,v,r){if(v){var o=e;if(e.type==="click"){Object.defineProperty(o,"target",{writable:!0}),Object.defineProperty(o,"currentTarget",{writable:!0});var p=t.cloneNode(!0);o.target=p,o.currentTarget=p,p.value="",v(o);return}if(r!==void 0){Object.defineProperty(o,"target",{writable:!0}),Object.defineProperty(o,"currentTarget",{writable:!0}),o.target=t,o.currentTarget=t,t.value=r,v(o);return}v(o)}}function Ie(t,e){if(t){t.focus(e);var v=e||{},r=v.cursor;if(r){var o=t.value.length;switch(r){case"start":t.setSelectionRange(0,0);break;case"end":t.setSelectionRange(o,o);break;default:t.setSelectionRange(0,o)}}}}const ze=oe({compatConfig:{MODE:3},name:"AInput",inheritAttrs:!1,props:Ce(),setup:function(e,v){var r=v.slots,o=v.attrs,p=v.expose,P=v.emit,y=W(),Y=W(),U,k=Be(),T=pe("input",e),$=T.direction,n=T.prefixCls,d=T.size,i=T.autocomplete,u=W(e.value===void 0?e.defaultValue:e.value),l=W(!1);ne(function(){return e.value},function(){u.value=e.value}),ne(function(){return e.disabled},function(){e.value!==void 0&&(u.value=e.value),e.disabled&&(l.value=!1)});var h=function(){U=setTimeout(function(){var a;((a=y.value)===null||a===void 0?void 0:a.getAttribute("type"))==="password"&&y.value.hasAttribute("value")&&y.value.removeAttribute("value")})},b=function(a){Ie(y.value,a)},C=function(){var a;(a=y.value)===null||a===void 0||a.blur()},g=function(a,s,I){var B;(B=y.value)===null||B===void 0||B.setSelectionRange(a,s,I)},_=function(){var a;(a=y.value)===null||a===void 0||a.select()};p({focus:b,blur:C,input:y,stateValue:u,setSelectionRange:g,select:_});var x=function(a){var s=e.onFocus;l.value=!0,s==null||s(a),J(function(){h()})},F=function(a){var s=e.onBlur;l.value=!1,s==null||s(a),k.onFieldBlur(),J(function(){h()})},w=function(a){P("update:value",a.target.value),P("change",a),P("input",a),k.onFieldChange()},z=we(),j=function(a,s){u.value!==a&&(e.value===void 0?u.value=a:J(function(){y.value.value!==u.value&&z.update()}),J(function(){s&&s()}))},D=function(a){re(y.value,a,w),j("",function(){b()})},R=function(a){var s=a.target,I=s.value,B=s.composing;if(!((a.isComposing||B)&&e.lazy||u.value===I)){var M=a.target.value;re(y.value,a,w),j(M,function(){h()})}},E=function(a){a.keyCode===13&&P("pressEnter",a),P("keydown",a)};ye(function(){h()}),me(function(){clearTimeout(U)});var q=function(){var a,s=e.addonBefore,I=s===void 0?r.addonBefore:s,B=e.addonAfter,M=B===void 0?r.addonAfter:B,O=e.disabled,G=e.bordered,X=G===void 0?!0:G,V=e.valueModifiers,ie=V===void 0?{}:V,de=e.htmlSize,ae=Q(e,["prefixCls","onPressEnter","addonBefore","addonAfter","prefix","suffix","allowClear","defaultValue","size","bordered","htmlSize","lazy","showCount","valueModifiers"]),H=S(S(S({},ae),o),{},{autocomplete:i.value,onChange:R,onInput:R,onFocus:x,onBlur:F,onKeydown:E,class:N(le(n.value,X,d.value,O,$.value),f({},o.class,o.class&&!I&&!M)),ref:y,key:"ant-input",size:de,id:(a=ae.id)!==null&&a!==void 0?a:k.id.value});ie.lazy&&delete H.onInput,H.autofocus||delete H.autofocus;var fe=A("input",Q(H,["size"]),null);return be(fe,[[Ae]])},Z=function(){var a,s=u.value,I=e.maxlength,B=e.suffix,M=B===void 0?(a=r.suffix)===null||a===void 0?void 0:a.call(r):B,O=e.showCount,G=Number(I)>0;if(M||O){var X=ge(te(s)).length,V=null;return xe(O)==="object"?V=O.formatter({count:X,maxlength:I}):V="".concat(X).concat(G?" / ".concat(I):""),A(he,null,[!!O&&A("span",{class:N("".concat(n.value,"-show-count-suffix"),f({},"".concat(n.value,"-show-count-has-suffix"),!!M))},[V]),M])}return null};return function(){var c=S(S(S({},o),e),{},{prefixCls:n.value,inputType:"input",value:te(u.value),handleReset:D,focused:l.value&&!e.disabled});return A($e,S(S({},Q(c,["element","valueModifiers","suffix","showCount"])),{},{ref:Y}),S(S({},r),{},{element:q,suffix:Z}))}}});export{$e as C,ze as I,Ie as a,te as f,Ce as i,re as r,Pe as t};
