'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { onAuth, signInWithGoogle, logout } from './lib/firebase';
import { upsertUser, saveChat, saveMessage, saveGeneration, incrementUsage } from './lib/supabase';
import type { User } from 'firebase/auth';

const LANGUAGES = [
  { code:'uz', name:"O'zbek", native:"O'zbek" },
  { code:'en', name:'English', native:'English' },
  { code:'tr', name:'Turkish', native:'Türkçe' },
  { code:'az', name:'Azerbaijani', native:'Azərbaycan' },
  { code:'tk', name:'Turkmen', native:'Türkmen' },
  { code:'kk', name:'Kazakh', native:'Қазақша' },
  { code:'ky', name:'Kyrgyz', native:'Кыргызча' },
  { code:'ar', name:'Arabic', native:'العربية', dir:'rtl' },
  { code:'zh-CN', name:'Chinese (Simplified)', native:'中文(简体)' },
  { code:'es', name:'Spanish', native:'Español' },
  { code:'fr', name:'French', native:'Français' },
  { code:'de', name:'German', native:'Deutsch' },
  { code:'nl', name:'Dutch', native:'Nederlands' },
  { code:'hi', name:'Hindi', native:'हिन्दी' },
  { code:'ja', name:'Japanese', native:'日本語' },
  { code:'ko', name:'Korean', native:'한국어' },
  { code:'pt', name:'Portuguese', native:'Português' },
  { code:'it', name:'Italian', native:'Italiano' },
  { code:'uk', name:'Ukrainian', native:'Українська' },
  { code:'fa', name:'Persian', native:'فارسی', dir:'rtl' },
  { code:'ur', name:'Urdu', native:'اردو', dir:'rtl' },
  { code:'he', name:'Hebrew', native:'עברית', dir:'rtl' },
  { code:'bg', name:'Bulgarian', native:'Български' },
  { code:'cs', name:'Czech', native:'Čeština' },
  { code:'da', name:'Danish', native:'Dansk' },
  { code:'fi', name:'Finnish', native:'Suomi' },
  { code:'ka', name:'Georgian', native:'ქართული' },
  { code:'el', name:'Greek', native:'Ελληνικά' },
  { code:'hu', name:'Hungarian', native:'Magyar' },
  { code:'id', name:'Indonesian', native:'Indonesia' },
  { code:'ms', name:'Malay', native:'Melayu' },
  { code:'mn', name:'Mongolian', native:'Монгол' },
  { code:'no', name:'Norwegian', native:'Norsk' },
  { code:'pl', name:'Polish', native:'Polski' },
  { code:'ro', name:'Romanian', native:'Română' },
  { code:'sr', name:'Serbian', native:'Srpski' },
  { code:'sv', name:'Swedish', native:'Svenska' },
  { code:'th', name:'Thai', native:'ไทย' },
  { code:'vi', name:'Vietnamese', native:'Tiếng Việt' },
];

type UIStr = { powered:string;nc:string;convs:string;noc:string;sub:string;ultra:string;ph:string;imgPh:string;vidPh:string;hint:string;sugg:{lang:string;txt:string}[]; };
const T:Record<string,UIStr>={
  uz:{ powered:'ASENA-1.0 ML TOMONIDAN',nc:"Yangi suhbat",convs:'SUHBATLAR',noc:"Hali suhbat yo'q",sub:"Aqlli yordamchingiz. Har qanday tilda savol bering.",ultra:'Ultra-tez Asena-1.0 ML',ph:"Xabar yozing...",imgPh:"Rasm tavsifini yozing (har qanday tilda)...",vidPh:"Video tavsifini yozing (har qanday tilda)...",hint:"ASENA AI · O'zbek · English · Türkçe · Azərbaycan · va boshqalar",sugg:[{lang:"O'zbek",txt:"Sun'iy intellekt kelajagi haqida gapir"},{lang:'English',txt:'Explain quantum computing simply'},{lang:'Türkçe',txt:'Yapay zekanın geleceği hakkında konuş'},{lang:'Azərbaycan',txt:'Süni intellekt haqqında danış'}] },
  en:{ powered:'POWERED BY ASENA-1.0 ML',nc:'New Chat',convs:'CONVERSATIONS',noc:'No conversations yet',sub:"Your intelligent assistant. Ask in any language.",ultra:'Ultra-fast Asena-1.0 ML',ph:'Type a message...',imgPh:'Describe the image you want to create (any language)...',vidPh:'Describe the video you want to create (any language)...',hint:"ASENA AI · English · O'zbek · Türkçe · Azərbaycan · and more",sugg:[{lang:'English',txt:'Explain quantum computing simply'},{lang:'English',txt:'Write a poem about space'},{lang:"O'zbek",txt:"Sun'iy intellekt haqida gapir"},{lang:'Türkçe',txt:'Yapay zeka hakkında konuş'}] },
  tr:{ powered:'ASENA-1.0 ML TARAFINDAN',nc:'Yeni Sohbet',convs:'SOHBETLER',noc:'Henüz sohbet yok',sub:'Akıllı asistanınız.',ultra:'Ultra hızlı Asena-1.0 ML',ph:'Mesaj yazın...',imgPh:'Görseli tanımlayın...',vidPh:'Videoyu tanımlayın...',hint:"ASENA AI · Türkçe · English · O'zbek · Azərbaycan",sugg:[{lang:'Türkçe',txt:'Yapay zekanın geleceği hakkında konuş'},{lang:'English',txt:'Explain quantum computing simply'},{lang:"O'zbek",txt:"Sun'iy intellekt haqida gapir"},{lang:'Azərbaycan',txt:'Süni intellekt haqqında danış'}] },
  az:{ powered:'ASENA-1.0 ML TƏRƏFİNDƏN',nc:'Yeni Söhbət',convs:'SÖHBƏTLƏRİM',noc:'Hələ söhbət yoxdur',sub:'Ağıllı köməkçiniz.',ultra:'Ultra-sürətli Asena-1.0 ML',ph:'Mesaj yazın...',imgPh:'Şəkli təsvir edin...',vidPh:'Videoyu təsvir edin...',hint:"ASENA AI · Azərbaycan · O'zbek · English · Türkçe",sugg:[{lang:'Azərbaycan',txt:'Süni intellekt haqqında danış'},{lang:'English',txt:'Explain quantum computing simply'},{lang:"O'zbek",txt:"Sun'iy intellekt haqida gapir"},{lang:'Türkçe',txt:'Yapay zeka hakkında konuş'}] },
  ar:{ powered:'مدعوم بـ ASENA-1.0 ML',nc:'محادثة جديدة',convs:'المحادثات',noc:'لا توجد محادثات',sub:'مساعدك الذكي.',ultra:'Asena-1.0 ML فائق السرعة',ph:'اكتب رسالة...',imgPh:'صف الصورة...',vidPh:'صف الفيديو...',hint:"ASENA AI · العربية · English · Türkçe · O'zbek",sugg:[{lang:'العربية',txt:'اشرح لي الذكاء الاصطناعي'},{lang:'English',txt:'Explain quantum computing simply'},{lang:"O'zbek",txt:"Sun'iy intellekt haqida gapir"},{lang:'Türkçe',txt:'Yapay zeka hakkında konuş'}] },
  'zh-CN':{ powered:'由 ASENA-1.0 ML 驱动',nc:'新对话',convs:'对话',noc:'暂无对话',sub:'您的智能助手。',ultra:'超快速 Asena-1.0 ML',ph:'输入消息...',imgPh:'描述图像...',vidPh:'描述视频...',hint:"ASENA AI · 中文 · English · O'zbek · Türkçe",sugg:[{lang:'中文',txt:'简单解释量子计算'},{lang:'English',txt:'Explain quantum computing simply'},{lang:"O'zbek",txt:"Sun'iy intellekt haqida gapir"},{lang:'Türkçe',txt:'Yapay zeka hakkında konuş'}] },
  de:{ powered:'BETRIEBEN VON ASENA-1.0 ML',nc:'Neues Gespräch',convs:'GESPRÄCHE',noc:'Keine Gespräche',sub:'Ihr intelligenter Assistent.',ultra:'Ultraschnelle Asena-1.0 ML',ph:'Nachricht...',imgPh:'Bild beschreiben...',vidPh:'Video beschreiben...',hint:"ASENA AI · Deutsch · English · O'zbek · Türkçe",sugg:[{lang:'Deutsch',txt:'Erkläre mir KI einfach'},{lang:'English',txt:'Explain quantum computing simply'},{lang:"O'zbek",txt:"Sun'iy intellekt haqida gapir"},{lang:'Türkçe',txt:'Yapay zeka hakkında konuş'}] },
  fr:{ powered:'PROPULSÉ PAR ASENA-1.0 ML',nc:'Nouvelle Discussion',convs:'CONVERSATIONS',noc:'Pas de conversations',sub:'Votre assistant intelligent.',ultra:"Ultra-rapide Asena-1.0 ML",ph:'Message...',imgPh:"Décrivez l'image...",vidPh:"Décrivez la vidéo...",hint:"ASENA AI · Français · English · O'zbek · Türkçe",sugg:[{lang:'Français',txt:"Explique-moi l'IA"},{lang:'English',txt:'Explain quantum computing simply'},{lang:"O'zbek",txt:"Sun'iy intellekt haqida gapir"},{lang:'Türkçe',txt:'Yapay zeka hakkında konuş'}] },
};
function getT(code:string):UIStr{ if(T[code])return T[code]; if(code.startsWith('zh'))return T['zh-CN']; return T['en']; }

interface Message{ id:string;role:'user'|'assistant';content:string;type?:'text'|'image'|'video';mediaUrl?:string;genPrompt?:string;thumb?:string; }
interface Conversation{ id:string;title:string;messages:Message[]; }

const LIMIT_LOGGED_IN=10,LIMIT_GUEST=1;
function getTodayKey(t:string){return `asena_${t}_${new Date().toISOString().split('T')[0]}`;}
function getUsage(t:string){if(typeof window==='undefined')return 0;return parseInt(localStorage.getItem(getTodayKey(t))||'0');}
function incUsage(t:string){if(typeof window==='undefined')return;localStorage.setItem(getTodayKey(t),String(getUsage(t)+1));}

const IMG_MODELS=['flux-pro','flux','turbo','gptimage'];
function pollinationsUrl(p:string,model:string,seed:number){ return `https://image.pollinations.ai/prompt/${encodeURIComponent(p)}?model=${model}&width=1024&height=1024&nologo=true&seed=${seed}&enhance=true`; }

async function addWatermark(src:string):Promise<string>{
  return new Promise(resolve=>{
    const img=new Image();img.crossOrigin='anonymous';
    img.onload=()=>{
      const c=document.createElement('canvas');c.width=img.width;c.height=img.height;
      const ctx=c.getContext('2d')!;ctx.drawImage(img,0,0);
      const fs=Math.max(14,Math.floor(img.width*0.022));
      ctx.font=`bold ${fs}px sans-serif`;
      const txt='✦ ASENA AI';const m=ctx.measureText(txt);
      const pad=10,x=img.width-m.width-pad*2,y=img.height-pad*2;
      ctx.fillStyle='rgba(9,9,15,0.65)';
      const rw=m.width+pad*2,rh=fs+pad*1.6,rx=x-pad,ry=y-fs-pad*0.5,r=6;
      ctx.beginPath();ctx.moveTo(rx+r,ry);ctx.lineTo(rx+rw-r,ry);ctx.quadraticCurveTo(rx+rw,ry,rx+rw,ry+r);ctx.lineTo(rx+rw,ry+rh-r);ctx.quadraticCurveTo(rx+rw,ry+rh,rx+rw-r,ry+rh);ctx.lineTo(rx+r,ry+rh);ctx.quadraticCurveTo(rx,ry+rh,rx,ry+rh-r);ctx.lineTo(rx,ry+r);ctx.quadraticCurveTo(rx,ry,rx+r,ry);ctx.closePath();ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.92)';ctx.fillText(txt,x,y);
      resolve(c.toDataURL('image/jpeg',0.93));
    };
    img.onerror=()=>resolve(src);img.src=src;
  });
}
function testImg(url:string):Promise<boolean>{ return new Promise(resolve=>{ const i=new Image();i.onload=()=>resolve(true);i.onerror=()=>resolve(false);i.src=url;setTimeout(()=>resolve(false),18000); }); }

function mdToHtml(raw:string){
  let t=raw.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  t=t.replace(/```([\w]*)\n?([\s\S]*?)```/g,(_,lang,code)=>`<pre class="codeblock"><div class="codeblock-lang">${lang||'code'}</div><code>${code.trim()}</code></pre>`);
  t=t.replace(/`([^`\n]+)`/g,'<code class="ic">$1</code>');
  const lines=t.split('\n');const out:string[]=[];let inList=false,listType='';
  for(const line of lines){
    if(/^### (.+)/.test(line)){if(inList){out.push(listType==='ul'?'</ul>':'</ol>');inList=false;}out.push(`<h3 class="mh3">${line.replace(/^### /,'')}</h3>`);continue;}
    if(/^## (.+)/.test(line)){if(inList){out.push(listType==='ul'?'</ul>':'</ol>');inList=false;}out.push(`<h2 class="mh2">${line.replace(/^## /,'')}</h2>`);continue;}
    if(/^# (.+)/.test(line)){if(inList){out.push(listType==='ul'?'</ul>':'</ol>');inList=false;}out.push(`<h1 class="mh1">${line.replace(/^# /,'')}</h1>`);continue;}
    if(/^---+$/.test(line.trim())){if(inList){out.push(listType==='ul'?'</ul>':'</ol>');inList=false;}out.push('<hr class="mhr"/>');continue;}
    const ol=line.match(/^(\d+)\. (.+)/);if(ol){if(!inList||listType!=='ol'){if(inList)out.push('</ul>');out.push('<ol class="mol">');inList=true;listType='ol';}out.push(`<li>${ol[2]}</li>`);continue;}
    const ul=line.match(/^[\-\*•] (.+)/);if(ul){if(!inList||listType!=='ul'){if(inList)out.push('</ol>');out.push('<ul class="mul">');inList=true;listType='ul';}out.push(`<li>${ul[1]}</li>`);continue;}
    if(inList&&line.trim()===''){out.push(listType==='ul'?'</ul>':'</ol>');inList=false;out.push('<div class="mpara-gap"></div>');continue;}
    if(inList){out.push(listType==='ul'?'</ul>':'</ol>');inList=false;}
    if(line.trim()===''){out.push('<div class="mpara-gap"></div>');continue;}
    out.push(`<p class="mpara">${line}</p>`);
  }
  if(inList)out.push(listType==='ul'?'</ul>':'</ol>');
  return out.join('').replace(/\*\*\*(.+?)\*\*\*/g,'<strong><em>$1</em></strong>').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>').replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,'<a href="$2" target="_blank" class="ml">$1</a>');
}

export default function Home(){
  const [lang,setLang]=useState('en');
  const [convs,setConvs]=useState<Conversation[]>([]);
  const [activeId,setActiveId]=useState<string|null>(null);
  const [input,setInput]=useState('');
  const [loading,setLoading]=useState(false);
  const [sidebarOpen,setSidebarOpen]=useState(false);
  const [genMode,setGenMode]=useState<'chat'|'image'|'video'>('chat');
  const [showModeMenu,setShowModeMenu]=useState(false);
  const [genStatus,setGenStatus]=useState('');
  const [limitMsg,setLimitMsg]=useState('');
  const [uploadedImage,setUploadedImage]=useState<string|null>(null);
  const [uploadedThumb,setUploadedThumb]=useState<string|null>(null);
  const [user,setUser]=useState<User|null>(null);
  const [supabaseUid,setSupabaseUid]=useState<string|null>(null);
  const [authLoading,setAuthLoading]=useState(true);
  const [loginLoading,setLoginLoading]=useState(false);

  const endRef=useRef<HTMLDivElement>(null);
  const taRef=useRef<HTMLTextAreaElement>(null);
  const fileRef=useRef<HTMLInputElement>(null);

  const s=getT(lang);
  const langObj=LANGUAGES.find(l=>l.code===lang);
  const isRTL=langObj?.dir==='rtl';
  const activeConv=convs.find(c=>c.id===activeId);

  useEffect(()=>{ if(typeof window==='undefined')return; if((window as any).puter)return; const sc=document.createElement('script');sc.src='https://js.puter.com/v2/';sc.async=true;document.head.appendChild(sc); },[]);
  useEffect(()=>{ const unsub=onAuth(async u=>{ setUser(u);setAuthLoading(false); if(u){ const res=await upsertUser({uid:u.uid,email:u.email!,displayName:u.displayName,photoURL:u.photoURL}); if(res?.data?.id)setSupabaseUid(res.data.id); } }); return()=>unsub(); },[]);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth'});},[activeConv?.messages]);
  useEffect(()=>{ const h=(e:KeyboardEvent)=>{if((e.ctrlKey||e.metaKey)&&e.key==='n'){e.preventDefault();newChat();}}; window.addEventListener('keydown',h);return()=>window.removeEventListener('keydown',h); },[]);
  useEffect(()=>{ if(!showModeMenu)return; const h=()=>setShowModeMenu(false); setTimeout(()=>document.addEventListener('click',h),10); return()=>document.removeEventListener('click',h); },[showModeMenu]);

  const newChat=useCallback(()=>{ setActiveId(null);setInput('');setGenMode('chat');setUploadedImage(null);setUploadedThumb(null); if(taRef.current)taRef.current.style.height='auto'; },[]);
  const autoResize=()=>{ const t=taRef.current;if(!t)return;t.style.height='auto';t.style.height=Math.min(t.scrollHeight,150)+'px'; };
  const handleLogin=async()=>{setLoginLoading(true);await signInWithGoogle();setLoginLoading(false);};
  const handleLogout=async()=>{await logout();setUser(null);};

  function checkLimit(type:'image'|'video'):boolean{
    const limit=user?LIMIT_LOGGED_IN:LIMIT_GUEST;
    if(getUsage(type)>=limit){ setLimitMsg(user?`Daily limit: ${limit} ${type}s/day.`:`Sign in for 10 free ${type}s/day!`); setTimeout(()=>setLimitMsg(''),4500); return false; }
    return true;
  }

  const handleFileChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{ const b64=ev.target?.result as string; setUploadedImage(b64);setUploadedThumb(b64); if(genMode==='chat')setGenMode('image'); };
    reader.readAsDataURL(file);e.target.value='';
  };

  async function translatePrompt(prompt:string):Promise<string>{
    try{ const r=await fetch('/api/translate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt})}); const d=await r.json();return d.translated||prompt; }catch{return prompt;}
  }

  async function generateImage(originalPrompt:string,cid:string){
    if(!checkLimit('image'))return;
    setLoading(true);setGenStatus('🌐 Translating prompt...');
    const userMsg:Message={id:Date.now().toString(),role:'user',content:originalPrompt,thumb:uploadedThumb||undefined};
    setConvs(prev=>prev.map(c=>c.id===cid?{...c,messages:[...c.messages,userMsg]}:c));
    const thinkId=(Date.now()+1).toString();
    setConvs(prev=>prev.map(c=>c.id===cid?{...c,messages:[...c.messages,{id:thinkId,role:'assistant',content:'__gen_img__',type:'text'}]}:c));
    setUploadedImage(null);setUploadedThumb(null);
    try{
      const eng=await translatePrompt(originalPrompt);
      const seed=Math.floor(Math.random()*99999);
      let imageUrl='';
      for(const model of IMG_MODELS){ setGenStatus(`🎨 Generating (${model})...`); const url=pollinationsUrl(eng,model,seed); if(await testImg(url)){imageUrl=url;break;} }
      if(!imageUrl){ try{ const p=(window as any).puter; if(p?.ai?.txt2img){const r=await p.ai.txt2img(eng,false,'flux-schnell');if(r?.src||r?.url)imageUrl=r.src||r.url;} }catch{} }
      if(!imageUrl){ setConvs(prev=>prev.map(c=>c.id===cid?{...c,messages:c.messages.map(m=>m.id===thinkId?{...m,content:'⚠️ Image generation failed. Please try again.'}:m)}:c)); return; }
      setGenStatus('💎 Adding watermark...');
      const wm=await addWatermark(imageUrl);
      incUsage('image');
      if(supabaseUid){ await incrementUsage(supabaseUid,'image'); await saveGeneration({userId:supabaseUid,type:'image',prompt:originalPrompt,model:'pollinations',fileUrl:imageUrl}); }
      setConvs(prev=>prev.map(c=>c.id===cid?{...c,messages:c.messages.map(m=>m.id===thinkId?{id:thinkId,role:'assistant',content:`Generated: "${originalPrompt}"`,type:'image',mediaUrl:wm,genPrompt:eng}:m)}:c));
    }catch{ setConvs(prev=>prev.map(c=>c.id===cid?{...c,messages:c.messages.map(m=>m.id===thinkId?{...m,content:'⚠️ Image generation error.'}:m)}:c)); }
    finally{setLoading(false);setGenStatus('');}
  }

  async function generateVideo(originalPrompt:string,cid:string){
    if(!checkLimit('video'))return;
    setLoading(true);setGenStatus('🌐 Translating prompt...');
    const userMsg:Message={id:Date.now().toString(),role:'user',content:originalPrompt};
    setConvs(prev=>prev.map(c=>c.id===cid?{...c,messages:[...c.messages,userMsg]}:c));
    const thinkId=(Date.now()+1).toString();
    setConvs(prev=>prev.map(c=>c.id===cid?{...c,messages:[...c.messages,{id:thinkId,role:'assistant',content:'__gen_vid__',type:'text'}]}:c));
    try{
      const eng=await translatePrompt(originalPrompt);
      const puter=(window as any).puter;
      if(!puter?.ai){ setConvs(prev=>prev.map(c=>c.id===cid?{...c,messages:c.messages.map(m=>m.id===thinkId?{...m,content:'⚠️ Puter.js loading. Wait 3s and retry.'}:m)}:c)); return; }
      const models=['wan-ai/wan2.2-t2v-a14b','google/veo-3.1','ByteDance/Seedance-1.0-pro'];
      let videoUrl='';
      for(const model of models){
        setGenStatus(`🎬 Generating video (${model.split('/')[1]})...`);
        try{ const r=await puter.ai.txt2vid({prompt:eng,model}); if(r?.url||r?.src){videoUrl=r.url||r.src;break;} }
        catch(err:any){ if(String(err).toLowerCase().includes('auth')||String(err).toLowerCase().includes('sign in')){ setConvs(prev=>prev.map(c=>c.id===cid?{...c,messages:c.messages.map(m=>m.id===thinkId?{...m,content:'__puter_auth__'}:m)}:c)); return; } continue; }
      }
      if(!videoUrl){ setConvs(prev=>prev.map(c=>c.id===cid?{...c,messages:c.messages.map(m=>m.id===thinkId?{...m,content:'__puter_auth__'}:m)}:c)); return; }
      incUsage('video');
      if(supabaseUid){ await incrementUsage(supabaseUid,'video'); await saveGeneration({userId:supabaseUid,type:'video',prompt:originalPrompt,model:'puter',fileUrl:videoUrl}); }
      setConvs(prev=>prev.map(c=>c.id===cid?{...c,messages:c.messages.map(m=>m.id===thinkId?{id:thinkId,role:'assistant',content:`Video: "${originalPrompt}"`,type:'video',mediaUrl:videoUrl,genPrompt:eng}:m)}:c));
    }catch(err:any){
      const isPuter=String(err).toLowerCase().includes('auth')||String(err).toLowerCase().includes('sign');
      setConvs(prev=>prev.map(c=>c.id===cid?{...c,messages:c.messages.map(m=>m.id===thinkId?{...m,content:isPuter?'__puter_auth__':'⚠️ Video generation error.'}:m)}:c));
    }finally{setLoading(false);setGenStatus('');}
  }

  const sendMsg=async(override?:string)=>{
    const text=(override??input).trim();if(!text||loading)return;
    setInput('');if(taRef.current)taRef.current.style.height='auto';
    let cid=activeId;
    let dbChatId:string|null=null;
    if(!cid){
      cid=Date.now().toString();
      const title=text.length>40?text.slice(0,40)+'…':text;
      setConvs(prev=>[{id:cid!,title,messages:[]},...prev]);
      setActiveId(cid);
      await new Promise(r=>setTimeout(r,50));
      // Supabase ga chat saqlash
      if(supabaseUid){ const dbChat=await saveChat(supabaseUid,null,title); if(dbChat?.id)dbChatId=dbChat.id; }
    }
    if(genMode==='image'){await generateImage(text,cid!);return;}
    if(genMode==='video'){await generateVideo(text,cid!);return;}
    const userMsg:Message={id:Date.now().toString(),role:'user',content:text};
    setConvs(prev=>prev.map(c=>c.id===cid?{...c,messages:[...c.messages,userMsg]}:c));
    // Supabase ga user xabarini saqlash
    if(dbChatId)await saveMessage(dbChatId,'user',text);
    setLoading(true);
    try{
      const cur=convs.find(c=>c.id===cid);
      const history=[...(cur?.messages??[]),userMsg].map(m=>({role:m.role,content:m.content}));
      const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:history})});
      const data=await res.json();
      const reply=data.content??'Xatolik.';
      setConvs(prev=>prev.map(c=>c.id===cid?{...c,messages:[...c.messages,{id:(Date.now()+1).toString(),role:'assistant',content:reply}]}:c));
      // Supabase ga AI javobini saqlash
      if(dbChatId)await saveMessage(dbChatId,'assistant',reply);
    }catch{ setConvs(prev=>prev.map(c=>c.id===cid?{...c,messages:[...c.messages,{id:(Date.now()+1).toString(),role:'assistant',content:'⚠️ Connection error.'}]}:c)); }
    finally{setLoading(false);}
  };

  const userInitial=user?.displayName?.charAt(0).toUpperCase()||user?.email?.charAt(0).toUpperCase()||'U';
  const MODES={ chat:{label:'Chat',color:'#8b5cf6',icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}, image:{label:'Image',color:'#06b6d4',icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>}, video:{label:'Video',color:'#f59e0b',icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>}, };
  const mc=MODES[genMode];
  const inputPh=genMode==='image'?s.imgPh:genMode==='video'?s.vidPh:s.ph;

  const GoogleIcon=()=><svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>;

  return(
    <div className="flex h-screen bg-[#09090f] text-[#e8e8f2] overflow-hidden" dir={isRTL?'rtl':'ltr'}>
      {limitMsg&&<div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1a1a2e] border border-[#8b5cf6] px-5 py-3 rounded-xl text-[13px] shadow-xl max-w-[360px] text-center">⚠️ {limitMsg}</div>}
      {genStatus&&<div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#0d0d16] border border-[#252538] text-[#00e5ff] px-5 py-3 rounded-xl text-[13px] shadow-xl flex items-center gap-2"><span className="w-2 h-2 bg-[#00e5ff] rounded-full animate-pulse"/>{genStatus}</div>}

      {/* SIDEBAR */}
      <aside style={{width:sidebarOpen?'262px':'52px',minWidth:sidebarOpen?'262px':'52px',transition:'width 0.3s ease,min-width 0.3s ease'}} className="flex flex-col bg-[#0d0d16] border-r border-[#252538] overflow-hidden flex-shrink-0">
        <div className="flex items-center border-b border-[#252538] px-[10px] py-[14px] gap-3" style={{minHeight:'60px'}}>
          <div className="w-8 h-8 min-w-[32px] rounded-[8px] overflow-hidden shadow-[0_0_16px_rgba(139,92,246,0.4)] cursor-pointer flex-shrink-0" onClick={()=>setSidebarOpen(v=>!v)}><img src="/asena-ai-logo.svg" alt="ASENA AI" width="32" height="32" style={{width:'100%',height:'100%',objectFit:'cover'}}/></div>
          {sidebarOpen&&<div className="overflow-hidden"><h1 style={{fontFamily:'var(--font-oxanium,Oxanium,sans-serif)'}} className="text-[13px] font-extrabold tracking-[1.5px] whitespace-nowrap">ASENA AI</h1><p className="text-[8px] text-[#00e5ff] tracking-[1.5px] font-semibold mt-0.5 whitespace-nowrap">{s.powered}</p></div>}
        </div>
        <div className="px-[10px] pt-3 pb-2">
          {sidebarOpen?(<button onClick={newChat} className="flex items-center justify-between w-full bg-[#13131f] border border-[#252538] rounded-[10px] px-3 py-2 text-[13px] cursor-pointer hover:border-[#8b5cf6] hover:bg-[#18182a] transition-all"><div className="flex items-center gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg><span>{s.nc}</span></div><span className="bg-[#18182a] border border-[#252538] rounded px-1 py-0.5 text-[10px] text-[#7777a0]">Ctrl N</span></button>
          ):(<button onClick={newChat} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#7777a0] hover:text-[#e8e8f2] hover:bg-[#13131f] transition-all mx-auto"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>)}
        </div>
        {sidebarOpen&&(<><p className="text-[10px] font-semibold tracking-[1.5px] text-[#7777a0] px-[14px] pb-2">{s.convs}</p><div className="flex-1 overflow-y-auto flex flex-col gap-0.5 px-[10px]">{convs.length===0?(<div className="flex flex-col items-center gap-2 py-7 text-[#7777a0] text-[12px] opacity-60"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span>{s.noc}</span></div>):convs.map(c=>(<div key={c.id} onClick={()=>setActiveId(c.id)} className={`px-2.5 py-2 rounded-lg cursor-pointer text-[12.5px] truncate transition-all ${activeId===c.id?'bg-[#13131f] text-[#e8e8f2]':'text-[#7777a0] hover:bg-[#13131f] hover:text-[#e8e8f2]'}`}>{c.title}</div>))}</div></>)}
        {!sidebarOpen&&<div className="flex-1"/>}
        <div className="border-t border-[#252538] px-[10px] pt-3 pb-3 flex flex-col gap-2">
          {sidebarOpen?(<>
            <div className="flex items-center gap-2 px-2 py-1.5 bg-[#13131f] rounded-lg text-[12px] text-[#7777a0]"><span className="w-[7px] h-[7px] bg-[#22c55e] rounded-full shadow-[0_0_6px_#22c55e]"/><span>Asena-1.0 ML</span></div>
            {authLoading?(<div className="flex items-center gap-2 p-2"><div className="w-8 h-8 rounded-lg bg-[#252538] animate-pulse"/><div className="h-3 w-20 bg-[#252538] rounded animate-pulse"/></div>
            ):user?(<div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#13131f] cursor-pointer" onClick={handleLogout}>{user.photoURL?<img src={user.photoURL} alt="" className="w-8 h-8 min-w-[32px] rounded-lg object-cover"/>:<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center text-[13px] font-bold">{userInitial}</div>}<div className="overflow-hidden flex-1"><p className="text-[12px] font-medium truncate">{user.displayName||'User'}</p><p className="text-[10px] text-[#7777a0]">Sign out</p></div></div>
            ):(<button onClick={handleLogin} disabled={loginLoading} className="flex items-center gap-2.5 w-full p-2 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-60"><GoogleIcon/><div className="text-left"><p className="text-[12px] font-semibold text-gray-800 whitespace-nowrap">{loginLoading?'Signing in...':'Sign in with Google'}</p><p className="text-[10px] text-gray-500">10 images & videos/day</p></div></button>)}
          </>):(<div className="flex flex-col items-center gap-2"><span className="w-[7px] h-[7px] bg-[#22c55e] rounded-full shadow-[0_0_6px_#22c55e]"/>{!authLoading&&(user?(user.photoURL?<img src={user.photoURL} alt="" className="w-8 h-8 rounded-lg object-cover cursor-pointer" onClick={handleLogout}/>:<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center text-[13px] font-bold cursor-pointer" onClick={handleLogout}>{userInitial}</div>):(<button onClick={handleLogin} className="w-8 h-8 rounded-lg bg-white flex items-center justify-center hover:bg-gray-100"><GoogleIcon/></button>))}</div>)}
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#252538] bg-[#09090f] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <button onClick={()=>setSidebarOpen(v=>!v)} className="p-1.5 rounded-lg text-[#7777a0] hover:text-[#e8e8f2] hover:bg-[#13131f] transition-all"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
            <div className="flex items-center gap-2 text-[13px] text-[#7777a0]"><span className="w-[7px] h-[7px] bg-[#22c55e] rounded-full shadow-[0_0_6px_#22c55e]"/><span>Asena-1.0 ML</span></div>
          </div>
          <div className="flex items-center gap-2">
            {user&&<div className="text-[11px] text-[#7777a0] hidden sm:flex items-center gap-1"><span>🖼 {LIMIT_LOGGED_IN-getUsage('image')}</span><span className="opacity-40">|</span><span>🎬 {LIMIT_LOGGED_IN-getUsage('video')}</span></div>}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7777a0" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            <select value={lang} onChange={e=>setLang(e.target.value)} className="bg-[#13131f] border border-[#252538] rounded-lg text-[#e8e8f2] text-[12.5px] px-2 py-1.5 cursor-pointer outline-none focus:border-[#8b5cf6] max-w-[190px]" style={{fontFamily:'inherit'}}>{LANGUAGES.map(l=><option key={l.code} value={l.code} style={{background:'#13131f'}}>{l.native}  —  {l.name}</option>)}</select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col">
          {!activeId?(
            <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 gap-4">
              <div className="w-[82px] h-[82px] rounded-[22px] overflow-hidden" style={{animation:'zoomPulse 3s ease-in-out infinite',boxShadow:'0 0 50px rgba(139,92,246,0.45)'}}><img src="/asena-ai-logo.svg" alt="ASENA AI" width="82" height="82" style={{width:'100%',height:'100%',objectFit:'cover'}}/></div>
              <h2 style={{fontFamily:'var(--font-oxanium,Oxanium,sans-serif)',background:'linear-gradient(135deg,#8b5cf6,#06b6d4)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}} className="text-[44px] font-extrabold tracking-[3px]">ASENA AI</h2>
              <p className="text-center text-[#7777a0] text-[15px] max-w-[500px] leading-relaxed">{s.sub}</p>
              <div className="flex gap-2">{(['chat','image','video'] as const).map(m=>(<button key={m} onClick={()=>setGenMode(m)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all" style={{borderColor:genMode===m?MODES[m].color:'#252538',background:genMode===m?`${MODES[m].color}18`:'transparent',color:genMode===m?MODES[m].color:'#7777a0'}}>{MODES[m].icon} {MODES[m].label}</button>))}</div>
              <div className="flex items-center gap-1.5 text-[12px] text-[#00e5ff] opacity-80"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg><span>{s.ultra}</span></div>
              {!user&&!authLoading&&(<div className="flex items-center gap-2 bg-[#13131f] border border-[#252538] rounded-xl px-4 py-2.5 text-[12px] text-[#7777a0]"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span>Guest: 1 image + 1 video free</span><button onClick={handleLogin} className="text-[#00e5ff] hover:underline font-medium">Sign in for 10/day →</button></div>)}
              <div className="grid grid-cols-2 gap-2.5 max-w-[680px] w-full mt-2">{[{lang:"O'zbek",txt:"Sun'iy intellekt kelajagi haqida gapir"},{lang:"English",txt:"Explain quantum computing simply"},{lang:"Türkçe",txt:"Yapay zekanın geleceği hakkında konuş"},{lang:"Azərbaycan",txt:"Süni intellekt haqqında danış"}].map((sg,i)=>(<div key={i} onClick={()=>sendMsg(sg.txt)} className="bg-[#13131f] border border-[#252538] rounded-xl p-3.5 cursor-pointer hover:border-[#8b5cf6] hover:bg-[#18182a] hover:-translate-y-0.5 transition-all"><p className="text-[11px] text-[#7777a0] mb-1">{sg.lang}</p><p className="text-[13.5px] font-medium leading-snug">{sg.txt}</p></div>))}</div>
            </div>
          ):(
            <div className="flex flex-col gap-3.5 p-5 flex-1">
              {activeConv?.messages.map(msg=>(
                <div key={msg.id} className={`flex gap-2.5 max-w-[800px] w-full mx-auto ${msg.role==='user'?'flex-row-reverse':''}`}>
                  <div className={`w-[30px] h-[30px] min-w-[30px] rounded-lg flex-shrink-0 overflow-hidden ${msg.role==='user'?'bg-[#252538] flex items-center justify-center font-bold text-[13px] text-[#7777a0]':''}`}>{msg.role==='assistant'?<img src="/asena-ai-logo.svg" alt="AI" width="30" height="30" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:(user?.photoURL?<img src={user.photoURL} alt="" className="w-full h-full object-cover"/>:userInitial)}</div>
                  <div className={`rounded-xl max-w-[calc(100%-46px)] border overflow-hidden ${msg.role==='user'?'bg-[rgba(139,92,246,0.12)] border-[rgba(139,92,246,0.28)]':'bg-[#13131f] border-[#252538]'}`}>
                    {msg.role==='user'&&msg.thumb&&<div className="p-2 pb-0"><img src={msg.thumb} alt="upload" className="max-w-[200px] rounded-lg"/></div>}
                    {msg.content==='__gen_img__'?(<div className="px-4 py-3 flex items-center gap-2 text-[#7777a0] text-[13px]"><div className="flex gap-1">{[0,1,2].map(i=><span key={i} className="w-1.5 h-1.5 bg-[#06b6d4] rounded-full animate-bounce" style={{animationDelay:`${i*0.22}s`}}/>)}</div><span>Creating image...</span></div>
                    ):msg.content==='__gen_vid__'?(<div className="px-4 py-3 flex items-center gap-2 text-[#7777a0] text-[13px]"><div className="flex gap-1">{[0,1,2].map(i=><span key={i} className="w-1.5 h-1.5 bg-[#f59e0b] rounded-full animate-bounce" style={{animationDelay:`${i*0.22}s`}}/>)}</div><span>Creating video...</span></div>
                    ):msg.content==='__puter_auth__'?(
                      <div className="px-4 py-4">
                        <div className="flex items-center gap-2 mb-2"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg><span className="text-[13px] font-medium text-[#f59e0b]">Video requires Puter.com account (free)</span></div>
                        <p className="text-[12px] text-[#7777a0] mb-3 leading-relaxed">Video generation uses Puter AI. Sign in once at puter.com with your free account, then come back and try again.</p>
                        <a href="https://puter.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f59e0b] text-black text-[12px] font-semibold hover:opacity-90 transition-all">Sign in to Puter.com (free) →</a>
                      </div>
                    ):msg.type==='image'&&msg.mediaUrl?(
                      <div><img src={msg.mediaUrl} alt={msg.genPrompt||''} className="w-full max-w-[512px] rounded-t-xl block"/><div className="px-3 py-2 flex items-center justify-between gap-2"><p className="text-[11px] text-[#7777a0] truncate flex-1">{msg.genPrompt}</p><a href={msg.mediaUrl} download="asena-ai.jpg" className="flex items-center gap-1 text-[11px] text-[#00e5ff] hover:opacity-80 flex-shrink-0"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Save</a></div></div>
                    ):msg.type==='video'&&msg.mediaUrl?(
                      <div><video src={msg.mediaUrl} controls className="w-full max-w-[512px] rounded-t-xl block"/><div className="px-3 py-2 flex items-center justify-between gap-2"><p className="text-[11px] text-[#7777a0] truncate flex-1">{msg.genPrompt}</p><a href={msg.mediaUrl} download="asena-ai.mp4" className="flex items-center gap-1 text-[11px] text-[#f59e0b] hover:opacity-80 flex-shrink-0"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Save</a></div></div>
                    ):(<div className="px-4 py-3 text-[13.5px] leading-[1.75] break-words" dangerouslySetInnerHTML={{__html:mdToHtml(msg.content)}}/>)}
                  </div>
                </div>
              ))}
              {loading&&genMode==='chat'&&(<div className="flex gap-2.5 max-w-[800px] w-full mx-auto"><div className="w-[30px] h-[30px] min-w-[30px] rounded-lg overflow-hidden flex-shrink-0"><img src="/asena-ai-logo.svg" alt="AI" width="30" height="30" style={{width:'100%',height:'100%',objectFit:'cover'}}/></div><div className="bg-[#13131f] border border-[#252538] rounded-xl px-4 py-3"><div className="flex gap-1">{[0,1,2].map(i=><span key={i} className="w-1.5 h-1.5 bg-[#8b5cf6] rounded-full animate-bounce" style={{animationDelay:`${i*0.22}s`}}/>)}</div></div></div>)}
              <div ref={endRef}/>
            </div>
          )}
        </div>

        {/* INPUT */}
        <div className="px-4 pb-4 pt-2 flex-shrink-0">
          <div className="max-w-[800px] mx-auto">
            {uploadedThumb&&(
              <div className="mb-2 flex items-center gap-2 bg-[#13131f] border border-[#252538] rounded-xl px-3 py-2">
                <img src={uploadedThumb} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0"/>
                <div className="flex-1"><p className="text-[12px] text-[#e8e8f2]">Image ready</p><p className="text-[11px] text-[#7777a0]">Choose mode: Image (edit) or Video (animate)</p></div>
                <div className="flex gap-1.5">
                  <button onClick={()=>setGenMode('image')} className="px-2 py-1 rounded-lg text-[11px] border transition-all" style={{borderColor:genMode==='image'?'#06b6d4':'#252538',color:genMode==='image'?'#06b6d4':'#7777a0'}}>🖼 Image</button>
                  <button onClick={()=>setGenMode('video')} className="px-2 py-1 rounded-lg text-[11px] border transition-all" style={{borderColor:genMode==='video'?'#f59e0b':'#252538',color:genMode==='video'?'#f59e0b':'#7777a0'}}>🎬 Video</button>
                  <button onClick={()=>{setUploadedImage(null);setUploadedThumb(null);}} className="px-2 py-1 rounded-lg bg-[#252538] text-[#7777a0] text-[11px] hover:bg-[#2a2a42]">✕</button>
                </div>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange}/>
            <div className="flex items-end gap-2 bg-[#18182a] border rounded-[14px] px-3 py-2.5 transition-colors" style={{borderColor:genMode==='chat'?'#252538':genMode==='image'?'rgba(6,182,212,0.45)':'rgba(245,158,11,0.45)'}}>
              {/* Upload button */}
              <button onClick={()=>fileRef.current?.click()} title="Upload image" className="w-7 h-7 rounded-lg flex items-center justify-center text-[#7777a0] hover:text-[#e8e8f2] hover:bg-[#252538] transition-all flex-shrink-0"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
              {/* Mode selector */}
              <div className="relative flex-shrink-0">
                <button onClick={e=>{e.stopPropagation();setShowModeMenu(v=>!v);}} className="px-2 h-7 rounded-lg flex items-center gap-1 text-[11px] font-medium border transition-all" style={{borderColor:`${mc.color}50`,background:`${mc.color}15`,color:mc.color}}>{mc.icon}<span>{mc.label}</span></button>
                {showModeMenu&&(<div className="absolute bottom-full mb-2 left-0 bg-[#13131f] border border-[#252538] rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-30 min-w-[130px]" onClick={e=>e.stopPropagation()}>{(['chat','image','video'] as const).map(m=>(<button key={m} onClick={()=>{setGenMode(m);setShowModeMenu(false);}} className="flex items-center gap-2 w-full px-3 py-2.5 text-[13px] hover:bg-[#18182a] transition-colors" style={{color:genMode===m?MODES[m].color:'#e8e8f2'}}><span style={{color:MODES[m].color}}>{MODES[m].icon}</span>{MODES[m].label}{genMode===m&&<span className="ml-auto text-[10px]">✓</span>}</button>))}</div>)}
              </div>
              <textarea ref={taRef} value={input} onChange={e=>{setInput(e.target.value);autoResize();}} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();if(input.trim()&&!loading)sendMsg();}}} placeholder={inputPh} rows={1} disabled={loading} className="flex-1 bg-transparent border-none outline-none text-[13.5px] text-[#e8e8f2] placeholder:text-[#7777a0] resize-none max-h-[150px] leading-[1.6] min-h-[22px] disabled:opacity-60" style={{fontFamily:'inherit'}}/>
              <div className="flex items-center gap-1.5">
                <button className="p-1.5 rounded-lg text-[#7777a0] hover:text-[#e8e8f2] hover:bg-[#13131f] transition-all"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg></button>
                <button onClick={()=>sendMsg()} disabled={!input.trim()||loading} className="rounded-lg p-2 flex items-center text-white disabled:opacity-35 disabled:cursor-not-allowed hover:opacity-85 active:scale-95 transition-all" style={{background:`linear-gradient(135deg,${mc.color},${genMode==='chat'?'#06b6d4':genMode==='image'?'#8b5cf6':'#ef4444'})`}}>
                  {genMode==='image'?<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>:genMode==='video'?<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>}
                </button>
              </div>
            </div>
            <p className="text-center text-[11px] text-[#7777a0] mt-1.5 opacity-60">{s.hint}</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes zoomPulse{0%,100%{transform:scale(1);box-shadow:0 0 40px rgba(139,92,246,0.5);}50%{transform:scale(1.08);box-shadow:0 0 70px rgba(139,92,246,0.8),0 0 110px rgba(6,182,212,0.4);}}
        .mpara{margin:0;padding:0;line-height:1.8;font-size:14px;color:#e8e8f2;}.mpara-gap{height:10px;}
        .mh1{font-size:20px;font-weight:700;color:#00e5ff;margin:16px 0 8px;padding-bottom:6px;border-bottom:1px solid #252538;line-height:1.3;}
        .mh2{font-size:17px;font-weight:700;color:#00e5ff;margin:14px 0 7px;line-height:1.3;}
        .mh3{font-size:15px;font-weight:600;color:#a78bfa;margin:12px 0 6px;line-height:1.3;}
        .mul,.mol{margin:8px 0 8px 4px;display:flex;flex-direction:column;gap:5px;}.mul{list-style:none;padding-left:4px;}.mol{list-style:none;counter-reset:oli;padding-left:4px;}
        .mul li{position:relative;padding-left:20px;font-size:14px;line-height:1.75;color:#e8e8f2;}.mul li::before{content:'';position:absolute;left:4px;top:10px;width:6px;height:6px;background:#8b5cf6;border-radius:50%;}
        .mol li{position:relative;padding-left:28px;font-size:14px;line-height:1.75;color:#e8e8f2;counter-increment:oli;}.mol li::before{content:counter(oli)'.';position:absolute;left:0;top:0;color:#00e5ff;font-weight:700;font-size:13px;}
        strong{color:#00e5ff;font-weight:700;}em{color:rgba(232,232,242,0.85);font-style:italic;}
        .codeblock{background:#0a0a14;border:1px solid #252538;border-radius:10px;overflow:hidden;margin:10px 0;}.codeblock-lang{background:#13131f;color:#7777a0;font-size:11px;padding:5px 12px;border-bottom:1px solid #252538;}.codeblock code{display:block;padding:12px;overflow-x:auto;font-family:monospace;font-size:12.5px;color:#e8e8f2;line-height:1.6;white-space:pre;}
        .ic{background:rgba(139,92,246,0.18);border:1px solid rgba(139,92,246,0.25);padding:1px 6px;border-radius:4px;font-family:monospace;font-size:12.5px;color:#c4b5fd;}
        .ml{color:#00e5ff;text-decoration:underline;text-underline-offset:3px;font-weight:500;}.ml:hover{opacity:0.8;}
        .mhr{border:none;border-top:1px solid #252538;margin:12px 0;}
        ::-webkit-scrollbar{width:3px;height:3px;}::-webkit-scrollbar-thumb{background:#252538;border-radius:3px;}
        select option{background:#13131f!important;color:#e8e8f2!important;}
      `}</style>
    </div>
  );
}
