import{q as S,d as p,v as _,g as r,_ as a,x as f,y as D,b as v}from"./index-55927906.js";var b=function(){return{prefixCls:String,type:{type:String,default:"horizontal"},dashed:{type:Boolean,default:!1},orientation:{type:String,default:"center"},plain:{type:Boolean,default:!1},orientationMargin:[String,Number]}},P=p({compatConfig:{MODE:3},name:"ADivider",props:b(),setup:function(n,g){var l=g.slots,u=_("divider",n),o=u.prefixCls,h=u.direction,c=r(function(){return n.orientation==="left"&&n.orientationMargin!=null}),d=r(function(){return n.orientation==="right"&&n.orientationMargin!=null}),m=r(function(){var t,i=n.type,C=n.dashed,M=n.plain,e=o.value;return t={},a(t,e,!0),a(t,"".concat(e,"-").concat(i),!0),a(t,"".concat(e,"-dashed"),!!C),a(t,"".concat(e,"-plain"),!!M),a(t,"".concat(e,"-rtl"),h.value==="rtl"),a(t,"".concat(e,"-no-default-orientation-margin-left"),c.value),a(t,"".concat(e,"-no-default-orientation-margin-right"),d.value),t}),y=r(function(){var t=typeof n.orientationMargin=="number"?"".concat(n.orientationMargin,"px"):n.orientationMargin;return f(f({},c.value&&{marginLeft:t}),d.value&&{marginRight:t})}),x=r(function(){return n.orientation.length>0?"-"+n.orientation:n.orientation});return function(){var t,i=D((t=l.default)===null||t===void 0?void 0:t.call(l));return v("div",{class:[m.value,i.length?"".concat(o.value,"-with-text ").concat(o.value,"-with-text").concat(x.value):""],role:"separator"},[i.length?v("span",{class:"".concat(o.value,"-inner-text"),style:y.value},[i]):null])}}});const w=S(P);export{w as D};
