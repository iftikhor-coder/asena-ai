'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { onAuth, signInWithGoogle, logout } from './lib/firebase';
import { upsertUser } from './lib/supabase';
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
  { code:'zh-TW', name:'Chinese (Traditional)', native:'中文(繁體)' },
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
  { code:'tg', name:'Tajik', native:'Тоҷикӣ' },
  { code:'fa', name:'Persian', native:'فارسی', dir:'rtl' },
  { code:'ur', name:'Urdu', native:'اردو', dir:'rtl' },
  { code:'he', name:'Hebrew', native:'עברית', dir:'rtl' },
  { code:'ps', name:'Pashto', native:'پښتو', dir:'rtl' },
  { code:'af', name:'Afrikaans', native:'Afrikaans' },
  { code:'sq', name:'Albanian', native:'Shqip' },
  { code:'am', name:'Amharic', native:'አማርኛ' },
  { code:'hy', name:'Armenian', native:'Հայերեն' },
  { code:'eu', name:'Basque', native:'Euskara' },
  { code:'be', name:'Belarusian', native:'Беларуская' },
  { code:'bn', name:'Bengali', native:'বাংলা' },
  { code:'bs', name:'Bosnian', native:'Bosanski' },
  { code:'bg', name:'Bulgarian', native:'Български' },
  { code:'ca', name:'Catalan', native:'Català' },
  { code:'hr', name:'Croatian', native:'Hrvatski' },
  { code:'cs', name:'Czech', native:'Čeština' },
  { code:'da', name:'Danish', native:'Dansk' },
  { code:'et', name:'Estonian', native:'Eesti' },
  { code:'tl', name:'Filipino', native:'Filipino' },
  { code:'fi', name:'Finnish', native:'Suomi' },
  { code:'gl', name:'Galician', native:'Galego' },
  { code:'ka', name:'Georgian', native:'ქართული' },
  { code:'el', name:'Greek', native:'Ελληνικά' },
  { code:'gu', name:'Gujarati', native:'ગુજરાતી' },
  { code:'hu', name:'Hungarian', native:'Magyar' },
  { code:'is', name:'Icelandic', native:'Íslenska' },
  { code:'id', name:'Indonesian', native:'Indonesia' },
  { code:'ga', name:'Irish', native:'Gaeilge' },
  { code:'kn', name:'Kannada', native:'ಕನ್ನಡ' },
  { code:'km', name:'Khmer', native:'ខ្មែរ' },
  { code:'ku', name:'Kurdish', native:'Kurdî' },
  { code:'lo', name:'Lao', native:'ລາວ' },
  { code:'lv', name:'Latvian', native:'Latviešu' },
  { code:'lt', name:'Lithuanian', native:'Lietuvių' },
  { code:'mk', name:'Macedonian', native:'Македонски' },
  { code:'ms', name:'Malay', native:'Melayu' },
  { code:'ml', name:'Malayalam', native:'മലയാളം' },
  { code:'mt', name:'Maltese', native:'Malti' },
  { code:'mi', name:'Maori', native:'Māori' },
  { code:'mr', name:'Marathi', native:'मराठी' },
  { code:'mn', name:'Mongolian', native:'Монгол' },
  { code:'ne', name:'Nepali', native:'नेपाली' },
  { code:'no', name:'Norwegian', native:'Norsk' },
  { code:'pl', name:'Polish', native:'Polski' },
  { code:'pa', name:'Punjabi', native:'ਪੰਜਾਬੀ' },
  { code:'ro', name:'Romanian', native:'Română' },
  { code:'sr', name:'Serbian', native:'Srpski' },
  { code:'sk', name:'Slovak', native:'Slovenčina' },
  { code:'sl', name:'Slovenian', native:'Slovenščina' },
  { code:'so', name:'Somali', native:'Soomaali' },
  { code:'sw', name:'Swahili', native:'Kiswahili' },
  { code:'sv', name:'Swedish', native:'Svenska' },
  { code:'ta', name:'Tamil', native:'தமிழ்' },
  { code:'te', name:'Telugu', native:'తెలుగు' },
  { code:'th', name:'Thai', native:'ไทย' },
  { code:'vi', name:'Vietnamese', native:'Tiếng Việt' },
  { code:'cy', name:'Welsh', native:'Cymraeg' },
  { code:'yo', name:'Yoruba', native:'Yorùbá' },
  { code:'zu', name:'Zulu', native:'isiZulu' },
];

type UIStr = {
  powered:string; nc:string; convs:string; noc:string; guest:string; gsub:string;
  sub:string; ultra:string; ph:string; hint:string;
  imgPh:string; vidPh:string;
  sugg:{lang:string;txt:string}[];
};

const T:Record<string,UIStr> = {
  uz:{ powered:'ASENA-1.0 ML TOMONIDAN', nc:"Yangi suhbat", convs:'SUHBATLAR', noc:"Hali suhbat yo'q", guest:'Mehmon foydalanuvchi', gsub:'Kirish uchun bosing', sub:"Aqlli yordamchingiz. Har qanday tilda savol bering — yordam berishga tayyorman.", ultra:'Ultra-tez Asena-1.0 ML', ph:"Xabar yozing... (Shift+Enter = yangi qator)", imgPh:"Rasm uchun tavsif yozing...", vidPh:"Video uchun tavsif yozing...", hint:"ASENA AI · O'zbek · English · Türkçe · Azərbaycan · va boshqalar", sugg:[{lang:"O'zbek",txt:"Sun'iy intellekt kelajagi haqida gapir"},{lang:'English',txt:'Explain quantum computing simply'},{lang:'Türkçe',txt:'Yapay zekanın geleceği hakkında konuş'},{lang:'Azərbaycan',txt:'Süni intellekt haqqında danış'}] },
  en:{ powered:'POWERED BY ASENA-1.0 ML', nc:'New Chat', convs:'CONVERSATIONS', noc:'No conversations yet', guest:'Guest User', gsub:'Sign in for more', sub:"Your intelligent assistant. Ask in any language — ready to help you.", ultra:'Ultra-fast Asena-1.0 ML', ph:'Type a message... (Shift+Enter = new line)', imgPh:'Describe the image you want to generate...', vidPh:'Describe the video you want to generate...', hint:"ASENA AI · English · O'zbek · Türkçe · Azərbaycan · and more", sugg:[{lang:'English',txt:'Explain quantum computing simply'},{lang:'English',txt:'Write me a poem about space'},{lang:"O'zbek",txt:"Sun'iy intellekt haqida gapir"},{lang:'Türkçe',txt:'Yapay zeka hakkında konuş'}] },
  tr:{ powered:'ASENA-1.0 ML TARAFINDAN', nc:'Yeni Sohbet', convs:'SOHBETLER', noc:'Henüz sohbet yok', guest:'Misafir Kullanıcı', gsub:'Daha fazlası için giriş yap', sub:'Akıllı asistanınız. Herhangi bir dilde soru sorun.', ultra:'Ultra hızlı Asena-1.0 ML', ph:'Mesaj yazın... (Shift+Enter = yeni satır)', imgPh:'Oluşturmak istediğiniz görseli tanımlayın...', vidPh:'Oluşturmak istediğiniz videoyu tanımlayın...', hint:"ASENA AI · Türkçe · English · O'zbek · Azərbaycan · ve daha fazlası", sugg:[{lang:'Türkçe',txt:'Yapay zekanın geleceği hakkında konuş'},{lang:'Türkçe',txt:'Kuantum bilgisayarı basitçe açıkla'},{lang:'English',txt:'Explain quantum computing simply'},{lang:"O'zbek",txt:"Sun'iy intellekt haqida gapir"}] },
  az:{ powered:'ASENA-1.0 ML TƏRƏFİNDƏN', nc:'Yeni Söhbət', convs:'SÖHBƏTLƏRİM', noc:'Hələ söhbət yoxdur', guest:'Qonaq İstifadəçi', gsub:'Daha çox xüsusiyyət üçün daxil ol', sub:'Ağıllı köməkçiniz. İstənilən dildə sual verin.', ultra:'Ultra-sürətli Asena-1.0 ML', ph:'Mesaj yazın... (Shift+Enter = yeni sətir)', imgPh:'Yaratmaq istədiyiniz şəkli təsvir edin...', vidPh:'Yaratmaq istədiyiniz videoyu təsvir edin...', hint:"ASENA AI · Azərbaycan · O'zbek · English · Türkçe · və daha çox", sugg:[{lang:'Azərbaycan',txt:'Süni intellekt haqqında danış'},{lang:'Azərbaycan',txt:'Kvant hesablamasını izah et'},{lang:'English',txt:'Explain quantum computing simply'},{lang:"O'zbek",txt:"Sun'iy intellekt haqida gapir"}] },
  ar:{ powered:'مدعوم بـ ASENA-1.0 ML', nc:'محادثة جديدة', convs:'المحادثات', noc:'لا توجد محادثات بعد', guest:'ضيف', gsub:'سجل الدخول لمزيد', sub:'مساعدك الذكي. اسأل بأي لغة.', ultra:'استنتاج Asena-1.0 ML فائق السرعة', ph:'اكتب رسالة...', imgPh:'صف الصورة التي تريد إنشاءها...', vidPh:'صف الفيديو الذي تريد إنشاءه...', hint:"ASENA AI · العربية · English · Türkçe · O'zbek · والمزيد", sugg:[{lang:'العربية',txt:'اشرح لي الذكاء الاصطناعي'},{lang:'English',txt:'Explain quantum computing simply'},{lang:"O'zbek",txt:"Sun'iy intellekt haqida gapir"},{lang:'Türkçe',txt:'Yapay zeka hakkında konuş'}] },
  'zh-CN':{ powered:'由 ASENA-1.0 ML 驱动', nc:'新对话', convs:'对话', noc:'暂无对话', guest:'访客用户', gsub:'登录以获取更多功能', sub:'您的智能助手。用任何语言提问。', ultra:'超快速 Asena-1.0 ML', ph:'输入消息...', imgPh:'描述您想生成的图像...', vidPh:'描述您想生成的视频...', hint:"ASENA AI · 中文 · English · O'zbek · Türkçe · 等等", sugg:[{lang:'中文',txt:'简单解释量子计算'},{lang:'中文',txt:'人工智能的未来是什么？'},{lang:'English',txt:'Explain quantum computing simply'},{lang:"O'zbek",txt:"Sun'iy intellekt haqida gapir"}] },
  de:{ powered:'BETRIEBEN VON ASENA-1.0 ML', nc:'Neues Gespräch', convs:'GESPRÄCHE', noc:'Noch keine Gespräche', guest:'Gastbenutzer', gsub:'Anmelden für mehr', sub:'Ihr intelligenter Assistent.', ultra:'Ultraschnelle Asena-1.0 ML', ph:'Nachricht schreiben...', imgPh:'Beschreibe das Bild, das du erstellen möchtest...', vidPh:'Beschreibe das Video, das du erstellen möchtest...', hint:"ASENA AI · Deutsch · English · O'zbek · Türkçe · und mehr", sugg:[{lang:'Deutsch',txt:'Erkläre mir KI einfach'},{lang:'English',txt:'Explain quantum computing simply'},{lang:"O'zbek",txt:"Sun'iy intellekt haqida gapir"},{lang:'Türkçe',txt:'Yapay zeka hakkında konuş'}] },
  fr:{ powered:'PROPULSÉ PAR ASENA-1.0 ML', nc:'Nouvelle Discussion', convs:'CONVERSATIONS', noc:'Pas encore de conversations', guest:'Utilisateur Invité', gsub:'Connectez-vous pour plus', sub:"Votre assistant intelligent.", ultra:"Inférence ultra-rapide d'Asena-1.0 ML", ph:'Tapez un message...', imgPh:"Décrivez l'image que vous souhaitez générer...", vidPh:"Décrivez la vidéo que vous souhaitez générer...", hint:"ASENA AI · Français · English · O'zbek · Türkçe · et plus", sugg:[{lang:'Français',txt:"Explique-moi l'intelligence artificielle"},{lang:'English',txt:'Explain quantum computing simply'},{lang:"O'zbek",txt:"Sun'iy intellekt haqida gapir"},{lang:'Türkçe',txt:'Yapay zeka hakkında konuş'}] },
};

function getT(code:string):UIStr {
  if(T[code]) return T[code];
  if(code.startsWith('zh')) return T['zh-CN'];
  return T['en'];
}

interface Message {
  id: string;
  role: 'user'|'assistant';
  content: string;
  type?: 'text'|'image'|'video';
  mediaUrl?: string;
  genPrompt?: string;
}
interface Conversation { id:string; title:string; messages:Message[]; }

const LIMIT_LOGGED_IN = 10;
const LIMIT_GUEST = 1;

function getTodayKey(type:string){ return `asena_${type}_${new Date().toISOString().split('T')[0]}`; }
function getUsage(type:string){ if(typeof window==='undefined')return 0; return parseInt(localStorage.getItem(getTodayKey(type))||'0'); }
function incrementUsageLocal(type:string){ if(typeof window==='undefined')return; localStorage.setItem(getTodayKey(type),String(getUsage(type)+1)); }

/* ── Image providers (Pollinations.ai - FREE, no API key!) ── */
const IMG_MODELS = ['flux-pro','flux','turbo','gptimage'];
function pollinationsUrl(prompt:string, model:string, seed:number){
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=${model}&width=1024&height=1024&nologo=true&seed=${seed}&enhance=true`;
}

/* ── Watermark with Canvas ── */
async function addWatermark(imageUrl:string):Promise<string>{
  return new Promise((resolve)=>{
    const img = new Image();
    img.crossOrigin='anonymous';
    img.onload=()=>{
      const canvas=document.createElement('canvas');
      canvas.width=img.width; canvas.height=img.height;
      const ctx=canvas.getContext('2d')!;
      ctx.drawImage(img,0,0);
      const fontSize=Math.max(14,Math.floor(img.width*0.022));
      ctx.font=`bold ${fontSize}px sans-serif`;
      const text='✦ ASENA AI';
      const m=ctx.measureText(text);
      const pad=10; const x=img.width-m.width-pad*2; const y=img.height-pad*2;
      ctx.fillStyle='rgba(9,9,15,0.62)';
      const rw=m.width+pad*2; const rh=fontSize+pad*1.5;
      const rx=x-pad; const ry=y-fontSize-pad*0.5;
      ctx.beginPath();
      const r=6;
      ctx.moveTo(rx+r,ry); ctx.lineTo(rx+rw-r,ry); ctx.quadraticCurveTo(rx+rw,ry,rx+rw,ry+r);
      ctx.lineTo(rx+rw,ry+rh-r); ctx.quadraticCurveTo(rx+rw,ry+rh,rx+rw-r,ry+rh);
      ctx.lineTo(rx+r,ry+rh); ctx.quadraticCurveTo(rx,ry+rh,rx,ry+rh-r);
      ctx.lineTo(rx,ry+r); ctx.quadraticCurveTo(rx,ry,rx+r,ry);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.92)'; ctx.fillText(text,x,y);
      resolve(canvas.toDataURL('image/jpeg',0.93));
    };
    img.onerror=()=>resolve(imageUrl);
    img.src=imageUrl;
  });
}

/* ── Test if image URL loads ── */
function testImageUrl(url:string):Promise<boolean>{
  return new Promise(resolve=>{
    const img=new Image();
    img.onload=()=>resolve(true);
    img.onerror=()=>resolve(false);
    img.src=url;
    setTimeout(()=>resolve(false),15000);
  });
}

function mdToHtml(raw:string){
  let t=raw.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  t=t.replace(/```([\w]*)\n?([\s\S]*?)```/g,(_,lang,code)=>`<pre class="codeblock"><div class="codeblock-lang">${lang||'code'}</div><code>${code.trim()}</code></pre>`);
  t=t.replace(/`([^`\n]+)`/g,'<code class="ic">$1</code>');
  const lines=t.split('\n'); const out:string[]=[]; let inList=false,listType='';
  for(let i=0;i<lines.length;i++){
    const line=lines[i];
    if(/^### (.+)/.test(line)){if(inList){out.push(listType==='ul'?'</ul>':'</ol>');inList=false;}out.push(`<h3 class="mh3">${line.replace(/^### /,'')}</h3>`);continue;}
    if(/^## (.+)/.test(line)){if(inList){out.push(listType==='ul'?'</ul>':'</ol>');inList=false;}out.push(`<h2 class="mh2">${line.replace(/^## /,'')}</h2>`);continue;}
    if(/^# (.+)/.test(line)){if(inList){out.push(listType==='ul'?'</ul>':'</ol>');inList=false;}out.push(`<h1 class="mh1">${line.replace(/^# /,'')}</h1>`);continue;}
    if(/^---+$/.test(line.trim())){if(inList){out.push(listType==='ul'?'</ul>':'</ol>');inList=false;}out.push('<hr class="mhr"/>');continue;}
    const olMatch=line.match(/^(\d+)\. (.+)/);
    if(olMatch){if(!inList||listType!=='ol'){if(inList)out.push('</ul>');out.push('<ol class="mol">');inList=true;listType='ol';}out.push(`<li>${olMatch[2]}</li>`);continue;}
    const ulMatch=line.match(/^[\-\*•] (.+)/);
    if(ulMatch){if(!inList||listType!=='ul'){if(inList)out.push('</ol>');out.push('<ul class="mul">');inList=true;listType='ul';}out.push(`<li>${ulMatch[1]}</li>`);continue;}
    if(inList&&line.trim()===''){out.push(listType==='ul'?'</ul>':'</ol>');inList=false;out.push('<div class="mpara-gap"></div>');continue;}
    if(inList){out.push(listType==='ul'?'</ul>':'</ol>');inList=false;}
    if(line.trim()===''){out.push('<div class="mpara-gap"></div>');continue;}
    out.push(`<p class="mpara">${line}</p>`);
  }
  if(inList)out.push(listType==='ul'?'</ul>':'</ol>');
  let result=out.join('');
  result=result
    .replace(/\*\*\*(.+?)\*\*\*/g,'<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,'<a href="$2" target="_blank" class="ml">$1</a>');
  return result;
}

export default function Home() {
  const [lang, setLang] = useState('en');
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string|null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [genMode, setGenMode] = useState<'chat'|'image'|'video'>('chat');
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [genStatus, setGenStatus] = useState('');

  // ── AUTH ──
  const [user, setUser] = useState<User|null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [limitMsg, setLimitMsg] = useState('');

  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const s = getT(lang);
  const langObj = LANGUAGES.find(l=>l.code===lang);
  const isRTL = langObj?.dir==='rtl';
  const activeConv = convs.find(c=>c.id===activeId);

  // ── Puter.js loader ──
  useEffect(()=>{
    if(typeof window==='undefined')return;
    if((window as any).puter)return;
    const script=document.createElement('script');
    script.src='https://js.puter.com/v2/';
    script.async=true;
    document.head.appendChild(script);
  },[]);

  useEffect(()=>{
    const unsub=onAuth(async(u)=>{
      setUser(u); setAuthLoading(false);
      if(u){ await upsertUser({uid:u.uid,email:u.email!,displayName:u.displayName,photoURL:u.photoURL}); }
    });
    return()=>unsub();
  },[]);

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:'smooth'}); },[activeConv?.messages]);
  useEffect(()=>{
    const h=(e:KeyboardEvent)=>{ if((e.ctrlKey||e.metaKey)&&e.key==='n'){e.preventDefault();newChat();} };
    window.addEventListener('keydown',h);
    return()=>window.removeEventListener('keydown',h);
  },[]);

  // Close mode menu on outside click
  useEffect(()=>{
    if(!showModeMenu)return;
    const h=()=>setShowModeMenu(false);
    setTimeout(()=>document.addEventListener('click',h),10);
    return()=>document.removeEventListener('click',h);
  },[showModeMenu]);

  const newChat=useCallback(()=>{ setActiveId(null); setInput(''); setGenMode('chat'); if(taRef.current)taRef.current.style.height='auto'; },[]);
  const autoResize=()=>{ const t=taRef.current; if(!t)return; t.style.height='auto'; t.style.height=Math.min(t.scrollHeight,150)+'px'; };

  const handleLogin=async()=>{ setLoginLoading(true); await signInWithGoogle(); setLoginLoading(false); };
  const handleLogout=async()=>{ await logout(); setUser(null); };

  function checkGenLimit(type:'image'|'video'):boolean{
    const limit=user?LIMIT_LOGGED_IN:LIMIT_GUEST;
    const used=getUsage(type);
    if(used>=limit){
      setLimitMsg(user?`Daily limit: ${limit} ${type}s/day.`:`Sign in for 10 free ${type}s/day! (Guest: 1 only)`);
      setTimeout(()=>setLimitMsg(''),4500);
      return false;
    }
    return true;
  }

  /* ── Translate prompt to English via server ── */
  async function translatePrompt(prompt:string):Promise<string>{
    try{
      const r=await fetch('/api/translate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt})});
      const d=await r.json();
      return d.translated||prompt;
    }catch{ return prompt; }
  }

  /* ── Generate Image ── */
  async function generateImage(originalPrompt:string, cid:string){
    if(!checkGenLimit('image'))return;
    setLoading(true);
    setGenStatus('🌐 Translating prompt...');

    // User message
    const userMsg:Message={id:Date.now().toString(),role:'user',content:originalPrompt,type:'text'};
    setConvs(prev=>prev.map(c=>c.id===cid?{...c,messages:[...c.messages,userMsg]}:c));

    // Thinking bubble
    const thinkId=(Date.now()+1).toString();
    const thinkMsg:Message={id:thinkId,role:'assistant',content:'__generating_image__',type:'text'};
    setConvs(prev=>prev.map(c=>c.id===cid?{...c,messages:[...c.messages,thinkMsg]}:c));

    try{
      const engPrompt=await translatePrompt(originalPrompt);
      const seed=Math.floor(Math.random()*99999);

      let imageUrl='';
      // Try each Pollinations model in order
      for(const model of IMG_MODELS){
        setGenStatus(`🎨 Generating with ${model}...`);
        const url=pollinationsUrl(engPrompt,model,seed);
        const ok=await testImageUrl(url);
        if(ok){ imageUrl=url; break; }
      }

      // Fallback: Puter.js txt2img
      if(!imageUrl){
        setGenStatus('🤖 Trying Puter AI...');
        try{
          const puter=(window as any).puter;
          if(puter?.ai?.txt2img){
            const result=await puter.ai.txt2img(engPrompt,false,'dall-e-3');
            if(result?.src||result?.url){ imageUrl=result.src||result.url; }
          }
        }catch{}
      }

      if(!imageUrl){
        // Remove thinking, show error
        const errMsg:Message={id:thinkId,role:'assistant',content:'⚠️ Image generation failed. Please try again.',type:'text'};
        setConvs(prev=>prev.map(c=>c.id===cid?{...c,messages:c.messages.map(m=>m.id===thinkId?errMsg:m)}:c));
        return;
      }

      setGenStatus('💎 Adding watermark...');
      const watermarked=await addWatermark(imageUrl);
      incrementUsageLocal('image');

      const imgMsg:Message={
        id:thinkId,
        role:'assistant',
        content:`Generated: "${originalPrompt}"`,
        type:'image',
        mediaUrl:watermarked,
        genPrompt:engPrompt,
      };
      setConvs(prev=>prev.map(c=>c.id===cid?{...c,messages:c.messages.map(m=>m.id===thinkId?imgMsg:m)}:c));
    }catch(e){
      const errMsg:Message={id:thinkId,role:'assistant',content:'⚠️ Image generation error. Please try again.',type:'text'};
      setConvs(prev=>prev.map(c=>c.id===cid?{...c,messages:c.messages.map(m=>m.id===thinkId?errMsg:m)}:c));
    }finally{
      setLoading(false);
      setGenStatus('');
    }
  }

  /* ── Generate Video (Puter.js) ── */
  async function generateVideo(originalPrompt:string, cid:string){
    if(!checkGenLimit('video'))return;
    setLoading(true);
    setGenStatus('🌐 Translating prompt...');

    const userMsg:Message={id:Date.now().toString(),role:'user',content:originalPrompt,type:'text'};
    setConvs(prev=>prev.map(c=>c.id===cid?{...c,messages:[...c.messages,userMsg]}:c));

    const thinkId=(Date.now()+1).toString();
    const thinkMsg:Message={id:thinkId,role:'assistant',content:'__generating_video__',type:'text'};
    setConvs(prev=>prev.map(c=>c.id===cid?{...c,messages:[...c.messages,thinkMsg]}:c));

    try{
      const engPrompt=await translatePrompt(originalPrompt);
      const puter=(window as any).puter;

      if(!puter?.ai){
        const errMsg:Message={id:thinkId,role:'assistant',content:'⚠️ Puter.js is loading. Please wait a moment and try again.',type:'text'};
        setConvs(prev=>prev.map(c=>c.id===cid?{...c,messages:c.messages.map(m=>m.id===thinkId?errMsg:m)}:c));
        return;
      }

      // Try video models in order
      const videoModels=['wan-ai/wan2.2-t2v-a14b','google/veo-3.1','ByteDance/Seedance-1.0-pro'];
      let videoUrl='';

      for(const model of videoModels){
        setGenStatus(`🎬 Generating video with ${model.split('/')[1]}...`);
        try{
          const result=await puter.ai.txt2vid({prompt:engPrompt,model});
          if(result?.url||result?.src){ videoUrl=result.url||result.src; break; }
        }catch{ continue; }
      }

      if(!videoUrl){
        const errMsg:Message={id:thinkId,role:'assistant',content:'⚠️ Video generation failed. Please sign in to Puter.com or try again.',type:'text'};
        setConvs(prev=>prev.map(c=>c.id===cid?{...c,messages:c.messages.map(m=>m.id===thinkId?errMsg:m)}:c));
        return;
      }

      incrementUsageLocal('video');
      const vidMsg:Message={
        id:thinkId,role:'assistant',
        content:`Generated video: "${originalPrompt}"`,
        type:'video',
        mediaUrl:videoUrl,
        genPrompt:engPrompt,
      };
      setConvs(prev=>prev.map(c=>c.id===cid?{...c,messages:c.messages.map(m=>m.id===thinkId?vidMsg:m)}:c));
    }catch{
      const errMsg:Message={id:thinkId,role:'assistant',content:'⚠️ Video generation error.',type:'text'};
      setConvs(prev=>prev.map(c=>c.id===cid?{...c,messages:c.messages.map(m=>m.id===thinkId?errMsg:m)}:c));
    }finally{
      setLoading(false);
      setGenStatus('');
    }
  }

  /* ── Send Message ── */
  const sendMsg=async(override?:string)=>{
    const text=(override??input).trim();
    if(!text||loading)return;
    setInput(''); if(taRef.current)taRef.current.style.height='auto';

    let cid=activeId;
    if(!cid){
      cid=Date.now().toString();
      const title=text.length>40?text.slice(0,40)+'…':text;
      setConvs(prev=>[{id:cid!,title,messages:[]},...prev]);
      setActiveId(cid);
      // Wait for state to settle
      await new Promise(r=>setTimeout(r,50));
    }

    if(genMode==='image'){ await generateImage(text,cid!); return; }
    if(genMode==='video'){ await generateVideo(text,cid!); return; }

    // Chat mode
    const userMsg:Message={id:Date.now().toString(),role:'user',content:text};
    setConvs(prev=>prev.map(c=>c.id===cid?{...c,messages:[...c.messages,userMsg]}:c));
    setLoading(true);
    try{
      const cur=convs.find(c=>c.id===cid);
      const history=[...(cur?.messages??[]),userMsg].map(m=>({role:m.role,content:m.content}));
      const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:history})});
      const data=await res.json();
      const reply=data.content??'Xatolik yuz berdi.';
      const aiMsg:Message={id:(Date.now()+1).toString(),role:'assistant',content:reply};
      setConvs(prev=>prev.map(c=>c.id===cid?{...c,messages:[...c.messages,aiMsg]}:c));
    }catch{
      const errMsg:Message={id:(Date.now()+1).toString(),role:'assistant',content:'⚠️ Ulanishda xatolik. / Connection error.'};
      setConvs(prev=>prev.map(c=>c.id===cid?{...c,messages:[...c.messages,errMsg]}:c));
    }finally{ setLoading(false); }
  };

  const userInitial=user?.displayName?.charAt(0).toUpperCase()||user?.email?.charAt(0).toUpperCase()||'U';

  // Mode config
  const MODES={
    chat:{ label:'Chat', icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, color:'#8b5cf6', ph:s.ph },
    image:{ label:'Image', icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>, color:'#06b6d4', ph:s.imgPh },
    video:{ label:'Video', icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>, color:'#f59e0b', ph:s.vidPh },
  };
  const modeConf=MODES[genMode];

  return (
    <div className="flex h-screen bg-[#09090f] text-[#e8e8f2] overflow-hidden" dir={isRTL?'rtl':'ltr'}>

      {/* ── LIMIT toast ── */}
      {limitMsg&&(
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1a1a2e] border border-[#8b5cf6] text-[#e8e8f2] px-5 py-3 rounded-xl text-[13px] shadow-[0_8px_32px_rgba(139,92,246,0.3)] max-w-[360px] text-center animate-fadeIn">
          ⚠️ {limitMsg}
        </div>
      )}

      {/* ── Gen status toast ── */}
      {genStatus&&(
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#0d0d16] border border-[#252538] text-[#00e5ff] px-5 py-3 rounded-xl text-[13px] shadow-[0_8px_32px_rgba(6,182,212,0.2)] flex items-center gap-2">
          <span className="w-2 h-2 bg-[#00e5ff] rounded-full animate-pulse"/>
          {genStatus}
        </div>
      )}

      {/* ── SIDEBAR ── */}
      <aside
        style={{width:sidebarOpen?'262px':'52px',minWidth:sidebarOpen?'262px':'52px',transition:'width 0.3s ease, min-width 0.3s ease'}}
        className="flex flex-col bg-[#0d0d16] border-r border-[#252538] overflow-hidden flex-shrink-0"
      >
        {/* Logo */}
        <div className="flex items-center border-b border-[#252538] px-[10px] py-[14px] gap-3" style={{minHeight:'60px'}}>
          <div className="w-8 h-8 min-w-[32px] rounded-[8px] overflow-hidden shadow-[0_0_16px_rgba(139,92,246,0.4)] cursor-pointer flex-shrink-0" onClick={()=>setSidebarOpen(v=>!v)}>
            <img src="/asena-ai-logo.svg" alt="ASENA AI" width="32" height="32" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
          </div>
          {sidebarOpen&&(
            <div className="overflow-hidden">
              <h1 style={{fontFamily:'var(--font-oxanium,Oxanium,sans-serif)'}} className="text-[13px] font-extrabold tracking-[1.5px] whitespace-nowrap">ASENA AI</h1>
              <p className="text-[8px] text-[#00e5ff] tracking-[1.5px] font-semibold mt-0.5 whitespace-nowrap">{s.powered}</p>
            </div>
          )}
        </div>

        {/* New Chat */}
        <div className="px-[10px] pt-3 pb-2">
          {sidebarOpen?(
            <button onClick={newChat} className="flex items-center justify-between w-full bg-[#13131f] border border-[#252538] rounded-[10px] px-3 py-2 text-[13px] cursor-pointer hover:border-[#8b5cf6] hover:bg-[#18182a] transition-all">
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span>{s.nc}</span>
              </div>
              <span className="bg-[#18182a] border border-[#252538] rounded px-1 py-0.5 text-[10px] text-[#7777a0]">Ctrl N</span>
            </button>
          ):(
            <button onClick={newChat} title="New Chat" className="w-8 h-8 flex items-center justify-center rounded-lg text-[#7777a0] hover:text-[#e8e8f2] hover:bg-[#13131f] transition-all mx-auto">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          )}
        </div>

        {/* Conversations */}
        {sidebarOpen&&(
          <>
            <p className="text-[10px] font-semibold tracking-[1.5px] text-[#7777a0] px-[14px] pb-2">{s.convs}</p>
            <div className="flex-1 overflow-y-auto flex flex-col gap-0.5 px-[10px]">
              {convs.length===0?(
                <div className="flex flex-col items-center gap-2 py-7 text-[#7777a0] text-[12px] opacity-60">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  <span>{s.noc}</span>
                </div>
              ):convs.map(c=>(
                <div key={c.id} onClick={()=>setActiveId(c.id)} className={`px-2.5 py-2 rounded-lg cursor-pointer text-[12.5px] truncate transition-all ${activeId===c.id?'bg-[#13131f] text-[#e8e8f2]':'text-[#7777a0] hover:bg-[#13131f] hover:text-[#e8e8f2]'}`}>{c.title}</div>
              ))}
            </div>
          </>
        )}
        {!sidebarOpen&&<div className="flex-1"/>}

        {/* Footer — Auth */}
        <div className="border-t border-[#252538] px-[10px] pt-3 pb-3 flex flex-col gap-2">
          {sidebarOpen?(
            <>
              <div className="flex items-center gap-2 px-2 py-1.5 bg-[#13131f] rounded-lg text-[12px] text-[#7777a0]">
                <span className="w-[7px] h-[7px] min-w-[7px] bg-[#22c55e] rounded-full shadow-[0_0_6px_#22c55e]"/>
                <span className="whitespace-nowrap">Asena-1.0 ML</span>
              </div>
              {authLoading?(
                <div className="flex items-center gap-2 p-2">
                  <div className="w-8 h-8 rounded-lg bg-[#252538] animate-pulse"/>
                  <div className="h-3 w-20 bg-[#252538] rounded animate-pulse"/>
                </div>
              ):user?(
                <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#13131f] transition-colors cursor-pointer" onClick={handleLogout} title="Sign out">
                  {user.photoURL?(<img src={user.photoURL} alt="" width="32" height="32" className="w-8 h-8 min-w-[32px] rounded-lg object-cover flex-shrink-0"/>):(
                    <div className="w-8 h-8 min-w-[32px] rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center text-[13px] font-bold flex-shrink-0">{userInitial}</div>
                  )}
                  <div className="overflow-hidden flex-1">
                    <p className="text-[12px] font-medium whitespace-nowrap truncate">{user.displayName||'User'}</p>
                    <p className="text-[10px] text-[#7777a0] whitespace-nowrap">Sign out</p>
                  </div>
                </div>
              ):(
                <button onClick={handleLogin} disabled={loginLoading} className="flex items-center gap-2.5 w-full p-2 rounded-lg bg-white hover:bg-gray-100 transition-all disabled:opacity-60 cursor-pointer">
                  <svg width="18" height="18" viewBox="0 0 24 24" className="flex-shrink-0">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <div className="text-left overflow-hidden">
                    <p className="text-[12px] font-semibold text-gray-800 whitespace-nowrap">{loginLoading?'Signing in...':'Sign in with Google'}</p>
                    <p className="text-[10px] text-gray-500 whitespace-nowrap">10 images & videos/day</p>
                  </div>
                </button>
              )}
            </>
          ):(
            <div className="flex flex-col items-center gap-2">
              <span className="w-[7px] h-[7px] bg-[#22c55e] rounded-full shadow-[0_0_6px_#22c55e]"/>
              {!authLoading&&(user?(
                user.photoURL?(<img src={user.photoURL} alt="" className="w-8 h-8 rounded-lg object-cover cursor-pointer" onClick={handleLogout} title="Sign out"/>):(
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center text-[13px] font-bold cursor-pointer" onClick={handleLogout}>{userInitial}</div>
                )
              ):(
                <button onClick={handleLogin} title="Sign in with Google" className="w-8 h-8 rounded-lg bg-white flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-all">
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Topbar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#252538] bg-[#09090f] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <button onClick={()=>setSidebarOpen(v=>!v)} className="p-1.5 rounded-lg text-[#7777a0] hover:text-[#e8e8f2] hover:bg-[#13131f] transition-all">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div className="flex items-center gap-2 text-[13px] text-[#7777a0]">
              <span className="w-[7px] h-[7px] bg-[#22c55e] rounded-full shadow-[0_0_6px_#22c55e]"/>
              <span>Asena-1.0 ML</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user&&(
              <div className="text-[11px] text-[#7777a0] hidden sm:flex items-center gap-1">
                <span>🖼 {LIMIT_LOGGED_IN-getUsage('image')}</span>
                <span className="opacity-40">|</span>
                <span>🎬 {LIMIT_LOGGED_IN-getUsage('video')}</span>
              </div>
            )}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7777a0" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            <select value={lang} onChange={e=>setLang(e.target.value)} className="bg-[#13131f] border border-[#252538] rounded-lg text-[#e8e8f2] text-[12.5px] px-2 py-1.5 cursor-pointer outline-none focus:border-[#8b5cf6] transition-colors max-w-[190px]" style={{fontFamily:'inherit'}}>
              {LANGUAGES.map(l=>(<option key={l.code+l.native} value={l.code} style={{background:'#13131f'}}>{l.native}  —  {l.name}</option>))}
            </select>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {!activeId?(
            <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 gap-4">
              <div className="w-[82px] h-[82px] rounded-[22px] overflow-hidden" style={{animation:'zoomPulse 3s ease-in-out infinite',boxShadow:'0 0 50px rgba(139,92,246,0.45)'}}>
                <img src="/asena-ai-logo.svg" alt="ASENA AI" width="82" height="82" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
              </div>
              <h2 style={{fontFamily:'var(--font-oxanium,Oxanium,sans-serif)',background:'linear-gradient(135deg,#8b5cf6,#06b6d4)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}} className="text-[44px] font-extrabold tracking-[3px]">ASENA AI</h2>
              <p className="text-center text-[#7777a0] text-[15px] max-w-[500px] leading-relaxed">{s.sub}</p>

              {/* Mode pills */}
              <div className="flex gap-2">
                {(['chat','image','video'] as const).map(m=>{
                  const mc=MODES[m];
                  const active=genMode===m;
                  return(
                    <button key={m} onClick={()=>setGenMode(m)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all" style={{borderColor:active?mc.color:'#252538',background:active?`${mc.color}18`:'transparent',color:active?mc.color:'#7777a0'}}>
                      {mc.icon} {mc.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1.5 text-[12px] text-[#00e5ff] opacity-80">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                <span>{s.ultra}</span>
              </div>
              {!user&&!authLoading&&(
                <div className="flex items-center gap-2 bg-[#13131f] border border-[#252538] rounded-xl px-4 py-2.5 text-[12px] text-[#7777a0]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span>Guest: 1 image + 1 video free</span>
                  <button onClick={handleLogin} className="text-[#00e5ff] hover:underline font-medium">Sign in for 10/day →</button>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2.5 max-w-[680px] w-full mt-2">
                {[
                  {lang:"O'zbek",txt:"Sun'iy intellekt kelajagi haqida gapir"},
                  {lang:"English",txt:"Explain quantum computing simply"},
                  {lang:"Türkçe",txt:"Yapay zekanın geleceği hakkında konuş"},
                  {lang:"Azərbaycan",txt:"Süni intellekt haqqında danış"},
                ].map((sg,i)=>(
                  <div key={i} onClick={()=>sendMsg(sg.txt)} className="bg-[#13131f] border border-[#252538] rounded-xl p-3.5 cursor-pointer hover:border-[#8b5cf6] hover:bg-[#18182a] hover:-translate-y-0.5 transition-all hover:shadow-[0_8px_24px_rgba(139,92,246,0.15)]">
                    <p className="text-[11px] text-[#7777a0] mb-1">{sg.lang}</p>
                    <p className="text-[13.5px] font-medium leading-snug">{sg.txt}</p>
                  </div>
                ))}
              </div>
            </div>
          ):(
            <div className="flex flex-col gap-3.5 p-5 flex-1">
              {activeConv?.messages.map(msg=>(
                <div key={msg.id} className={`flex gap-2.5 max-w-[800px] w-full mx-auto ${msg.role==='user'?'flex-row-reverse':''}`}>
                  <div className={`w-[30px] h-[30px] min-w-[30px] rounded-lg flex-shrink-0 overflow-hidden ${msg.role==='user'?'bg-[#252538] flex items-center justify-center font-bold text-[13px] text-[#7777a0]':''}`}>
                    {msg.role==='assistant'
                      ?<img src="/asena-ai-logo.svg" alt="AI" width="30" height="30" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                      :(user?.photoURL?<img src={user.photoURL} alt="" className="w-full h-full object-cover"/>:userInitial)
                    }
                  </div>
                  <div className={`rounded-xl max-w-[calc(100%-46px)] border overflow-hidden ${msg.role==='user'?'bg-[rgba(139,92,246,0.12)] border-[rgba(139,92,246,0.28)]':'bg-[#13131f] border-[#252538]'}`}>
                    {/* Image message */}
                    {msg.type==='image'&&msg.content==='__generating_image__'?(
                      <div className="px-4 py-3 flex items-center gap-2 text-[#7777a0] text-[13px]">
                        <div className="flex gap-1">{[0,1,2].map(i=><span key={i} className="w-1.5 h-1.5 bg-[#06b6d4] rounded-full animate-bounce" style={{animationDelay:`${i*0.22}s`}}/>)}</div>
                        <span>Generating image...</span>
                      </div>
                    ):msg.type==='image'&&msg.mediaUrl?(
                      <div>
                        <img src={msg.mediaUrl} alt={msg.genPrompt||'Generated image'} className="w-full max-w-[512px] rounded-t-xl" style={{display:'block'}}/>
                        <div className="px-3 py-2 flex items-center justify-between gap-2">
                          <p className="text-[11px] text-[#7777a0] truncate flex-1">{msg.genPrompt||msg.content}</p>
                          <a href={msg.mediaUrl} download="asena-ai-image.jpg" className="flex items-center gap-1 text-[11px] text-[#00e5ff] hover:opacity-80 flex-shrink-0">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            Save
                          </a>
                        </div>
                      </div>
                    /* Video message */
                    ):msg.content==='__generating_video__'?(
                      <div className="px-4 py-3 flex items-center gap-2 text-[#7777a0] text-[13px]">
                        <div className="flex gap-1">{[0,1,2].map(i=><span key={i} className="w-1.5 h-1.5 bg-[#f59e0b] rounded-full animate-bounce" style={{animationDelay:`${i*0.22}s`}}/>)}</div>
                        <span>Generating video...</span>
                      </div>
                    ):msg.type==='video'&&msg.mediaUrl?(
                      <div>
                        <video src={msg.mediaUrl} controls className="w-full max-w-[512px] rounded-t-xl" style={{display:'block'}}/>
                        <div className="px-3 py-2 flex items-center justify-between gap-2">
                          <p className="text-[11px] text-[#7777a0] truncate flex-1">{msg.genPrompt||msg.content}</p>
                          <a href={msg.mediaUrl} download="asena-ai-video.mp4" className="flex items-center gap-1 text-[11px] text-[#f59e0b] hover:opacity-80 flex-shrink-0">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            Save
                          </a>
                        </div>
                      </div>
                    ):(
                      /* Normal text message */
                      <div className="px-4 py-3 text-[13.5px] leading-[1.75] break-words" dangerouslySetInnerHTML={{__html:mdToHtml(msg.content)}}/>
                    )}
                  </div>
                </div>
              ))}
              {loading&&genMode==='chat'&&(
                <div className="flex gap-2.5 max-w-[800px] w-full mx-auto">
                  <div className="w-[30px] h-[30px] min-w-[30px] rounded-lg overflow-hidden flex-shrink-0">
                    <img src="/asena-ai-logo.svg" alt="AI" width="30" height="30" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  </div>
                  <div className="bg-[#13131f] border border-[#252538] rounded-xl px-4 py-3">
                    <div className="flex gap-1">{[0,1,2].map(i=><span key={i} className="w-1.5 h-1.5 bg-[#8b5cf6] rounded-full animate-bounce" style={{animationDelay:`${i*0.22}s`}}/>)}</div>
                  </div>
                </div>
              )}
              <div ref={endRef}/>
            </div>
          )}
        </div>

        {/* ── INPUT ── */}
        <div className="px-4 pb-4 pt-2 flex-shrink-0">
          <div className="max-w-[800px] mx-auto">
            <div className="flex items-end gap-2 bg-[#18182a] border focus-within:border-[rgba(139,92,246,0.7)] rounded-[14px] px-3 py-2.5 transition-colors" style={{borderColor:genMode==='chat'?'#252538':genMode==='image'?'rgba(6,182,212,0.4)':'rgba(245,158,11,0.4)'}}>

              {/* + Mode selector button */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={e=>{e.stopPropagation();setShowModeMenu(v=>!v);}}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
                  style={{background:`${modeConf.color}22`,color:modeConf.color}}
                  title="Switch mode"
                >
                  {modeConf.icon}
                </button>
                {showModeMenu&&(
                  <div className="absolute bottom-full mb-2 left-0 bg-[#13131f] border border-[#252538] rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-30 min-w-[140px]" onClick={e=>e.stopPropagation()}>
                    {(['chat','image','video'] as const).map(m=>{
                      const mc=MODES[m];
                      return(
                        <button key={m} onClick={()=>{setGenMode(m);setShowModeMenu(false);}} className="flex items-center gap-2.5 w-full px-3 py-2.5 text-[13px] hover:bg-[#18182a] transition-colors text-left" style={{color:genMode===m?mc.color:'#e8e8f2'}}>
                          <span style={{color:mc.color}}>{mc.icon}</span>
                          {mc.label}
                          {genMode===m&&<span className="ml-auto text-[10px]">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <textarea
                ref={taRef}
                value={input}
                onChange={e=>{setInput(e.target.value);autoResize();}}
                onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();if(input.trim()&&!loading)sendMsg();}}}
                placeholder={modeConf.ph}
                rows={1}
                disabled={loading}
                className="flex-1 bg-transparent border-none outline-none text-[13.5px] text-[#e8e8f2] placeholder:text-[#7777a0] resize-none max-h-[150px] leading-[1.6] min-h-[22px] disabled:opacity-60"
                style={{fontFamily:'inherit'}}
              />

              <div className="flex items-center gap-1.5">
                {/* Voice button */}
                <button className="p-1.5 rounded-lg text-[#7777a0] hover:text-[#e8e8f2] hover:bg-[#13131f] transition-all">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                </button>
                {/* Send button */}
                <button onClick={()=>sendMsg()} disabled={!input.trim()||loading} className="rounded-lg p-2 flex items-center text-white disabled:opacity-35 disabled:cursor-not-allowed hover:opacity-85 active:scale-95 transition-all" style={{background:`linear-gradient(135deg,${modeConf.color},${genMode==='chat'?'#06b6d4':genMode==='image'?'#8b5cf6':'#ef4444'})`}}>
                  {genMode==='image'?(
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  ):genMode==='video'?(
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                  ):(
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Mode indicator */}
            <div className="flex items-center justify-center gap-1.5 mt-1.5">
              <span className="text-[11px] opacity-60" style={{color:modeConf.color}}>
                {genMode==='image'?'🖼 Image Generation — Pollinations AI':genMode==='video'?'🎬 Video Generation — Puter AI':''}
              </span>
              {genMode!=='chat'&&<span className="text-[11px] text-[#7777a0] opacity-50">· {s.hint}</span>}
              {genMode==='chat'&&<p className="text-[11px] text-[#7777a0] opacity-70">{s.hint}</p>}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes zoomPulse {
          0%,100%{transform:scale(1);box-shadow:0 0 40px rgba(139,92,246,0.5);}
          50%{transform:scale(1.08);box-shadow:0 0 70px rgba(139,92,246,0.8),0 0 110px rgba(6,182,212,0.4);}
        }
        @keyframes fadeIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .animate-fadeIn { animation: fadeIn 0.2s ease; }
        .mpara{ margin:0;padding:0;line-height:1.8;font-size:14px;color:#e8e8f2; }
        .mpara-gap{ height:10px; }
        .mh1{ font-size:20px;font-weight:700;color:#00e5ff;margin:16px 0 8px;padding-bottom:6px;border-bottom:1px solid #252538;line-height:1.3; }
        .mh2{ font-size:17px;font-weight:700;color:#00e5ff;margin:14px 0 7px;line-height:1.3; }
        .mh3{ font-size:15px;font-weight:600;color:#a78bfa;margin:12px 0 6px;line-height:1.3; }
        .mul,.mol{ margin:8px 0 8px 4px;padding-left:20px;display:flex;flex-direction:column;gap:5px; }
        .mul{ list-style:none;padding-left:4px; }
        .mol{ list-style:none;counter-reset:oli;padding-left:4px; }
        .mul li{ position:relative;padding-left:20px;font-size:14px;line-height:1.75;color:#e8e8f2; }
        .mul li::before{ content:'';position:absolute;left:4px;top:10px;width:6px;height:6px;background:#8b5cf6;border-radius:50%; }
        .mol li{ position:relative;padding-left:28px;font-size:14px;line-height:1.75;color:#e8e8f2;counter-increment:oli; }
        .mol li::before{ content:counter(oli)'.';position:absolute;left:0;top:0;color:#00e5ff;font-weight:700;font-size:13px;min-width:22px; }
        strong{ color:#00e5ff;font-weight:700; }
        em{ color:rgba(232,232,242,0.85);font-style:italic; }
        .codeblock{ background:#0a0a14;border:1px solid #252538;border-radius:10px;overflow:hidden;margin:10px 0; }
        .codeblock-lang{ background:#13131f;color:#7777a0;font-size:11px;padding:5px 12px;letter-spacing:0.5px;border-bottom:1px solid #252538; }
        .codeblock code{ display:block;padding:12px;overflow-x:auto;font-family:monospace;font-size:12.5px;color:#e8e8f2;line-height:1.6;white-space:pre; }
        .ic{ background:rgba(139,92,246,0.18);border:1px solid rgba(139,92,246,0.25);padding:1px 6px;border-radius:4px;font-family:monospace;font-size:12.5px;color:#c4b5fd; }
        .ml{ color:#00e5ff;text-decoration:underline;text-underline-offset:3px;font-weight:500; }
        .ml:hover{ opacity:0.8; }
        .mhr{ border:none;border-top:1px solid #252538;margin:12px 0; }
        ::-webkit-scrollbar{width:3px;height:3px;}
        ::-webkit-scrollbar-thumb{background:#252538;border-radius:3px;}
        select option{background:#13131f!important;color:#e8e8f2!important;}
      `}</style>
    </div>
  );
}
