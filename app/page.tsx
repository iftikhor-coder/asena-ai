'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

// ══════════════════════════════════════════════
//  ALL GOOGLE TRANSLATE LANGUAGES (109 ta)
// ══════════════════════════════════════════════
const LANGUAGES = [
  { code: 'uz', name: "O'zbek", native: "O'zbek" },
  { code: 'en', name: 'English', native: 'English' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'ar', name: 'Arabic', native: 'العربية', dir: 'rtl' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', native: '中文(简体)' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', native: '中文(繁體)' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'uk', name: 'Ukrainian', native: 'Українська' },
  { code: 'kk', name: 'Kazakh', native: 'Қазақша' },
  { code: 'ky', name: 'Kyrgyz', native: 'Кыргызча' },
  { code: 'tg', name: 'Tajik', native: 'Тоҷикӣ' },
  { code: 'fa', name: 'Persian', native: 'فارسی', dir: 'rtl' },
  { code: 'ur', name: 'Urdu', native: 'اردو', dir: 'rtl' },
  { code: 'he', name: 'Hebrew', native: 'עברית', dir: 'rtl' },
  { code: 'ps', name: 'Pashto', native: 'پښتو', dir: 'rtl' },
  { code: 'sd', name: 'Sindhi', native: 'سنڌي', dir: 'rtl' },
  { code: 'ug', name: 'Uyghur', native: 'ئۇيغۇرچە', dir: 'rtl' },
  { code: 'yi', name: 'Yiddish', native: 'יידיש', dir: 'rtl' },
  { code: 'af', name: 'Afrikaans', native: 'Afrikaans' },
  { code: 'sq', name: 'Albanian', native: 'Shqip' },
  { code: 'am', name: 'Amharic', native: 'አማርኛ' },
  { code: 'hy', name: 'Armenian', native: 'Հայերեն' },
  { code: 'az', name: 'Azerbaijani', native: 'Azərbaycan' },
  { code: 'eu', name: 'Basque', native: 'Euskara' },
  { code: 'be', name: 'Belarusian', native: 'Беларуская' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'bs', name: 'Bosnian', native: 'Bosanski' },
  { code: 'bg', name: 'Bulgarian', native: 'Български' },
  { code: 'ca', name: 'Catalan', native: 'Català' },
  { code: 'ceb', name: 'Cebuano', native: 'Cebuano' },
  { code: 'ny', name: 'Chichewa', native: 'Chichewa' },
  { code: 'co', name: 'Corsican', native: 'Corsu' },
  { code: 'hr', name: 'Croatian', native: 'Hrvatski' },
  { code: 'cs', name: 'Czech', native: 'Čeština' },
  { code: 'da', name: 'Danish', native: 'Dansk' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands' },
  { code: 'eo', name: 'Esperanto', native: 'Esperanto' },
  { code: 'et', name: 'Estonian', native: 'Eesti' },
  { code: 'tl', name: 'Filipino', native: 'Filipino' },
  { code: 'fi', name: 'Finnish', native: 'Suomi' },
  { code: 'fy', name: 'Frisian', native: 'Frysk' },
  { code: 'gl', name: 'Galician', native: 'Galego' },
  { code: 'ka', name: 'Georgian', native: 'ქართული' },
  { code: 'el', name: 'Greek', native: 'Ελληνικά' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'ht', name: 'Haitian Creole', native: 'Kreyòl' },
  { code: 'ha', name: 'Hausa', native: 'Hausa' },
  { code: 'haw', name: 'Hawaiian', native: "ʻŌlelo Hawaiʻi" },
  { code: 'hmn', name: 'Hmong', native: 'Hmong' },
  { code: 'hu', name: 'Hungarian', native: 'Magyar' },
  { code: 'is', name: 'Icelandic', native: 'Íslenska' },
  { code: 'ig', name: 'Igbo', native: 'Igbo' },
  { code: 'id', name: 'Indonesian', native: 'Indonesia' },
  { code: 'ga', name: 'Irish', native: 'Gaeilge' },
  { code: 'jw', name: 'Javanese', native: 'Jawa' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'km', name: 'Khmer', native: 'ខ្មែរ' },
  { code: 'ku', name: 'Kurdish', native: 'Kurdî' },
  { code: 'lo', name: 'Lao', native: 'ລາວ' },
  { code: 'la', name: 'Latin', native: 'Latina' },
  { code: 'lv', name: 'Latvian', native: 'Latviešu' },
  { code: 'lt', name: 'Lithuanian', native: 'Lietuvių' },
  { code: 'lb', name: 'Luxembourgish', native: 'Lëtzebuergesch' },
  { code: 'mk', name: 'Macedonian', native: 'Македонски' },
  { code: 'mg', name: 'Malagasy', native: 'Malagasy' },
  { code: 'ms', name: 'Malay', native: 'Melayu' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'mt', name: 'Maltese', native: 'Malti' },
  { code: 'mi', name: 'Maori', native: 'Māori' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'mn', name: 'Mongolian', native: 'Монгол' },
  { code: 'my', name: 'Myanmar', native: 'မြန်မာ' },
  { code: 'ne', name: 'Nepali', native: 'नेपाली' },
  { code: 'no', name: 'Norwegian', native: 'Norsk' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'pl', name: 'Polish', native: 'Polski' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'ro', name: 'Romanian', native: 'Română' },
  { code: 'sm', name: 'Samoan', native: 'Samoa' },
  { code: 'gd', name: 'Scots Gaelic', native: 'Gàidhlig' },
  { code: 'sr', name: 'Serbian', native: 'Српски' },
  { code: 'st', name: 'Sesotho', native: 'Sesotho' },
  { code: 'sn', name: 'Shona', native: 'Shona' },
  { code: 'si', name: 'Sinhala', native: 'සිංහල' },
  { code: 'sk', name: 'Slovak', native: 'Slovenčina' },
  { code: 'sl', name: 'Slovenian', native: 'Slovenščina' },
  { code: 'so', name: 'Somali', native: 'Soomaali' },
  { code: 'su', name: 'Sundanese', native: 'Sunda' },
  { code: 'sw', name: 'Swahili', native: 'Kiswahili' },
  { code: 'sv', name: 'Swedish', native: 'Svenska' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'th', name: 'Thai', native: 'ไทย' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' },
  { code: 'cy', name: 'Welsh', native: 'Cymraeg' },
  { code: 'xh', name: 'Xhosa', native: 'isiXhosa' },
  { code: 'yo', name: 'Yoruba', native: 'Yorùbá' },
  { code: 'zu', name: 'Zulu', native: 'isiZulu' },
];

// ══════════════════════════════════════════════
//  UI TRANSLATIONS
// ══════════════════════════════════════════════
type UIStrings = {
  powered: string; nc: string; convs: string; noc: string;
  guest: string; gsub: string; sub: string; ultra: string;
  ph: string; hint: string;
  sugg: { lang: string; txt: string }[];
};

const T: Record<string, UIStrings> = {
  uz: {
    powered: 'ASENA ML TOMONIDAN', nc: 'Yangi suhbat', convs: 'SUHBATLAR',
    noc: "Hali suhbat yo'q", guest: 'Mehmon foydalanuvchi', gsub: 'Kirish uchun bosqich 2',
    sub: "Aqlli yordamchingiz. Har qanday tilda savol bering — men sizga yordam berishga tayyorman.",
    ultra: 'Ultra-tez Asena ML xulosa', ph: "Xabar yozing... (Shift+Enter = yangi qator)",
    hint: "ASENA AI · O'zbek · English · Русский · العربية · 中文 · Español · va boshqalar",
    sugg: [
      { lang: "O'zbek", txt: "Sun'iy intellekt kelajagi haqida gapir" },
      { lang: 'English', txt: 'Explain quantum computing simply' },
      { lang: 'Русский', txt: 'Напиши стихотворение о весне' },
      { lang: 'العربية', txt: 'اشرح لي كيف تعمل الشبكات العصبية' },
    ],
  },
  en: {
    powered: 'POWERED BY ASENA ML', nc: 'New Chat', convs: 'CONVERSATIONS',
    noc: 'No conversations yet', guest: 'Guest User', gsub: 'Step 2 to sign in',
    sub: "Your intelligent assistant. Ask in any language — I'm ready to help you.",
    ultra: 'Ultra-fast Asena ML inference', ph: 'Type a message... (Shift+Enter = new line)',
    hint: 'ASENA AI · English · O\'zbek · Русский · العربية · 中文 · Español · and more',
    sugg: [
      { lang: 'English', txt: 'Explain quantum computing simply' },
      { lang: 'English', txt: 'Write me a poem about space' },
      { lang: "O'zbek", txt: "Sun'iy intellekt haqida gapir" },
      { lang: 'Русский', txt: 'Расскажи о будущем технологий' },
    ],
  },
  ru: {
    powered: 'НА БАЗЕ ASENA ML', nc: 'Новый чат', convs: 'БЕСЕДЫ',
    noc: 'Нет бесед', guest: 'Гость', gsub: 'Шаг 2 для входа',
    sub: 'Ваш умный помощник. Задавайте вопросы на любом языке — готов помочь.',
    ultra: 'Сверхбыстрый вывод Asena ML', ph: 'Напишите сообщение... (Shift+Enter = новая строка)',
    hint: 'ASENA AI · Русский · English · O\'zbek · العربية · 中文 · Español · и другие',
    sugg: [
      { lang: 'Русский', txt: 'Напиши стихотворение о весне' },
      { lang: 'Русский', txt: 'Объясни квантовые вычисления просто' },
      { lang: 'English', txt: 'Explain quantum computing simply' },
      { lang: "O'zbek", txt: "Sun'iy intellekt haqida gapir" },
    ],
  },
  ar: {
    powered: 'مدعوم بـ ASENA ML', nc: 'محادثة جديدة', convs: 'المحادثات',
    noc: 'لا توجد محادثات بعد', guest: 'ضيف', gsub: 'الخطوة 2 لتسجيل الدخول',
    sub: 'مساعدك الذكي. اسأل بأي لغة — أنا هنا للمساعدة.',
    ultra: 'استنتاج Asena ML فائق السرعة', ph: 'اكتب رسالة... (Shift+Enter = سطر جديد)',
    hint: 'ASENA AI · العربية · English · Русский · O\'zbek · 中文 · والمزيد',
    sugg: [
      { lang: 'العربية', txt: 'اشرح لي كيف تعمل الشبكات العصبية' },
      { lang: 'العربية', txt: 'حدثني عن مستقبل الذكاء الاصطناعي' },
      { lang: 'English', txt: 'Explain quantum computing simply' },
      { lang: "O'zbek", txt: "Sun'iy intellekt haqida gapir" },
    ],
  },
  tr: {
    powered: 'ASENA ML İLE', nc: 'Yeni Sohbet', convs: 'SOHBETLER',
    noc: 'Henüz sohbet yok', guest: 'Misafir Kullanıcı', gsub: 'Giriş için adım 2',
    sub: 'Akıllı asistanınız. Herhangi bir dilde soru sorun — yardım etmeye hazırım.',
    ultra: 'Ultra hızlı Asena ML çıkarımı', ph: 'Mesaj yazın... (Shift+Enter = yeni satır)',
    hint: "ASENA AI · Türkçe · English · Русский · العربية · 中文 · O'zbek · ve daha fazlası",
    sugg: [
      { lang: 'Türkçe', txt: 'Yapay zekanın geleceği hakkında konuş' },
      { lang: 'English', txt: 'Explain quantum computing simply' },
      { lang: "O'zbek", txt: "Sun'iy intellekt haqida gapir" },
      { lang: 'Русский', txt: 'Напиши стихотворение о весне' },
    ],
  },
  'zh-CN': {
    powered: '由 ASENA ML 驱动', nc: '新对话', convs: '对话',
    noc: '暂无对话', guest: '访客用户', gsub: '登录第2步',
    sub: '您的智能助手。用任何语言提问 — 我随时准备帮助您。',
    ultra: '超快速 Asena ML 推理', ph: '输入消息... (Shift+Enter = 换行)',
    hint: "ASENA AI · 中文 · English · Русский · العربية · O'zbek · Español · 等等",
    sugg: [
      { lang: '中文', txt: '简单解释量子计算' },
      { lang: '中文', txt: '人工智能的未来是什么？' },
      { lang: 'English', txt: 'Explain quantum computing simply' },
      { lang: "O'zbek", txt: "Sun'iy intellekt haqida gapir" },
    ],
  },
  es: {
    powered: 'IMPULSADO POR ASENA ML', nc: 'Nueva Conversación', convs: 'CONVERSACIONES',
    noc: 'No hay conversaciones', guest: 'Usuario Invitado', gsub: 'Paso 2 para iniciar sesión',
    sub: "Tu asistente inteligente. Pregunta en cualquier idioma — estoy listo para ayudarte.",
    ultra: 'Inferencia ultrarrápida de Asena ML', ph: 'Escribe un mensaje... (Shift+Enter = nueva línea)',
    hint: "ASENA AI · Español · English · Русский · العربية · 中文 · O'zbek · y más",
    sugg: [
      { lang: 'Español', txt: 'Cuéntame sobre el futuro de la IA' },
      { lang: 'English', txt: 'Explain quantum computing simply' },
      { lang: "O'zbek", txt: "Sun'iy intellekt haqida gapir" },
      { lang: 'Русский', txt: 'Напиши стихотворение о весне' },
    ],
  },
  fr: {
    powered: 'PROPULSÉ PAR ASENA ML', nc: 'Nouvelle Discussion', convs: 'CONVERSATIONS',
    noc: 'Pas encore de conversations', guest: 'Utilisateur Invité', gsub: 'Étape 2 pour se connecter',
    sub: "Votre assistant intelligent. Posez des questions dans n'importe quelle langue — je suis prêt à vous aider.",
    ultra: "Inférence ultra-rapide d'Asena ML", ph: 'Tapez un message... (Shift+Enter = nouvelle ligne)',
    hint: "ASENA AI · Français · English · Русский · العربية · 中文 · O'zbek · et plus",
    sugg: [
      { lang: 'Français', txt: "Explique-moi l'apprentissage automatique" },
      { lang: 'English', txt: 'Explain quantum computing simply' },
      { lang: "O'zbek", txt: "Sun'iy intellekt haqida gapir" },
      { lang: 'Русский', txt: 'Напиши стихотворение о весне' },
    ],
  },
  de: {
    powered: 'BETRIEBEN VON ASENA ML', nc: 'Neues Gespräch', convs: 'GESPRÄCHE',
    noc: 'Noch keine Gespräche', guest: 'Gastbenutzer', gsub: 'Schritt 2 zum Einloggen',
    sub: 'Ihr intelligenter Assistent. Stellen Sie Fragen in jeder Sprache — ich bin bereit zu helfen.',
    ultra: 'Ultraschnelle Asena ML-Inferenz', ph: 'Nachricht schreiben... (Shift+Enter = neue Zeile)',
    hint: "ASENA AI · Deutsch · English · Русский · العربية · 中文 · O'zbek · und mehr",
    sugg: [
      { lang: 'Deutsch', txt: 'Erkläre mir Quantencomputing einfach' },
      { lang: 'English', txt: 'Explain quantum computing simply' },
      { lang: "O'zbek", txt: "Sun'iy intellekt haqida gapir" },
      { lang: 'Русский', txt: 'Напиши стихотворение' },
    ],
  },
  hi: {
    powered: 'ASENA ML द्वारा संचालित', nc: 'नई चैट', convs: 'बातचीत',
    noc: 'अभी तक कोई बातचीत नहीं', guest: 'अतिथि उपयोगकर्ता', gsub: 'साइन इन के लिए चरण 2',
    sub: 'आपका बुद्धिमान सहायक। किसी भी भाषा में प्रश्न पूछें — मैं मदद के लिए तैयार हूं।',
    ultra: 'अल्ट्रा-फास्ट Asena ML इन्फेरेंस', ph: 'संदेश लिखें... (Shift+Enter = नई पंक्ति)',
    hint: "ASENA AI · हिन्दी · English · Русский · العربية · 中文 · O'zbek · और अधिक",
    sugg: [
      { lang: 'हिन्दी', txt: 'AI का भविष्य क्या है?' },
      { lang: 'English', txt: 'Explain quantum computing simply' },
      { lang: "O'zbek", txt: "Sun'iy intellekt haqida gapir" },
      { lang: 'Русский', txt: 'Напиши стихотворение' },
    ],
  },
  ja: {
    powered: 'ASENA ML 搭載', nc: '新しいチャット', convs: '会話',
    noc: 'まだ会話がありません', guest: 'ゲストユーザー', gsub: 'ログインのステップ2',
    sub: 'あなたのインテリジェントアシスタント。どんな言語でも質問してください。',
    ultra: '超高速 Asena ML 推論', ph: 'メッセージを入力... (Shift+Enter = 改行)',
    hint: "ASENA AI · 日本語 · English · Русский · العربية · 中文 · O'zbek · その他",
    sugg: [
      { lang: '日本語', txt: 'AIの未来について話して' },
      { lang: 'English', txt: 'Explain quantum computing simply' },
      { lang: "O'zbek", txt: "Sun'iy intellekt haqida gapir" },
      { lang: 'Русский', txt: 'Напиши стихотворение' },
    ],
  },
  ko: {
    powered: 'ASENA ML 구동', nc: '새 채팅', convs: '대화',
    noc: '아직 대화가 없습니다', guest: '게스트 사용자', gsub: '로그인 2단계',
    sub: '당신의 지능형 어시스턴트. 어떤 언어로든 질문하세요.',
    ultra: '초고속 Asena ML 추론', ph: '메시지 입력... (Shift+Enter = 새 줄)',
    hint: "ASENA AI · 한국어 · English · Русский · العربية · 中文 · O'zbek · 더 보기",
    sugg: [
      { lang: '한국어', txt: 'AI의 미래에 대해 이야기해 줘' },
      { lang: 'English', txt: 'Explain quantum computing simply' },
      { lang: "O'zbek", txt: "Sun'iy intellekt haqida gapir" },
      { lang: 'Русский', txt: 'Напиши стихотворение' },
    ],
  },
  kk: {
    powered: 'ASENA ML ҚУАТТАЛҒАН', nc: 'Жаңа сөйлесу', convs: 'СӨЙЛЕСУЛЕР',
    noc: 'Әлі сөйлесулер жоқ', guest: 'Қонақ пайдаланушы', gsub: 'Кіру үшін 2-қадам',
    sub: 'Сіздің ақылды көмекшіңіз. Кез келген тілде сұрақ қойыңыз.',
    ultra: 'Өте жылдам Asena ML қорытындысы', ph: 'Хабар жазыңыз... (Shift+Enter = жаңа жол)',
    hint: "ASENA AI · Қазақша · O'zbek · Русский · English · Arabic · және басқалары",
    sugg: [
      { lang: 'Қазақша', txt: 'AI болашағы туралы айт' },
      { lang: 'English', txt: 'Explain quantum computing simply' },
      { lang: "O'zbek", txt: "Sun'iy intellekt haqida gapir" },
      { lang: 'Русский', txt: 'Напиши стихотворение' },
    ],
  },
  uk: {
    powered: 'НА БАЗІ ASENA ML', nc: 'Нова розмова', convs: 'РОЗМОВИ',
    noc: 'Ще немає розмов', guest: 'Гість', gsub: 'Крок 2 для входу',
    sub: 'Ваш розумний помічник. Ставте запитання будь-якою мовою — готовий допомогти.',
    ultra: 'Надшвидкий висновок Asena ML', ph: 'Напишіть повідомлення... (Shift+Enter = новий рядок)',
    hint: "ASENA AI · Українська · English · Русский · العربية · 中文 · O'zbek · та інші",
    sugg: [
      { lang: 'Українська', txt: 'Розкажи про майбутнє штучного інтелекту' },
      { lang: 'English', txt: 'Explain quantum computing simply' },
      { lang: "O'zbek", txt: "Sun'iy intellekt haqida gapir" },
      { lang: 'Русский', txt: 'Напиши стихотворение' },
    ],
  },
  pt: {
    powered: 'POWERED BY ASENA ML', nc: 'Nova Conversa', convs: 'CONVERSAS',
    noc: 'Sem conversas ainda', guest: 'Usuário Convidado', gsub: 'Passo 2 para entrar',
    sub: 'Seu assistente inteligente. Pergunte em qualquer idioma — estou pronto para ajudar.',
    ultra: 'Inferência ultra-rápida do Asena ML', ph: 'Digite uma mensagem... (Shift+Enter = nova linha)',
    hint: "ASENA AI · Português · English · Русский · العربية · 中文 · O'zbek · e mais",
    sugg: [
      { lang: 'Português', txt: 'Fale sobre o futuro da IA' },
      { lang: 'English', txt: 'Explain quantum computing simply' },
      { lang: "O'zbek", txt: "Sun'iy intellekt haqida gapir" },
      { lang: 'Русский', txt: 'Напиши стихотворение' },
    ],
  },
};

function getT(code: string): UIStrings {
  if (T[code]) return T[code];
  if (code.startsWith('zh')) return T['zh-CN'];
  return T['en'];
}

// ══════════════════════════════════════════════
//  TYPES
// ══════════════════════════════════════════════
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}
interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

// ══════════════════════════════════════════════
//  ICONS
// ══════════════════════════════════════════════
const StarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L14.8 9.2H22.5L16.3 13.8L18.6 21L12 16.4L5.4 21L7.7 13.8L1.5 9.2H9.2L12 2Z" fill="white" opacity="0.95" />
    <circle cx="12" cy="11.5" r="2.8" fill="rgba(255,255,255,0.55)" />
  </svg>
);
const StarSmall = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L14.8 9.2H22.5L16.3 13.8L18.6 21L12 16.4L5.4 21L7.7 13.8L1.5 9.2H9.2L12 2Z" fill="white" opacity="0.9" />
  </svg>
);

// ══════════════════════════════════════════════
//  MARKDOWN RENDERER (simple)
// ══════════════════════════════════════════════
function renderMd(text: string) {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/```([\w]*)\n?([\s\S]*?)```/g, '<pre class="code-block"><code>$2</code></pre>')
    .replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)/gm, '<h3 class="md-h3">$1</h3>')
    .replace(/^## (.+)/gm, '<h2 class="md-h2">$1</h2>')
    .replace(/^# (.+)/gm, '<h1 class="md-h1">$1</h1>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="md-link">$1</a>')
    .replace(/\n/g, '<br/>');
}

// ══════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════
export default function Home() {
  const [langCode, setLangCode] = useState('uz');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const s = getT(langCode);
  const lang = LANGUAGES.find(l => l.c === langCode);
  const isRTL = lang?.dir === 'rtl';
  const activeConv = conversations.find(c => c.id === activeId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        newChat();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const newChat = useCallback(() => {
    setActiveId(null);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, []);

  const autoResize = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 150) + 'px';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !loading) sendMessage();
    }
  };

  const sendMessage = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    let convId = activeId;

    if (!convId) {
      convId = Date.now().toString();
      const newConv: Conversation = {
        id: convId,
        title: text.length > 40 ? text.slice(0, 40) + '…' : text,
        messages: [userMsg],
      };
      setConversations(prev => [newConv, ...prev]);
      setActiveId(convId);
    } else {
      setConversations(prev =>
        prev.map(c => c.id === convId ? { ...c, messages: [...c.messages, userMsg] } : c)
      );
    }

    setLoading(true);

    try {
      const currentConv = conversations.find(c => c.id === convId);
      const history = [
        ...(currentConv?.messages ?? []),
        userMsg,
      ].map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      const data = await res.json();
      const reply = data.content ?? data.message ?? "Javob olishda xatolik yuz berdi.";

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
      };
      setConversations(prev =>
        prev.map(c => c.id === convId ? { ...c, messages: [...c.messages, aiMsg] } : c)
      );
    } catch {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '⚠️ Ulanishda xatolik yuz berdi. Iltimos qayta urinib ko\'ring.',
      };
      setConversations(prev =>
        prev.map(c => c.id === convId ? { ...c, messages: [...c.messages, errMsg] } : c)
      );
    } finally {
      setLoading(false);
    }
  };

  const showWelcome = !activeId;

  return (
    <div
      className="flex h-screen bg-[#09090f] text-[#e8e8f2] overflow-hidden"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* ─── SIDEBAR ─── */}
      <aside
        className={`flex flex-col border-r border-[#252538] bg-[#0d0d16] transition-all duration-300 overflow-hidden
          ${sidebarOpen ? 'w-[262px] min-w-[262px] px-[10px] py-[14px]' : 'w-0 min-w-0 p-0'}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 pb-4 border-b border-[#252538] mb-3">
          <div className="w-9 h-9 min-w-9 rounded-[10px] bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center shadow-[0_0_24px_rgba(139,92,246,0.4)]">
            <StarIcon />
          </div>
          <div>
            <h1 className="font-['Oxanium'] text-[14px] font-extrabold tracking-[1.5px]">ASENA AI</h1>
            <p className="text-[9px] text-[#00e5ff] tracking-[2px] font-semibold mt-0.5">{s.powered}</p>
          </div>
        </div>

        {/* New Chat */}
        <button
          onClick={newChat}
          className="flex items-center justify-between bg-[#13131f] border border-[#252538] rounded-[10px] px-3 py-2 text-[13.5px] cursor-pointer mb-4 hover:border-[#8b5cf6] hover:bg-[#18182a] transition-all"
        >
          <div className="flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>{s.nc}</span>
          </div>
          <span className="bg-[#18182a] border border-[#252538] rounded px-1 py-0.5 text-[10px] text-[#7777a0]">Ctrl N</span>
        </button>

        <p className="text-[10px] font-semibold tracking-[1.5px] text-[#7777a0] px-1 pb-2">{s.convs}</p>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-0.5 scrollbar-thin">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-7 text-[#7777a0] text-[12.5px] opacity-70">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.45">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>{s.noc}</span>
            </div>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => setActiveId(conv.id)}
                className={`px-2.5 py-2 rounded-lg cursor-pointer text-[12.5px] truncate transition-all
                  ${activeId === conv.id
                    ? 'bg-[#13131f] text-[#e8e8f2]'
                    : 'text-[#7777a0] hover:bg-[#13131f] hover:text-[#e8e8f2]'
                  }`}
              >
                {conv.title}
              </div>
            ))
          )}
        </div>

        {/* Bottom */}
        <div className="border-t border-[#252538] pt-3 flex flex-col gap-2">
          <div className="flex items-center gap-2 px-2 py-1.5 bg-[#13131f] rounded-lg text-[12px] text-[#7777a0]">
            <span className="w-[7px] h-[7px] min-w-[7px] bg-[#22c55e] rounded-full shadow-[0_0_6px_#22c55e]" />
            <span>Asena ML-1</span>
          </div>
          <div className="flex items-center gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-[#13131f] transition-colors">
            <div className="w-8 h-8 min-w-8 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center text-[13px] font-bold">U</div>
            <div>
              <p className="text-[12.5px] font-medium">{s.guest}</p>
              <p className="text-[11px] text-[#7777a0]">{s.gsub}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── MAIN ─── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Topbar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#252538] bg-[#09090f] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="p-1.5 rounded-lg text-[#7777a0] hover:text-[#e8e8f2] hover:bg-[#13131f] transition-all"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div className="flex items-center gap-2 text-[13px] text-[#7777a0]">
              <span className="w-[7px] h-[7px] bg-[#22c55e] rounded-full shadow-[0_0_6px_#22c55e]" />
              <span>Asena ML-1 Versatile</span>
            </div>
          </div>

          {/* Language selector */}
          <div className="flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7777a0" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <select
              value={langCode}
              onChange={e => setLangCode(e.target.value)}
              className="bg-[#13131f] border border-[#252538] rounded-lg text-[#e8e8f2] text-[12.5px] px-2 py-1.5 cursor-pointer outline-none focus:border-[#8b5cf6] transition-colors max-w-[190px]"
              style={{ fontFamily: 'inherit' }}
            >
              {LANGUAGES.map(l => (
                <option key={l.c + l.nat} value={l.c} style={{ background: '#13131f' }}>
                  {l.native}  —  {l.n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {showWelcome ? (
            /* ── WELCOME ── */
            <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 gap-4">
              <div className="w-[82px] h-[82px] rounded-[22px] bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center animate-pulse-glow shadow-[0_0_50px_rgba(139,92,246,0.45)]">
                <StarIcon />
              </div>
              <h2 className="font-['Oxanium'] text-[44px] font-extrabold tracking-[3px] bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] bg-clip-text text-transparent">
                ASENA AI
              </h2>
              <p className="text-center text-[#7777a0] text-[15px] max-w-[500px] leading-relaxed">{s.sub}</p>
              <div className="flex items-center gap-1.5 text-[12px] text-[#00e5ff] opacity-80">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <span>{s.ultra}</span>
              </div>
              {/* Suggestions */}
              <div className="grid grid-cols-2 gap-2.5 max-w-[680px] w-full mt-2">
                {s.sugg.map((sg, i) => (
                  <div
                    key={i}
                    onClick={() => sendMessage(sg.txt)}
                    className="bg-[#13131f] border border-[#252538] rounded-xl p-3.5 cursor-pointer hover:border-[#8b5cf6] hover:bg-[#18182a] hover:-translate-y-0.5 transition-all hover:shadow-[0_8px_24px_rgba(139,92,246,0.15)]"
                  >
                    <p className="text-[11px] text-[#7777a0] mb-1">{sg.lang}</p>
                    <p className="text-[13.5px] font-medium leading-snug">{sg.txt}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ── MESSAGES ── */
            <div className="flex flex-col gap-3.5 p-5 flex-1">
              {activeConv?.messages.map(msg => (
                <div key={msg.id} className={`flex gap-2.5 max-w-[800px] w-full mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-[30px] h-[30px] min-w-[30px] rounded-lg flex items-center justify-center font-bold text-[13px] flex-shrink-0 ${msg.role === 'assistant' ? 'bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4]' : 'bg-[#252538] text-[#7777a0]'}`}>
                    {msg.role === 'assistant' ? <StarSmall /> : 'U'}
                  </div>
                  <div
                    className={`rounded-xl px-4 py-3 text-[13.5px] leading-[1.75] max-w-[calc(100%-46px)] break-words border
                      ${msg.role === 'user'
                        ? 'bg-[rgba(139,92,246,0.12)] border-[rgba(139,92,246,0.28)]'
                        : 'bg-[#13131f] border-[#252538]'
                      }`}
                    dangerouslySetInnerHTML={{ __html: renderMd(msg.content) }}
                  />
                </div>
              ))}
              {loading && (
                <div className="flex gap-2.5 max-w-[800px] w-full mx-auto">
                  <div className="w-[30px] h-[30px] min-w-[30px] rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center flex-shrink-0">
                    <StarSmall />
                  </div>
                  <div className="bg-[#13131f] border border-[#252538] rounded-xl px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 bg-[#8b5cf6] rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.22}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="px-4 pb-4 pt-2.5 flex-shrink-0">
          <div className="max-w-[800px] mx-auto">
            <div className={`flex items-end gap-2 bg-[#18182a] border rounded-[14px] px-3 py-2.5 transition-colors ${loading ? 'border-[#252538]' : 'border-[#252538] focus-within:border-[rgba(139,92,246,0.7)]'}`}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => { setInput(e.target.value); autoResize(); }}
                onKeyDown={handleKeyDown}
                placeholder={s.ph}
                rows={1}
                disabled={loading}
                className="flex-1 bg-transparent border-none outline-none text-[13.5px] text-[#e8e8f2] placeholder:text-[#7777a0] resize-none max-h-[150px] leading-[1.6] min-h-[22px] disabled:opacity-60"
                style={{ fontFamily: 'inherit' }}
              />
              <div className="flex items-center gap-1.5">
                <button className="p-1.5 rounded-lg text-[#7777a0] hover:text-[#e8e8f2] hover:bg-[#13131f] transition-all">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                </button>
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] rounded-lg p-2 flex items-center text-white disabled:opacity-35 disabled:cursor-not-allowed hover:opacity-85 active:scale-95 transition-all"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-center text-[11px] text-[#7777a0] mt-2 opacity-70">{s.hint}</p>
          </div>
        </div>
      </div>

      {/* Inline styles for markdown & animations */}
      <style jsx global>{`
        .code-block { background:#0d0d16; border:1px solid #252538; border-radius:8px; padding:12px; overflow-x:auto; margin:8px 0; font-family:monospace; font-size:12.5px; }
        .inline-code { background:rgba(139,92,246,0.18); padding:2px 5px; border-radius:4px; font-family:monospace; font-size:12.5px; }
        .md-link { color:#00e5ff; text-decoration:underline; text-underline-offset:3px; }
        .md-h1,.md-h2,.md-h3 { font-family:'Oxanium',sans-serif; color:#e8e8f2; margin:10px 0 5px; }
        .md-h1 { font-size:20px; } .md-h2 { font-size:17px; } .md-h3 { font-size:15px; }
        strong { color:#00e5ff; }
        @keyframes pulse-glow {
          0%,100% { box-shadow: 0 0 40px rgba(139,92,246,0.4); }
          50% { box-shadow: 0 0 70px rgba(139,92,246,0.7), 0 0 110px rgba(6,182,212,0.3); }
        }
        .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .scrollbar-thin::-webkit-scrollbar { width: 3px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #252538; border-radius: 3px; }
        select option { background: #13131f !important; }
      `}</style>
    </div>
  );
}
