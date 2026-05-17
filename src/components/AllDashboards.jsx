import { useState, useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────
   DESIGN SYSTEM
───────────────────────────────────────────────────────────── */
const C = {
  // Primary Brand
  teal:"#0ea5e9", tealDk:"#0284c7", tealLt:"#38bdf8",
  cyan:"#06b6d4", cyanDk:"#0891b2",
  // Sky blues
  sky50:"#f0f9ff", sky100:"#e0f2fe", sky200:"#bae6fd", sky300:"#7dd3fc",
  // Neutrals
  white:"#ffffff", slate50:"#f8fafc", slate100:"#f1f5f9",
  slate200:"#e2e8f0", slate300:"#cbd5e1", slate400:"#94a3b8",
  slate500:"#64748b", slate600:"#475569", slate700:"#334155",
  slate800:"#1e293b", slate900:"#0f172a",
  // Status
  red:"#ef4444", redLt:"#fef2f2", redBd:"#fecaca",
  orange:"#f97316", orangeLt:"#fff7ed", orangeBd:"#fed7aa",
  green:"#22c55e", greenLt:"#f0fdf4", greenBd:"#bbf7d0",
  yellow:"#eab308", yellowLt:"#fefce8", yellowBd:"#fde68a",
  purple:"#8b5cf6", purpleLt:"#f5f3ff",
  // Dark theme (SuperAdmin)
  dark900:"#071525", dark800:"#0c1f35", dark700:"#0f2744",
  dark600:"#1a3a5c", darkBd:"#1e3a5f", darkText:"#7db8d8",
};

const GS = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900&display=swap');
    *{margin:0;padding:0;box-sizing:border-box;}
    html{scroll-behavior:smooth;}
    body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;background:${C.sky50};}
    input,button,textarea,select{font-family:inherit;}
    button{cursor:pointer;}
    a{text-decoration:none;}
    ::-webkit-scrollbar{width:4px;height:4px;}
    ::-webkit-scrollbar-thumb{background:${C.sky200};border-radius:9px;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
    @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,.45)}60%{box-shadow:0 0 0 7px rgba(34,197,94,0)}}
    @keyframes pulseRed{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.45)}60%{box-shadow:0 0 0 7px rgba(239,68,68,0)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes slideIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}
    .fade-up{animation:fadeUp .6s ease both;}
    .float{animation:float 5s ease-in-out infinite;}
    .slide-in{animation:slideIn .3s ease both;}
    .hover-card{transition:transform .2s,box-shadow .2s;}
    .hover-card:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(14,165,233,.18)!important;}
  `}</style>
);

/* ─────────────────────────────────────────────────────────────
   SVG ICON HELPER
───────────────────────────────────────────────────────────── */
const paths = {
  home:"M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
  check:"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
  ok:"M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
  wrench:"M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z",
  box:"M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z",
  bell:"M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z",
  user:"M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z",
  users:"M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
  activity:"M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3z",
  thumbsup:"M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z",
  alert:"M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
  arrow:"M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z",
  chevron:"M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z",
  chevL:"M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z",
  search:"M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
  plus:"M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
  logout:"M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z",
  shield:"M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z",
  building:"M17 11V3H7v4H3v14h8v-4h2v4h8V11h-4zM7 19H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5v-2h2v2zm4 4H9v-2h2v2zm0-4H9v-2h2v2zm0-4H9V5h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V5h2v2zm4 12h-2v-2h2v2zm0-4h-2v-2h2v2z",
  clock:"M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z",
  map:"M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z",
  phone:"M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z",
  star:"M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
  zap:"M7 2v11h3v9l7-12h-4l4-8z",
  dollar:"M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z",
  trend:"M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z",
  download:"M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z",
  filter:"M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z",
  grid:"M3 3h7v7H3zm0 11h7v7H3zm11-11h7v7h-7zm0 11h7v7h-7z",
  calendar:"M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z",
  eye:"M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z",
  qr:"M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 13h2v2h-2zm2 2h2v2h-2zm2-2h2v2h-2zm-4 4h2v2h-2zm2 2h2v2h-2zm2-2h2v2h-2z",
  refresh:"M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z",
  file:"M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z",
  settings:"M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z",
  moon:"M10 2c-1.82 0-3.53.5-5 1.35C7.99 5.08 10 8.3 10 12s-2.01 6.92-5 8.65C6.47 21.5 8.18 22 10 22c5.52 0 10-4.48 10-10S15.52 2 10 2z",
  sun:"M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z",
  barChart:"M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z",
  trendUp:"M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z",
  trendDn:"M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z",
  moreV:"M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z",
};
function Ic({ n, s=18, col="currentColor", fill, sw=0, style={} }) {
  const d = paths[n]||"";
  const fc = fill ?? col;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={fc} stroke="none" strokeWidth={sw} style={{flexShrink:0,...style}}>
      {d.split(" M").map((seg,i)=><path key={i} d={i===0?seg:"M"+seg}/>)}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   MICRO COMPONENTS
───────────────────────────────────────────────────────────── */
function Badge({color="teal",children,dot=false}) {
  const m={
    red:{bg:C.redLt,text:C.red},orange:{bg:C.orangeLt,text:C.orange},
    yellow:{bg:C.yellowLt,text:"#92400e"},green:{bg:C.greenLt,text:"#15803d"},
    blue:{bg:"#eff6ff",text:"#1d4ed8"},teal:{bg:C.sky100,text:C.tealDk},
    gray:{bg:C.slate100,text:C.slate600},purple:{bg:C.purpleLt,text:C.purple},
  };
  const c=m[color]||m.teal;
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,background:c.bg,color:c.text,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:99,whiteSpace:"nowrap"}}>
    {dot&&<div style={{width:5,height:5,borderRadius:"50%",background:c.text}}/>}{children}
  </span>;
}

function Card({children,style={},onClick,dark=false}) {
  return <div onClick={onClick} style={{
    background:dark?C.dark700:C.white,
    border:`1px solid ${dark?C.darkBd:C.sky100}`,
    borderRadius:8,padding:"16px 18px",
    boxShadow:`0 1px 4px rgba(14,165,233,${dark?.03:.04})`,
    cursor:onClick?"pointer":"default",
    transition:"box-shadow .18s",
    ...style
  }}>{children}</div>;
}

function ProgressBar({pct,color=C.teal,h=6,bg=C.sky100,dark=false}) {
  return <div style={{height:h,background:dark?"rgba(255,255,255,.1)":bg,borderRadius:h,overflow:"hidden"}}>
    <div style={{width:`${Math.min(100,Math.max(0,pct))}%`,height:"100%",background:color,borderRadius:h,transition:"width .5s"}}/>
  </div>;
}

function SparkLine({data,color,w=80,h=34}) {
  if(!data?.length) return null;
  const mn=Math.min(...data),mx=Math.max(...data),rng=mx-mn||1;
  const pts=data.map((v,i)=>{
    const x=(i/(data.length-1))*w;
    const y=h-((v-mn)/rng)*(h-6)-3;
    return `${x},${y}`;
  }).join(" ");
  const id=`sg${color.replace(/[^a-z0-9]/gi,"")}`;
  return <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow:"visible"}}>
    <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={color} stopOpacity=".2"/><stop offset="100%" stopColor={color} stopOpacity="0"/>
    </linearGradient></defs>
    <polygon fill={`url(#${id})`} points={`0,${h} ${pts} ${w},${h}`}/>
    <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pts}/>
    {data.map((v,i)=>{
      const x=(i/(data.length-1))*w, y=h-((v-mn)/rng)*(h-6)-3;
      return i===data.length-1?<circle key={i} cx={x} cy={y} r="3" fill={color} stroke={C.white} strokeWidth="1.5"/>:null;
    })}
  </svg>;
}

function MiniBar({data,color,days=["S","S","R","K","J","S","M"],dark=false}) {
  const mx=Math.max(...data,1);
  return <div style={{display:"flex",gap:5,alignItems:"flex-end",height:52}}>
    {data.map((v,i)=>(
      <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
        <div style={{width:"100%",height:44,background:dark?"rgba(255,255,255,.08)":C.sky100,borderRadius:6,display:"flex",alignItems:"flex-end",overflow:"hidden"}}>
          <div style={{width:"100%",height:`${(v/mx)*100}%`,background:color,borderRadius:6,transition:"height .4s"}}/>
        </div>
        <span style={{fontSize:8,color:dark?C.darkText:C.slate400,fontWeight:600}}>{days[i]}</span>
      </div>
    ))}
  </div>;
}

function StatusDot({s}) {
  const c={completed:C.green,in_progress:C.teal,assigned:C.orange,overdue:C.red,active:C.red,resolved:C.green}[s]||C.slate300;
  return <div style={{width:8,height:8,borderRadius:"50%",background:c,flexShrink:0,boxShadow:`0 0 0 2px ${c}33`}}/>;
}

function Input({value,onChange,placeholder,type="text",style={}}) {
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder}
    style={{width:"100%",padding:"10px 13px",borderRadius:10,border:`1.5px solid ${C.sky200}`,fontSize:13,
      color:C.slate800,outline:"none",background:C.white,transition:"border .2s",...style}}
    onFocus={e=>e.target.style.borderColor=C.teal} onBlur={e=>e.target.style.borderColor=C.sky200}/>;
}

/* ─────────────────────────────────────────────────────────────
   FAKE DATA
───────────────────────────────────────────────────────────── */
const D = {
  monthChart:[
    {m:"Jan",PM:72,WO:41,target:80},{m:"Feb",PM:68,WO:38,target:80},{m:"Mar",PM:81,WO:52,target:80},
    {m:"Apr",PM:77,WO:45,target:80},{m:"Mei",PM:85,WO:58,target:80},{m:"Jun",PM:79,WO:44,target:80},
    {m:"Jul",PM:88,WO:61,target:80},{m:"Agt",PM:84,WO:55,target:80},{m:"Sep",PM:91,WO:63,target:80},
    {m:"Okt",PM:87,WO:57,target:80},{m:"Nov",PM:93,WO:66,target:80},{m:"Des",PM:90,WO:60,target:80},
  ],
  alarms:[
    {id:1,title:"Sub-Panel Lt.5 Suhu Tinggi",sev:"major",loc:"Ruang Panel Lt.5 · Lt.5",time:"14:23",status:"active"},
    {id:2,title:"AC Indoor Lt.5 Unit-1 Filter Kotor",sev:"warning",loc:"Lt.5 Ruang Tenant 1 · Lt.5",time:"13:10",status:"active"},
    {id:3,title:"Pompa Hydrant Pressure Drop",sev:"critical",loc:"Basement B1 · Shaft Plumbing",time:"11:45",status:"active"},
    {id:4,title:"UPS Battery Low — Server Room",sev:"emergency",loc:"Lt.3 · Server Room",time:"10:30",status:"active"},
  ],
  workorders:[
    {id:"WO-0241",title:"Kebocoran Pipa Lt.5",priority:"emergency",status:"assigned",floor:"5",loc:"Toilet Pria",due:"Hari ini",assignee:"Budi S."},
    {id:"WO-0238",title:"AC Tidak Dingin R.102",priority:"high",status:"in_progress",floor:"1",loc:"Ruang Rapat",due:"Besok",assignee:"Andi P."},
    {id:"WO-0235",title:"Lampu Koridor Mati",priority:"medium",status:"in_progress",floor:"3",loc:"Koridor A",due:"2 hari",assignee:"Rizky M."},
    {id:"WO-0229",title:"Handle Pintu Rusak",priority:"low",status:"completed",floor:"2",loc:"R.Direksi",due:"Selesai",assignee:"Hendra K."},
    {id:"WO-0225",title:"Pompa Air Bocor",priority:"high",status:"assigned",floor:"R",loc:"Rooftop",due:"Hari ini",assignee:"Budi S."},
  ],
  tasks_tek:[
    {id:1,title:"Pengecekan AC Lantai 3",status:"in_progress",time:"08:00",cat:"HVAC",steps:6,pct:50},
    {id:2,title:"Inspeksi Panel Listrik B2",status:"assigned",time:"10:00",cat:"Electrical",steps:4,pct:0},
    {id:3,title:"Service Pompa Air Rooftop",status:"completed",time:"07:00",cat:"Plumbing",steps:8,pct:100},
    {id:4,title:"Pengecekan Genset Basement",status:"overdue",time:"09:00",cat:"Mechanical",steps:5,pct:20},
    {id:5,title:"Kalibrasi Sensor CO2 Lt.4",status:"assigned",time:"14:00",cat:"HVAC",steps:3,pct:0},
  ],
  tasks_hk:[
    {id:1,title:"Pembersihan Lobby Utama",status:"completed",time:"07:00",cat:"Lobby",steps:5,pct:100},
    {id:2,title:"Pembersihan Toilet Lt.2",status:"in_progress",time:"09:00",cat:"Toilet",steps:7,pct:42},
    {id:3,title:"Mopping Koridor Lt.3",status:"assigned",time:"11:00",cat:"Koridor",steps:4,pct:0},
    {id:4,title:"Pembersihan Pantry Lt.4",status:"overdue",time:"10:00",cat:"Pantry",steps:3,pct:33},
    {id:5,title:"Lap Kaca Fasad Lt.1",status:"assigned",time:"13:00",cat:"Eksterior",steps:6,pct:0},
  ],
  materials:[
    {id:1,name:"Filter AC",cat:"HVAC",stock:12,min:5,unit:"pcs",low:false},
    {id:2,name:"Kabel NYY 4x2.5",cat:"Electrical",stock:2,min:5,unit:"m",low:true},
    {id:3,name:"Seal Pipa 1\"",cat:"Plumbing",stock:30,min:10,unit:"pcs",low:false},
    {id:4,name:"Oli Pompa 10W40",cat:"Mechanical",stock:3,min:4,unit:"ltr",low:true},
    {id:5,name:"Lampu TL 40W",cat:"Electrical",stock:8,min:10,unit:"pcs",low:true},
  ],
  monitoring:[
    {label:"Suhu Chiller",value:"7.2°C",target:"6–8°C",unit:"°C",ok:true,data:[7.1,7.3,6.9,7.2,7.5,7.1,7.2]},
    {label:"Voltage Panel A",value:"218 V",target:"210–230V",unit:"V",ok:true,data:[220,219,218,221,217,219,218]},
    {label:"Tekanan Pompa",value:"3.8 bar",target:"3.5–4.5",unit:"bar",ok:true,data:[3.7,3.9,3.8,4.0,3.8,3.9,3.8]},
    {label:"Suhu Genset",value:"95°C",target:"< 90°C",unit:"°C",ok:false,data:[80,83,86,89,91,93,95]},
  ],
  approvals:[
    {id:"REQ-041",title:"Kabel NYY 4x2.5 — 10m",type:"material",status:"pending",by:"Budi S.",date:"Kemarin"},
    {id:"REQ-039",title:"Filter AC x5 pcs",type:"material",status:"approved",by:"Rina W.",date:"3 hari lalu"},
    {id:"WO-ESC-003",title:"Eskalasi WO-0241 ke Emergency",type:"eskalasi",status:"pending",by:"Doni K.",date:"Kemarin"},
  ],
  visitors:[
    {id:1,name:"Ahmad Dhani",host:"PT Sinarmas — Lt.8",purpose:"Meeting",in:"09:15",status:"on_premise",id_type:"KTP"},
    {id:2,name:"Sari Indah",host:"PT Tokopedia — Lt.12",purpose:"Interview",in:"10:30",status:"on_premise",id_type:"KTP"},
    {id:3,name:"Bimo Wicaksono",host:"Direksi — Lt.20",purpose:"Delivery",in:"11:00",status:"scheduled",id_type:"SIM"},
  ],
  companies:[
    {id:1,name:"PT Gedung Properti Indonesia",email:"admin@properti.co.id",plan:"starter",status:"trial",buildings:2,users:10,mrr:0,date:"14/5/2026"},
    {id:2,name:"PT Menara Sentosa",email:"admin@menara.co.id",plan:"professional",status:"active",buildings:5,users:48,mrr:6900000,date:"1/3/2026"},
    {id:3,name:"Graha Perkasa Group",email:"ops@grahaperkasa.id",plan:"enterprise",status:"active",buildings:12,users:120,mrr:15000000,date:"10/1/2026"},
  ],
  users:[
    {id:1,name:"Budi Santoso",email:"budi@soma.id",role:"teknisi",status:"active",last:"15/5 09:41"},
    {id:2,name:"Rina Wulandari",email:"rina@soma.id",role:"spv_teknisi",status:"active",last:"15/5 08:30"},
    {id:3,name:"Ahmad Fauzi",email:"ahmad@soma.id",role:"housekeeping",status:"active",last:"15/5 10:00"},
    {id:4,name:"Dewi Lestari",email:"dewi@soma.id",role:"building_admin",status:"active",last:"15/5 07:50"},
    {id:5,name:"Hendra Kurnia",email:"hendra@soma.id",role:"teknisi",status:"inactive",last:"10/5 14:20"},
  ],
  assets:[
    {id:"AST-001",name:"Chiller Unit A",cat:"HVAC",loc:"Basement B1",status:"operational",last_service:"01/04/2026"},
    {id:"AST-002",name:"Panel Listrik MDP",cat:"Electrical",loc:"Basement B2",status:"operational",last_service:"15/03/2026"},
    {id:"AST-003",name:"Pompa Hydrant P1",cat:"Plumbing",loc:"Basement B1",status:"maintenance",last_service:"10/05/2026"},
    {id:"AST-004",name:"Genset Caterpillar",cat:"Mechanical",loc:"Basement B2",status:"operational",last_service:"20/04/2026"},
    {id:"AST-005",name:"AC Central Lt.5",cat:"HVAC",loc:"Shaft Lt.5",status:"breakdown",last_service:"01/05/2026"},
  ],
};

/* ─────────────────────────────────────────────────────────────
   STATUS/CONFIG MAPS
───────────────────────────────────────────────────────────── */
const sevCfg={
  emergency:{c:C.red,bg:C.redLt,bd:C.redBd,label:"🔴 Emergency"},
  critical:{c:C.orange,bg:C.orangeLt,bd:C.orangeBd,label:"🟠 Critical"},
  major:{c:C.orange,bg:C.orangeLt,bd:C.orangeBd,label:"🟠 Major"},
  warning:{c:C.yellow,bg:C.yellowLt,bd:C.yellowBd,label:"🟡 Warning"},
};
const prioCfg={
  emergency:{col:"red",label:"Emergency"},high:{col:"orange",label:"High"},
  medium:{col:"yellow",label:"Medium"},low:{col:"blue",label:"Low"},
};
const stsCfg={
  completed:{col:"green",label:"✅ Selesai"},in_progress:{col:"teal",label:"▶ Proses"},
  assigned:{col:"yellow",label:"📋 Pending"},overdue:{col:"red",label:"⚠️ Terlambat"},
  approved:{col:"green",label:"✅ Disetujui"},pending:{col:"yellow",label:"⏳ Menunggu"},
  on_premise:{col:"green",label:"🟢 On-site"},scheduled:{col:"blue",label:"📅 Terjadwal"},
  operational:{col:"green",label:"Operational"},maintenance:{col:"yellow",label:"Maintenance"},breakdown:{col:"red",label:"Breakdown"},
  active:{col:"green",label:"Active"},trial:{col:"blue",label:"Trial"},past_due:{col:"red",label:"Past Due"},
};
const roleLbl={teknisi:"Teknisi MEP",spv_teknisi:"SPV Teknisi",housekeeping:"Housekeeping",spv_housekeeping:"SPV HK",building_admin:"Admin Gedung",super_admin:"Super Admin"};

/* ═══════════════════════════════════════════════════════════════
   ███ MOBILE APP ███
═══════════════════════════════════════════════════════════════ */

// ── Mobile Dashboard ─────────────────────────────────────────
function MDashboard({role,nav}) {
  const isHK=role==="housekeeping"||role==="spv_housekeeping";
  const isSPV=role==="spv_teknisi"||role==="spv_housekeeping";
  const tasks=isHK?D.tasks_hk:D.tasks_tek;
  const done=tasks.filter(t=>t.status==="completed").length;
  const overdue=tasks.filter(t=>t.status==="overdue").length;
  const pct=Math.round((done/tasks.length)*100);
  return (
    <div style={{paddingBottom:16}}>
      {/* Gradient banner */}
      <div style={{margin:"0 -16px",padding:"16px 18px 18px",background:C.teal,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-20,right:-20,width:90,height:90,borderRadius:"50%",background:"rgba(255,255,255,.08)"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
          <div>
            <p style={{color:"rgba(255,255,255,.75)",fontSize:10,marginBottom:2}}>
              {new Date().toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"short"})}
            </p>
            <h2 style={{color:C.white,fontSize:18,fontWeight:900,letterSpacing:"-0.3px"}}>Halo, Budi 👋</h2>
            <p style={{color:"rgba(255,255,255,.65)",fontSize:10,marginTop:1}}>Soma Tower A · SCBD</p>
          </div>
          {isSPV&&<Badge color="purple">SPV</Badge>}
        </div>
        <div style={{background:"rgba(0,0,0,.12)",borderRadius:10,padding:"10px 14px"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <span style={{color:C.white,fontSize:11,fontWeight:700}}>Progress Hari Ini</span>
            <span style={{color:C.white,fontSize:12,fontWeight:800}}>{done}/{tasks.length}</span>
          </div>
          <div style={{height:5,background:"rgba(255,255,255,.2)",borderRadius:4}}>
            <div style={{height:5,background:C.white,borderRadius:4,width:`${pct}%`}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
            <p style={{color:"rgba(255,255,255,.65)",fontSize:9}}>{pct}% selesai</p>
            {overdue>0&&<p style={{color:"#fde68a",fontSize:9,fontWeight:700}}>⚠ {overdue} terlambat</p>}
          </div>
        </div>
      </div>
      <div style={{paddingTop:12}}>
        {D.alarms.length>0&&(
          <div onClick={()=>nav("monitor")} style={{background:C.redLt,border:`1px solid ${C.redBd}`,borderRadius:8,padding:"9px 12px",marginBottom:10,cursor:"pointer",borderLeft:`3px solid ${C.red}`}}>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <Ic n="bell" s={13} col={C.red}/>
              <span style={{fontSize:12,fontWeight:800,color:C.red}}>{D.alarms.length} alarm aktif</span>
              <Ic n="chevron" s={12} col={C.red} style={{marginLeft:"auto"}}/>
            </div>
          </div>
        )}
        {/* Stats 4-col */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:7,marginBottom:14}}>
          {[
            {label:"Tugas",value:tasks.length,col:C.teal},
            {label:"Selesai",value:done,col:C.green},
            {label:"Telat",value:overdue,col:C.red},
            {label:"Alarm",value:D.alarms.length,col:C.orange},
          ].map(k=>(
            <div key={k.label} style={{background:C.white,border:`1px solid ${C.sky100}`,borderRadius:8,padding:"8px 6px",textAlign:"center"}}>
              <p style={{fontSize:20,fontWeight:900,color:k.col,lineHeight:1}}>{k.value}</p>
              <p style={{fontSize:9,color:C.slate400,marginTop:3,fontWeight:600}}>{k.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <p style={{fontSize:11,fontWeight:800,color:C.slate600,marginBottom:8,textTransform:"uppercase",letterSpacing:.5}}>Quick Actions</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
          {[
            {label:isHK?"Checklist HK":"Checklist PM",emoji:"✅",c:C.teal,bg:"#e0f7fa",scr:"tugas"},
            {label:"Work Order",emoji:"🔧",c:C.orange,bg:"#fff3e0",scr:"tugas",hide:isHK&&!isSPV},
            {label:"Material",emoji:"📦",c:C.cyan,bg:"#e0f9ff",scr:"stok"},
            {label:isSPV?"Approval":"Monitoring",emoji:isSPV?"✔":"📡",c:isSPV?C.purple:C.green,bg:isSPV?"#f3e8ff":"#e8fef0",scr:isSPV?"stok":"monitor"},
          ].filter(q=>!q.hide).map(q=>(
            <button key={q.label} onClick={()=>nav(q.scr)}
              style={{background:C.white,border:`1px solid ${C.sky100}`,borderRadius:10,padding:"10px 10px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:9}}>
              <div style={{width:32,height:32,borderRadius:8,background:q.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{q.emoji}</div>
              <p style={{fontSize:11,fontWeight:700,color:C.slate700,lineHeight:1.3}}>{q.label}</p>
            </button>
          ))}
        </div>

        {/* Task preview */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <p style={{fontSize:11,fontWeight:800,color:C.slate600,textTransform:"uppercase",letterSpacing:.5}}>Task Hari Ini</p>
          <button onClick={()=>nav("tugas")} style={{fontSize:10,color:C.teal,fontWeight:700,background:"none",border:"none",cursor:"pointer"}}>Lihat semua →</button>
        </div>
        {tasks.slice(0,3).map(t=>(
          <div key={t.id} style={{background:C.white,border:`1px solid ${C.sky100}`,borderRadius:8,padding:"9px 12px",marginBottom:6,display:"flex",alignItems:"center",gap:9}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:t.status==="completed"?C.green:t.status==="overdue"?C.red:t.status==="in_progress"?C.teal:C.orange,flexShrink:0}}/>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontSize:12,fontWeight:700,color:C.slate800,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.title}</p>
              <p style={{fontSize:10,color:C.slate400}}>{t.time} · {t.cat}</p>
            </div>
            <Badge color={stsCfg[t.status]?.col}>{stsCfg[t.status]?.label}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Mobile Checklist ─────────────────────────────────────────
function MChecklist({role}) {
  const isHK=role==="housekeeping"||role==="spv_housekeeping";
  const tasks=isHK?D.tasks_hk:D.tasks_tek;
  const [active,setActive]=useState(null);
  const [step,setStep]=useState(0);
  const [ans,setAns]=useState({});
  const done=tasks.filter(t=>t.status==="completed").length;
  const STEPS=["Periksa kondisi awal","Dokumentasi visual","Lakukan prosedur","Verifikasi hasil","Catat temuan","Tanda tangan digital","Finalisasi laporan"];
  const OPTS=[["✅ Normal / OK","green"],["⚠️ Ada Temuan","yellow"],["🔧 Perlu Tindak Lanjut","red"]];
  if(active) {
    const p=Math.round((Object.keys(ans).length/active.steps)*100);
    return (
      <div style={{display:"flex",flexDirection:"column",minHeight:"100%"}}>
        <div style={{margin:"0 -16px -16px",background:`linear-gradient(135deg,${C.teal},${C.cyan})`,padding:"16px 20px 20px"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
            <button onClick={()=>{setActive(null);setStep(0);setAns({});}} style={{background:"rgba(255,255,255,.18)",border:"none",borderRadius:8,padding:"5px 12px",color:C.white,fontSize:12,fontWeight:700,cursor:"pointer"}}>← Kembali</button>
            <span style={{color:"rgba(255,255,255,.8)",fontSize:12}}>{step+1}/{active.steps}</span>
          </div>
          <p style={{color:C.white,fontSize:15,fontWeight:800,marginBottom:12}}>{active.title}</p>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{flex:1,height:6,background:"rgba(255,255,255,.25)",borderRadius:6}}>
              <div style={{height:6,background:C.white,borderRadius:6,width:`${p}%`}}/>
            </div>
            <span style={{color:C.white,fontSize:11,fontWeight:700}}>{p}%</span>
          </div>
        </div>
        <div style={{flex:1,paddingTop:20}}>
          <div style={{background:`${C.teal}12`,borderRadius:12,padding:"10px 14px",marginBottom:14}}>
            <p style={{fontSize:12,fontWeight:700,color:C.tealDk}}>Langkah {step+1}: {STEPS[step%STEPS.length]}</p>
          </div>
          {OPTS.map(([lbl,col])=>(
            <div key={lbl} onClick={()=>setAns(a=>({...a,[step]:lbl}))}
              style={{padding:"14px 16px",borderRadius:14,marginBottom:9,cursor:"pointer",
                border:`2px solid ${ans[step]===lbl?C.teal:C.slate200}`,
                background:ans[step]===lbl?`${C.teal}0e`:C.white,
                color:ans[step]===lbl?C.tealDk:C.slate700,fontWeight:600,fontSize:13,transition:"all .15s"}}>
              {lbl}
            </div>
          ))}
        </div>
        <div>
          {step<active.steps-1
            ?<button disabled={!ans[step]} onClick={()=>setStep(s=>s+1)}
                style={{width:"100%",padding:"14px",borderRadius:14,fontSize:14,fontWeight:800,border:"none",
                  background:ans[step]?`linear-gradient(135deg,${C.teal},${C.cyan})`:C.slate200,
                  color:ans[step]?C.white:C.slate400,cursor:ans[step]?"pointer":"not-allowed"}}>
                Selanjutnya →
              </button>
            :<button onClick={()=>{setActive(null);setStep(0);setAns({});}}
                style={{width:"100%",padding:"14px",borderRadius:14,fontSize:14,fontWeight:800,border:"none",background:`linear-gradient(135deg,${C.green},#16a34a)`,color:C.white,cursor:"pointer"}}>
                ✅ Selesaikan & Kirim
              </button>
          }
          {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{width:"100%",marginTop:8,padding:"9px",background:"none",border:"none",fontSize:13,color:C.slate400,cursor:"pointer"}}>← Langkah Sebelumnya</button>}
        </div>
      </div>
    );
  }
  return (
    <div>
      {/* Progress summary — compact */}
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:C.sky50,borderRadius:10,marginBottom:12,border:`1px solid ${C.sky100}`}}>
        <div style={{position:"relative",width:44,height:44,flexShrink:0}}>
          <svg width="44" height="44" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r="17" fill="none" stroke={C.slate200} strokeWidth="4"/>
            <circle cx="22" cy="22" r="17" fill="none" stroke={C.teal} strokeWidth="4"
              strokeDasharray={`${2*Math.PI*17*done/tasks.length} ${2*Math.PI*17}`}
              strokeLinecap="round" transform="rotate(-90 22 22)"/>
          </svg>
          <span style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:C.teal}}>{Math.round(done/tasks.length*100)}%</span>
        </div>
        <div>
          <p style={{fontWeight:800,color:C.slate800,fontSize:13}}>Progress Checklist</p>
          <p style={{fontSize:11,color:C.slate500,marginTop:1}}>{done}/{tasks.length} selesai hari ini</p>
        </div>
        <div style={{marginLeft:"auto",textAlign:"right"}}>
          <p style={{fontSize:10,color:C.slate400}}>Berhasil</p>
          <p style={{fontSize:15,fontWeight:900,color:C.green}}>{done}</p>
        </div>
      </div>

      {/* Task list — compact cards */}
      {tasks.map(t=>{
        const isDone=t.status==="completed",isOver=t.status==="overdue";
        return (
          <div key={t.id} style={{marginBottom:8,background:isDone?C.greenLt:isOver?"#fff5f5":C.white,
            border:`1px solid ${isDone?C.greenBd:isOver?C.redBd:C.sky100}`,borderRadius:10,
            padding:"10px 12px",borderLeft:`3px solid ${isDone?C.green:isOver?C.red:C.teal}`}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:isDone?0:8}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:isDone?C.green:isOver?C.red:C.orange,flexShrink:0,marginTop:4}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:6}}>
                  <p style={{fontWeight:700,color:C.slate800,fontSize:12,lineHeight:1.3}}>{t.title}</p>
                  <Badge color={stsCfg[t.status]?.col}>{stsCfg[t.status]?.label}</Badge>
                </div>
                <p style={{fontSize:10,color:C.slate400,marginTop:2}}>🕐 {t.time} · {t.cat} · {t.steps} langkah</p>
                {t.pct>0&&t.pct<100&&<div style={{marginTop:5}}><ProgressBar pct={t.pct} h={3}/></div>}
              </div>
            </div>
            {!isDone&&(
              <button onClick={()=>{setActive(t);setStep(0);setAns({});}}
                style={{width:"100%",padding:"8px",borderRadius:8,fontSize:12,fontWeight:700,border:"none",cursor:"pointer",
                  background:isOver?C.red:C.teal,color:C.white}}>
                {t.status==="in_progress"?"▶ Lanjutkan":isOver?"⚠ Kerjakan Sekarang":"▶ Mulai Checklist"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Mobile Work Orders ────────────────────────────────────────
function MWorkOrders() {
  const [sel,setSel]=useState(null);
  if(sel) return (
    <div>
      <div style={{margin:"0 -16px -16px",background:`linear-gradient(135deg,${C.slate800},${C.slate700})`,padding:"16px 20px 22px"}}>
        <button onClick={()=>setSel(null)} style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:8,padding:"5px 12px",color:C.white,fontSize:12,cursor:"pointer",marginBottom:12}}>← Kembali</button>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div><p style={{color:"rgba(255,255,255,.5)",fontSize:11,marginBottom:3}}>{sel.id}</p><p style={{color:C.white,fontSize:16,fontWeight:800}}>{sel.title}</p></div>
          <Badge color={prioCfg[sel.priority]?.col}>{prioCfg[sel.priority]?.label}</Badge>
        </div>
      </div>
      <div style={{paddingTop:16}}>
        <Card style={{marginBottom:12}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            {[["Lantai",`Lt. ${sel.floor}`],["Lokasi",sel.loc],["Tenggat",sel.due],["Assignee",sel.assignee]].map(([l,v])=>(
              <div key={l}><p style={{fontSize:10,color:C.slate400,fontWeight:700,marginBottom:3}}>{l}</p><p style={{fontSize:13,fontWeight:700,color:C.slate700}}>{v}</p></div>
            ))}
          </div>
        </Card>
        <p style={{fontSize:13,fontWeight:800,color:C.slate700,marginBottom:10}}>Langkah Pengerjaan</p>
        {["Identifikasi sumber masalah","Siapkan alat & material","Lakukan perbaikan","Uji coba & verifikasi","Dokumentasi & laporan"].map((s,i)=>(
          <Card key={i} style={{marginBottom:8,padding:"11px 14px",display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:26,height:26,borderRadius:"50%",background:C.sky100,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{fontSize:11,fontWeight:800,color:C.teal}}>{i+1}</span>
            </div>
            <p style={{fontSize:13,color:C.slate700}}>{s}</p>
          </Card>
        ))}
        <button onClick={()=>setSel(null)} style={{width:"100%",marginTop:8,padding:"14px",borderRadius:14,fontSize:14,fontWeight:800,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${C.green},#16a34a)`,color:C.white}}>
          ✅ Tandai Selesai & Kirim
        </button>
      </div>
    </div>
  );
  return (
    <div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
        <button style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:99,background:C.sky100,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,color:C.teal}}>
          <Ic n="plus" s={12} col={C.teal}/> Buat WO Baru
        </button>
      </div>
      {D.workorders.map(wo=>(
        <Card key={wo.id} style={{marginBottom:10}} onClick={()=>setSel(wo)}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
            <span style={{fontSize:10,color:C.slate400,fontWeight:700,fontFamily:"monospace"}}>{wo.id}</span>
            <Badge color={prioCfg[wo.priority]?.col}>{prioCfg[wo.priority]?.label}</Badge>
          </div>
          <p style={{fontSize:14,fontWeight:800,color:C.slate800,marginBottom:6}}>{wo.title}</p>
          <div style={{display:"flex",gap:12,fontSize:11,color:C.slate400,marginBottom:10}}>
            <span>📍 Lt.{wo.floor} · {wo.loc}</span><span>⏰ {wo.due}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <Badge color={stsCfg[wo.status]?.col}>{stsCfg[wo.status]?.label}</Badge>
            <span style={{fontSize:11,color:C.teal,fontWeight:700}}>Buka →</span>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── Mobile Materials ──────────────────────────────────────────
function MMaterials() {
  const [tab,setTab]=useState("stock");
  const low=D.materials.filter(m=>m.low);
  return (
    <div>
      <div style={{display:"flex",gap:0,marginBottom:14,background:C.slate100,borderRadius:12,padding:3}}>
        {[["stock","📦 Stok"],["request","📋 Request"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)}
            style={{flex:1,padding:"8px",fontSize:12,fontWeight:700,border:"none",cursor:"pointer",borderRadius:10,
              background:tab===k?C.white:"transparent",color:tab===k?C.teal:C.slate400,
              boxShadow:tab===k?"0 1px 6px rgba(0,0,0,.08)":"none",transition:"all .2s"}}>
            {l}
          </button>
        ))}
      </div>
      {tab==="stock"&&(
        <>
          {low.length>0&&<Card style={{background:C.redLt,border:`1px solid ${C.redBd}`,marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}><Ic n="alert" s={13} col={C.red}/><span style={{fontSize:12,fontWeight:800,color:C.red}}>{low.length} stok rendah</span></div>
            {low.map(m=><p key={m.id} style={{fontSize:11,color:"#991b1b"}}>• {m.name} — sisa {m.stock} {m.unit}</p>)}
          </Card>}
          {D.materials.map(m=>(
            <Card key={m.id} style={{marginBottom:10,background:m.low?"#fff9f9":C.white,border:m.low?`1px solid ${C.redBd}`:undefined}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div><p style={{fontWeight:800,color:C.slate800,fontSize:13}}>{m.name}</p><p style={{fontSize:11,color:C.slate400,marginTop:2}}>{m.cat} · per {m.unit}</p></div>
                <div style={{textAlign:"right"}}><p style={{fontSize:24,fontWeight:900,color:m.low?C.red:C.teal,lineHeight:1}}>{m.stock}</p><p style={{fontSize:9,color:C.slate400}}>min: {m.min}</p></div>
              </div>
              <ProgressBar pct={Math.min(100,(m.stock/m.min)*50)} color={m.low?C.red:C.teal}/>
              {m.low&&<button onClick={()=>setTab("request")} style={{width:"100%",marginTop:10,padding:"8px",borderRadius:10,fontSize:12,fontWeight:700,border:"none",cursor:"pointer",background:C.redLt,color:C.red}}>+ Request Restock</button>}
            </Card>
          ))}
        </>
      )}
      {tab==="request"&&(
        <>
          <button style={{width:"100%",padding:"12px",borderRadius:14,fontSize:13,fontWeight:700,border:`2px dashed ${C.teal}`,cursor:"pointer",background:C.sky100,color:C.teal,marginBottom:14,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            <Ic n="plus" s={14} col={C.teal}/> Buat Request Material
          </button>
          {[{id:"REQ-042",mat:"Kabel NYY 4x2.5",qty:"10 m",status:"pending",date:"Kemarin"},
            {id:"REQ-040",mat:"Filter AC x5",qty:"5 pcs",status:"approved",date:"3 hari lalu"}].map(r=>(
            <Card key={r.id} style={{marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div><p style={{fontSize:10,color:C.slate400,fontFamily:"monospace",marginBottom:2}}>{r.id}</p><p style={{fontWeight:700,color:C.slate800,fontSize:13}}>{r.mat}</p><p style={{fontSize:11,color:C.slate400}}>{r.qty} · {r.date}</p></div>
                <Badge color={r.status==="pending"?"yellow":"green"}>{r.status==="pending"?"⏳ Pending":"✅ Disetujui"}</Badge>
              </div>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}

// ── Mobile Monitoring ─────────────────────────────────────────
function MMonitoring() {
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <p style={{fontSize:12,color:C.slate500}}>Live · Update real-time</p>
        <div style={{display:"flex",alignItems:"center",gap:6,background:C.greenLt,borderRadius:99,padding:"4px 10px"}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:C.green,animation:"pulse 2s infinite"}}/>
          <span style={{fontSize:10,fontWeight:700,color:"#15803d"}}>Online</span>
        </div>
      </div>
      {D.monitoring.map(m=>(
        <Card key={m.label} style={{marginBottom:12,border:!m.ok?`1px solid ${C.redBd}`:undefined}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div>
              <p style={{fontSize:11,color:C.slate400,fontWeight:700,marginBottom:4}}>{m.label}</p>
              <p style={{fontSize:26,fontWeight:900,color:m.ok?C.teal:C.red,lineHeight:1}}>{m.value}</p>
              <p style={{fontSize:10,color:C.slate400,marginTop:3}}>Target: {m.target}</p>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:10}}>
              <Badge color={m.ok?"green":"red"}>{m.ok?"✅ Normal":"⚠️ Abnormal"}</Badge>
              <SparkLine data={m.data} color={m.ok?C.teal:C.red}/>
            </div>
          </div>
          {!m.ok&&<div style={{background:C.redLt,borderRadius:10,padding:"8px 12px",fontSize:11,color:C.red,fontWeight:600}}>⚠️ Parameter di luar batas — tindakan diperlukan segera</div>}
        </Card>
      ))}
      <p style={{fontSize:13,fontWeight:800,color:C.slate700,marginBottom:10}}>Minggu Ini</p>
      <Card>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {[["PM Selesai",[5,7,6,8,6,5,8],C.teal],["WO Closed",[2,3,1,4,2,1,3],C.cyan]].map(([l,d,c])=>(
            <div key={l}><p style={{fontSize:10,fontWeight:700,color:C.slate400,marginBottom:8}}>{l}</p><MiniBar data={d} color={c}/></div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Mobile Alarms ─────────────────────────────────────────────
function MAlarms() {
  return (
    <div>
      <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
        {["Semua","Emergency","Critical","Major","Warning"].map(f=>(
          <button key={f} onClick={()=>{}} style={{padding:"5px 12px",borderRadius:99,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,background:f==="Semua"?C.teal:C.slate100,color:f==="Semua"?C.white:C.slate500}}>
            {f}
          </button>
        ))}
      </div>
      {D.alarms.map(a=>{
        const s=sevCfg[a.sev]||sevCfg.warning;
        return (
          <div key={a.id} style={{marginBottom:12,background:s.bg,border:`1px solid ${s.bd}`,borderRadius:16,padding:"14px 16px",borderLeft:`4px solid ${s.c}`}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
              <p style={{fontWeight:800,color:s.c,fontSize:13,lineHeight:1.3}}>{s.label} — {a.title}</p>
              <span style={{fontSize:10,color:C.slate400,fontWeight:700,flexShrink:0,marginLeft:8}}>{a.time}</span>
            </div>
            <p style={{fontSize:11,color:C.slate500,marginBottom:12}}>📍 {a.loc}</p>
            <div style={{display:"flex",gap:8}}>
              <button style={{flex:1,padding:"8px",borderRadius:10,fontSize:12,fontWeight:700,background:C.white,border:`1px solid ${s.bd}`,color:s.c,cursor:"pointer"}}>Acknowledge</button>
              <button style={{flex:1,padding:"8px",borderRadius:10,fontSize:12,fontWeight:700,background:s.c,border:"none",color:C.white,cursor:"pointer"}}>Resolve</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Mobile Approvals ──────────────────────────────────────────
function MApprovals() {
  const [tab,setTab]=useState("pending");
  const items=D.approvals.filter(a=>tab==="pending"?a.status==="pending":a.status==="approved");
  return (
    <div>
      <div style={{display:"flex",gap:0,marginBottom:14,background:C.slate100,borderRadius:12,padding:3}}>
        {[["pending","⏳ Menunggu"],["approved","✅ Disetujui"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)}
            style={{flex:1,padding:"8px",fontSize:12,fontWeight:700,border:"none",cursor:"pointer",borderRadius:10,
              background:tab===k?C.white:"transparent",color:tab===k?C.teal:C.slate400,
              boxShadow:tab===k?"0 1px 6px rgba(0,0,0,.08)":"none"}}>
            {l}
          </button>
        ))}
      </div>
      {items.length===0&&<p style={{textAlign:"center",color:C.slate400,padding:"40px 0",fontSize:13}}>Tidak ada item</p>}
      {items.map(a=>(
        <Card key={a.id} style={{marginBottom:10}}>
          <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:7}}>
            <Badge color={a.type==="material"?"blue":"orange"}>{a.type==="material"?"📦 Material":"⚠️ Eskalasi"}</Badge>
            <span style={{fontSize:10,color:C.slate400,fontFamily:"monospace"}}>{a.id}</span>
          </div>
          <p style={{fontSize:13,fontWeight:700,color:C.slate800,marginBottom:3}}>{a.title}</p>
          <p style={{fontSize:11,color:C.slate400,marginBottom:12}}>oleh {a.by} · {a.date}</p>
          {a.status==="pending"?(
            <div style={{display:"flex",gap:8}}>
              <button style={{flex:1,padding:"9px",borderRadius:10,fontSize:12,fontWeight:700,background:C.greenLt,border:`1px solid ${C.greenBd}`,color:"#15803d",cursor:"pointer"}}>✅ Setujui</button>
              <button style={{flex:1,padding:"9px",borderRadius:10,fontSize:12,fontWeight:700,background:C.redLt,border:`1px solid ${C.redBd}`,color:C.red,cursor:"pointer"}}>❌ Tolak</button>
            </div>
          ):<Badge color="green">✅ Sudah Disetujui</Badge>}
        </Card>
      ))}
    </div>
  );
}

// ── Mobile Profile ────────────────────────────────────────────
function MProfile({role,onToggleRole}) {
  return (
    <div>
      <Card style={{background:`linear-gradient(135deg,${C.teal},${C.cyan})`,textAlign:"center",padding:"28px 16px",marginBottom:16}}>
        <div style={{width:70,height:70,borderRadius:"50%",background:"rgba(255,255,255,.25)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",fontSize:24,fontWeight:900,color:C.white,border:"2px solid rgba(255,255,255,.4)"}}>
          BS
        </div>
        <p style={{color:C.white,fontSize:18,fontWeight:900,marginBottom:3}}>Budi Santoso</p>
        <p style={{color:"rgba(255,255,255,.75)",fontSize:12,marginBottom:14}}>{roleLbl[role]||role} · Soma Tower A</p>
        <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,.2)",borderRadius:99,padding:"4px 14px"}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:"#4ade80",animation:"pulse 2s infinite"}}/>
          <span style={{fontSize:11,color:C.white,fontWeight:700}}>Aktif hari ini</span>
        </div>
      </Card>
      <Card style={{marginBottom:12}}>
        {[["Email","budi.santoso@soma.co.id","user"],["Role",roleLbl[role]||role,"shield"],["Gedung","Soma Tower A - SCBD","building"],["Telepon","+62 812 3456 7890","phone"]].map(([l,v,n],i,arr)=>(
          <div key={l} style={{display:"flex",gap:12,alignItems:"center",padding:"11px 0",borderBottom:i<arr.length-1?`1px solid ${C.sky100}`:"none"}}>
            <div style={{width:34,height:34,borderRadius:9,background:C.sky100,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ic n={n} s={15} col={C.teal}/></div>
            <div><p style={{fontSize:10,color:C.slate400,fontWeight:700}}>{l}</p><p style={{fontSize:13,color:C.slate700,fontWeight:600}}>{v}</p></div>
          </div>
        ))}
      </Card>
      <Card style={{marginBottom:12,background:C.sky100}}>
        <p style={{fontSize:11,color:C.slate500,fontWeight:700,marginBottom:8}}>🔄 Demo — Ganti Role</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
          {[["teknisi","Teknisi"],["housekeeping","HK"],["spv_teknisi","SPV TEK"],["spv_housekeeping","SPV HK"]].map(([r,l])=>(
            <button key={r} onClick={()=>onToggleRole(r)}
              style={{padding:"8px",borderRadius:9,fontSize:11,fontWeight:700,border:"none",cursor:"pointer",
                background:role===r?C.teal:C.white,color:role===r?C.white:C.slate500}}>
              {l}
            </button>
          ))}
        </div>
      </Card>
      <button style={{width:"100%",padding:"13px",borderRadius:14,fontSize:13,fontWeight:700,border:`1px solid ${C.redBd}`,cursor:"pointer",background:C.redLt,color:C.red,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
        <Ic n="logout" s={15} col={C.red}/> Keluar
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   COMBINED TAB SCREENS (5-tab nav)
───────────────────────────────────────────────────────────── */

// Tab 2: Tugas = Checklist + WO (combined)
function TabTugas({role}) {
  const isHK=role==="housekeeping"||role==="spv_housekeeping";
  const isSPV=role.startsWith("spv");
  // Tab hanya tampilkan WO jika bukan HK biasa
  const showWO=!isHK||isSPV;
  const tabs=["checklist", ...(showWO?["workorder"]:[])];
  const tabLabels={checklist:isHK?"✅ Checklist HK":"✅ Checklist PM", workorder:"🔧 Work Order"};
  const [sub,setSub]=useState("checklist");
  return (
    <div>
      {/* Sub-tab pill */}
      {tabs.length>1&&(
        <div style={{display:"flex",gap:0,marginBottom:14,background:C.slate100,borderRadius:12,padding:3}}>
          {tabs.map(k=>(
            <button key={k} onClick={()=>setSub(k)}
              style={{flex:1,padding:"8px",fontSize:12,fontWeight:700,border:"none",cursor:"pointer",borderRadius:10,
                background:sub===k?`linear-gradient(135deg,${C.teal},${C.cyan})`:"transparent",
                color:sub===k?C.white:C.slate400,
                boxShadow:sub===k?"0 2px 8px rgba(14,165,233,.25)":"none",transition:"all .2s"}}>
              {tabLabels[k]}
            </button>
          ))}
        </div>
      )}
      {sub==="checklist"&&<MChecklist role={role}/>}
      {sub==="workorder"&&showWO&&<MWorkOrders/>}
    </div>
  );
}

// Tab 3: Monitor = Live Monitoring + Alarms (combined)
function TabMonitor() {
  const [sub,setSub]=useState("monitoring");
  const alarmCount=D.alarms.filter(a=>a.status==="active").length;
  return (
    <div>
      <div style={{display:"flex",gap:0,marginBottom:14,background:C.slate100,borderRadius:12,padding:3}}>
        {[["monitoring","📡 Monitoring"],["alarms","🔔 Alarm"]].map(([k,l])=>(
          <button key={k} onClick={()=>setSub(k)}
            style={{flex:1,padding:"8px",fontSize:12,fontWeight:700,border:"none",cursor:"pointer",borderRadius:10,
              background:sub===k?`linear-gradient(135deg,${C.teal},${C.cyan})`:"transparent",
              color:sub===k?C.white:C.slate400,
              boxShadow:sub===k?"0 2px 8px rgba(14,165,233,.25)":"none",
              transition:"all .2s",position:"relative"}}>
            {l}
            {k==="alarms"&&alarmCount>0&&(
              <span style={{position:"absolute",top:4,right:10,minWidth:16,height:16,borderRadius:8,background:C.red,color:C.white,fontSize:9,fontWeight:900,display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"0 4px"}}>
                {alarmCount}
              </span>
            )}
          </button>
        ))}
      </div>
      {sub==="monitoring"&&<MMonitoring/>}
      {sub==="alarms"&&<MAlarms/>}
    </div>
  );
}

// Tab 4: Stok = Material + Approvals (SPV) combined
function TabStok({role}) {
  const isSPV=role.startsWith("spv");
  const pendingCount=D.approvals.filter(a=>a.status==="pending").length;
  const tabs=["material",...(isSPV?["approval"]:[])];
  const [sub,setSub]=useState("material");
  return (
    <div>
      {tabs.length>1&&(
        <div style={{display:"flex",gap:0,marginBottom:14,background:C.slate100,borderRadius:12,padding:3}}>
          {[["material","📦 Material"],["approval","👔 Approval"]].filter(([k])=>tabs.includes(k)).map(([k,l])=>(
            <button key={k} onClick={()=>setSub(k)}
              style={{flex:1,padding:"8px",fontSize:12,fontWeight:700,border:"none",cursor:"pointer",borderRadius:10,
                background:sub===k?`linear-gradient(135deg,${C.teal},${C.cyan})`:"transparent",
                color:sub===k?C.white:C.slate400,
                boxShadow:sub===k?"0 2px 8px rgba(14,165,233,.25)":"none",
                transition:"all .2s",position:"relative"}}>
              {l}
              {k==="approval"&&pendingCount>0&&(
                <span style={{position:"absolute",top:4,right:10,minWidth:16,height:16,borderRadius:8,background:C.orange,color:C.white,fontSize:9,fontWeight:900,display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"0 4px"}}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
      {sub==="material"&&<MMaterials/>}
      {sub==="approval"&&isSPV&&<MApprovals/>}
    </div>
  );
}

// ── Mobile Shell (5-tab fixed nav) ───────────────────────────
function MobileApp({onBack,initialRole="teknisi"}) {
  const [tab,setTab]=useState("home");
  const [role,setRole]=useState(initialRole);
  const cRef=useRef(null);
  useEffect(()=>{if(cRef.current)cRef.current.scrollTop=0;},[tab]);

  const isHK=role==="housekeeping"||role==="spv_housekeeping";
  const isSPV=role.startsWith("spv");
  const alarmCount=D.alarms.filter(a=>a.status==="active").length;
  const pendingCount=D.approvals.filter(a=>a.status==="pending").length;

  // 5 tab tetap — konten berubah sesuai role
  const NAV=[
    {id:"home",   n:"home",     label:"Home"},
    {id:"tugas",  n:"check",    label:"Tugas",   badge: (() => { const t=isHK?D.tasks_hk:D.tasks_tek; return t.filter(x=>x.status==="overdue").length||0; })() },
    {id:"monitor",n:"activity", label:"Monitor", badge:alarmCount},
    {id:"stok",   n:"box",      label:"Stok",    badge:isSPV?pendingCount:0},
    {id:"profil", n:"user",     label:"Profil"},
  ];

  const TAB_TITLES={
    home:"SOMA BMS", tugas:isHK?"Checklist HK":"Tugas & WO",
    monitor:"Monitoring", stok:"Material & Stok", profil:"Profil Saya",
  };

  const SCREENS={
    home:   <MDashboard role={role} nav={(scr)=>{
              // map legacy screen names to new tabs
              const map={checklist:"tugas",workorders:"tugas",monitoring:"monitor",alarms:"monitor",materials:"stok",approvals:"stok"};
              setTab(map[scr]||scr);
            }}/>,
    tugas:  <TabTugas role={role}/>,
    monitor:<TabMonitor/>,
    stok:   <TabStok role={role}/>,
    profil: <MProfile role={role} onToggleRole={(r)=>{setRole(r);setTab("home");}}/>,
  };

  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${C.sky100},${C.sky200},#cffafe)`,display:"flex",alignItems:"center",justifyContent:"center",padding:"24px 20px"}}>
      <div style={{position:"fixed",top:-60,right:-60,width:280,height:280,borderRadius:"50%",background:`radial-gradient(circle,${C.teal}15,transparent 70%)`,pointerEvents:"none"}}/>
      <button onClick={onBack} style={{position:"fixed",top:20,left:20,zIndex:200,background:C.white,border:"none",borderRadius:12,padding:"9px 16px",fontSize:13,fontWeight:700,color:C.teal,cursor:"pointer",boxShadow:"0 3px 14px rgba(0,0,0,.1)",display:"flex",alignItems:"center",gap:6}}>
        <Ic n="chevL" s={14} col={C.teal}/> Kembali
      </button>

      {/* Phone frame */}
      <div style={{width:375,background:"#1c1c1e",borderRadius:44,padding:"8px",boxShadow:"0 40px 80px rgba(0,0,0,.5),inset 0 0 0 1px rgba(255,255,255,.12)",position:"relative"}}>
        {/* Dynamic island */}
        <div style={{position:"absolute",top:12,left:"50%",transform:"translateX(-50%)",width:110,height:30,background:"#000",borderRadius:18,zIndex:20}}/>
        <div style={{background:C.white,borderRadius:38,overflow:"hidden",height:780,display:"flex",flexDirection:"column",position:"relative"}}>

          {/* Status bar */}
          <div style={{height:50,display:"flex",alignItems:"flex-end",justifyContent:"space-between",padding:"0 22px 10px",flexShrink:0}}>
            <span style={{fontSize:13,fontWeight:800,color:C.slate700}}>9:41</span>
            <div style={{display:"flex",gap:5,alignItems:"center"}}>
              {[3,5,7].map(h=><div key={h} style={{width:3,height:h,background:C.slate600,borderRadius:1}}/>)}
              <div style={{width:22,height:11,border:`1.5px solid ${C.slate500}`,borderRadius:3,padding:1.5,position:"relative",display:"flex"}}>
                <div style={{width:"80%",background:C.green,borderRadius:2}}/>
                <div style={{position:"absolute",right:-3,top:"50%",transform:"translateY(-50%)",width:2.5,height:5,background:C.slate500,borderRadius:"0 1px 1px 0"}}/>
              </div>
            </div>
          </div>

          {/* App header */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0 16px 12px",borderBottom:`1px solid ${C.sky200}`,flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:32,height:32,background:`linear-gradient(135deg,${C.teal},${C.cyan})`,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{color:C.white,fontWeight:900,fontSize:14}}>S</span>
              </div>
              <div>
                <p style={{fontWeight:800,fontSize:13,color:C.slate800}}>{TAB_TITLES[tab]||"SOMA BMS"}</p>
                <p style={{fontSize:9,color:C.slate400}}>{roleLbl[role]||role}</p>
              </div>
            </div>
            <div style={{display:"flex",gap:7}}>
              {/* Bell → langsung ke tab monitor sub-alarm */}
              <button onClick={()=>setTab("monitor")}
                style={{width:34,height:34,borderRadius:9,background:C.white,border:`1px solid ${C.sky200}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",position:"relative"}}>
                <Ic n="bell" s={15} col={alarmCount>0?C.red:C.slate600}/>
                {alarmCount>0&&<div style={{position:"absolute",top:7,right:7,width:6,height:6,borderRadius:"50%",background:C.red,border:`1.5px solid ${C.white}`}}/>}
              </button>
              <div onClick={()=>setTab("profil")} style={{width:34,height:34,borderRadius:"50%",background:`${C.teal}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:C.teal,border:`1px solid ${C.teal}40`,cursor:"pointer"}}>
                BS
              </div>
            </div>
          </div>

          {/* Content */}
          <div key={tab} ref={cRef} style={{flex:1,overflowY:"auto",padding:"14px 16px 90px",scrollbarWidth:"none"}} className="slide-in">
            {SCREENS[tab]||SCREENS.home}
          </div>

          {/* Bottom nav — fixed 5 tab */}
          <nav style={{position:"absolute",bottom:0,left:0,right:0,background:C.white,borderTop:`1px solid ${C.sky200}`,display:"flex",boxShadow:"0 -4px 20px rgba(14,165,233,.07)",paddingBottom:6}}>
            {NAV.map(item=>{
              const act=tab===item.id;
              return (
                <button key={item.id} onClick={()=>setTab(item.id)}
                  style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                    padding:"9px 0 4px",gap:3,background:"none",border:"none",cursor:"pointer",
                    borderTop:`2.5px solid ${act?C.teal:"transparent"}`,position:"relative",transition:"all .15s"}}>
                  {/* Badge notif */}
                  {item.badge>0&&(
                    <span style={{position:"absolute",top:6,right:"50%",marginRight:-18,minWidth:15,height:15,borderRadius:8,
                      background:item.id==="stok"?C.orange:C.red,
                      color:C.white,fontSize:8,fontWeight:900,display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"0 3px",
                      border:`1.5px solid ${C.white}`,lineHeight:1}}>
                      {item.badge}
                    </span>
                  )}
                  <div style={{width:act?36:28,height:act?36:28,borderRadius:act?11:9,
                    background:act?`linear-gradient(135deg,${C.teal},${C.cyan})`:"transparent",
                    display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s",
                    boxShadow:act?`0 3px 10px ${C.teal}40`:"none"}}>
                    <Ic n={item.n} s={act?18:17} col={act?C.white:C.slate300} sw={act?2.2:1.6}/>
                  </div>
                  <span style={{fontSize:9,fontWeight:700,color:act?C.teal:C.slate400,transition:"color .15s"}}>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ███ ADMIN LAYOUT (Desktop) ███
═══════════════════════════════════════════════════════════════ */
const ADMIN_NAV=[
  {id:"dashboard",n:"grid",label:"Dashboard"},
  {id:"assets",n:"building",label:"Aset"},
  {id:"templates",n:"file",label:"Template"},
  {id:"schedules",n:"calendar",label:"Jadwal"},
  {id:"workorders",n:"wrench",label:"Work Order"},
  {id:"materials",n:"box",label:"Material"},
  {id:"alarms",n:"bell",label:"Alarm"},
  {id:"billing",n:"dollar",label:"Billing"},
  {id:"visitors",n:"users",label:"Tamu"},
  {id:"users",n:"user",label:"Users"},
];

function AdminLayout({page,setPage,children,role="building_admin",dark=false,onToggleDark}) {
  const bg=dark?"#0c1929":C.white;
  const sideBg=dark?"#091d35":C.white;
  const borderCol=dark?C.darkBd:"#e8edf2";
  const textMain=dark?C.sky100:C.slate800;
  const textMuted=dark?C.darkText:"#64748b";
  return (
    <div style={{display:"flex",height:"100vh",background:dark?"#0c1929":"#f5f7fa",overflow:"hidden",fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif"}}>
      {/* Sidebar */}
      <aside style={{width:216,background:sideBg,borderRight:`1px solid ${borderCol}`,display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{padding:"18px 16px 14px",borderBottom:`1px solid ${borderCol}`}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <div style={{width:30,height:30,background:C.teal,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{color:C.white,fontWeight:900,fontSize:13}}>S</span>
            </div>
            <div><p style={{fontSize:13,fontWeight:800,color:textMain,letterSpacing:"-0.2px"}}>SOMA BMS</p><p style={{fontSize:9,color:textMuted,letterSpacing:.8,textTransform:"uppercase"}}>Building Mgmt</p></div>
          </div>
        </div>
        <nav style={{flex:1,overflowY:"auto",padding:"8px 8px"}}>
          {ADMIN_NAV.map(item=>{
            const act=page===item.id;
            return (
              <button key={item.id} onClick={()=>setPage(item.id)}
                style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"8px 10px",borderRadius:5,marginBottom:1,border:"none",cursor:"pointer",transition:"all .12s",
                  background:act?`${C.teal}12`:"transparent",
                  color:act?C.teal:textMuted,
                  borderLeft:act?`2px solid ${C.teal}`:"2px solid transparent"}}>
                <Ic n={item.n} s={15} col={act?C.teal:textMuted} sw={act?2:1.5}/>
                <span style={{fontSize:12.5,fontWeight:act?700:500}}>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div style={{borderTop:`1px solid ${borderCol}`,padding:"12px 10px"}}>
          <div style={{display:"flex",alignItems:"center",gap:9,padding:"8px 10px",borderRadius:5,marginBottom:4,background:dark?"rgba(255,255,255,.04)":"#f5f7fa"}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:C.teal,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:C.white,flexShrink:0}}>AD</div>
            <div style={{flex:1,minWidth:0}}><p style={{fontSize:12,fontWeight:700,color:textMain,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>Admin User</p><p style={{fontSize:10,color:textMuted}}>Admin Gedung</p></div>
          </div>
          <button style={{width:"100%",display:"flex",alignItems:"center",gap:7,padding:"7px 10px",borderRadius:5,border:"none",cursor:"pointer",background:"transparent",color:textMuted,fontSize:12,fontWeight:600}}>
            <Ic n="logout" s={13} col={textMuted}/> Keluar
          </button>
        </div>
      </aside>
      {/* Main */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <header style={{background:dark?C.dark700:C.white,borderBottom:`1px solid ${borderCol}`,padding:"0 24px",height:54,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <p style={{fontSize:14,fontWeight:700,color:textMain,textTransform:"capitalize"}}>{ADMIN_NAV.find(x=>x.id===page)?.label||"Dashboard"}</p>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{display:"flex",alignItems:"center",gap:7,background:dark?C.dark800:"#f5f7fa",border:`1px solid ${borderCol}`,borderRadius:5,padding:"6px 11px"}}>
              <Ic n="search" s={13} col={textMuted}/>
              <input placeholder="Cari sesuatu..." style={{background:"transparent",border:"none",outline:"none",fontSize:12,color:textMain,width:130}} readOnly/>
            </div>
            <button style={{width:32,height:32,borderRadius:5,background:dark?C.dark800:"#f5f7fa",border:`1px solid ${borderCol}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",position:"relative"}}>
              <Ic n="bell" s={14} col={textMuted}/>
              <div style={{position:"absolute",top:7,right:7,width:6,height:6,borderRadius:"50%",background:C.red,border:`1.5px solid ${dark?C.dark700:C.white}`}}/>
            </button>
            <button onClick={onToggleDark} style={{width:32,height:32,borderRadius:5,background:dark?C.dark800:"#f5f7fa",border:`1px solid ${borderCol}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
              <Ic n={dark?"sun":"moon"} s={14} col={textMuted}/>
            </button>
            <button style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:5,border:"none",cursor:"pointer",background:C.teal,color:C.white,fontSize:12,fontWeight:700}}>
              ← Kembali
            </button>
          </div>
        </header>
        <main style={{flex:1,overflowY:"auto",padding:"20px 24px",background:dark?"#0c1929":"#f5f7fa"}}>
          {children}
        </main>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ADMIN DASHBOARD PAGE
───────────────────────────────────────────────────────────── */
function PageAdminDashboard({dark=false}) {
  const bg=dark?C.dark700:C.white;
  const bd=dark?C.darkBd:C.sky100;
  const t=dark?C.sky200:C.slate800;
  const m=dark?C.darkText:C.slate500;
  const alarmActive=D.alarms.filter(a=>a.status==="active");
  const kpi=[
    {label:"Task Hari Ini",value:8,icon:"check",c:C.teal,bg:dark?`${C.teal}15`:C.sky100,trend:"+2",pos:true},
    {label:"Selesai",value:5,icon:"ok",c:C.green,bg:dark?`${C.green}15`:C.greenLt,trend:"62%",pos:true},
    {label:"Terlambat",value:1,icon:"alert",c:C.red,bg:dark?`${C.red}15`:C.redLt,trend:"-1",pos:false},
    {label:"Alarm Aktif",value:alarmActive.length,icon:"bell",c:C.orange,bg:dark?`${C.orange}15`:C.orangeLt,trend:alarmActive.length>0?"Perlu tindakan":"Normal",pos:alarmActive.length===0},
  ];
  const pmData=[{cat:"HVAC",done:8,total:10,c:C.teal},{cat:"Elektrikal",done:5,total:8,c:C.cyan},{cat:"Plumbing",done:3,total:6,c:C.green},{cat:"Housekeeping",done:12,total:14,c:C.purple}];
  return (
    <div>
      {/* Greeting */}
      <div style={{marginBottom:22,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:900,color:t}}>Selamat datang, Admin 👋</h1>
          <p style={{fontSize:13,color:m,marginTop:3}}>{new Date().toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"})} · Gedung Soma Tower A - SCBD</p>
        </div>
        <div style={{display:"flex",gap:8}}>
          {["Minggu ini","Bulan ini"].map((l,i)=>(
            <button key={l} style={{padding:"7px 14px",borderRadius:9,fontSize:12,fontWeight:700,border:`1px solid ${bd}`,cursor:"pointer",background:i===0?`linear-gradient(135deg,${C.teal},${C.cyan})`:bg,color:i===0?C.white:m}}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22}}>
        {kpi.map((k,i)=>(
          <Card key={k.label} dark={dark} style={{cursor:"default"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
              <div style={{width:40,height:40,borderRadius:12,background:k.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Ic n={k.icon} s={19} col={k.c}/>
              </div>
              <Ic n="moreV" s={15} col={m}/>
            </div>
            <p style={{fontSize:30,fontWeight:900,color:t,lineHeight:1,marginBottom:5}}>{k.value}</p>
            <p style={{fontSize:12,color:m,marginBottom:10}}>{k.label}</p>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <Ic n={k.pos?"trendUp":"trendDn"} s={12} col={k.pos?C.green:C.red}/>
              <span style={{fontSize:11,fontWeight:700,color:k.pos?C.green:C.red}}>{k.trend}</span>
              <span style={{fontSize:11,color:m}}>vs minggu lalu</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:22}}>
        {/* PM Completion per kategori */}
        <Card dark={dark}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
            <div><p style={{fontWeight:800,fontSize:15,color:t}}>Completion Rate PM</p><p style={{fontSize:12,color:m,marginTop:2}}>Progres minggu ini per kategori</p></div>
            <button style={{fontSize:11,fontWeight:700,color:C.teal,background:"none",border:"none",cursor:"pointer"}}>Minggu ini</button>
          </div>
          {pmData.map(p=>(
            <div key={p.cat} style={{marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:p.c}}/>
                  <span style={{fontSize:13,fontWeight:600,color:t}}>{p.cat}</span>
                </div>
                <span style={{fontSize:13,fontWeight:800,color:t}}>{p.done}/{p.total}</span>
              </div>
              <ProgressBar pct={(p.done/p.total)*100} color={p.c} h={8} dark={dark}/>
              <p style={{fontSize:11,color:m,marginTop:4}}>{Math.round((p.done/p.total)*100)}% selesai</p>
            </div>
          ))}
        </Card>

        {/* Alarm Aktif + weekly stats */}
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <Card dark={dark} style={{flex:1}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <p style={{fontWeight:800,fontSize:15,color:t}}>Alarm Aktif</p>
              <button style={{fontSize:11,fontWeight:700,color:C.teal,background:"none",border:"none",cursor:"pointer"}}>Semua →</button>
            </div>
            {D.alarms.slice(0,3).map(a=>{
              const s=sevCfg[a.sev]||sevCfg.warning;
              return (
                <div key={a.id} style={{display:"flex",gap:10,alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${dark?C.darkBd:C.sky100}`}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:s.c,flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:12,fontWeight:700,color:t,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.title}</p>
                    <p style={{fontSize:10,color:m}}>{a.loc}</p>
                  </div>
                  <Badge color={a.sev==="warning"?"yellow":a.sev==="major"?"orange":"red"}>{a.sev}</Badge>
                </div>
              );
            })}
          </Card>

          <Card dark={dark}>
            <p style={{fontWeight:800,fontSize:14,color:t,marginBottom:14}}>WO Minggu Ini</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {[["PM Selesai",[5,7,6,8,6,5,8],C.teal],["WO Closed",[2,3,1,4,2,1,3],C.cyan]].map(([l,d,c])=>(
                <div key={l}><p style={{fontSize:10,fontWeight:700,color:m,marginBottom:8}}>{l}</p><MiniBar data={d} color={c} dark={dark}/></div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* WO Table */}
      <Card dark={dark}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div><p style={{fontWeight:800,fontSize:15,color:t}}>Work Order & Maintenance</p><p style={{fontSize:12,color:m,marginTop:2}}>Work order aktif dan riwayat terbaru</p></div>
          <div style={{display:"flex",gap:8}}>
            <button style={{display:"flex",alignItems:"center",gap:6,padding:"7px 13px",borderRadius:9,border:`1px solid ${dark?C.darkBd:C.sky200}`,cursor:"pointer",background:"transparent",color:m,fontSize:12,fontWeight:600}}>
              <Ic n="filter" s={13} col={m}/> Filter
            </button>
            <button style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:9,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${C.teal},${C.cyan})`,color:C.white,fontSize:12,fontWeight:700}}>
              <Ic n="download" s={13} col={C.white}/> Export
            </button>
          </div>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr>
                {["NOMOR WO","JUDUL","ASSIGNEE","LOKASI","PRIORITAS","STATUS","TANGGAL"].map(h=>(
                  <th key={h} style={{padding:"10px 12px",textAlign:"left",fontSize:10,fontWeight:700,color:m,borderBottom:`1px solid ${dark?C.darkBd:C.sky100}`,whiteSpace:"nowrap",letterSpacing:.5}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {D.workorders.map(w=>(
                <tr key={w.id} style={{cursor:"pointer",transition:"background .15s"}}>
                  <td style={{padding:"11px 12px",borderBottom:`1px solid ${dark?C.darkBd:C.sky50}`}}>
                    <span style={{fontFamily:"monospace",fontSize:12,fontWeight:700,color:C.teal}}>{w.id}</span>
                  </td>
                  <td style={{padding:"11px 12px",borderBottom:`1px solid ${dark?C.darkBd:C.sky50}`}}>
                    <span style={{fontSize:13,fontWeight:600,color:t}}>{w.title}</span>
                  </td>
                  <td style={{padding:"11px 12px",borderBottom:`1px solid ${dark?C.darkBd:C.sky50}`}}>
                    <span style={{fontSize:12,color:m}}>{w.assignee}</span>
                  </td>
                  <td style={{padding:"11px 12px",borderBottom:`1px solid ${dark?C.darkBd:C.sky50}`}}>
                    <span style={{fontSize:11,color:m}}>Lt.{w.floor} · {w.loc}</span>
                  </td>
                  <td style={{padding:"11px 12px",borderBottom:`1px solid ${dark?C.darkBd:C.sky50}`}}>
                    <Badge color={prioCfg[w.priority]?.col}>{prioCfg[w.priority]?.label}</Badge>
                  </td>
                  <td style={{padding:"11px 12px",borderBottom:`1px solid ${dark?C.darkBd:C.sky50}`}}>
                    <Badge color={stsCfg[w.status]?.col}>{stsCfg[w.status]?.label}</Badge>
                  </td>
                  <td style={{padding:"11px 12px",borderBottom:`1px solid ${dark?C.darkBd:C.sky50}`}}>
                    <span style={{fontSize:11,color:m}}>{w.due}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ADMIN INNER PAGES
───────────────────────────────────────────────────────────── */
function PageAssets({dark}) {
  const bg=dark?C.dark700:C.white,t=dark?C.sky200:C.slate800,m=dark?C.darkText:C.slate500,bd=dark?C.darkBd:C.sky100;
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div><h2 style={{fontSize:18,fontWeight:900,color:t}}>Manajemen Aset</h2><p style={{fontSize:12,color:m}}>Kelola aset MEP dan fasilitas gedung</p></div>
        <button style={{display:"flex",alignItems:"center",gap:6,padding:"9px 18px",borderRadius:10,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${C.teal},${C.cyan})`,color:C.white,fontSize:13,fontWeight:700}}>
          <Ic n="plus" s={14} col={C.white}/> Tambah Aset
        </button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        {[{label:"Total Aset",value:24,c:C.teal},{label:"Operational",value:20,c:C.green},{label:"Maintenance",value:3,c:C.yellow},{label:"Breakdown",value:1,c:C.red}].map(k=>(
          <Card key={k.label} dark={dark}><p style={{fontSize:11,color:m,marginBottom:8,fontWeight:600}}>{k.label}</p><p style={{fontSize:26,fontWeight:900,color:k.c}}>{k.value}</p></Card>
        ))}
      </div>
      <Card dark={dark}>
        <div style={{display:"flex",gap:10,marginBottom:16}}>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:8,background:dark?C.dark800:C.sky50,border:`1px solid ${bd}`,borderRadius:10,padding:"8px 12px"}}>
            <Ic n="search" s={14} col={m}/><span style={{fontSize:12,color:m}}>Cari aset...</span>
          </div>
          {["HVAC","Electrical","Plumbing","Mechanical"].map(f=>(
            <button key={f} style={{padding:"8px 14px",borderRadius:9,border:`1px solid ${bd}`,cursor:"pointer",background:"transparent",color:m,fontSize:12,fontWeight:600}}>{f}</button>
          ))}
        </div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["ID","Nama Aset","Kategori","Lokasi","Status","Last Service"].map(h=><th key={h} style={{padding:"10px 12px",textAlign:"left",fontSize:10,fontWeight:700,color:m,borderBottom:`1px solid ${bd}`,letterSpacing:.5}}>{h}</th>)}</tr></thead>
          <tbody>
            {D.assets.map(a=>(
              <tr key={a.id}>
                <td style={{padding:"11px 12px",borderBottom:`1px solid ${dark?C.darkBd:C.sky50}`}}><span style={{fontFamily:"monospace",fontSize:11,color:C.teal,fontWeight:700}}>{a.id}</span></td>
                <td style={{padding:"11px 12px",borderBottom:`1px solid ${dark?C.darkBd:C.sky50}`}}><span style={{fontSize:13,fontWeight:600,color:t}}>{a.name}</span></td>
                <td style={{padding:"11px 12px",borderBottom:`1px solid ${dark?C.darkBd:C.sky50}`}}><Badge color="teal">{a.cat}</Badge></td>
                <td style={{padding:"11px 12px",borderBottom:`1px solid ${dark?C.darkBd:C.sky50}`}}><span style={{fontSize:12,color:m}}>{a.loc}</span></td>
                <td style={{padding:"11px 12px",borderBottom:`1px solid ${dark?C.darkBd:C.sky50}`}}><Badge color={stsCfg[a.status]?.col||"gray"}>{stsCfg[a.status]?.label||a.status}</Badge></td>
                <td style={{padding:"11px 12px",borderBottom:`1px solid ${dark?C.darkBd:C.sky50}`}}><span style={{fontSize:12,color:m}}>{a.last_service}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function PageUsers({dark}) {
  const t=dark?C.sky200:C.slate800,m=dark?C.darkText:C.slate500,bd=dark?C.darkBd:C.sky100;
  const roleBadge={teknisi:"teal",spv_teknisi:"blue",housekeeping:"purple",spv_housekeeping:"purple",building_admin:"orange"};
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div><h2 style={{fontSize:18,fontWeight:900,color:t}}>Manajemen Pengguna</h2><p style={{fontSize:12,color:m}}>Kelola akun dan hak akses tim</p></div>
        <button style={{display:"flex",alignItems:"center",gap:6,padding:"9px 18px",borderRadius:10,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${C.teal},${C.cyan})`,color:C.white,fontSize:13,fontWeight:700}}>
          <Ic n="plus" s={14} col={C.white}/> Tambah User
        </button>
      </div>
      <Card dark={dark}>
        <div style={{display:"flex",gap:10,marginBottom:16}}>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:8,background:dark?C.dark800:C.sky50,border:`1px solid ${bd}`,borderRadius:10,padding:"8px 12px"}}>
            <Ic n="search" s={14} col={m}/><span style={{fontSize:12,color:m}}>Cari pengguna...</span>
          </div>
        </div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["Nama","Email","Role","Status","Last Login","Aksi"].map(h=><th key={h} style={{padding:"10px 12px",textAlign:"left",fontSize:10,fontWeight:700,color:m,borderBottom:`1px solid ${bd}`,letterSpacing:.5}}>{h}</th>)}</tr></thead>
          <tbody>
            {D.users.map(u=>(
              <tr key={u.id}>
                <td style={{padding:"11px 12px",borderBottom:`1px solid ${dark?C.darkBd:C.sky50}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:9}}>
                    <div style={{width:30,height:30,borderRadius:"50%",background:`${C.teal}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:C.teal}}>
                      {u.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
                    </div>
                    <span style={{fontSize:13,fontWeight:600,color:t}}>{u.name}</span>
                  </div>
                </td>
                <td style={{padding:"11px 12px",borderBottom:`1px solid ${dark?C.darkBd:C.sky50}`}}><span style={{fontSize:12,color:m}}>{u.email}</span></td>
                <td style={{padding:"11px 12px",borderBottom:`1px solid ${dark?C.darkBd:C.sky50}`}}><Badge color={roleBadge[u.role]||"gray"}>{roleLbl[u.role]||u.role}</Badge></td>
                <td style={{padding:"11px 12px",borderBottom:`1px solid ${dark?C.darkBd:C.sky50}`}}><Badge color={u.status==="active"?"green":"gray"} dot>{u.status==="active"?"Aktif":"Nonaktif"}</Badge></td>
                <td style={{padding:"11px 12px",borderBottom:`1px solid ${dark?C.darkBd:C.sky50}`}}><span style={{fontSize:11,color:m}}>{u.last}</span></td>
                <td style={{padding:"11px 12px",borderBottom:`1px solid ${dark?C.darkBd:C.sky50}`}}>
                  <div style={{display:"flex",gap:6}}>
                    <button style={{padding:"5px 10px",borderRadius:7,border:`1px solid ${bd}`,cursor:"pointer",background:"transparent",color:m,fontSize:11}}>Edit</button>
                    <button style={{padding:"5px 10px",borderRadius:7,border:"none",cursor:"pointer",background:C.redLt,color:C.red,fontSize:11}}>Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function PageAlarms({dark}) {
  const t=dark?C.sky200:C.slate800,m=dark?C.darkText:C.slate500;
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div><h2 style={{fontSize:18,fontWeight:900,color:t}}>Alarm & Notifikasi</h2><p style={{fontSize:12,color:m}}>Pantau dan tangani alarm sistem gedung</p></div>
        <div style={{display:"flex",alignItems:"center",gap:7,background:`${C.red}15`,borderRadius:10,padding:"7px 14px",border:`1px solid ${C.redBd}`}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:C.red,animation:"pulseRed 2s infinite"}}/>
          <span style={{fontSize:12,fontWeight:700,color:C.red}}>{D.alarms.filter(a=>a.status==="active").length} alarm aktif</span>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        {[{label:"Emergency",count:1,c:C.red},{label:"Critical",count:1,c:C.orange},{label:"Major",count:1,c:C.orange},{label:"Warning",count:1,c:C.yellow}].map(k=>(
          <Card key={k.label} dark={dark}><p style={{fontSize:11,color:m,marginBottom:8}}>{k.label}</p><p style={{fontSize:26,fontWeight:900,color:k.c}}>{k.count}</p></Card>
        ))}
      </div>
      {D.alarms.map(a=>{
        const s=sevCfg[a.sev]||sevCfg.warning;
        return (
          <div key={a.id} style={{marginBottom:12,background:dark?C.dark700:s.bg,border:`1px solid ${dark?C.darkBd:s.bd}`,borderRadius:14,padding:"16px 18px",borderLeft:`4px solid ${s.c}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><Badge color={a.sev==="warning"?"yellow":a.sev==="major"?"orange":"red"}>{s.label}</Badge><span style={{fontSize:11,color:m}}>{a.time}</span></div>
                <p style={{fontSize:14,fontWeight:800,color:dark?C.sky100:s.c}}>{a.title}</p>
                <p style={{fontSize:12,color:m,marginTop:2}}>📍 {a.loc}</p>
              </div>
              <div style={{display:"flex",gap:8,flexShrink:0}}>
                <button style={{padding:"7px 14px",borderRadius:9,border:`1px solid ${dark?C.darkBd:s.bd}`,cursor:"pointer",background:"transparent",color:dark?C.sky300:s.c,fontSize:12,fontWeight:700}}>Acknowledge</button>
                <button style={{padding:"7px 14px",borderRadius:9,border:"none",cursor:"pointer",background:s.c,color:C.white,fontSize:12,fontWeight:700}}>Resolve</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PageVisitors({dark}) {
  const t=dark?C.sky200:C.slate800,m=dark?C.darkText:C.slate500,bd=dark?C.darkBd:C.sky100;
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div><h2 style={{fontSize:18,fontWeight:900,color:t}}>Manajemen Tamu</h2><p style={{fontSize:12,color:m}}>Monitor tamu aktif & terjadwal secara realtime</p></div>
        <div style={{display:"flex",gap:8}}>
          <button style={{display:"flex",alignItems:"center",gap:6,padding:"9px 14px",borderRadius:10,border:`1px solid ${bd}`,cursor:"pointer",background:"transparent",color:m,fontSize:12,fontWeight:700}}>
            <Ic n="refresh" s={13} col={m}/> Refresh
          </button>
          <button style={{display:"flex",alignItems:"center",gap:6,padding:"9px 18px",borderRadius:10,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${C.teal},${C.cyan})`,color:C.white,fontSize:13,fontWeight:700}}>
            <Ic n="plus" s={14} col={C.white}/> Daftarkan Tamu
          </button>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:16}}>
        {/* QR Validasi */}
        <Card dark={dark}>
          <p style={{fontWeight:800,fontSize:14,color:t,marginBottom:16}}>🔍 Validasi QR Akses</p>
          <div style={{background:dark?C.dark800:C.sky50,border:`2px dashed ${bd}`,borderRadius:12,padding:"32px",textAlign:"center",marginBottom:14}}>
            <Ic n="qr" s={48} col={m} style={{display:"block",margin:"0 auto 10px"}}/>
            <p style={{fontSize:12,color:m}}>Tempel / scan QR code UUID...</p>
          </div>
          <Input value="" onChange={()=>{}} placeholder="Masukkan UUID QR Code"/>
          <button style={{width:"100%",marginTop:10,padding:"12px",borderRadius:11,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${C.teal},${C.cyan})`,color:C.white,fontSize:13,fontWeight:700}}>
            🔍 Validasi
          </button>
        </Card>

        {/* Guest list */}
        <Card dark={dark}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <p style={{fontWeight:800,fontSize:14,color:t}}>Tamu Aktif</p>
            <div style={{display:"flex",alignItems:"center",gap:5,background:`${C.green}15`,borderRadius:99,padding:"4px 10px",border:`1px solid ${C.greenBd}`}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:C.green,animation:"pulse 2s infinite"}}/>
              <span style={{fontSize:10,fontWeight:700,color:"#15803d"}}>{D.visitors.filter(v=>v.status==="on_premise").length} On-site</span>
            </div>
          </div>
          {D.visitors.map(v=>(
            <div key={v.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:`1px solid ${dark?C.darkBd:C.sky100}`}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:`${C.teal}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:C.teal,flexShrink:0}}>
                {v.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:13,fontWeight:700,color:t}}>{v.name}</p>
                <p style={{fontSize:11,color:m}}>{v.host} · {v.purpose}</p>
              </div>
              <div style={{textAlign:"right"}}>
                <Badge color={stsCfg[v.status]?.col||"gray"}>{stsCfg[v.status]?.label||v.status}</Badge>
                <p style={{fontSize:10,color:m,marginTop:3}}>Masuk: {v.in}</p>
              </div>
              {v.status==="on_premise"&&<button style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${C.redBd}`,cursor:"pointer",background:C.redLt,color:C.red,fontSize:11,fontWeight:700,flexShrink:0}}>Checkout</button>}
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ADMIN PAGE: TEMPLATES
───────────────────────────────────────────────────────────── */
function PageTemplates({dark}) {
  const t=dark?C.sky200:C.slate800,m=dark?C.darkText:C.slate500,bd=dark?C.darkBd:C.sky100;
  const [sel,setSel]=useState(null);
  const templates=[
    {id:"TPL-001",name:"PM Chiller Monthly",cat:"HVAC",steps:12,last:"01/05/2026",freq:"Bulanan",active:true},
    {id:"TPL-002",name:"Inspeksi Panel Listrik",cat:"Electrical",steps:8,last:"15/04/2026",freq:"Mingguan",active:true},
    {id:"TPL-003",name:"PM Pompa Hydrant",cat:"Plumbing",steps:6,last:"10/05/2026",freq:"Bulanan",active:true},
    {id:"TPL-004",name:"Pembersihan AHU",cat:"HVAC",steps:10,last:"05/05/2026",freq:"Triwulan",active:false},
    {id:"TPL-005",name:"Checklist HK Lobby",cat:"Housekeeping",steps:14,last:"16/05/2026",freq:"Harian",active:true},
    {id:"TPL-006",name:"Inspeksi APAR",cat:"Safety",steps:5,last:"20/04/2026",freq:"Bulanan",active:true},
  ];
  const catColor={HVAC:"teal",Electrical:"orange",Plumbing:"blue",Housekeeping:"purple",Safety:"red",Mechanical:"gray"};
  const freqColor={Harian:"green",Mingguan:"teal",Bulanan:"blue",Triwulan:"purple"};
  if(sel) {
    const sampleSteps=["Periksa kondisi visual secara menyeluruh","Cek parameter operasional sesuai SOP","Bersihkan area dan komponen yang diperlukan","Lakukan pelumasan / penggantian komponen","Catat temuan dan anomali","Uji operasional setelah maintenance","Dokumentasi visual (foto)","Tanda tangan teknisi & supervisor"];
    return (
      <div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
          <button onClick={()=>setSel(null)} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:9,border:`1px solid ${bd}`,cursor:"pointer",background:"transparent",color:m,fontSize:12,fontWeight:700}}>← Kembali</button>
          <h2 style={{fontSize:18,fontWeight:900,color:t}}>{sel.name}</h2>
          <Badge color={catColor[sel.cat]||"gray"}>{sel.cat}</Badge>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <Card dark={dark}>
            <p style={{fontWeight:800,fontSize:14,color:t,marginBottom:14}}>Informasi Template</p>
            {[["ID",sel.id],["Kategori",sel.cat],["Frekuensi",sel.freq],["Langkah",`${sel.steps} langkah`],["Terakhir dipakai",sel.last],["Status",sel.active?"Aktif":"Nonaktif"]].map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:`1px solid ${bd}`}}>
                <span style={{fontSize:12,color:m}}>{l}</span>
                <span style={{fontSize:12,fontWeight:700,color:t}}>{v}</span>
              </div>
            ))}
          </Card>
          <Card dark={dark}>
            <p style={{fontWeight:800,fontSize:14,color:t,marginBottom:14}}>Langkah-langkah ({sel.steps})</p>
            {sampleSteps.slice(0,sel.steps).map((s,i)=>(
              <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"9px 0",borderBottom:`1px solid ${bd}`}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:`${C.teal}15`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:10,fontWeight:800,color:C.teal}}>{i+1}</span></div>
                <span style={{fontSize:12,color:t}}>{s}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    );
  }
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div><h2 style={{fontSize:18,fontWeight:900,color:t}}>Template Checklist</h2><p style={{fontSize:12,color:m}}>Kelola template PM, HK, dan inspeksi</p></div>
        <button style={{display:"flex",alignItems:"center",gap:6,padding:"9px 18px",borderRadius:10,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${C.teal},${C.cyan})`,color:C.white,fontSize:13,fontWeight:700}}>
          <Ic n="plus" s={14} col={C.white}/> Buat Template
        </button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
        {[{label:"Total Template",value:templates.length,c:C.teal},{label:"Aktif",value:templates.filter(x=>x.active).length,c:C.green},{label:"Rata-rata Langkah",value:Math.round(templates.reduce((s,x)=>s+x.steps,0)/templates.length),c:C.cyan}].map(k=>(
          <Card key={k.label} dark={dark}><p style={{fontSize:11,color:m,marginBottom:8,fontWeight:600}}>{k.label}</p><p style={{fontSize:26,fontWeight:900,color:k.c}}>{k.value}</p></Card>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        {templates.map(tpl=>(
          <Card key={tpl.id} dark={dark} onClick={()=>setSel(tpl)} style={{cursor:"pointer",transition:"transform .18s,box-shadow .18s"}}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 8px 24px ${C.teal}18`;}}
            onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow=""}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div>
                <span style={{fontSize:10,color:m,fontFamily:"monospace",fontWeight:700}}>{tpl.id}</span>
                <p style={{fontSize:14,fontWeight:800,color:t,marginTop:2}}>{tpl.name}</p>
              </div>
              <Badge color={tpl.active?"green":"gray"}>{tpl.active?"Aktif":"Nonaktif"}</Badge>
            </div>
            <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:10}}>
              <Badge color={catColor[tpl.cat]||"gray"}>{tpl.cat}</Badge>
              <Badge color={freqColor[tpl.freq]||"blue"}>{tpl.freq}</Badge>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:m}}>
              <span>📋 {tpl.steps} langkah</span>
              <span>Terakhir: {tpl.last}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ADMIN PAGE: SCHEDULES
───────────────────────────────────────────────────────────── */
function PageSchedules({dark}) {
  const t=dark?C.sky200:C.slate800,m=dark?C.darkText:"#64748b",bd=dark?C.darkBd:"#e8edf2";
  const [view,setView]=useState("week");
  const days=["Sen","Sel","Rab","Kam","Jum","Sab","Min"];
  const dates=["13","14","15","16","17","18","19"];
  const todayIdx=2; // Rabu = today

  const schedules=[
    {id:1,title:"PM Chiller Bulanan",cat:"HVAC",day:1,hour:8,dur:90,assignee:"Budi S.",color:C.teal},
    {id:2,title:"Inspeksi Panel",cat:"Electrical",day:1,hour:10,dur:60,assignee:"Andi P.",color:C.orange},
    {id:3,title:"Checklist HK Lobby",cat:"HK",day:0,hour:7,dur:60,assignee:"Ahmad F.",color:C.purple},
    {id:4,title:"Service Pompa",cat:"Plumbing",day:3,hour:9,dur:90,assignee:"Budi S.",color:C.cyan},
    {id:5,title:"PM Genset",cat:"Mechanical",day:4,hour:13,dur:120,assignee:"Rizky M.",color:C.green},
    {id:6,title:"Checklist HK Toilet",cat:"HK",day:2,hour:8,dur:60,assignee:"Ahmad F.",color:C.purple},
    {id:7,title:"Inspeksi APAR",cat:"Safety",day:5,hour:11,dur:60,assignee:"Hendra K.",color:C.red},
    {id:8,title:"Kalibrasi Sensor CO2",cat:"HVAC",day:2,hour:14,dur:60,assignee:"Rizky M.",color:C.teal},
    {id:9,title:"Pengecekan UPS",cat:"Electrical",day:0,hour:10,dur:45,assignee:"Andi P.",color:C.orange},
    {id:10,title:"Pembersihan AC Split",cat:"HVAC",day:3,hour:7,dur:90,assignee:"Budi S.",color:C.teal},
    {id:11,title:"PM Pompa Hydrant",cat:"Plumbing",day:6,hour:9,dur:120,assignee:"Hendra K.",color:C.cyan},
    {id:12,title:"Cleaning Lobby Malam",cat:"HK",day:4,hour:18,dur:60,assignee:"Ahmad F.",color:C.purple},
  ];

  const hours=[7,8,9,10,11,12,13,14,15,16,17,18];
  const slotH=52; // px per hour

  const upcoming=[
    {date:"Hari ini",title:"PM Chiller Unit A",assignee:"Budi S.",status:"in_progress",time:"08:00"},
    {date:"Hari ini",title:"Checklist HK Lobby",assignee:"Ahmad F.",status:"completed",time:"07:00"},
    {date:"Besok",title:"Inspeksi Panel Listrik B2",assignee:"Andi P.",status:"assigned",time:"10:00"},
    {date:"18/05",title:"PM Genset Caterpillar",assignee:"Rizky M.",status:"assigned",time:"13:00"},
    {date:"20/05",title:"Service Pompa Hydrant",assignee:"Budi S.",status:"assigned",time:"09:00"},
    {date:"22/05",title:"Kalibrasi Sensor CO2 Lt.4",assignee:"Rizky M.",status:"assigned",time:"14:00"},
  ];

  const catColors={HVAC:C.teal,Electrical:C.orange,HK:C.purple,Plumbing:C.cyan,Mechanical:C.green,Safety:C.red};

  return (
    <div>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <h2 style={{fontSize:17,fontWeight:800,color:t,marginBottom:2}}>Jadwal Maintenance</h2>
          <p style={{fontSize:12,color:m}}>Kalender PM dan jadwal tim lapangan · Mei 2026</p>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {/* Week nav */}
          <div style={{display:"flex",alignItems:"center",gap:0,border:`1px solid ${bd}`,borderRadius:5,overflow:"hidden"}}>
            <button style={{padding:"6px 10px",background:"transparent",border:"none",cursor:"pointer",color:m,fontSize:14,borderRight:`1px solid ${bd}`}}>‹</button>
            <span style={{padding:"6px 14px",fontSize:12,fontWeight:700,color:t,background:dark?"rgba(255,255,255,.04)":"#f9fafb"}}>13–19 Mei</span>
            <button style={{padding:"6px 10px",background:"transparent",border:"none",cursor:"pointer",color:m,fontSize:14,borderLeft:`1px solid ${bd}`}}>›</button>
          </div>
          {/* View toggle */}
          <div style={{display:"flex",border:`1px solid ${bd}`,borderRadius:5,overflow:"hidden"}}>
            {[["week","Mingguan"],["list","List"]].map(([v,l])=>(
              <button key={v} onClick={()=>setView(v)} style={{padding:"6px 14px",border:"none",cursor:"pointer",fontSize:12,fontWeight:600,background:view===v?C.teal:"transparent",color:view===v?C.white:m,borderRight:v==="week"?`1px solid ${bd}`:"none"}}>
                {l}
              </button>
            ))}
          </div>
          <button style={{display:"flex",alignItems:"center",gap:6,padding:"7px 16px",borderRadius:5,border:"none",cursor:"pointer",background:C.teal,color:C.white,fontSize:12,fontWeight:700}}>
            <Ic n="plus" s={13} col={C.white}/> Jadwalkan
          </button>
        </div>
      </div>

      {view==="week"?(
        <div style={{background:dark?C.dark700:C.white,border:`1px solid ${bd}`,borderRadius:6,overflow:"hidden"}}>
          {/* Legend */}
          <div style={{padding:"10px 16px",borderBottom:`1px solid ${bd}`,display:"flex",gap:14,alignItems:"center",background:dark?"rgba(255,255,255,.02)":"#fafbfc"}}>
            {Object.entries(catColors).map(([cat,col])=>(
              <div key={cat} style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:8,height:8,borderRadius:2,background:col}}/>
                <span style={{fontSize:11,color:m,fontWeight:600}}>{cat}</span>
              </div>
            ))}
            <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:C.teal}}/>
              <span style={{fontSize:11,color:C.teal,fontWeight:700}}>Hari ini</span>
            </div>
          </div>

          {/* Calendar grid */}
          <div style={{display:"flex",overflowY:"auto",maxHeight:520}}>
            {/* Time column */}
            <div style={{width:48,flexShrink:0,borderRight:`1px solid ${bd}`}}>
              <div style={{height:44,borderBottom:`1px solid ${bd}`}}/>{/* header spacer */}
              {hours.map(h=>(
                <div key={h} style={{height:slotH,borderBottom:`1px solid ${dark?"rgba(255,255,255,.04)":"#f1f5f9"}`,display:"flex",alignItems:"flex-start",justifyContent:"flex-end",paddingRight:6,paddingTop:3}}>
                  <span style={{fontSize:9,color:m,fontWeight:600}}>{h.toString().padStart(2,"0")}:00</span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {days.map((d,di)=>{
              const isToday=di===todayIdx;
              const daySched=schedules.filter(s=>s.day===di);
              const totalH=hours.length*slotH;
              return (
                <div key={d} style={{flex:1,borderRight:di<6?`1px solid ${bd}`:undefined,minWidth:80}}>
                  {/* Day header */}
                  <div style={{height:44,borderBottom:`1px solid ${bd}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                    background:isToday?`${C.teal}0a`:dark?"rgba(255,255,255,.02)":"#fafbfc",
                    position:"sticky",top:0,zIndex:2}}>
                    <span style={{fontSize:10,fontWeight:700,color:isToday?C.teal:m,textTransform:"uppercase",letterSpacing:.5}}>{d}</span>
                    <div style={{width:24,height:24,borderRadius:"50%",background:isToday?C.teal:"transparent",display:"flex",alignItems:"center",justifyContent:"center",marginTop:2}}>
                      <span style={{fontSize:12,fontWeight:800,color:isToday?C.white:t}}>{dates[di]}</span>
                    </div>
                  </div>

                  {/* Grid rows + events */}
                  <div style={{position:"relative",height:totalH}}>
                    {hours.map(h=>(
                      <div key={h} style={{
                        position:"absolute",top:(h-hours[0])*slotH,left:0,right:0,height:slotH,
                        borderBottom:`1px solid ${dark?"rgba(255,255,255,.04)":"#f1f5f9"}`,
                        background:isToday&&h===9?`${C.teal}04`:"transparent"
                      }}/>
                    ))}

                    {/* Events — pixel positioned */}
                    {daySched.map(s=>{
                      const topPx=(s.hour-hours[0])*slotH;
                      const heightPx=Math.max((s.dur/60)*slotH,24);
                      return (
                        <div key={s.id} title={`${s.title} · ${s.assignee}`}
                          style={{
                            position:"absolute",
                            top:topPx+1,left:2,right:2,
                            height:heightPx-2,
                            background:`${s.color}13`,
                            border:`1px solid ${s.color}35`,
                            borderLeft:`3px solid ${s.color}`,
                            borderRadius:3,padding:"2px 4px",
                            cursor:"pointer",overflow:"hidden",
                            zIndex:1,transition:"background .12s"
                          }}
                          onMouseEnter={e=>e.currentTarget.style.background=`${s.color}25`}
                          onMouseLeave={e=>e.currentTarget.style.background=`${s.color}13`}
                        >
                          <p style={{fontSize:9,fontWeight:800,color:s.color,lineHeight:1.3}}>{s.hour.toString().padStart(2,"0")}:00</p>
                          <p style={{fontSize:9,fontWeight:700,color:t,lineHeight:1.2,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{s.title}</p>
                          {heightPx>40&&<p style={{fontSize:8,color:m,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.assignee}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ):(
        /* List view */
        <div style={{background:dark?C.dark700:C.white,border:`1px solid ${bd}`,borderRadius:6,overflow:"hidden"}}>
          <div style={{padding:"12px 16px",borderBottom:`1px solid ${bd}`,background:dark?"rgba(255,255,255,.02)":"#fafbfc"}}>
            <p style={{fontWeight:700,fontSize:13,color:t}}>Jadwal Mendatang</p>
          </div>
          {upcoming.map((u,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 16px",borderBottom:i<upcoming.length-1?`1px solid ${bd}`:"none",
              transition:"background .12s"}}
              onMouseEnter={e=>e.currentTarget.style.background=dark?"rgba(255,255,255,.02)":"#fafbfc"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={{width:52,flexShrink:0}}>
                <p style={{fontSize:10,fontWeight:800,color:C.teal,marginBottom:1}}>{u.date}</p>
                <p style={{fontSize:10,color:m}}>{u.time}</p>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:13,fontWeight:700,color:t}}>{u.title}</p>
                <p style={{fontSize:11,color:m,marginTop:1}}>{u.assignee}</p>
              </div>
              <Badge color={stsCfg[u.status]?.col}>{stsCfg[u.status]?.label}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ADMIN PAGE: WORK ORDERS (Desktop)
───────────────────────────────────────────────────────────── */
function PageAdminWorkOrders({dark}) {
  const t=dark?C.sky200:C.slate800,m=dark?C.darkText:C.slate500,bd=dark?C.darkBd:C.sky100;
  const [filter,setFilter]=useState("all");
  const statuses=["all","assigned","in_progress","completed","overdue"];
  const filtered=filter==="all"?D.workorders:D.workorders.filter(w=>w.status===filter);
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div><h2 style={{fontSize:18,fontWeight:900,color:t}}>Work Order</h2><p style={{fontSize:12,color:m}}>Kelola seluruh pekerjaan dan perbaikan gedung</p></div>
        <div style={{display:"flex",gap:8}}>
          <button style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:9,border:`1px solid ${bd}`,cursor:"pointer",background:"transparent",color:m,fontSize:12,fontWeight:700}}>
            <Ic n="download" s={13} col={m}/> Export
          </button>
          <button style={{display:"flex",alignItems:"center",gap:6,padding:"9px 18px",borderRadius:10,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${C.teal},${C.cyan})`,color:C.white,fontSize:13,fontWeight:700}}>
            <Ic n="plus" s={14} col={C.white}/> Buat WO
          </button>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        {[{label:"Total WO",value:D.workorders.length,c:C.teal},{label:"Sedang Berjalan",value:D.workorders.filter(w=>w.status==="in_progress").length,c:C.cyan},{label:"Selesai",value:D.workorders.filter(w=>w.status==="completed").length,c:C.green},{label:"Terlambat",value:D.workorders.filter(w=>w.status==="overdue").length,c:C.red}].map(k=>(
          <Card key={k.label} dark={dark}><p style={{fontSize:11,color:m,marginBottom:8,fontWeight:600}}>{k.label}</p><p style={{fontSize:26,fontWeight:900,color:k.c}}>{k.value}</p></Card>
        ))}
      </div>
      <Card dark={dark}>
        <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
          {statuses.map(s=>(
            <button key={s} onClick={()=>setFilter(s)} style={{padding:"6px 14px",borderRadius:99,border:`1px solid ${filter===s?C.teal:bd}`,cursor:"pointer",background:filter===s?C.teal:"transparent",color:filter===s?C.white:m,fontSize:12,fontWeight:700}}>
              {s==="all"?"Semua":stsCfg[s]?.label||s}
            </button>
          ))}
        </div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["NOMOR WO","JUDUL","ASSIGNEE","LOKASI","PRIORITAS","STATUS","TENGGAT"].map(h=><th key={h} style={{padding:"10px 12px",textAlign:"left",fontSize:10,fontWeight:700,color:m,borderBottom:`1px solid ${bd}`,letterSpacing:.5,whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map(w=>(
              <tr key={w.id} style={{cursor:"pointer",transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background=dark?"rgba(255,255,255,.03)":C.sky50} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{padding:"12px",borderBottom:`1px solid ${bd}`}}><span style={{fontFamily:"monospace",fontSize:12,fontWeight:700,color:C.teal}}>{w.id}</span></td>
                <td style={{padding:"12px",borderBottom:`1px solid ${bd}`}}><span style={{fontSize:13,fontWeight:600,color:t}}>{w.title}</span></td>
                <td style={{padding:"12px",borderBottom:`1px solid ${bd}`}}><span style={{fontSize:12,color:m}}>{w.assignee}</span></td>
                <td style={{padding:"12px",borderBottom:`1px solid ${bd}`}}><span style={{fontSize:11,color:m}}>Lt.{w.floor} · {w.loc}</span></td>
                <td style={{padding:"12px",borderBottom:`1px solid ${bd}`}}><Badge color={prioCfg[w.priority]?.col}>{prioCfg[w.priority]?.label}</Badge></td>
                <td style={{padding:"12px",borderBottom:`1px solid ${bd}`}}><Badge color={stsCfg[w.status]?.col}>{stsCfg[w.status]?.label}</Badge></td>
                <td style={{padding:"12px",borderBottom:`1px solid ${bd}`}}><span style={{fontSize:11,color:m}}>{w.due}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ADMIN PAGE: MATERIALS (Desktop)
───────────────────────────────────────────────────────────── */
function PageAdminMaterials({dark}) {
  const t=dark?C.sky200:C.slate800,m=dark?C.darkText:C.slate500,bd=dark?C.darkBd:C.sky100;
  const [tab,setTab]=useState("stock");
  const lowStock=D.materials.filter(x=>x.low);
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div><h2 style={{fontSize:18,fontWeight:900,color:t}}>Manajemen Material</h2><p style={{fontSize:12,color:m}}>Kelola stok dan request material gedung</p></div>
        <button style={{display:"flex",alignItems:"center",gap:6,padding:"9px 18px",borderRadius:10,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${C.teal},${C.cyan})`,color:C.white,fontSize:13,fontWeight:700}}>
          <Ic n="plus" s={14} col={C.white}/> Tambah Material
        </button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        {[{label:"Total Item",value:D.materials.length,c:C.teal},{label:"Stok Rendah",value:lowStock.length,c:C.red},{label:"Request Pending",value:D.approvals.filter(a=>a.type==="material"&&a.status==="pending").length,c:C.orange},{label:"Disetujui Minggu Ini",value:D.approvals.filter(a=>a.status==="approved").length,c:C.green}].map(k=>(
          <Card key={k.label} dark={dark}><p style={{fontSize:11,color:m,marginBottom:8,fontWeight:600}}>{k.label}</p><p style={{fontSize:26,fontWeight:900,color:k.c}}>{k.value}</p></Card>
        ))}
      </div>
      {lowStock.length>0&&(
        <div style={{background:C.redLt,border:`1px solid ${C.redBd}`,borderRadius:14,padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
          <Ic n="alert" s={15} col={C.red}/>
          <span style={{fontSize:13,fontWeight:700,color:C.red}}>{lowStock.length} item di bawah stok minimum: </span>
          <span style={{fontSize:13,color:"#991b1b"}}>{lowStock.map(x=>x.name).join(", ")}</span>
        </div>
      )}
      <div style={{display:"flex",gap:0,marginBottom:16,background:dark?C.dark800:C.slate100,borderRadius:12,padding:3,width:"fit-content"}}>
        {[["stock","📦 Stok"],["requests","📋 Approval Request"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{padding:"8px 18px",borderRadius:10,border:"none",cursor:"pointer",fontSize:13,fontWeight:700,background:tab===k?C.teal:"transparent",color:tab===k?C.white:m}}>
            {l}
          </button>
        ))}
      </div>
      {tab==="stock"?(
        <Card dark={dark}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>{["ID","Nama Material","Kategori","Stok","Min","Satuan","Status"].map(h=><th key={h} style={{padding:"10px 12px",textAlign:"left",fontSize:10,fontWeight:700,color:m,borderBottom:`1px solid ${bd}`,letterSpacing:.5}}>{h}</th>)}</tr></thead>
            <tbody>
              {D.materials.map((mat,i)=>(
                <tr key={mat.id} onMouseEnter={e=>e.currentTarget.style.background=dark?"rgba(255,255,255,.03)":C.sky50} onMouseLeave={e=>e.currentTarget.style.background="transparent"} style={{transition:"background .15s"}}>
                  <td style={{padding:"12px",borderBottom:`1px solid ${bd}`}}><span style={{fontFamily:"monospace",fontSize:11,color:C.teal,fontWeight:700}}>MAT-00{i+1}</span></td>
                  <td style={{padding:"12px",borderBottom:`1px solid ${bd}`}}><span style={{fontSize:13,fontWeight:600,color:t}}>{mat.name}</span></td>
                  <td style={{padding:"12px",borderBottom:`1px solid ${bd}`}}><Badge color="teal">{mat.cat}</Badge></td>
                  <td style={{padding:"12px",borderBottom:`1px solid ${bd}`}}><span style={{fontSize:14,fontWeight:900,color:mat.low?C.red:C.teal}}>{mat.stock}</span></td>
                  <td style={{padding:"12px",borderBottom:`1px solid ${bd}`}}><span style={{fontSize:12,color:m}}>{mat.min}</span></td>
                  <td style={{padding:"12px",borderBottom:`1px solid ${bd}`}}><span style={{fontSize:12,color:m}}>{mat.unit}</span></td>
                  <td style={{padding:"12px",borderBottom:`1px solid ${bd}`}}><Badge color={mat.low?"red":"green"}>{mat.low?"⚠️ Rendah":"✅ Aman"}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ):(
        <Card dark={dark}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>{["ID","Material","Tipe","Diminta oleh","Tanggal","Status","Aksi"].map(h=><th key={h} style={{padding:"10px 12px",textAlign:"left",fontSize:10,fontWeight:700,color:m,borderBottom:`1px solid ${bd}`,letterSpacing:.5}}>{h}</th>)}</tr></thead>
            <tbody>
              {D.approvals.filter(a=>a.type==="material").map(a=>(
                <tr key={a.id} onMouseEnter={e=>e.currentTarget.style.background=dark?"rgba(255,255,255,.03)":C.sky50} onMouseLeave={e=>e.currentTarget.style.background="transparent"} style={{transition:"background .15s"}}>
                  <td style={{padding:"12px",borderBottom:`1px solid ${bd}`}}><span style={{fontFamily:"monospace",fontSize:11,color:C.teal,fontWeight:700}}>{a.id}</span></td>
                  <td style={{padding:"12px",borderBottom:`1px solid ${bd}`}}><span style={{fontSize:13,fontWeight:600,color:t}}>{a.title}</span></td>
                  <td style={{padding:"12px",borderBottom:`1px solid ${bd}`}}><Badge color="blue">📦 Material</Badge></td>
                  <td style={{padding:"12px",borderBottom:`1px solid ${bd}`}}><span style={{fontSize:12,color:m}}>{a.by}</span></td>
                  <td style={{padding:"12px",borderBottom:`1px solid ${bd}`}}><span style={{fontSize:11,color:m}}>{a.date}</span></td>
                  <td style={{padding:"12px",borderBottom:`1px solid ${bd}`}}><Badge color={a.status==="pending"?"yellow":"green"}>{a.status==="pending"?"⏳ Pending":"✅ Disetujui"}</Badge></td>
                  <td style={{padding:"12px",borderBottom:`1px solid ${bd}`}}>
                    {a.status==="pending"?(
                      <div style={{display:"flex",gap:6}}>
                        <button style={{padding:"5px 12px",borderRadius:7,border:"none",cursor:"pointer",background:C.greenLt,color:"#15803d",fontSize:11,fontWeight:700}}>✅ Setujui</button>
                        <button style={{padding:"5px 12px",borderRadius:7,border:"none",cursor:"pointer",background:C.redLt,color:C.red,fontSize:11,fontWeight:700}}>❌ Tolak</button>
                      </div>
                    ):<span style={{fontSize:11,color:m}}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ADMIN PAGE: BILLING
───────────────────────────────────────────────────────────── */
function PageBilling({dark}) {
  const t=dark?C.sky200:C.slate800,m=dark?C.darkText:C.slate500,bd=dark?C.darkBd:C.sky100;
  const plan={name:"Professional",price:"Rp 6.900.000",cycle:"per bulan",nextBill:"1 Juni 2026",status:"active"};
  const invoices=[
    {id:"INV-2026-05",date:"01/05/2026",amount:"Rp 6.900.000",status:"paid"},
    {id:"INV-2026-04",date:"01/04/2026",amount:"Rp 6.900.000",status:"paid"},
    {id:"INV-2026-03",date:"01/03/2026",amount:"Rp 6.900.000",status:"paid"},
    {id:"INV-2026-02",date:"01/02/2026",amount:"Rp 6.900.000",status:"paid"},
  ];
  return (
    <div>
      <div style={{marginBottom:18}}><h2 style={{fontSize:18,fontWeight:900,color:t}}>Billing & Langganan</h2><p style={{fontSize:12,color:m}}>Kelola paket, tagihan, dan metode pembayaran</p></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
        <Card dark={dark} style={{background:dark?undefined:`linear-gradient(135deg,${C.teal},${C.cyanDk})`,border:"none"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
            <div>
              <p style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.7)",marginBottom:4}}>Paket Aktif</p>
              <p style={{fontSize:22,fontWeight:900,color:dark?C.teal:C.white}}>{plan.name}</p>
            </div>
            <Badge color="green">● Aktif</Badge>
          </div>
          <p style={{fontSize:28,fontWeight:900,color:dark?C.sky100:C.white,lineHeight:1}}>{plan.price}<span style={{fontSize:13,fontWeight:600,color:dark?C.darkText:"rgba(255,255,255,.7)"}}>/{plan.cycle.split(" ")[1]}</span></p>
          <p style={{fontSize:11,color:dark?C.darkText:"rgba(255,255,255,.65)",marginTop:8}}>Tagihan berikutnya: {plan.nextBill}</p>
          <button style={{marginTop:16,padding:"9px 18px",borderRadius:10,border:dark?`1px solid ${C.teal}`:"2px solid rgba(255,255,255,.4)",cursor:"pointer",background:"transparent",color:dark?C.teal:C.white,fontSize:12,fontWeight:700}}>
            Ganti Paket
          </button>
        </Card>
        <Card dark={dark}>
          <p style={{fontWeight:800,fontSize:14,color:t,marginBottom:14}}>Metode Pembayaran</p>
          <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px",borderRadius:12,border:`1px solid ${bd}`,marginBottom:10}}>
            <div style={{width:44,height:28,background:`linear-gradient(135deg,#1a56db,#0ea5e9)`,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:9,fontWeight:900,color:C.white}}>VISA</span></div>
            <div><p style={{fontSize:13,fontWeight:700,color:t}}>•••• •••• •••• 4242</p><p style={{fontSize:11,color:m}}>Exp: 12/2028</p></div>
            <Badge color="green" style={{marginLeft:"auto"}}>Utama</Badge>
          </div>
          <button style={{width:"100%",padding:"9px",borderRadius:10,border:`2px dashed ${bd}`,cursor:"pointer",background:"transparent",color:m,fontSize:12,fontWeight:700}}>
            + Tambah Metode Pembayaran
          </button>
        </Card>
      </div>
      <Card dark={dark}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <p style={{fontWeight:800,fontSize:15,color:t}}>Riwayat Tagihan</p>
          <button style={{display:"flex",alignItems:"center",gap:6,padding:"7px 13px",borderRadius:9,border:`1px solid ${bd}`,cursor:"pointer",background:"transparent",color:m,fontSize:12,fontWeight:700}}>
            <Ic n="download" s={13} col={m}/> Export PDF
          </button>
        </div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["No. Invoice","Tanggal","Paket","Jumlah","Status","Aksi"].map(h=><th key={h} style={{padding:"10px 12px",textAlign:"left",fontSize:10,fontWeight:700,color:m,borderBottom:`1px solid ${bd}`,letterSpacing:.5}}>{h}</th>)}</tr></thead>
          <tbody>
            {invoices.map(inv=>(
              <tr key={inv.id} onMouseEnter={e=>e.currentTarget.style.background=dark?"rgba(255,255,255,.03)":C.sky50} onMouseLeave={e=>e.currentTarget.style.background="transparent"} style={{transition:"background .15s"}}>
                <td style={{padding:"12px",borderBottom:`1px solid ${bd}`}}><span style={{fontFamily:"monospace",fontSize:12,color:C.teal,fontWeight:700}}>{inv.id}</span></td>
                <td style={{padding:"12px",borderBottom:`1px solid ${bd}`}}><span style={{fontSize:12,color:m}}>{inv.date}</span></td>
                <td style={{padding:"12px",borderBottom:`1px solid ${bd}`}}><span style={{fontSize:12,fontWeight:600,color:t}}>Professional</span></td>
                <td style={{padding:"12px",borderBottom:`1px solid ${bd}`}}><span style={{fontSize:13,fontWeight:700,color:t}}>{inv.amount}</span></td>
                <td style={{padding:"12px",borderBottom:`1px solid ${bd}`}}><Badge color="green">✅ Lunas</Badge></td>
                <td style={{padding:"12px",borderBottom:`1px solid ${bd}`}}><button style={{padding:"5px 12px",borderRadius:7,border:`1px solid ${bd}`,cursor:"pointer",background:"transparent",color:m,fontSize:11,fontWeight:600}}>Download</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function PageSimple({title,desc,dark}) {
  const t=dark?C.sky200:C.slate800,m=dark?C.darkText:C.slate500;
  return (
    <div>
      <div style={{marginBottom:18}}><h2 style={{fontSize:18,fontWeight:900,color:t}}>{title}</h2><p style={{fontSize:12,color:m}}>{desc}</p></div>
      <Card dark={dark} style={{textAlign:"center",padding:"60px"}}>
        <Ic n="settings" s={48} col={m} style={{display:"block",margin:"0 auto 16px"}}/>
        <p style={{fontSize:16,fontWeight:700,color:t,marginBottom:8}}>{title}</p>
        <p style={{fontSize:13,color:m}}>Halaman ini akan ditampilkan di sini. Data terhubung ke API backend.</p>
      </Card>
    </div>
  );
}

function AdminApp({onBack}) {
  const [page,setPage]=useState("dashboard");
  const [dark,setDark]=useState(false);
  const render=()=>{
    switch(page) {
      case"dashboard": return <PageAdminDashboard dark={dark}/>;
      case"assets": return <PageAssets dark={dark}/>;
      case"users": return <PageUsers dark={dark}/>;
      case"alarms": return <PageAlarms dark={dark}/>;
      case"visitors": return <PageVisitors dark={dark}/>;
      case"templates": return <PageTemplates dark={dark}/>;
      case"schedules": return <PageSchedules dark={dark}/>;
      case"workorders": return <PageAdminWorkOrders dark={dark}/>;
      case"materials": return <PageAdminMaterials dark={dark}/>;
      case"billing": return <PageBilling dark={dark}/>;
      default: return <PageSimple title={ADMIN_NAV.find(x=>x.id===page)?.label||page} desc="Halaman manajemen gedung" dark={dark}/>;
    }
  };
  return (
    <div style={{position:"relative"}}>
      <button onClick={onBack} style={{position:"fixed",top:16,right:16,zIndex:300,background:C.white,border:"none",borderRadius:10,padding:"8px 14px",fontSize:12,fontWeight:700,color:C.teal,cursor:"pointer",boxShadow:"0 3px 14px rgba(0,0,0,.12)",display:"flex",alignItems:"center",gap:6}}>
        ← Kembali
      </button>
      <AdminLayout page={page} setPage={setPage} dark={dark} onToggleDark={()=>setDark(x=>!x)}>
        {render()}
      </AdminLayout>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ███ SUPER ADMIN ███  (Dark Teal theme)
═══════════════════════════════════════════════════════════════ */
function SuperAdminApp({onBack}) {
  const [tab,setTab]=useState("overview");
  const BG=C.dark900,CARD=C.dark700,BD=C.darkBd,TXT=C.sky100,MUT=C.darkText;
  const planColor={starter:C.teal,professional:C.cyan,enterprise:C.purple};
  const statusColor={trial:"blue",active:"green",past_due:"red",suspended:"gray"};
  const totalMRR=D.companies.reduce((s,c)=>s+c.mrr,0);

  return (
    <div style={{display:"flex",height:"100vh",background:BG,overflow:"hidden",fontFamily:"'Plus Jakarta Sans',system-ui"}}>
      <button onClick={onBack} style={{position:"fixed",top:16,right:16,zIndex:300,background:C.dark700,border:`1px solid ${C.darkBd}`,borderRadius:10,padding:"8px 14px",fontSize:12,fontWeight:700,color:C.sky300,cursor:"pointer"}}>
        ← Kembali
      </button>

      {/* Sidebar */}
      <aside style={{width:220,background:"#050e1a",borderRight:`1px solid ${BD}`,display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{padding:"22px 18px 18px",borderBottom:`1px solid ${BD}`}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <div style={{width:34,height:34,background:`linear-gradient(135deg,${C.teal},${C.cyan})`,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <Ic n="shield" s={17} col={C.white}/>
            </div>
            <div><p style={{fontSize:14,fontWeight:800,color:TXT}}>SOMA BMS</p><p style={{fontSize:9,color:C.teal,letterSpacing:.5,fontWeight:700}}>SUPER ADMIN</p></div>
          </div>
        </div>
        <nav style={{flex:1,padding:"12px 10px"}}>
          {[{id:"overview",n:"grid",label:"Overview"},{id:"companies",n:"building",label:"Semua Company"},{id:"settings",n:"settings",label:"Platform Settings"}].map(item=>{
            const act=tab===item.id;
            return <button key={item.id} onClick={()=>setTab(item.id)}
              style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:11,marginBottom:3,border:"none",cursor:"pointer",
                background:act?`${C.teal}20`:"transparent",color:act?C.teal:MUT,transition:"all .18s"}}>
              <Ic n={item.n} s={16} col={act?C.teal:MUT} sw={act?2:1.5}/>
              <span style={{fontSize:13,fontWeight:act?700:500}}>{item.label}</span>
            </button>;
          })}
        </nav>
        <div style={{borderTop:`1px solid ${BD}`,padding:"14px 12px"}}>
          <div style={{display:"flex",alignItems:"center",gap:9,padding:"8px 10px",marginBottom:6,background:`${C.teal}10`,borderRadius:10}}>
            <div style={{width:30,height:30,borderRadius:"50%",background:`${C.teal}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:C.teal}}>SA</div>
            <div><p style={{fontSize:12,fontWeight:700,color:TXT}}>Super Admin</p><p style={{fontSize:9,color:C.teal}}>super_admin</p></div>
          </div>
          <button style={{width:"100%",display:"flex",alignItems:"center",gap:7,padding:"7px 10px",borderRadius:9,border:"none",cursor:"pointer",background:"transparent",color:MUT,fontSize:12}}>
            <Ic n="logout" s={13} col={MUT}/> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <header style={{background:C.dark800,borderBottom:`1px solid ${BD}`,padding:"0 24px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <p style={{fontSize:16,fontWeight:800,color:TXT}}>Platform Overview</p>
          <div style={{display:"flex",gap:10}}>
            <div style={{display:"flex",alignItems:"center",gap:8,background:C.dark700,border:`1px solid ${BD}`,borderRadius:10,padding:"7px 12px"}}>
              <Ic n="search" s={14} col={MUT}/><input placeholder="Search..." style={{background:"transparent",border:"none",outline:"none",fontSize:12,color:TXT,width:120}}/>
            </div>
            <button style={{width:34,height:34,borderRadius:9,background:C.dark700,border:`1px solid ${BD}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",position:"relative"}}>
              <Ic n="bell" s={15} col={MUT}/>
              <div style={{position:"absolute",top:8,right:8,width:6,height:6,borderRadius:"50%",background:C.red}}/>
            </button>
            <div style={{display:"flex",alignItems:"center",gap:6,background:`${C.teal}18`,border:`1px solid ${C.teal}40`,borderRadius:9,padding:"6px 12px"}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:C.teal,animation:"pulse 2s infinite"}}/>
              <span style={{fontSize:11,fontWeight:700,color:C.teal}}>Super Admin</span>
            </div>
          </div>
        </header>

        <main style={{flex:1,overflowY:"auto",padding:"22px 24px",background:BG}}>
          {/* KPI */}
          {tab==="overview"&&<div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22}}>
            {[
              {label:"Total Company",value:D.companies.length,icon:"building",c:C.teal,trend:"+12%"},
              {label:"Total Gedung",value:D.companies.reduce((s,c)=>s+c.buildings,0),icon:"grid",c:C.cyan,trend:"+8%"},
              {label:"Total Pengguna",value:D.companies.reduce((s,c)=>s+c.users,0),icon:"users",c:C.green,trend:"+5%"},
              {label:"MRR",value:`Rp${(totalMRR/1000000).toFixed(1)}jt`,icon:"dollar",c:C.teal,trend:"+15%"},
            ].map(k=>(
              <div key={k.label} style={{background:CARD,border:`1px solid ${BD}`,borderRadius:16,padding:"18px 20px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                  <div style={{width:38,height:38,borderRadius:11,background:`${k.c}18`,display:"flex",alignItems:"center",justifyContent:"center"}}><Ic n={k.icon} s={18} col={k.c}/></div>
                  <Ic n="moreV" s={14} col={MUT}/>
                </div>
                <p style={{fontSize:28,fontWeight:900,color:TXT,lineHeight:1,marginBottom:4}}>{k.value}</p>
                <p style={{fontSize:12,color:MUT,marginBottom:10}}>{k.label}</p>
                <div style={{display:"flex",alignItems:"center",gap:5}}><Ic n="trendUp" s={11} col={C.green}/><span style={{fontSize:11,fontWeight:700,color:C.green}}>{k.trend}</span><span style={{fontSize:11,color:MUT}}>vs bulan lalu</span></div>
              </div>
            ))}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:22}}>
            {/* Subscription Status */}
            <div style={{background:CARD,border:`1px solid ${BD}`,borderRadius:16,padding:"20px"}}>
              <p style={{fontWeight:800,fontSize:15,color:TXT,marginBottom:18}}>Subscription Status</p>
              {[{label:"Active",val:D.companies.filter(c=>c.status==="active").length,c:C.green},
                {label:"Trial",val:D.companies.filter(c=>c.status==="trial").length,c:C.teal},
                {label:"Past Due",val:0,c:C.red},{label:"Suspended",val:0,c:MUT}].map(s=>(
                <div key={s.label} style={{marginBottom:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                    <div style={{display:"flex",alignItems:"center",gap:7}}><div style={{width:8,height:8,borderRadius:"50%",background:s.c}}/><span style={{fontSize:13,color:TXT,fontWeight:600}}>{s.label}</span></div>
                    <span style={{fontSize:13,fontWeight:800,color:TXT}}>{s.val}</span>
                  </div>
                  <ProgressBar pct={D.companies.length>0?(s.val/D.companies.length)*100:0} color={s.c} h={7} dark/>
                </div>
              ))}
            </div>

            {/* Revenue */}
            <div style={{background:CARD,border:`1px solid ${BD}`,borderRadius:16,padding:"20px"}}>
              <p style={{fontWeight:800,fontSize:15,color:TXT,marginBottom:18}}>Revenue</p>
              {[["MRR (Monthly Recurring)",`Rp${totalMRR.toLocaleString("id-ID")}`],["Bulan Ini",`Rp${totalMRR.toLocaleString("id-ID")}`],["All-time Total",`Rp${(totalMRR*12).toLocaleString("id-ID")}`]].map(([l,v])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${BD}`}}>
                  <span style={{fontSize:13,color:MUT}}>{l}</span>
                  <span style={{fontSize:14,fontWeight:800,color:C.teal}}>{v}</span>
                </div>
              ))}
              <div style={{marginTop:14,background:`${C.yellow}15`,border:`1px solid ${C.yellowBd}`,borderRadius:10,padding:"10px 14px",display:"flex",gap:7,alignItems:"center"}}>
                <Ic n="alert" s={13} col={C.yellow}/>
                <p style={{fontSize:11,color:C.yellow,fontWeight:600}}>{D.companies.filter(c=>c.status==="trial").length} company aktif berkontribusi ke MRR (trial)</p>
              </div>
            </div>
          </div>

          {/* Company table */}
          <div style={{background:CARD,border:`1px solid ${BD}`,borderRadius:16,padding:"20px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <p style={{fontWeight:800,fontSize:15,color:TXT}}>Company Terbaru</p>
              <button style={{fontSize:12,fontWeight:700,color:C.teal,background:"none",border:"none",cursor:"pointer"}}>Lihat Semua →</button>
            </div>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr>{["COMPANY","PAKET","STATUS","GEDUNG","USER","MRR","DAFTAR"].map(h=><th key={h} style={{padding:"10px 12px",textAlign:"left",fontSize:10,fontWeight:700,color:MUT,borderBottom:`1px solid ${BD}`,letterSpacing:.5}}>{h}</th>)}</tr></thead>
              <tbody>
                {D.companies.map(co=>(
                  <tr key={co.id}>
                    <td style={{padding:"12px",borderBottom:`1px solid ${BD}`}}>
                      <p style={{fontSize:13,fontWeight:700,color:TXT}}>{co.name}</p>
                      <p style={{fontSize:11,color:MUT}}>{co.email}</p>
                    </td>
                    <td style={{padding:"12px",borderBottom:`1px solid ${BD}`}}><span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:99,background:`${planColor[co.plan]}20`,color:planColor[co.plan]}}>{co.plan}</span></td>
                    <td style={{padding:"12px",borderBottom:`1px solid ${BD}`}}><Badge color={statusColor[co.status]||"gray"} dot>{co.status}</Badge></td>
                    <td style={{padding:"12px",borderBottom:`1px solid ${BD}`}}><span style={{fontSize:13,fontWeight:700,color:TXT}}>{co.buildings}</span></td>
                    <td style={{padding:"12px",borderBottom:`1px solid ${BD}`}}><span style={{fontSize:13,fontWeight:700,color:TXT}}>{co.users}</span></td>
                    <td style={{padding:"12px",borderBottom:`1px solid ${BD}`}}><span style={{fontSize:13,fontWeight:700,color:C.teal}}>Rp{(co.mrr/1000000).toFixed(1)}jt</span></td>
                    <td style={{padding:"12px",borderBottom:`1px solid ${BD}`}}><span style={{fontSize:11,color:MUT}}>{co.date}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>}

          {/* Companies Tab */}
          {tab==="companies"&&<div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div><p style={{fontSize:18,fontWeight:900,color:TXT}}>Semua Company</p><p style={{fontSize:12,color:MUT}}>Kelola tenant dan subscription perusahaan</p></div>
              <button style={{display:"flex",alignItems:"center",gap:6,padding:"9px 18px",borderRadius:10,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${C.teal},${C.cyan})`,color:C.white,fontSize:13,fontWeight:700}}>
                <Ic n="plus" s={14} col={C.white}/> Tambah Company
              </button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
              {[{label:"Total Company",val:D.companies.length,c:C.teal},{label:"Active",val:D.companies.filter(x=>x.status==="active").length,c:C.green},{label:"Trial",val:D.companies.filter(x=>x.status==="trial").length,c:C.cyan}].map(k=>(
                <div key={k.label} style={{background:CARD,border:`1px solid ${BD}`,borderRadius:14,padding:"16px 18px"}}>
                  <p style={{fontSize:11,color:MUT,marginBottom:6,fontWeight:600}}>{k.label}</p>
                  <p style={{fontSize:26,fontWeight:900,color:k.c}}>{k.val}</p>
                </div>
              ))}
            </div>
            {D.companies.map(co=>(
              <div key={co.id} style={{background:CARD,border:`1px solid ${BD}`,borderRadius:16,padding:"18px 20px",marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                  <div style={{display:"flex",gap:12,alignItems:"center"}}>
                    <div style={{width:42,height:42,borderRadius:12,background:`${C.teal}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:900,color:C.teal}}>
                      {co.name.split(" ")[0][0]}{co.name.split(" ")[1]?.[0]||""}
                    </div>
                    <div>
                      <p style={{fontSize:14,fontWeight:800,color:TXT}}>{co.name}</p>
                      <p style={{fontSize:11,color:MUT}}>{co.email}</p>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:99,background:`${planColor[co.plan]}20`,color:planColor[co.plan]}}>{co.plan}</span>
                    <Badge color={statusColor[co.status]||"gray"} dot>{co.status}</Badge>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
                  {[["Gedung",co.buildings,"building"],["Pengguna",co.users,"users"],["MRR",`Rp${(co.mrr/1000000).toFixed(1)}jt`,"dollar"],["Bergabung",co.date,"calendar"]].map(([l,v,icon])=>(
                    <div key={l}>
                      <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}><Ic n={icon} s={11} col={MUT}/><span style={{fontSize:10,color:MUT,fontWeight:600}}>{l}</span></div>
                      <p style={{fontSize:14,fontWeight:800,color:TXT}}>{v}</p>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",gap:8,marginTop:14,paddingTop:14,borderTop:`1px solid ${BD}`}}>
                  <button style={{padding:"6px 14px",borderRadius:8,border:`1px solid ${BD}`,cursor:"pointer",background:"transparent",color:TXT,fontSize:12,fontWeight:600}}>Detail</button>
                  <button style={{padding:"6px 14px",borderRadius:8,border:`1px solid ${C.teal}40`,cursor:"pointer",background:`${C.teal}10`,color:C.teal,fontSize:12,fontWeight:700}}>Impersonate</button>
                  <button style={{padding:"6px 14px",borderRadius:8,border:"none",cursor:"pointer",background:`${C.red}15`,color:C.red,fontSize:12,fontWeight:700,marginLeft:"auto"}}>Suspend</button>
                </div>
              </div>
            ))}
          </div>}

          {/* Settings Tab */}
          {tab==="settings"&&<div>
            <div style={{marginBottom:20}}><p style={{fontSize:18,fontWeight:900,color:TXT}}>Platform Settings</p><p style={{fontSize:12,color:MUT}}>Konfigurasi global platform SOMA BMS</p></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div>
                <div style={{background:CARD,border:`1px solid ${BD}`,borderRadius:16,padding:"20px",marginBottom:14}}>
                  <p style={{fontWeight:800,fontSize:14,color:TXT,marginBottom:16}}>⚙️ Pengaturan Umum</p>
                  {[["Nama Platform","SOMA BMS Enterprise"],["Versi","v3.2.1"],["Environment","Production"],["Zona Waktu","Asia/Jakarta (WIB)"],["Bahasa Default","Indonesia"]].map(([l,v])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${BD}`}}>
                      <span style={{fontSize:12,color:MUT}}>{l}</span>
                      <span style={{fontSize:12,fontWeight:700,color:TXT}}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{background:CARD,border:`1px solid ${BD}`,borderRadius:16,padding:"20px"}}>
                  <p style={{fontWeight:800,fontSize:14,color:TXT,marginBottom:16}}>🔔 Notifikasi</p>
                  {[["Email Alarm Critical",true],["Push Notification",true],["Slack Integration",false],["WhatsApp Blast",true],["SMS Gateway",false]].map(([l,on])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${BD}`}}>
                      <span style={{fontSize:12,color:MUT}}>{l}</span>
                      <div style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer"}}>
                        <div style={{width:34,height:18,borderRadius:9,background:on?C.teal:"rgba(255,255,255,.15)",position:"relative",transition:"background .2s"}}>
                          <div style={{position:"absolute",top:2,left:on?16:2,width:14,height:14,borderRadius:"50%",background:C.white,transition:"left .2s"}}/>
                        </div>
                        <span style={{fontSize:11,fontWeight:700,color:on?C.teal:MUT}}>{on?"Aktif":"Nonaktif"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{background:CARD,border:`1px solid ${BD}`,borderRadius:16,padding:"20px",marginBottom:14}}>
                  <p style={{fontWeight:800,fontSize:14,color:TXT,marginBottom:16}}>🔒 Keamanan</p>
                  {[["Two-Factor Auth","Wajib (semua user)"],["Session Timeout","8 jam"],["IP Whitelist","Nonaktif"],["Audit Log Retention","90 hari"],["Password Policy","Strong (min 10 char)"]].map(([l,v])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${BD}`}}>
                      <span style={{fontSize:12,color:MUT}}>{l}</span>
                      <span style={{fontSize:12,fontWeight:700,color:TXT}}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{background:CARD,border:`1px solid ${BD}`,borderRadius:16,padding:"20px"}}>
                  <p style={{fontWeight:800,fontSize:14,color:TXT,marginBottom:16}}>📊 Status Sistem</p>
                  {[["API Server","Online",true],["Database","Online",true],["File Storage","Online",true],["Email Service","Online",true],["SMS Gateway","Degraded",false]].map(([l,v,ok])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${BD}`}}>
                      <span style={{fontSize:12,color:MUT}}>{l}</span>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <div style={{width:7,height:7,borderRadius:"50%",background:ok?C.green:C.yellow,animation:"pulse 2s infinite"}}/>
                        <span style={{fontSize:12,fontWeight:700,color:ok?C.green:C.yellow}}>{v}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>}
        </main>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ███ TRO / SECURITY DASHBOARD ███
═══════════════════════════════════════════════════════════════ */
function TROApp({onBack}) {
  const [qrInput,setQrInput]=useState("");
  const [validated,setValidated]=useState(null);
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({name:"",id_type:"KTP",purpose:"",host:""});
  const onsite=D.visitors.filter(v=>v.status==="on_premise");
  const scheduled=D.visitors.filter(v=>v.status==="scheduled");

  const validate=()=>{
    if(qrInput.length>3){setValidated({valid:true,name:"Ahmad Dhani",host:"PT Sinarmas",floor:"Lt.8"});}
    else setValidated({valid:false,msg:"QR Code tidak ditemukan atau sudah expired"});
  };

  return (
    <div style={{minHeight:"100vh",background:C.sky50,fontFamily:"'Plus Jakarta Sans',system-ui"}}>
      {/* Top bar */}
      <header style={{background:C.slate900,padding:"0 24px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:30,height:30,background:`linear-gradient(135deg,${C.teal},${C.cyan})`,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:C.white,fontWeight:900,fontSize:13}}>S</span></div>
          <div><p style={{fontSize:13,fontWeight:800,color:C.white}}>SOMA BMS · TRO</p><p style={{fontSize:10,color:C.slate400}}>Gedung Soma Tower A · Security</p></div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button style={{fontSize:12,fontWeight:600,color:C.slate300,background:"none",border:`1px solid ${C.slate700}`,borderRadius:8,padding:"6px 12px",cursor:"pointer"}}>🗂 Admin Dashboard</button>
          <button onClick={onBack} style={{fontSize:12,fontWeight:700,color:C.white,background:"none",border:`1px solid ${C.slate600}`,borderRadius:8,padding:"6px 12px",cursor:"pointer"}}>← Keluar</button>
        </div>
      </header>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"24px"}}>
        {/* KPI */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22}}>
          {[
            {label:"Tamu On-site",value:onsite.length,c:C.teal,n:"users"},
            {label:"Terdaftar Hari Ini",value:D.visitors.length,c:C.green,n:"check"},
            {label:"Total Aktif",value:onsite.length,c:C.orange,n:"activity"},
            {label:"Gedung",value:"20 Lt",c:C.cyan,n:"building"},
          ].map(k=>(
            <Card key={k.label}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div style={{width:36,height:36,borderRadius:10,background:`${k.c}12`,display:"flex",alignItems:"center",justifyContent:"center"}}><Ic n={k.n} s={17} col={k.c}/></div>
              </div>
              <p style={{fontSize:26,fontWeight:900,color:k.c,lineHeight:1}}>{k.value}</p>
              <p style={{fontSize:11,color:C.slate500,marginTop:5,fontWeight:600}}>{k.label}</p>
            </Card>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"360px 1fr",gap:16}}>
          {/* QR Validasi */}
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <Card>
              <p style={{fontWeight:800,fontSize:15,color:C.slate800,marginBottom:14}}>🔍 Validasi QR Akses</p>
              <div style={{background:C.sky50,border:`2px dashed ${C.sky200}`,borderRadius:14,padding:"28px",textAlign:"center",marginBottom:14,cursor:"pointer"}}>
                <div style={{width:60,height:60,background:C.sky100,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px"}}><Ic n="qr" s={30} col={C.teal}/></div>
                <p style={{fontSize:12,fontWeight:600,color:C.teal}}>Tap untuk scan QR Code</p>
                <p style={{fontSize:11,color:C.slate400,marginTop:3}}>atau masukkan UUID manual</p>
              </div>
              <Input value={qrInput} onChange={e=>setQrInput(e.target.value)} placeholder="Tempel / scan QR code UUID..."/>
              <button onClick={validate} style={{width:"100%",marginTop:10,padding:"12px",borderRadius:11,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${C.teal},${C.cyan})`,color:C.white,fontSize:13,fontWeight:800,boxShadow:`0 4px 14px ${C.teal}40`}}>
                🔍 Validasi
              </button>
              {validated&&(
                <div style={{marginTop:12,padding:"14px",borderRadius:12,background:validated.valid?C.greenLt:C.redLt,border:`1px solid ${validated.valid?C.greenBd:C.redBd}`}}>
                  {validated.valid
                    ?<><p style={{fontSize:13,fontWeight:800,color:"#15803d"}}>✅ QR Valid — Akses Diizinkan</p><p style={{fontSize:12,color:"#166534",marginTop:4}}>{validated.name} → {validated.host} · {validated.floor}</p></>
                    :<p style={{fontSize:13,fontWeight:700,color:C.red}}>❌ {validated.msg}</p>
                  }
                </div>
              )}
            </Card>

            <button onClick={()=>setShowForm(x=>!x)} style={{width:"100%",padding:"14px",borderRadius:14,border:"none",cursor:"pointer",background:C.slate900,color:C.white,fontSize:14,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              <Ic n="plus" s={16} col={C.white}/> Daftarkan Tamu Baru
            </button>

            {showForm&&(
              <Card>
                <p style={{fontWeight:800,color:C.teal,marginBottom:14,fontSize:13}}>📝 Form Pendaftaran Tamu</p>
                {[["Nama Lengkap","name","text"],["Tujuan Kunjungan","purpose","text"],["Host / Tenant","host","text"]].map(([l,k,t])=>(
                  <div key={k} style={{marginBottom:10}}>
                    <p style={{fontSize:11,fontWeight:700,color:C.slate600,marginBottom:4}}>{l}</p>
                    <Input value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} placeholder={`Masukkan ${l.toLowerCase()}`}/>
                  </div>
                ))}
                <div style={{marginBottom:14}}>
                  <p style={{fontSize:11,fontWeight:700,color:C.slate600,marginBottom:4}}>Jenis Identitas</p>
                  <div style={{display:"flex",gap:8}}>
                    {["KTP","SIM","Passport"].map(t=>(
                      <button key={t} onClick={()=>setForm(f=>({...f,id_type:t}))}
                        style={{flex:1,padding:"8px",borderRadius:9,border:`1.5px solid ${form.id_type===t?C.teal:C.sky200}`,cursor:"pointer",background:form.id_type===t?`${C.teal}10`:C.white,color:form.id_type===t?C.teal:C.slate500,fontSize:12,fontWeight:700}}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={()=>setShowForm(false)} style={{width:"100%",padding:"12px",borderRadius:11,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${C.teal},${C.cyan})`,color:C.white,fontSize:13,fontWeight:800}}>
                  Daftarkan & Generate QR
                </button>
              </Card>
            )}
          </div>

          {/* Tamu Aktif */}
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <p style={{fontWeight:800,fontSize:15,color:C.slate800}}>Tamu Aktif</p>
                <div style={{display:"flex",alignItems:"center",gap:5,background:C.greenLt,borderRadius:99,padding:"3px 10px",border:`1px solid ${C.greenBd}`}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:C.green,animation:"pulse 2s infinite"}}/>
                  <span style={{fontSize:10,fontWeight:700,color:"#15803d"}}>{onsite.length} On-site</span>
                </div>
              </div>
              <button style={{display:"flex",alignItems:"center",gap:6,padding:"7px 12px",borderRadius:9,border:`1px solid ${C.sky200}`,cursor:"pointer",background:"transparent",color:C.slate500,fontSize:12}}>
                <Ic n="refresh" s={13} col={C.slate500}/> Refresh
              </button>
            </div>

            {D.visitors.length===0?(
              <div style={{textAlign:"center",padding:"60px",color:C.slate400}}>
                <Ic n="users" s={48} col={C.slate300} style={{display:"block",margin:"0 auto 14px"}}/>
                <p style={{fontSize:14,fontWeight:600}}>Tidak ada tamu aktif</p>
                <p style={{fontSize:12,marginTop:4}}>Klik "Daftarkan Tamu Baru" untuk mulai</p>
              </div>
            ):(
              <div>
                {/* On-premise */}
                {onsite.length>0&&<p style={{fontSize:11,fontWeight:700,color:C.slate400,marginBottom:8,letterSpacing:.5}}>🟢 ON-SITE ({onsite.length})</p>}
                {onsite.map(v=>(
                  <div key={v.id} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 0",borderBottom:`1px solid ${C.sky100}`}}>
                    <div style={{width:40,height:40,borderRadius:"50%",background:`${C.teal}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:C.teal,flexShrink:0}}>
                      {v.name.split(" ").map(w=>w[0]).join("").slice(0,2)}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:14,fontWeight:700,color:C.slate800}}>{v.name}</p>
                      <p style={{fontSize:12,color:C.slate500,marginTop:1}}>{v.host}</p>
                      <div style={{display:"flex",gap:10,marginTop:4}}>
                        <span style={{fontSize:10,color:C.slate400}}>🎯 {v.purpose}</span>
                        <span style={{fontSize:10,color:C.slate400}}>🪪 {v.id_type}</span>
                        <span style={{fontSize:10,color:C.slate400}}>⏰ Masuk: {v.in}</span>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:8,flexShrink:0}}>
                      <button style={{padding:"7px 13px",borderRadius:9,border:`1px solid ${C.sky200}`,cursor:"pointer",background:"transparent",color:C.slate600,fontSize:12,fontWeight:600}}>Detail</button>
                      <button style={{padding:"7px 13px",borderRadius:9,border:"none",cursor:"pointer",background:C.redLt,color:C.red,fontSize:12,fontWeight:700}}>Checkout</button>
                    </div>
                  </div>
                ))}

                {/* Scheduled */}
                {scheduled.length>0&&<>
                  <p style={{fontSize:11,fontWeight:700,color:C.slate400,margin:"16px 0 8px",letterSpacing:.5}}>📅 TERJADWAL ({scheduled.length})</p>
                  {scheduled.map(v=>(
                    <div key={v.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:`1px solid ${C.sky100}`}}>
                      <div style={{width:38,height:38,borderRadius:"50%",background:C.sky100,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:C.slate500,flexShrink:0}}>
                        {v.name.split(" ").map(w=>w[0]).join("").slice(0,2)}
                      </div>
                      <div style={{flex:1}}><p style={{fontSize:13,fontWeight:700,color:C.slate700}}>{v.name}</p><p style={{fontSize:11,color:C.slate400}}>{v.host} · {v.purpose}</p></div>
                      <Badge color="blue">📅 Terjadwal</Badge>
                    </div>
                  ))}
                </>}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FAQ ITEM COMPONENT
═══════════════════════════════════════════════════════════════ */
function FAQItem({item,teal}) {
  const [open,setOpen]=useState(false);
  return (
    <div style={{borderBottom:`1px solid #e0f2fe`,overflow:"hidden"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{width:"100%",textAlign:"left",padding:"20px 0",background:"none",border:"none",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",gap:16}}>
        <span style={{fontSize:15,fontWeight:700,color:"#1e293b",lineHeight:1.4}}>{item.q}</span>
        <div style={{width:28,height:28,borderRadius:8,background:open?`${teal}12`:"#f0f9ff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .2s"}}>
          <span style={{fontSize:18,color:open?teal:"#94a3b8",lineHeight:1}}>{open?"−":"+"}</span>
        </div>
      </button>
      {open&&<div style={{paddingBottom:20}}>
        <p style={{fontSize:14,color:"#64748b",lineHeight:1.75}}>{item.a}</p>
      </div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ███ LANDING PAGE ███
═══════════════════════════════════════════════════════════════ */
function LandingPage({onDemo,onAdmin,onTRO}) {
  const [scrolled,setScrolled]=useState(false);
  useEffect(()=>{const fn=()=>setScrolled(window.scrollY>30);window.addEventListener("scroll",fn);return()=>window.removeEventListener("scroll",fn);},[]);

  const FEATS=[
    {n:"check",c:C.teal,title:"Smart Checklist PM & HK",desc:"Template checklist terstruktur dengan panduan langkah demi langkah. Tidak ada tugas yang terlewat, setiap langkah terdokumentasi otomatis."},
    {n:"wrench",c:C.orange,title:"Work Order Digital",desc:"Buat, assign, dan pantau WO dari mobile. Eskalasi otomatis sesuai SLA — tidak perlu chat WhatsApp untuk koordinasi."},
    {n:"activity",c:C.green,title:"Live Monitoring MEP",desc:"Dashboard real-time parameter suhu, tekanan, daya, dan utilitas gedung lengkap dengan alert otomatis bila anomali terdeteksi."},
    {n:"box",c:C.cyan,title:"Manajemen Material & Aset",desc:"Kontrol stok, request, approval material dalam satu alur. Notifikasi stok minimum otomatis ke tim pengadaan."},
    {n:"bell",c:C.red,title:"Sistem Alarm Multi-Level",desc:"Alarm critical, major, warning dengan eskalasi otomatis ke personel yang tepat — dari teknisi lapangan hingga GM."},
    {n:"shield",c:C.purple,title:"Role-Based Access Control",desc:"Teknisi, HK, SPV, Admin, hingga TRO Security — hak akses terpisah dan aman sesuai tanggung jawab masing-masing."},
    {n:"users",c:"#ec4899",title:"Visitor & Akses Management",desc:"Registrasi tamu digital, QR akses, validasi security, dan log kunjungan lengkap — cocok untuk gedung perkantoran dan mixed-use."},
    {n:"barChart",c:"#10b981",title:"Analytics & Laporan Eksekutif",desc:"Laporan PM completion, KPI tim, trend operasional, dan konsumsi utilitas — tersedia dalam format PDF siap presentasi."},
    {n:"calendar",c:"#f59e0b",title:"Penjadwalan Preventif Otomatis",desc:"Jadwal PM berulang dibuat otomatis berdasarkan interval waktu atau jam operasional — tidak perlu input manual setiap bulan."},
    {n:"map",c:"#6366f1",title:"Floor Plan & Peta Aset",desc:"Visualisasi posisi aset dan titik masalah langsung di denah gedung. Tim lapangan langsung tahu lokasi tanpa bertanya."},
    {n:"dollar",c:"#0ea5e9",title:"Cost Tracking & Budget",desc:"Pantau biaya pemeliharaan per area, per kategori, dan per tim. Bandingkan aktual vs anggaran secara real-time."},
    {n:"file",c:"#64748b",title:"Dokumentasi Digital",desc:"Foto, nota service, SOP, dan laporan tersimpan terstruktur — tidak ada lagi dokumen hilang atau folder tidak terorganisir."},
  ];

  const DEMOS=[
    {label:"📱 Mobile Teknisi",desc:"Checklist PM, WO & monitoring lapangan",onClick:()=>onDemo("teknisi"),primary:true},
    {label:"🧹 Mobile HK",desc:"Panduan kebersihan & inspeksi area",onClick:()=>onDemo("housekeeping"),primary:true},
    {label:"👔 SPV Dashboard",desc:"Approval material, WO & eskalasi tim",onClick:()=>onDemo("spv_teknisi"),primary:false},
    {label:"🖥 Admin Gedung",desc:"Dashboard lengkap manajemen gedung",onClick:onAdmin,primary:false},

    {label:"🏢 TRO / Security",desc:"QR validasi tamu & visitor management",onClick:onTRO,primary:false},
  ];

  return (
    <div style={{background:C.white,color:C.slate800,overflowX:"hidden"}}>
      <GS/>
      {/* Navbar */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,height:66,transition:"all .3s",
        background:scrolled?"rgba(255,255,255,.97)":C.white,backdropFilter:scrolled?"blur(20px)":"none",
        borderBottom:`1px solid ${scrolled?C.sky200:"#e8f4fd"}`,
        boxShadow:scrolled?"0 4px 28px rgba(14,165,233,.09)":"0 1px 0 #e8f4fd"}}>
        <div style={{maxWidth:1200,margin:"0 auto",padding:"0 32px",height:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",gap:24}}>
          {/* Logo */}
          <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
            <div style={{width:36,height:36,background:`linear-gradient(135deg,${C.teal},${C.cyan})`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 12px ${C.teal}45`}}>
              <span style={{color:C.white,fontWeight:900,fontSize:16}}>S</span>
            </div>
            <div>
              <p style={{fontSize:16,fontWeight:900,background:`linear-gradient(90deg,${C.teal},${C.cyan})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1.1}}>SOMA BMS</p>
              <p style={{fontSize:8,color:C.slate400,fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>Building Management System</p>
            </div>
          </div>
          {/* Nav links */}
          <div style={{display:"flex",gap:2,flex:1,justifyContent:"center"}}>
            {[["Fitur","#fitur"],["Modul","#modul"],["Harga","#harga"],["Testimoni","#testimoni"],["FAQ","#faq"],["Tentang","#pendiri"]].map(([l,h])=>(
              <a key={l} href={h} style={{color:C.slate500,fontSize:13.5,fontWeight:600,textDecoration:"none",padding:"6px 13px",borderRadius:8,transition:"all .2s",whiteSpace:"nowrap"}}
                onMouseEnter={e=>{e.currentTarget.style.color=C.teal;e.currentTarget.style.background=`${C.teal}0d`;}}
                onMouseLeave={e=>{e.currentTarget.style.color=C.slate500;e.currentTarget.style.background="transparent";}}>
                {l}
              </a>
            ))}
          </div>
          {/* Right actions */}
          <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
            <a href="#kontak" style={{display:"flex",alignItems:"center",gap:6,padding:"7px 13px",borderRadius:9,border:`1px solid ${C.sky200}`,color:C.slate600,fontSize:12.5,fontWeight:700,textDecoration:"none",background:C.white,transition:"all .2s",whiteSpace:"nowrap"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.teal;e.currentTarget.style.color=C.teal;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.sky200;e.currentTarget.style.color=C.slate600;}}>
              <Ic n="phone" s={13} col={C.teal}/> Hubungi Kami
            </a>
            <button onClick={()=>onDemo("teknisi")} style={{padding:"8px 20px",borderRadius:10,fontSize:13,fontWeight:800,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${C.teal},${C.cyan})`,color:C.white,boxShadow:`0 4px 14px ${C.teal}45`,display:"flex",alignItems:"center",gap:7,whiteSpace:"nowrap"}}>
              Coba Demo <Ic n="arrow" s={14} col={C.white}/>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{paddingTop:110,paddingBottom:80,background:`linear-gradient(170deg,${C.white} 35%,${C.sky100} 100%)`,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:60,right:-80,width:450,height:450,borderRadius:"50%",background:`radial-gradient(circle,${C.teal}12,transparent 65%)`,pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:0,left:-80,width:320,height:320,borderRadius:"50%",background:`radial-gradient(circle,${C.cyan}10,transparent 65%)`,pointerEvents:"none"}}/>
        <div style={{maxWidth:1120,margin:"0 auto",padding:"0 24px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:60,alignItems:"center"}}>
          <div className="fade-up">
            <div style={{display:"inline-flex",alignItems:"center",gap:7,background:`${C.teal}12`,borderRadius:99,padding:"5px 14px",marginBottom:20,border:`1px solid ${C.sky200}`}}>
              <Ic n="zap" s={11} col={C.teal}/>
              <span style={{fontSize:12,fontWeight:700,color:C.teal}}>Platform BMS Enterprise #1 Indonesia</span>
            </div>
            <h1 style={{fontSize:48,fontWeight:900,lineHeight:1.1,marginBottom:20,letterSpacing:"-1.5px",color:C.slate900}}>
              Gedung Lebih Cerdas,<br/>
              <span style={{background:`linear-gradient(135deg,${C.teal},${C.cyan})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Biaya Lebih Hemat</span>
            </h1>
            <p style={{fontSize:16,color:C.slate500,lineHeight:1.75,marginBottom:32,maxWidth:460}}>
              SOMA BMS menyatukan seluruh operasional gedung — teknisi MEP, housekeeping, aset, hingga keamanan — dalam satu platform digital yang bisa dipakai dari mana saja. Kurangi downtime, tingkatkan akuntabilitas tim.
            </p>
            <div style={{display:"flex",gap:12,marginBottom:28}}>
              <button onClick={()=>onDemo("teknisi")} style={{padding:"13px 28px",borderRadius:12,fontSize:15,fontWeight:800,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${C.teal},${C.cyan})`,color:C.white,boxShadow:`0 8px 22px ${C.teal}50`,display:"flex",alignItems:"center",gap:8}}>
                Coba Demo Gratis <Ic n="arrow" s={16} col={C.white}/>
              </button>
              <button onClick={onAdmin} style={{padding:"13px 22px",borderRadius:12,fontSize:15,fontWeight:700,border:`2px solid ${C.sky200}`,cursor:"pointer",background:"transparent",color:C.teal}}>
                Lihat Dashboard
              </button>
            </div>
            <div style={{display:"flex",gap:20}}>
              {["30 hari gratis tanpa syarat","Tanpa kartu kredit","Setup & onboarding < 1 jam"].map(t=>(
                <div key={t} style={{display:"flex",alignItems:"center",gap:5}}>
                  <Ic n="ok" s={12} col={C.green} sw={2.5}/>
                  <span style={{fontSize:12,color:C.slate500,fontWeight:600}}>{t}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Right: phone + cards */}
          <div style={{position:"relative",display:"flex",justifyContent:"center",paddingTop:16}}>
            <div className="float" style={{position:"absolute",top:0,left:0,width:185,background:C.white,borderRadius:16,padding:"12px 14px",boxShadow:`0 10px 36px rgba(14,165,233,.15)`,zIndex:5,border:`1px solid ${C.sky100}`}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}><div style={{width:7,height:7,borderRadius:"50%",background:C.red,animation:"pulseRed 2s infinite"}}/><span style={{fontSize:10,fontWeight:800,color:C.red}}>SOMA Alert</span></div>
              <p style={{fontSize:12,fontWeight:700,color:C.slate700}}>Suhu Chiller Tinggi</p>
              <p style={{fontSize:10,color:C.slate400,marginTop:2}}>Basement B2 · 12:48</p>
            </div>
            <div className="float" style={{position:"absolute",bottom:16,right:0,width:158,background:C.white,borderRadius:16,padding:"12px 14px",boxShadow:`0 10px 36px rgba(6,182,212,.14)`,zIndex:5,border:`1px solid ${C.sky100}`,animationDelay:".9s"}}>
              <p style={{fontSize:10,color:C.slate400,marginBottom:4,fontWeight:600}}>PM Progress</p>
              <p style={{fontSize:22,fontWeight:900,color:C.teal,marginBottom:7}}>87%</p>
              <MiniBar data={[5,7,6,8,7,6,9]} color={C.teal}/>
            </div>
            {/* Mini phone */}
            <div className="float" style={{width:205,background:"#0c1117",borderRadius:34,padding:8,boxShadow:"0 40px 80px rgba(0,0,0,.28)",zIndex:4,animationDelay:".3s"}}>
              <div style={{background:`linear-gradient(180deg,${C.sky100},${C.slate50})`,borderRadius:27,overflow:"hidden",minHeight:370}}>
                <div style={{background:`linear-gradient(135deg,${C.teal},${C.cyan})`,padding:"18px 15px 20px",position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:-20,right:-20,width:70,height:70,borderRadius:"50%",background:"rgba(255,255,255,.1)"}}/>
                  <p style={{color:"rgba(255,255,255,.7)",fontSize:9,marginBottom:3}}>Jumat, 15 Mei 2026</p>
                  <p style={{color:C.white,fontSize:14,fontWeight:900}}>Halo, Budi 👋</p>
                  <div style={{background:"rgba(255,255,255,.18)",borderRadius:10,padding:"9px 11px",marginTop:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:9,color:C.white,fontWeight:700}}>Progress</span><span style={{fontSize:9,color:C.white,fontWeight:800}}>5/8</span></div>
                    <div style={{height:4,background:"rgba(255,255,255,.3)",borderRadius:4}}><div style={{height:4,background:C.white,borderRadius:4,width:"62%"}}/></div>
                  </div>
                </div>
                <div style={{padding:"10px 11px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                  {[["PM",C.teal],["WO",C.orange],["Material",C.cyan],["Monitor",C.green]].map(([l,c])=>(
                    <div key={l} style={{background:C.white,borderRadius:10,padding:"9px 7px",textAlign:"center",boxShadow:"0 2px 6px rgba(0,0,0,.06)"}}>
                      <div style={{width:26,height:26,borderRadius:7,background:`${c}15`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 4px"}}><div style={{width:10,height:10,borderRadius:3,background:c}}/></div>
                      <p style={{fontSize:8,fontWeight:700,color:C.slate600}}>{l}</p>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",borderTop:`1px solid ${C.sky100}`,background:C.white,padding:"5px 0 9px"}}>
                  {["Home","PM","WO","Profil"].map((l,i)=>(
                    <div key={l} style={{flex:1,textAlign:"center"}}><p style={{fontSize:7,color:i===0?C.teal:C.slate400,fontWeight:700}}>{l}</p></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Stats */}
        <div style={{maxWidth:860,margin:"56px auto 0",padding:"0 24px",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:0}}>
          {[["500+","Gedung Aktif"],["12.000+","Pengguna Harian"],["99,9%","SLA Uptime"],["4,9★","Rating Klien"]].map(([v,l],i)=>(
            <div key={i} style={{textAlign:"center",padding:"20px 14px",background:i%2===0?C.sky50:C.white,border:`1px solid ${C.sky200}`,borderRadius:i===0?"14px 0 0 14px":i===3?"0 14px 14px 0":0}}>
              <p style={{fontSize:26,fontWeight:900,color:C.teal,letterSpacing:"-1px"}}>{v}</p>
              <p style={{fontSize:12,color:C.slate500,fontWeight:600}}>{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="fitur" style={{padding:"80px 24px",background:C.white}}>
        <div style={{maxWidth:1120,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:50}}>
            <p style={{fontSize:11,fontWeight:800,color:C.teal,marginBottom:9,letterSpacing:2,textTransform:"uppercase"}}>Fitur Platform</p>
            <h2 style={{fontSize:36,fontWeight:900,letterSpacing:"-1px",color:C.slate900,marginBottom:12}}>Semua yang dibutuhkan gedung modern</h2>
            <p style={{color:C.slate400,fontSize:15,maxWidth:540,margin:"0 auto"}}>Dari checklist harian hingga laporan eksekutif — SOMA BMS menangani operasional end-to-end tanpa perlu integrasi tambahan.</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
            {FEATS.map(f=>(
              <div key={f.title} className="hover-card" style={{background:C.white,border:`1px solid ${C.sky100}`,borderRadius:16,padding:"22px 18px",boxShadow:"0 2px 10px rgba(14,165,233,.05)"}}>
                <div style={{width:44,height:44,borderRadius:13,background:`${f.c}12`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14}}><Ic n={f.n} s={20} col={f.c}/></div>
                <h3 style={{fontWeight:800,fontSize:14,marginBottom:7,color:C.slate800}}>{f.title}</h3>
                <p style={{fontSize:12,color:C.slate400,lineHeight:1.65}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo modules */}
      <section id="modul" style={{padding:"80px 24px",background:`linear-gradient(180deg,${C.sky50},${C.white})`}}>
        <div style={{maxWidth:1120,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:56}}>
            <p style={{fontSize:11,fontWeight:800,color:C.teal,marginBottom:9,letterSpacing:2,textTransform:"uppercase"}}>Live Demo</p>
            <h2 style={{fontSize:36,fontWeight:900,letterSpacing:"-1px",color:C.slate900,marginBottom:12}}>Klik & coba langsung</h2>
            <p style={{color:C.slate400,fontSize:15}}>Semua demo interaktif — tidak perlu registrasi</p>
          </div>

          {/* Mobile Apps Group */}
          <div style={{marginBottom:40}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
              <div style={{display:"flex",alignItems:"center",gap:9,padding:"6px 16px",background:C.slate900,borderRadius:99}}>
                <span style={{fontSize:14}}>📱</span>
                <span style={{fontSize:12,fontWeight:800,color:C.white,letterSpacing:.5}}>MOBILE APPS</span>
              </div>
              <div style={{flex:1,height:1,background:`linear-gradient(90deg,${C.sky200},transparent)`}}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
              {[
                {label:"📱 Mobile Teknisi",emoji:"🔧",desc:"Checklist PM, Work Order & monitoring lapangan harian",onClick:()=>onDemo("teknisi"),tag:"MEP & Teknikal"},
                {label:"🧹 Mobile HK",emoji:"🧹",desc:"Panduan kebersihan, inspeksi area & laporan shift",onClick:()=>onDemo("housekeeping"),tag:"Housekeeping"},
                {label:"👔 SPV Dashboard",emoji:"👔",desc:"Approval material, eskalasi WO & monitoring tim lapangan",onClick:()=>onDemo("spv_teknisi"),tag:"Supervisor"},
              ].map(d=>(
                <div key={d.label} className="hover-card" onClick={d.onClick}
                  style={{background:C.white,borderRadius:18,padding:"22px 20px",cursor:"pointer",border:`1.5px solid ${C.sky100}`,
                    boxShadow:`0 4px 18px rgba(14,165,233,.08)`,position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:0,right:0,width:70,height:70,background:`linear-gradient(135deg,${C.teal}08,${C.cyan}12)`,borderRadius:"0 18px 0 50px"}}/>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                    <div style={{width:46,height:46,borderRadius:14,background:`linear-gradient(135deg,${C.teal}18,${C.cyan}14)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{d.emoji}</div>
                    <span style={{fontSize:10,fontWeight:700,color:C.teal,background:`${C.teal}12`,padding:"3px 9px",borderRadius:99}}>{d.tag}</span>
                  </div>
                  <p style={{fontSize:14,fontWeight:800,color:C.slate800,marginBottom:6}}>{d.label}</p>
                  <p style={{fontSize:12,color:C.slate400,lineHeight:1.6,marginBottom:16}}>{d.desc}</p>
                  <div style={{display:"flex",alignItems:"center",gap:5,color:C.teal,fontSize:12,fontWeight:700}}>
                    Buka Demo <Ic n="arrow" s={12} col={C.teal}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Apps Group */}
          <div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
              <div style={{display:"flex",alignItems:"center",gap:9,padding:"6px 16px",background:`linear-gradient(135deg,${C.teal},${C.cyan})`,borderRadius:99}}>
                <span style={{fontSize:14}}>🖥</span>
                <span style={{fontSize:12,fontWeight:800,color:C.white,letterSpacing:.5}}>DESKTOP & WEB APPS</span>
              </div>
              <div style={{flex:1,height:1,background:`linear-gradient(90deg,${C.sky200},transparent)`}}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14}}>
              {[
                {label:"🖥 Admin Gedung",emoji:"🏢",desc:"Dashboard lengkap manajemen gedung — WO, aset, laporan & KPI",onClick:onAdmin,tag:"Admin",accent:C.teal},
                {label:"🏢 TRO Security",emoji:"🔐",desc:"QR validasi tamu, visitor management & log keamanan 24/7",onClick:onTRO,tag:"Security",accent:C.slate700},
              ].map(d=>(
                <div key={d.label} className="hover-card" onClick={d.onClick}
                  style={{background:`linear-gradient(145deg,${C.slate900},${C.slate800})`,borderRadius:18,padding:"22px 20px",cursor:"pointer",
                    border:`1px solid rgba(255,255,255,.06)`,boxShadow:`0 8px 28px rgba(0,0,0,.18)`,position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:-20,right:-20,width:90,height:90,borderRadius:"50%",background:`${d.accent}18`}}/>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                    <div style={{width:46,height:46,borderRadius:14,background:`${d.accent}22`,border:`1px solid ${d.accent}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{d.emoji}</div>
                    <span style={{fontSize:10,fontWeight:700,color:d.accent,background:`${d.accent}18`,padding:"3px 9px",borderRadius:99}}>{d.tag}</span>
                  </div>
                  <p style={{fontSize:14,fontWeight:800,color:C.white,marginBottom:6}}>{d.label}</p>
                  <p style={{fontSize:12,color:"rgba(255,255,255,.5)",lineHeight:1.6,marginBottom:16}}>{d.desc}</p>
                  <div style={{display:"flex",alignItems:"center",gap:5,color:d.accent,fontSize:12,fontWeight:700}}>
                    Buka Demo <Ic n="arrow" s={12} col={d.accent}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="harga" style={{padding:"80px 24px",background:C.white}}>
        <div style={{maxWidth:900,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:50}}>
            <p style={{fontSize:11,fontWeight:800,color:C.teal,marginBottom:9,letterSpacing:2,textTransform:"uppercase"}}>Harga</p>
            <h2 style={{fontSize:36,fontWeight:900,letterSpacing:"-1px",color:C.slate900}}>Transparan, Tanpa Biaya Tersembunyi</h2>
            <p style={{color:C.slate400,fontSize:15,marginTop:12}}>Mulai gratis 30 hari. Upgrade atau batalkan kapan saja — tanpa penalti.</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:20,alignItems:"center"}}>
            {[
              {name:"Starter",price:"Rp 2,9jt",sub:"/gedung/bulan",features:["Hingga 20 pengguna","Checklist PM & HK","Work Order digital","Dashboard admin","Laporan bulanan","Email support"],pop:false},
              {name:"Professional",price:"Rp 6,9jt",sub:"/gedung/bulan",features:["Hingga 100 pengguna","Semua modul mobile","Live monitoring MEP","Integrasi IoT sensor","Visitor management","Analitik & KPI lanjutan","Priority support 24/7"],pop:true},
              {name:"Enterprise",price:"Custom",sub:"hubungi tim kami",features:["Pengguna tak terbatas","Multi-gedung & multi-kota","SLA 99,9% terjamin","Dedicated engineer kami","Custom development","Onboarding & pelatihan tim","Kontrak jangka panjang"],pop:false},
            ].map(p=>(
              <div key={p.name} style={{borderRadius:20,padding:"28px 22px",position:"relative",
                background:p.pop?`linear-gradient(135deg,${C.teal},${C.cyan})`:C.white,
                border:p.pop?"none":`1px solid ${C.sky100}`,
                boxShadow:p.pop?`0 20px 50px ${C.teal}50`:"0 2px 14px rgba(14,165,233,.06)",
                transform:p.pop?"scale(1.04)":"none"}}>
                {p.pop&&<div style={{position:"absolute",top:-13,left:"50%",transform:"translateX(-50%)",background:"#fbbf24",borderRadius:99,padding:"4px 16px",fontSize:10,fontWeight:900,color:"#78350f",whiteSpace:"nowrap"}}>⭐ Paling Populer</div>}
                <p style={{fontWeight:800,fontSize:15,color:p.pop?C.white:C.slate800,marginBottom:7}}>{p.name}</p>
                <p style={{fontSize:28,fontWeight:900,color:p.pop?C.white:C.teal,lineHeight:1}}>{p.price}</p>
                <p style={{fontSize:11,color:p.pop?"rgba(255,255,255,.7)":C.slate400,marginBottom:22}}>{p.sub}</p>
                {p.features.map(f=>(
                  <div key={f} style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
                    <Ic n="ok" s={12} col={p.pop?C.white:C.green} sw={2.5}/>
                    <span style={{fontSize:12,color:p.pop?"rgba(255,255,255,.9)":C.slate500}}>{f}</span>
                  </div>
                ))}
                <button onClick={()=>onDemo("teknisi")} style={{width:"100%",marginTop:20,padding:"12px",borderRadius:11,fontSize:13,fontWeight:800,border:"none",cursor:"pointer",
                  background:p.pop?C.white:`linear-gradient(135deg,${C.teal},${C.cyan})`,
                  color:p.pop?C.teal:C.white,boxShadow:p.pop?`0 4px 14px rgba(0,0,0,.14)`:`0 4px 14px ${C.teal}44`}}>
                  {p.name==="Enterprise"?"Hubungi Sales":"Mulai Gratis"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:"80px 24px",background:`linear-gradient(145deg,${C.teal} 0%,${C.cyanDk} 60%,#0369a1 100%)`,position:"relative",overflow:"hidden"}}>
        {/* Decorative circles */}
        <div style={{position:"absolute",top:-100,left:-100,width:380,height:380,borderRadius:"50%",background:"rgba(255,255,255,.05)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:-60,right:-60,width:260,height:260,borderRadius:"50%",background:"rgba(255,255,255,.04)",pointerEvents:"none"}}/>

        <div style={{maxWidth:820,margin:"0 auto",position:"relative",textAlign:"center"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(255,255,255,.15)",borderRadius:99,padding:"5px 16px",marginBottom:20,border:"1px solid rgba(255,255,255,.2)"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"#4ade80",animation:"pulse 2s infinite"}}/>
            <span style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.9)",letterSpacing:.5}}>Demo Tersedia Sekarang · Tanpa Registrasi</span>
          </div>
          <h2 style={{fontSize:38,fontWeight:900,color:C.white,marginBottom:12,letterSpacing:"-1px"}}>Siap transformasi gedung Anda?</h2>
          <p style={{color:"rgba(255,255,255,.8)",fontSize:15,marginBottom:44,lineHeight:1.7}}>Ribuan profesional gedung sudah membuktikannya. Sekarang giliran Anda — coba gratis 30 hari tanpa kartu kredit.</p>

          {/* Mobile Apps Row */}
          <div style={{marginBottom:16}}>
            <p style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.55)",letterSpacing:1.5,textTransform:"uppercase",marginBottom:12}}>📱 Mobile Apps</p>
            <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
              {[
                {label:"Teknisi MEP",onClick:()=>onDemo("teknisi")},
                {label:"Housekeeping",onClick:()=>onDemo("housekeeping")},
                {label:"SPV Dashboard",onClick:()=>onDemo("spv_teknisi")},
              ].map(b=>(
                <button key={b.label} onClick={b.onClick}
                  style={{padding:"11px 22px",borderRadius:11,fontSize:13,fontWeight:800,cursor:"pointer",
                    background:C.white,color:C.teal,border:"none",boxShadow:"0 6px 20px rgba(0,0,0,.16)",
                    display:"flex",alignItems:"center",gap:7,transition:"transform .15s"}}>
                  📱 {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{display:"flex",alignItems:"center",gap:14,margin:"20px auto",maxWidth:460,justifyContent:"center"}}>
            <div style={{flex:1,height:1,background:"rgba(255,255,255,.2)"}}/>
            <span style={{fontSize:11,color:"rgba(255,255,255,.4)",fontWeight:600}}>atau</span>
            <div style={{flex:1,height:1,background:"rgba(255,255,255,.2)"}}/>
          </div>

          {/* Desktop Apps Row */}
          <div>
            <p style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.55)",letterSpacing:1.5,textTransform:"uppercase",marginBottom:12}}>🖥 Desktop & Web Apps</p>
            <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
              {[
                {label:"Admin Gedung",onClick:onAdmin},
                {label:"TRO Security",onClick:onTRO},
              ].map(b=>(
                <button key={b.label} onClick={b.onClick}
                  style={{padding:"11px 22px",borderRadius:11,fontSize:13,fontWeight:700,cursor:"pointer",
                    background:"rgba(255,255,255,.12)",color:C.white,border:"1.5px solid rgba(255,255,255,.3)",
                    display:"flex",alignItems:"center",gap:7,transition:"all .2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.2)";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,.12)";}}>
                  🖥 {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimoni" style={{padding:"80px 24px",background:C.sky50}}>
        <div style={{maxWidth:1120,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:52}}>
            <p style={{fontSize:11,fontWeight:800,color:C.teal,marginBottom:9,letterSpacing:2,textTransform:"uppercase"}}>Testimoni Klien</p>
            <h2 style={{fontSize:36,fontWeight:900,letterSpacing:"-1px",color:C.slate900,marginBottom:12}}>Dipercaya pengelola gedung terbaik</h2>
            <p style={{color:C.slate400,fontSize:15}}>Apa kata mereka yang sudah merasakan manfaatnya langsung</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
            {[
              {name:"Budi Hartono",role:"Building Manager",company:"Menara Sudirman Premium",avatar:"BH",quote:"SOMA BMS mengubah cara kami bekerja sepenuhnya. Laporan PM yang dulu memakan waktu 2 jam kini selesai otomatis. Tim teknis kami jauh lebih produktif.",rating:5,tags:["PM Efficiency","Laporan Otomatis"]},
              {name:"Siti Rahayu",role:"Facility Manager",company:"Kawasan Komersil Bintaro",avatar:"SR",quote:"Work Order tidak pernah lagi terlewat sejak pakai SOMA BMS. Eskalasi otomatis ke SPV sangat membantu — tidak ada lagi koordinasi manual via WhatsApp grup.",rating:5,tags:["Work Order","Eskalasi SLA"]},
              {name:"Andi Wijaya",role:"Direktur Operasional",company:"PT Properti Nusantara",avatar:"AW",quote:"Kami mengelola 12 gedung sekaligus dari satu dashboard. Visibilitas operasional yang tidak pernah kami bayangkan sebelumnya — dan harganya sangat masuk akal.",rating:5,tags:["Multi-Gedung","Visibilitas"]},
              {name:"Dewi Santoso",role:"HSE Manager",company:"Graha Korporasi Jakarta",avatar:"DS",quote:"Fitur visitor management QR-nya sangat membantu keamanan gedung kami. Tamu terdokumentasi rapi, tim security bekerja lebih efisien.",rating:5,tags:["Visitor Management","Keamanan"]},
              {name:"Rizal Fauzan",role:"Chief Engineer",company:"Menara Permata Selatan",avatar:"RF",quote:"Monitoring MEP real-time adalah game changer. Kami bisa mendeteksi anomali suhu chiller sebelum breakdown — menghemat biaya perbaikan jutaan rupiah.",rating:5,tags:["Live Monitoring","MEP"]},
              {name:"Mega Pratiwi",role:"GM Property",company:"Sentral Bisnis Serpong",avatar:"MP",quote:"Setup dan onboarding sangat cepat. Dalam 2 hari tim kami sudah produktif menggunakan semua fitur. Dukungan teknisnya responsif dan profesional.",rating:5,tags:["Onboarding Cepat","Support"]},
            ].map(t=>(
              <div key={t.name} className="hover-card" style={{background:C.white,borderRadius:20,padding:"24px 22px",border:`1px solid ${C.sky100}`,boxShadow:"0 2px 12px rgba(14,165,233,.06)"}}>
                <div style={{display:"flex",gap:2,marginBottom:14}}>
                  {Array(t.rating).fill(0).map((_,i)=><span key={i} style={{color:"#fbbf24",fontSize:13}}>★</span>)}
                </div>
                <p style={{fontSize:13,color:C.slate600,lineHeight:1.75,marginBottom:20,fontStyle:"italic"}}>"{t.quote}"</p>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:18}}>
                  {t.tags.map(tag=><span key={tag} style={{fontSize:10,fontWeight:700,color:C.teal,background:`${C.teal}12`,padding:"2px 9px",borderRadius:99}}>{tag}</span>)}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10,paddingTop:14,borderTop:`1px solid ${C.sky100}`}}>
                  <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${C.teal}30,${C.cyan}20)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:C.teal}}>{t.avatar}</div>
                  <div>
                    <p style={{fontSize:13,fontWeight:800,color:C.slate800}}>{t.name}</p>
                    <p style={{fontSize:11,color:C.slate400}}>{t.role} · {t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{padding:"80px 24px",background:C.white}}>
        <div style={{maxWidth:780,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:52}}>
            <p style={{fontSize:11,fontWeight:800,color:C.teal,marginBottom:9,letterSpacing:2,textTransform:"uppercase"}}>FAQ</p>
            <h2 style={{fontSize:36,fontWeight:900,letterSpacing:"-1px",color:C.slate900,marginBottom:12}}>Pertanyaan yang sering ditanyakan</h2>
          </div>
          {[
            {q:"Berapa lama proses implementasi SOMA BMS?",a:"Rata-rata 1–3 hari kerja dari mulai setup akun hingga tim lapangan siap beroperasi. Kami menyediakan sesi onboarding dan pelatihan tim termasuk dalam paket."},
            {q:"Apakah SOMA BMS bisa digunakan tanpa koneksi internet?",a:"Aplikasi mobile mendukung mode offline untuk checklist dan work order. Data akan tersinkronisasi otomatis begitu koneksi internet tersedia kembali."},
            {q:"Bagaimana keamanan data gedung kami?",a:"Data dienkripsi end-to-end (SSL 256-bit), dihosting di server AWS Jakarta, dan memenuhi standar keamanan SNI. Kami tidak pernah mengakses data Anda tanpa izin eksplisit."},
            {q:"Apakah bisa terintegrasi dengan sistem BAS atau SCADA yang sudah ada?",a:"Ya. SOMA BMS mendukung integrasi melalui API REST dan MQTT untuk koneksi ke BAS, SCADA, dan sensor IoT berbagai merek. Tim teknis kami siap membantu proses integrasi."},
            {q:"Berapa banyak pengguna yang bisa mengakses platform?",a:"Tergantung paket yang dipilih. Starter mendukung hingga 20 pengguna, Professional hingga 100, dan Enterprise tidak terbatas. Semua dengan role dan hak akses yang dapat dikonfigurasi."},
            {q:"Bagaimana jika kami ingin membatalkan berlangganan?",a:"Tidak ada biaya pembatalan dan tidak ada kontrak jangka panjang yang mengikat (kecuali Enterprise yang disesuaikan). Batalkan kapan saja dan data Anda dapat diekspor sepenuhnya."},
            {q:"Apakah ada biaya setup atau implementasi tambahan?",a:"Tidak ada biaya setup tersembunyi. Onboarding, konfigurasi awal, dan pelatihan tim sudah termasuk dalam semua paket berlangganan."},
            {q:"Apakah SOMA BMS cocok untuk gedung residensial atau apartemen?",a:"SOMA BMS dirancang terutama untuk gedung komersial, perkantoran, dan mixed-use. Untuk residensial besar, silakan hubungi tim kami untuk solusi yang disesuaikan."},
          ].map((item,i)=><FAQItem key={i} item={item} teal={C.teal}/>)}
          <div style={{textAlign:"center",marginTop:48,padding:"28px",borderRadius:20,background:C.sky50,border:`1px solid ${C.sky100}`}}>
            <p style={{fontSize:14,color:C.slate600,marginBottom:16}}>Masih punya pertanyaan? Tim kami siap membantu.</p>
            <a href="tel:+6285775190949" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"11px 24px",borderRadius:11,background:`linear-gradient(135deg,${C.teal},${C.cyan})`,color:C.white,textDecoration:"none",fontSize:14,fontWeight:700,boxShadow:`0 6px 18px ${C.teal}40`}}>
              <Ic n="phone" s={14} col={C.white}/> +62 857-7519-0949
            </a>
          </div>
        </div>
      </section>

      {/* Founder Profile */}
      <section id="pendiri" style={{padding:"100px 24px",background:"#f9f6f1",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,transparent,${C.teal},${C.cyan},transparent)`}}/>
        <div style={{position:"absolute",top:-80,right:-80,width:300,height:300,borderRadius:"50%",background:`${C.teal}06`,pointerEvents:"none"}}/>
        <div style={{maxWidth:1060,margin:"0 auto",display:"grid",gridTemplateColumns:"340px 1fr",gap:64,alignItems:"flex-start"}}>

          {/* Left: Profile card */}
          <div>
            <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(14,165,233,.1)",borderRadius:99,padding:"4px 14px",marginBottom:24,border:`1px solid ${C.teal}22`}}>
              <span style={{fontSize:10,fontWeight:800,color:C.teal,letterSpacing:1,textTransform:"uppercase"}}>Tentang Pendiri</span>
            </div>

            {/* Avatar */}
            <div style={{width:88,height:88,borderRadius:24,background:`linear-gradient(135deg,${C.slate800},${C.slate700})`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:18,boxShadow:`0 12px 32px rgba(0,0,0,.2), 0 0 0 4px #f9f6f1, 0 0 0 6px ${C.teal}30`}}>
              <span style={{fontSize:28,fontWeight:900,color:C.white,letterSpacing:"-1px"}}>AS</span>
            </div>

            <h3 style={{fontSize:22,fontWeight:900,color:C.slate900,marginBottom:4,letterSpacing:"-0.5px"}}>Arif Saputro</h3>
            <p style={{fontSize:13,color:C.slate500,fontWeight:600,marginBottom:2}}>Pendiri & Direktur Utama</p>
            <p style={{fontSize:12,color:C.slate400,marginBottom:24}}>PT Kreatif Desain Abadi</p>

            {/* Info cards */}
            {[
              {label:"Latar Belakang",value:"Teknik Sipil — Struktur"},
              {label:"Keahlian Utama",value:"Building Management & IoT"},
              {label:"Pengalaman",value:"10+ Tahun di Industri Gedung"},
            ].map(item=>(
              <div key={item.label} style={{padding:"11px 14px",border:`1px solid #e8e0d5`,borderRadius:12,marginBottom:10,background:C.white}}>
                <p style={{fontSize:10,fontWeight:700,color:C.slate400,letterSpacing:.8,textTransform:"uppercase",marginBottom:3}}>{item.label}</p>
                <p style={{fontSize:13,fontWeight:700,color:C.slate700}}>{item.value}</p>
              </div>
            ))}

            {/* LinkedIn CTA */}
            <a href="https://id.linkedin.com/in/arif-saputro-47047b219" target="_blank" rel="noopener noreferrer"
              style={{display:"flex",alignItems:"center",gap:9,padding:"12px 16px",borderRadius:12,background:"#0a66c2",textDecoration:"none",marginTop:18,transition:"opacity .2s"}}
              onMouseEnter={e=>e.currentTarget.style.opacity=".88"}
              onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span style={{fontSize:13,fontWeight:700,color:C.white}}>Lihat Profil LinkedIn</span>
            </a>
          </div>

          {/* Right: Quote + content */}
          <div style={{paddingTop:12}}>
            {/* Big quote mark */}
            <div style={{fontSize:72,color:`${C.teal}25`,lineHeight:1,marginBottom:4,fontFamily:"Georgia,serif"}}>"</div>

            <blockquote style={{fontSize:22,fontWeight:800,color:C.slate800,lineHeight:1.45,marginBottom:24,letterSpacing:"-0.3px",fontStyle:"italic",borderLeft:"none",padding:0}}>
              Platform manajemen gedung Indonesia seharusnya sekelas dunia — tanpa biaya lisensi selangit, tanpa ketergantungan software asing.
            </blockquote>

            <p style={{fontSize:14,color:C.slate500,lineHeight:1.85,marginBottom:16}}>
              Selama lebih dari satu dekade berkarier di bidang teknik sipil, konstruksi, dan manajemen properti komersial, saya menyaksikan langsung bagaimana tim operasional gedung menghabiskan waktu berharga untuk hal-hal yang seharusnya otomatis — checklist manual di kertas, koordinasi WO lewat WhatsApp grup, laporan PM dikerjakan ulang tiap bulan, dan aset yang tidak terpantau.
            </p>
            <p style={{fontSize:14,color:C.slate500,lineHeight:1.85,marginBottom:32}}>
              SOMA BMS lahir dari satu komitmen: <strong style={{color:C.slate700}}>setiap proses operasional gedung harus dapat dipertanggungjawabkan secara teknis, real-time, dan efisien — dan seharusnya terjangkau untuk semua ukuran gedung di Indonesia.</strong>
            </p>

            {/* Value props */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
              {[
                {icon:"🎯",title:"Presisi & Akuntabilitas",desc:"Setiap data divalidasi dan bisa ditelusuri hingga ke personel yang bertanggung jawab — tidak ada celah abu-abu."},
                {icon:"🏗",title:"Dibuat oleh Praktisi Lapangan",desc:"Tim kami adalah manajer gedung dan insinyur aktif yang memahami masalah nyata operasional sehari-hari."},
                {icon:"🔓",title:"Harga Demokratis",desc:"Alat manajemen gedung andal tidak seharusnya dibatasi oleh lisensi ratusan juta. Akses penuh, harga wajar."},
              ].map(v=>(
                <div key={v.title} style={{padding:"16px 14px",borderRadius:14,background:C.white,border:"1px solid #e8e0d5",boxShadow:"0 2px 8px rgba(0,0,0,.04)"}}>
                  <div style={{fontSize:22,marginBottom:8}}>{v.icon}</div>
                  <p style={{fontSize:12,fontWeight:800,color:C.slate700,marginBottom:6}}>{v.title}</p>
                  <p style={{fontSize:11,color:C.slate400,lineHeight:1.65}}>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="kontak" style={{background:C.slate900,color:"rgba(255,255,255,.5)",padding:"64px 24px 0"}}>
        {/* Top divider accent */}
        <div style={{maxWidth:1120,margin:"0 auto"}}>
          <div style={{height:3,background:`linear-gradient(90deg,${C.teal},${C.cyan},transparent)`,borderRadius:9,marginBottom:52}}/>

          {/* Main footer grid */}
          <div style={{display:"grid",gridTemplateColumns:"1.8fr 1fr 1fr 1fr",gap:48,marginBottom:52}}>

            {/* Brand column */}
            <div>
              {/* Logo */}
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
                <div style={{width:36,height:36,background:`linear-gradient(135deg,${C.teal},${C.cyan})`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 14px ${C.teal}55`}}>
                  <span style={{color:C.white,fontWeight:900,fontSize:16}}>S</span>
                </div>
                <div>
                  <span style={{color:C.white,fontWeight:900,fontSize:16,letterSpacing:"-0.3px"}}>SOMA BMS</span>
                  <p style={{fontSize:10,color:C.teal,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginTop:1}}>Enterprise</p>
                </div>
              </div>

              <p style={{fontSize:13,lineHeight:1.8,marginBottom:24,maxWidth:280}}>
                Platform manajemen gedung digital terpadu — menghadirkan efisiensi operasional, kepatuhan, dan keamanan untuk properti komersial Indonesia.
              </p>

              {/* Contact info */}
              <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
                <a href="tel:+6285775190949" style={{display:"flex",alignItems:"flex-start",gap:9,color:"rgba(255,255,255,.55)",textDecoration:"none",fontSize:12,transition:"color .2s"}}
                  onMouseEnter={e=>e.currentTarget.style.color=C.teal} onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,.55)"}>
                  <Ic n="phone" s={13} col={C.teal} style={{marginTop:1,flexShrink:0}}/>
                  <span>+62 857-7519-0949</span>
                </a>
                <a href="https://wa.me/6285775190949" target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"flex-start",gap:9,color:"rgba(255,255,255,.55)",textDecoration:"none",fontSize:12,transition:"color .2s"}}
                  onMouseEnter={e=>e.currentTarget.style.color=C.green} onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,.55)"}>
                  <span style={{fontSize:13,marginTop:-1}}>💬</span>
                  <span>WhatsApp Support</span>
                </a>
                <a href="mailto:hello@somabms.id" style={{display:"flex",alignItems:"flex-start",gap:9,color:"rgba(255,255,255,.55)",textDecoration:"none",fontSize:12,transition:"color .2s"}}
                  onMouseEnter={e=>e.currentTarget.style.color=C.teal} onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,.55)"}>
                  <span style={{fontSize:13,marginTop:-1}}>✉️</span>
                  <span>hello@somabms.id</span>
                </a>
                <div style={{display:"flex",alignItems:"flex-start",gap:9,color:"rgba(255,255,255,.55)",fontSize:12}}>
                  <Ic n="map" s={13} col={C.teal} style={{marginTop:2,flexShrink:0}}/>
                  <span style={{lineHeight:1.6}}>Jl. Jenderal Sudirman No.RT.5, Senayan,<br/>Kec. Kby. Baru, DKI Jakarta 10270</span>
                </div>
              </div>

              {/* Social links */}
              <div style={{display:"flex",gap:8}}>
                {[
                  {label:"LinkedIn",href:"https://id.linkedin.com/in/arif-saputro-47047b219",icon:(
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  )},
                ].map(s=>(
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    style={{width:32,height:32,borderRadius:8,border:"1px solid rgba(255,255,255,.12)",background:"rgba(255,255,255,.05)",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(255,255,255,.5)",transition:"all .2s",textDecoration:"none"}}
                    onMouseEnter={e=>{e.currentTarget.style.background=C.teal+"33";e.currentTarget.style.borderColor=C.teal;e.currentTarget.style.color=C.teal;}}
                    onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,.05)";e.currentTarget.style.borderColor="rgba(255,255,255,.12)";e.currentTarget.style.color="rgba(255,255,255,.5)";}}>
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Navigation columns */}
            {[
              {title:"Platform",links:[
                {l:"Fitur Lengkap",href:"#fitur"},
                {l:"Modul Demo",href:"#modul"},
                {l:"Harga & Paket",href:"#harga"},
                {l:"Testimoni Klien",href:"#testimoni"},
                {l:"FAQ",href:"#faq"},
              ]},
              {title:"Perusahaan",links:[
                {l:"Tentang & Pendiri",href:"#pendiri"},
                {l:"Visi & Misi",href:"#pendiri"},
                {l:"Hubungi Kami",href:"#kontak"},
                {l:"LinkedIn Pendiri",href:"https://id.linkedin.com/in/arif-saputro-47047b219"},
                {l:"Karier",href:"mailto:hello@somabms.id"},
              ]},
              {title:"Dukungan",links:[
                {l:"Coba Demo Langsung",href:"#modul"},
                {l:"Hubungi Sales",href:"tel:+6285775190949"},
                {l:"WhatsApp Support",href:"https://wa.me/6285775190949"},
                {l:"Email Support",href:"mailto:support@somabms.id"},
                {l:"Request Demo Privat",href:"tel:+6285775190949"},
              ]},
            ].map(col=>(
              <div key={col.title}>
                <p style={{color:C.white,fontWeight:800,fontSize:12,marginBottom:18,letterSpacing:".5px",textTransform:"uppercase"}}>{col.title}</p>
                {col.links.map(item=>(
                  <a key={item.l} href={item.href} target={item.href.startsWith("http")?"_blank":undefined} rel="noopener noreferrer"
                    style={{display:"block",fontSize:13,marginBottom:11,color:"rgba(255,255,255,.5)",textDecoration:"none",transition:"color .2s",cursor:"pointer"}}
                    onMouseEnter={e=>e.currentTarget.style.color=C.teal}
                    onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,.5)"}>
                    {item.l}
                  </a>
                ))}
              </div>
            ))}
          </div>

          {/* Trust badges row */}
          <div style={{borderTop:"1px solid rgba(255,255,255,.07)",paddingTop:28,marginBottom:28}}>
            <div style={{display:"flex",gap:14,flexWrap:"wrap",alignItems:"center"}}>
              {[
                {icon:"🔒",title:"SSL 256-bit",sub:"Data terenkripsi penuh"},
                {icon:"🖥",title:"Server Indonesia",sub:"Hosted di AWS Jakarta"},
                {icon:"✅",title:"Standar SNI",sub:"Sesuai regulasi gedung"},
                {icon:"📊",title:"99.9% Uptime",sub:"Dipantau 24/7"},
              ].map(b=>(
                <div key={b.title} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px",borderRadius:10,border:"1px solid rgba(255,255,255,.08)",background:"rgba(255,255,255,.03)"}}>
                  <span style={{fontSize:16}}>{b.icon}</span>
                  <div>
                    <p style={{fontSize:11,fontWeight:800,color:"rgba(255,255,255,.75)",lineHeight:1.2}}>{b.title}</p>
                    <p style={{fontSize:10,color:"rgba(255,255,255,.35)"}}>{b.sub}</p>
                  </div>
                </div>
              ))}
              <div style={{marginLeft:"auto",textAlign:"right"}}>
                <p style={{fontSize:11,color:"rgba(255,255,255,.35)",marginBottom:3}}>Butuh bantuan?</p>
                <a href="tel:+6285775190949" style={{fontSize:14,fontWeight:800,color:C.teal,textDecoration:"none"}}>+62 857-7519-0949</a>
              </div>
            </div>
          </div>

          {/* Founder badge */}
          <div style={{marginBottom:28,display:"flex",justifyContent:"flex-start"}}>
            <a href="https://id.linkedin.com/in/arif-saputro-47047b219" target="_blank" rel="noopener noreferrer"
              style={{display:"inline-flex",alignItems:"center",gap:12,padding:"12px 20px",borderRadius:14,border:"1px solid rgba(255,255,255,.1)",background:"rgba(255,255,255,.04)",textDecoration:"none",transition:"all .2s"}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(14,165,233,.1)";e.currentTarget.style.borderColor=C.teal+"55";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,.04)";e.currentTarget.style.borderColor="rgba(255,255,255,.1)";}}>
              <div style={{width:38,height:38,borderRadius:10,background:`linear-gradient(135deg,${C.teal}33,${C.cyan}22)`,border:`1px solid ${C.teal}44`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Ic n="user" s={16} col={C.teal}/>
              </div>
              <div>
                <p style={{color:C.white,fontSize:13,fontWeight:700,marginBottom:2}}>Arif Saputro</p>
                <p style={{color:"rgba(255,255,255,.45)",fontSize:11}}>Pendiri & CEO · SOMA BMS · PT Kreatif Desain Abadi</p>
              </div>
              <div style={{marginLeft:4,display:"flex",alignItems:"center",gap:5,color:C.teal,fontSize:11,fontWeight:700}}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill={C.teal}>
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </div>
            </a>
          </div>

          {/* Bottom bar */}
          <div style={{borderTop:"1px solid rgba(255,255,255,.07)",padding:"20px 0 28px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
            <div>
              <p style={{fontSize:12}}>© 2026 SOMA BMS Enterprise · PT Kreatif Desain Abadi. Seluruh hak cipta dilindungi undang-undang.</p>
              <p style={{fontSize:11,marginTop:3,color:"rgba(255,255,255,.25)"}}>Jl. Jenderal Sudirman No.RT.5, Senayan, Kec. Kby. Baru, DKI Jakarta 10270</p>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:20}}>
              {[["Kebijakan Privasi","#"],["Syarat & Ketentuan","#"],["Keamanan Data","#"],["Aksesibilitas","#"]].map(([t,h])=>(
                <a key={t} href={h} style={{fontSize:12,color:"rgba(255,255,255,.35)",textDecoration:"none",transition:"color .2s"}}
                  onMouseEnter={e=>e.currentTarget.style.color=C.teal}
                  onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,.35)"}>
                  {t}
                </a>
              ))}
            </div>
            <p style={{fontSize:12,color:"rgba(255,255,255,.3)"}}>Made with ♥ in Indonesia 🇮🇩</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════════ */

// Named exports for individual demo pages
export { MobileApp, AdminApp, TROApp, GS };
