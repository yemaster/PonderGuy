import{d as w,t as y,c as S,o as m,a as g,r as v,e as h,G as b,q as e,n as _,g as $,H as B,b as l,f as z,j as x,k as I,w as M}from"./index-DpkYZs8z.js";const N=w({__name:"pgButton",props:{color:{type:String,default:"#1780db"},mode:{type:String,default:"round"},size:{type:String,default:"medium"}},setup(r){const c=r,{color:s,size:i,mode:d}=y(c),t=S(()=>{const a=parseInt(s.value.substring(1,3),16),u=parseInt(s.value.substring(3,5),16),p=parseInt(s.value.substring(5,7),16);return a*.299+u*.587+p*.114>=192?"#212223":"#fcfbfe"});return(a,u)=>(m(),g("button",{class:b(["pg-button",`${e(i)} ${e(d)}`]),style:_({backgroundColor:e(s),color:t.value})},[v(a.$slots,"default",{},()=>[h("wee")])],6))}}),V={class:"pg-modal-text"},A={key:0,class:"pg-modal-title"},T={class:"pg-modal-content"},j={class:"pg-modal-append"},D=w({__name:"pgModal",props:{title:String,show:Boolean,backgroundColor:{type:String,default:"#ffffff"},mode:{type:String,default:"round"},backClick:{type:Boolean,default:!0},showAppend:{type:Boolean,default:!0}},emits:["update:show"],setup(r,{emit:c}){const s=r,i=c,{title:d,show:t,backClick:a,mode:u,showAppend:p}=y(s),f=$(t.value);function k(o=!1){(a.value||o)&&i("update:show",!t.value)}return B(()=>t.value,o=>{setTimeout(()=>{f.value=o},o===!0?0:200)}),(o,n)=>(m(),g("div",{class:b(["pg-modal",{show:f.value,hide:!f.value,"show-append":e(p)}])},[l("div",{class:"pg-modal-back",onClick:n[0]||(n[0]=C=>k())}),l("div",{class:b(["pg-modal-container",{show:e(t),hide:!e(t),round:e(u)==="round"}]),style:_(`background-color: ${r.backgroundColor}`)},[l("div",V,[e(d)?(m(),g("div",A,z(e(d)),1)):x("",!0),l("div",T,[v(o.$slots,"content",{},()=>[h("Modal Info")])])]),l("div",j,[v(o.$slots,"append",{},()=>[I(N,{size:"small",onClick:n[1]||(n[1]=C=>k(!0))},{default:M(()=>[h("关闭")]),_:1})])])],6)],2))}});export{D as _,N as a};