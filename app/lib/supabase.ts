// app/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnon);

// ── Foydalanuvchini DB ga saqlash / yangilash ──
export async function upsertUser(firebaseUser: {
  uid: string; email: string; displayName?: string | null; photoURL?: string | null;
}) {
  // IP va davlatni aniqlash
  let country = null, countryCode = null, ip = null;
  try {
    const res = await fetch('/api/geoip');
const geo = await res.json();
country     = geo.country;
countryCode = geo.countryCode;
ip          = geo.ip;
  } catch {}

  const { data, error } = await supabase
    .from('users')
    .upsert({
      firebase_uid: firebaseUser.uid,
      email:        firebaseUser.email,
      name:         firebaseUser.displayName,
      avatar_url:   firebaseUser.photoURL,
      country, country_code: countryCode, ip_address: ip,
      last_seen:    new Date().toISOString(),
    }, { onConflict: 'firebase_uid' })
    .select()
    .single();

  console.log('upsertUser result:', data, error);
  return { data, error };
}

// ── Kunlik limitni tekshirish ──
export async function checkLimit(userId: string, type: 'image' | 'video', isLoggedIn: boolean) {
  const limit = isLoggedIn ? 5 : 1;
  const today = new Date().toISOString().split('T')[0];

  const { data } = await supabase
    .from('daily_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  const used = data ? (type === 'image' ? data.img_count : data.vid_count) : 0;
  return { allowed: used < limit, used, limit, remaining: Math.max(0, limit - used) };
}

// ── Limitni yangilash ──
export async function incrementUsage(userId: string, type: 'image' | 'video') {
  const today = new Date().toISOString().split('T')[0];
  const field = type === 'image' ? 'img_count' : 'vid_count';

  const { data: existing } = await supabase
    .from('daily_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  if (existing) {
    await supabase.from('daily_usage').update({
      [field]: existing[field] + 1
    }).eq('id', existing.id);
  } else {
    await supabase.from('daily_usage').insert({
      user_id: userId, date: today,
      img_count: type === 'image' ? 1 : 0,
      vid_count: type === 'video' ? 1 : 0,
    });
  }
}

// ── Generatsiyani saqlash ──
export async function saveGeneration(data: {
  userId?: string; guestId?: string;
  type: 'image' | 'video'; prompt: string; model?: string; fileUrl?: string;
}) {
  return await supabase.from('generations').insert({
    user_id:        data.userId,
    guest_id:       data.guestId,
    type:           data.type,
    prompt:         data.prompt,
    model:          data.model,
    file_url:       data.fileUrl,
    with_watermark: true,
  });
}

// ── Chat saqlash ──
export async function saveChat(userId: string | null, guestId: string | null, title: string) {
  const { data } = await supabase.from('chats').insert({
    user_id:  userId,
    guest_id: guestId,
    title,
  }).select().single();
  return data;
}

// ── Xabar saqlash ──
export async function saveMessage(chatId: string, role: 'user' | 'assistant', content: string) {
  return await supabase.from('messages').insert({ chat_id: chatId, role, content });
}

// ── ADMIN: barcha foydalanuvchilar ──
export async function adminGetUsers() {
  return await supabase
    .from('users')
    .select('*, chats(count), generations(count)')
    .order('created_at', { ascending: false });
}

// ── ADMIN: statistika ──
export async function adminGetStats() {
  const [users, chats, msgs, imgs, vids] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('chats').select('id', { count: 'exact', head: true }),
    supabase.from('messages').select('id', { count: 'exact', head: true }),
    supabase.from('generations').select('id', { count: 'exact', head: true }).eq('type','image'),
    supabase.from('generations').select('id', { count: 'exact', head: true }).eq('type','video'),
  ]);
  return {
    totalUsers:    users.count ?? 0,
    totalChats:    chats.count ?? 0,
    totalMessages: msgs.count  ?? 0,
    totalImages:   imgs.count  ?? 0,
    totalVideos:   vids.count  ?? 0,
  };
}

// ── ADMIN: davlatlar bo'yicha ──
export async function adminGetCountries() {
  const { data } = await supabase
    .from('users')
    .select('country, country_code')
    .not('country_code', 'is', null);

  const counts: Record<string, { country: string; count: number }> = {};
  data?.forEach(u => {
    if (!u.country_code) return;
    if (!counts[u.country_code]) counts[u.country_code] = { country: u.country, count: 0 };
    counts[u.country_code].count++;
  });
  return Object.entries(counts)
    .map(([code, v]) => ({ code, country: v.country, count: v.count }))
    .sort((a, b) => b.count - a.count);
}
