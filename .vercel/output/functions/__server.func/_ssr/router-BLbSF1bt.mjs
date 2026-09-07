import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as createRootRoute, g as createFileRoute, h as lazyRouteComponent, l as Scripts, m as Outlet, p as createRouter, u as HeadContent, x as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn, s as __exportAll } from "./ssr.mjs";
import { r as getSql } from "./db-D0SnWfr8.mjs";
import { B as string, H as unknown, I as number, L as object, M as discriminatedUnion, O as _enum, P as literal, V as union } from "../_libs/@better-auth/core+[...].mjs";
import { n as number$1 } from "../_libs/zod.mjs";
import { n as auth } from "./server-C4YCOdJf.mjs";
import { u as TriangleAlert } from "../_libs/lucide-react.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-BLbSF1bt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var tr = {
	"brand.name": "Nocturne",
	"brand.tag": "Özel odalarda birlikte dinleyin.",
	"brand.kicker": "Listening rooms",
	"nav.rooms": "Odalar",
	"nav.friends": "Arkadaşlar",
	"nav.library": "Kütüphane",
	"nav.profile": "Profil",
	"nav.signIn": "Giriş yap",
	"nav.enter": "Odalarınıza girin",
	"landing.hero": "Aynı şarkı. Aynı an. Ayrı odalar değil.",
	"landing.sub": "Sevgilinizle veya yakınlarınızla özel bir oda açın. Müziği birlikte yönetin, yazın, sesli not ve fotoğraf gönderin.",
	"landing.cta": "Oda oluştur",
	"landing.secondary": "Zaten hesabım var",
	"landing.f1t": "Ortak kuyruk",
	"landing.f1d": "Herkes şarkı ekler, herkes kontrol eder. Kim yönetiyor, her zaman görünür.",
	"landing.f2t": "Canlı sohbet",
	"landing.f2d": "Metin, fotoğraf ve sesli mesaj. Gönderildi, ulaştı, okundu.",
	"landing.f3t": "Özel odalar",
	"landing.f3d": "Şifre, onay kapısı ve tek tıkla davet bağlantısı.",
	"landing.f4t": "YouTube ve dosya",
	"landing.f4d": "Katalogdan seçin, YouTube bağlantısı yapıştırın veya cihazınızdan yükleyin.",
	"auth.title": "Nocturne’a giriş",
	"auth.sub": "Özel odalarınız sizi bekliyor.",
	"auth.email": "E-posta",
	"auth.password": "Şifre",
	"auth.name": "Adınız",
	"auth.signIn": "Giriş yap",
	"auth.signUp": "Hesap oluştur",
	"auth.switchToSignUp": "Hesabınız yok mu? Kayıt olun",
	"auth.switchToSignIn": "Zaten hesabınız var mı? Giriş yapın",
	"auth.or": "veya",
	"auth.google": "Google ile devam et",
	"auth.x": "X ile devam et",
	"auth.error": "Giriş başarısız. Bilgilerinizi kontrol edin.",
	"auth.signupError": "Kayıt başarısız. E-posta kullanımda olabilir.",
	"auth.disabled": "Giriş kapalı.",
	"app.greeting": "Merhaba, {name}",
	"app.sub": "Bir oda açın veya davet bağlantısıyla katılın.",
	"app.newRoom": "Yeni oda",
	"app.empty": "Henüz odanız yok. İlk odayı siz kurun.",
	"app.members": "{n} kişi",
	"app.nowPlaying": "Çalıyor",
	"app.idle": "Sessiz",
	"room.createTitle": "Yeni oda",
	"room.name": "Oda adı",
	"room.password": "Şifre (isteğe bağlı)",
	"room.passwordHint": "Şifre, davetlilerin hızlıca girmesini sağlar.",
	"room.theme": "Tema",
	"room.create": "Odayı aç",
	"room.copy": "Bağlantıyı kopyala",
	"room.copied": "Bağlantı kopyalandı",
	"room.leave": "Odadan çık",
	"room.delete": "Odayı sil",
	"room.kick": "Çıkar",
	"room.requests": "Katılım istekleri",
	"room.approve": "Onayla",
	"room.decline": "Reddet",
	"room.people": "Kişiler",
	"room.queue": "Kuyruk",
	"room.chat": "Sohbet",
	"room.history": "Geçmiş",
	"room.join": "Odaya katıl",
	"room.request": "Katılım iste",
	"room.pending": "Onay bekleniyor",
	"room.needPassword": "Bu odanın şifresi var.",
	"room.enterPassword": "Şifreyi girin",
	"room.missing": "Oda bulunamadı.",
	"room.controlledBy": "Kontrol: {name}",
	"room.nobody": "Kimse kontrol etmiyor",
	"room.muteMe": "Müzik bende çalmasın",
	"room.away": "Müsait değilim",
	"room.add": "Ekle",
	"room.search": "Şarkı ara veya YouTube bağlantısı yapıştır",
	"room.collection": "Koleksiyon",
	"room.youtube": "YouTube",
	"room.uploads": "Yüklemeler",
	"room.emptyQueue": "Kuyruk boş. Bir parça ekleyin.",
	"room.emptyChat": "İlk mesajı siz yazın.",
	"room.emptyHistory": "Henüz dinlenen bir parça yok.",
	"room.message": "Mesaj yazın",
	"room.photo": "Fotoğraf",
	"room.voice": "Sesli mesaj",
	"room.recording": "Kaydediliyor… bırakın gönderilsin",
	"room.owner": "Kurucu",
	"room.invite": "Davet et",
	"player.play": "Çal",
	"player.pause": "Duraklat",
	"player.next": "Sonraki",
	"player.prev": "Önceki",
	"player.volume": "Ses",
	"friends.search": "İsimle ara",
	"friends.empty": "Henüz arkadaşınız yok.",
	"friends.add": "İstek gönder",
	"friends.accept": "Kabul",
	"friends.ignore": "Yoksay",
	"friends.pending": "İstek gönderildi",
	"friends.incoming": "Gelen istekler",
	"friends.list": "Arkadaşlarınız",
	"library.title": "Kişisel kütüphane",
	"library.sub": "Cihazınızdan ses yükleyin veya koleksiyondan kaydedin.",
	"library.upload": "Dosya yükle",
	"library.empty": "Kütüphane boş.",
	"library.tooBig": "Dosya çok büyük. En fazla 2 MB.",
	"library.badType": "Desteklenmeyen format.",
	"profile.title": "Profil",
	"profile.name": "Görünen ad",
	"profile.photo": "Profil fotoğrafı",
	"profile.language": "Dil",
	"profile.appearance": "Görünüm",
	"profile.dark": "Koyu",
	"profile.light": "Açık",
	"profile.away": "Müsait değilim",
	"profile.mute": "Müzik bende çalmasın",
	"profile.save": "Kaydet",
	"profile.saved": "Kaydedildi",
	"profile.notify": "Tarayıcı bildirimleri",
	"profile.notifyOn": "Bildirimler açık",
	"profile.notifyOff": "Bildirimleri aç",
	"notify.empty": "Bildirim yok",
	"notify.message": "Yeni mesaj",
	"notify.join": "Odaya katılım",
	"notify.song": "Şarkı değişti",
	"notify.invite": "Oda daveti",
	"notify.request": "Katılım isteği",
	"theme.violet": "Gece Moru",
	"theme.obsidian": "Obsidyen Altın",
	"theme.ember": "Köz",
	"theme.aurora": "Aurora",
	"theme.ivory": "Fildişi",
	"common.loading": "Yükleniyor",
	"common.cancel": "Vazgeç",
	"common.save": "Kaydet",
	"common.delete": "Sil",
	"common.search": "Ara",
	"common.error": "Bir şeyler ters gitti.",
	"common.online": "Çevrimiçi",
	"common.away": "Uzakta",
	"receipt.sent": "Gönderildi",
	"receipt.delivered": "Ulaştı",
	"receipt.read": "Okundu"
};
var en = {
	"brand.name": "Nocturne",
	"brand.tag": "Listen together in private rooms.",
	"brand.kicker": "Listening rooms",
	"nav.rooms": "Rooms",
	"nav.friends": "Friends",
	"nav.library": "Library",
	"nav.profile": "Profile",
	"nav.signIn": "Sign in",
	"nav.enter": "Enter your rooms",
	"landing.hero": "The same song. The same moment. Not separate rooms.",
	"landing.sub": "Open a private room with someone you love. Share the queue, the controls, the chat, photos, and voice notes.",
	"landing.cta": "Create a room",
	"landing.secondary": "I already have an account",
	"landing.f1t": "Shared queue",
	"landing.f1d": "Anyone can add tracks. Anyone can control. The current operator is always visible.",
	"landing.f2t": "Live chat",
	"landing.f2d": "Text, photos, and voice notes — sent, delivered, read.",
	"landing.f3t": "Private rooms",
	"landing.f3d": "Optional password, required approval, one-click invite link.",
	"landing.f4t": "YouTube and files",
	"landing.f4d": "Pick from the collection, paste a YouTube link, or upload from your device.",
	"auth.title": "Sign in to Nocturne",
	"auth.sub": "Your private rooms are waiting.",
	"auth.email": "Email",
	"auth.password": "Password",
	"auth.name": "Your name",
	"auth.signIn": "Sign in",
	"auth.signUp": "Create account",
	"auth.switchToSignUp": "New here? Create an account",
	"auth.switchToSignIn": "Already have an account? Sign in",
	"auth.or": "or",
	"auth.google": "Continue with Google",
	"auth.x": "Continue with X",
	"auth.error": "Sign-in failed. Check your details.",
	"auth.signupError": "Sign-up failed. That email may already be in use.",
	"auth.disabled": "Sign-in is disabled.",
	"app.greeting": "Hello, {name}",
	"app.sub": "Open a room or join with an invite link.",
	"app.newRoom": "New room",
	"app.empty": "No rooms yet. Start the first one.",
	"app.members": "{n} people",
	"app.nowPlaying": "Playing",
	"app.idle": "Quiet",
	"room.createTitle": "New room",
	"room.name": "Room name",
	"room.password": "Password (optional)",
	"room.passwordHint": "A password lets invited people enter immediately.",
	"room.theme": "Theme",
	"room.create": "Open room",
	"room.copy": "Copy link",
	"room.copied": "Link copied",
	"room.leave": "Leave room",
	"room.delete": "Delete room",
	"room.kick": "Remove",
	"room.requests": "Join requests",
	"room.approve": "Approve",
	"room.decline": "Decline",
	"room.people": "People",
	"room.queue": "Queue",
	"room.chat": "Chat",
	"room.history": "History",
	"room.join": "Join room",
	"room.request": "Request access",
	"room.pending": "Waiting for approval",
	"room.needPassword": "This room is password protected.",
	"room.enterPassword": "Enter password",
	"room.missing": "Room not found.",
	"room.controlledBy": "Control: {name}",
	"room.nobody": "No one is controlling",
	"room.muteMe": "Don’t play music on this device",
	"room.away": "I’m unavailable",
	"room.add": "Add",
	"room.search": "Search tracks or paste a YouTube link",
	"room.collection": "Collection",
	"room.youtube": "YouTube",
	"room.uploads": "Uploads",
	"room.emptyQueue": "Queue is empty. Add a track.",
	"room.emptyChat": "Say something first.",
	"room.emptyHistory": "Nothing has played yet.",
	"room.message": "Write a message",
	"room.photo": "Photo",
	"room.voice": "Voice note",
	"room.recording": "Recording… release to send",
	"room.owner": "Host",
	"room.invite": "Invite",
	"player.play": "Play",
	"player.pause": "Pause",
	"player.next": "Next",
	"player.prev": "Previous",
	"player.volume": "Volume",
	"friends.search": "Search by name",
	"friends.empty": "No friends yet.",
	"friends.add": "Send request",
	"friends.accept": "Accept",
	"friends.ignore": "Ignore",
	"friends.pending": "Request sent",
	"friends.incoming": "Incoming requests",
	"friends.list": "Your friends",
	"library.title": "Personal library",
	"library.sub": "Upload audio from your device or save tracks from the collection.",
	"library.upload": "Upload file",
	"library.empty": "Library is empty.",
	"library.tooBig": "File is too large. 2 MB max.",
	"library.badType": "Unsupported format.",
	"profile.title": "Profile",
	"profile.name": "Display name",
	"profile.photo": "Profile photo",
	"profile.language": "Language",
	"profile.appearance": "Appearance",
	"profile.dark": "Dark",
	"profile.light": "Light",
	"profile.away": "I’m unavailable",
	"profile.mute": "Don’t play music on this device",
	"profile.save": "Save",
	"profile.saved": "Saved",
	"profile.notify": "Browser notifications",
	"profile.notifyOn": "Notifications on",
	"profile.notifyOff": "Enable notifications",
	"notify.empty": "No notifications",
	"notify.message": "New message",
	"notify.join": "Someone joined",
	"notify.song": "Song changed",
	"notify.invite": "Room invite",
	"notify.request": "Join request",
	"theme.violet": "Midnight violet",
	"theme.obsidian": "Obsidian gold",
	"theme.ember": "Ember",
	"theme.aurora": "Aurora",
	"theme.ivory": "Ivory",
	"common.loading": "Loading",
	"common.cancel": "Cancel",
	"common.save": "Save",
	"common.delete": "Delete",
	"common.search": "Search",
	"common.error": "Something went wrong.",
	"common.online": "Online",
	"common.away": "Away",
	"receipt.sent": "Sent",
	"receipt.delivered": "Delivered",
	"receipt.read": "Read"
};
var DICTS = {
	tr,
	en,
	ar: {
		"brand.name": "Nocturne",
		"brand.tag": "استمعوا معًا في غرف خاصة.",
		"brand.kicker": "غرف الاستماع",
		"nav.rooms": "الغرف",
		"nav.friends": "الأصدقاء",
		"nav.library": "المكتبة",
		"nav.profile": "الملف",
		"nav.signIn": "تسجيل الدخول",
		"nav.enter": "ادخل إلى غرفك",
		"landing.hero": "الأغنية نفسها. اللحظة نفسها. ليست غرفًا منفصلة.",
		"landing.sub": "افتح غرفة خاصة مع من تحب. شاركوا قائمة التشغيل والتحكم والدردشة والصور والملاحظات الصوتية.",
		"landing.cta": "إنشاء غرفة",
		"landing.secondary": "لدي حساب بالفعل",
		"landing.f1t": "قائمة مشتركة",
		"landing.f1d": "أي شخص يضيف المقاطع ويتحكم بها. يظهر المتحكم الحالي دائمًا.",
		"landing.f2t": "دردشة مباشرة",
		"landing.f2d": "نص وصور وملاحظات صوتية — أُرسل، وصل، قُرئ.",
		"landing.f3t": "غرف خاصة",
		"landing.f3d": "كلمة مرور اختيارية، موافقة إلزامية، ورابط دعوة بنقرة.",
		"landing.f4t": "يوتيوب وملفات",
		"landing.f4d": "اختر من المجموعة أو الصق رابط يوتيوب أو ارفع من جهازك.",
		"auth.title": "تسجيل الدخول إلى Nocturne",
		"auth.sub": "غرفك الخاصة بانتظارك.",
		"auth.email": "البريد الإلكتروني",
		"auth.password": "كلمة المرور",
		"auth.name": "اسمك",
		"auth.signIn": "دخول",
		"auth.signUp": "إنشاء حساب",
		"auth.switchToSignUp": "جديد هنا؟ أنشئ حسابًا",
		"auth.switchToSignIn": "لديك حساب؟ سجّل الدخول",
		"auth.or": "أو",
		"auth.google": "المتابعة مع Google",
		"auth.x": "المتابعة مع X",
		"auth.error": "فشل تسجيل الدخول. تحقق من بياناتك.",
		"auth.signupError": "فشل إنشاء الحساب. ربما البريد مستخدم.",
		"auth.disabled": "تسجيل الدخول معطّل.",
		"app.greeting": "مرحبًا، {name}",
		"app.sub": "افتح غرفة أو انضم برابط دعوة.",
		"app.newRoom": "غرفة جديدة",
		"app.empty": "لا غرف بعد. ابدأ الأولى.",
		"app.members": "{n} أشخاص",
		"app.nowPlaying": "يُشغَّل",
		"app.idle": "صامت",
		"room.createTitle": "غرفة جديدة",
		"room.name": "اسم الغرفة",
		"room.password": "كلمة المرور (اختياري)",
		"room.passwordHint": "تسمح كلمة المرور للمدعوين بالدخول فورًا.",
		"room.theme": "السمة",
		"room.create": "فتح الغرفة",
		"room.copy": "نسخ الرابط",
		"room.copied": "تم نسخ الرابط",
		"room.leave": "مغادرة الغرفة",
		"room.delete": "حذف الغرفة",
		"room.kick": "إزالة",
		"room.requests": "طلبات الانضمام",
		"room.approve": "قبول",
		"room.decline": "رفض",
		"room.people": "الأشخاص",
		"room.queue": "القائمة",
		"room.chat": "الدردشة",
		"room.history": "السجل",
		"room.join": "انضم للغرفة",
		"room.request": "طلب انضمام",
		"room.pending": "بانتظار الموافقة",
		"room.needPassword": "هذه الغرفة محمية بكلمة مرور.",
		"room.enterPassword": "أدخل كلمة المرور",
		"room.missing": "الغرفة غير موجودة.",
		"room.controlledBy": "التحكم: {name}",
		"room.nobody": "لا أحد يتحكم",
		"room.muteMe": "لا تشغّل الموسيقى على جهازي",
		"room.away": "لست متاحًا",
		"room.add": "إضافة",
		"room.search": "ابحث أو الصق رابط يوتيوب",
		"room.collection": "المجموعة",
		"room.youtube": "يوتيوب",
		"room.uploads": "الملفات",
		"room.emptyQueue": "القائمة فارغة. أضف مقطعًا.",
		"room.emptyChat": "اكتب الرسالة الأولى.",
		"room.emptyHistory": "لم يُشغَّل شيء بعد.",
		"room.message": "اكتب رسالة",
		"room.photo": "صورة",
		"room.voice": "ملاحظة صوتية",
		"room.recording": "جارٍ التسجيل… أفلت للإرسال",
		"room.owner": "المضيف",
		"room.invite": "دعوة",
		"player.play": "تشغيل",
		"player.pause": "إيقاف",
		"player.next": "التالي",
		"player.prev": "السابق",
		"player.volume": "الصوت",
		"friends.search": "البحث بالاسم",
		"friends.empty": "لا أصدقاء بعد.",
		"friends.add": "إرسال طلب",
		"friends.accept": "قبول",
		"friends.ignore": "تجاهل",
		"friends.pending": "تم إرسال الطلب",
		"friends.incoming": "الطلبات الواردة",
		"friends.list": "أصدقائك",
		"library.title": "مكتبتك",
		"library.sub": "ارفع صوتًا من جهازك أو احفظ من المجموعة.",
		"library.upload": "رفع ملف",
		"library.empty": "المكتبة فارغة.",
		"library.tooBig": "الملف كبير جدًا. الحد 2MB.",
		"library.badType": "صيغة غير مدعومة.",
		"profile.title": "الملف",
		"profile.name": "الاسم الظاهر",
		"profile.photo": "صورة الملف",
		"profile.language": "اللغة",
		"profile.appearance": "المظهر",
		"profile.dark": "داكن",
		"profile.light": "فاتح",
		"profile.away": "لست متاحًا",
		"profile.mute": "لا تشغّل الموسيقى على جهازي",
		"profile.save": "حفظ",
		"profile.saved": "تم الحفظ",
		"profile.notify": "إشعارات المتصفح",
		"profile.notifyOn": "الإشعارات مفعّلة",
		"profile.notifyOff": "تفعيل الإشعارات",
		"notify.empty": "لا إشعارات",
		"notify.message": "رسالة جديدة",
		"notify.join": "انضمام إلى الغرفة",
		"notify.song": "تغيرت الأغنية",
		"notify.invite": "دعوة غرفة",
		"notify.request": "طلب انضمام",
		"theme.violet": "بنفسجي منتصف الليل",
		"theme.obsidian": "ذهب أسود",
		"theme.ember": "جمر",
		"theme.aurora": "شفق",
		"theme.ivory": "عاج",
		"common.loading": "جارٍ التحميل",
		"common.cancel": "إلغاء",
		"common.save": "حفظ",
		"common.delete": "حذف",
		"common.search": "بحث",
		"common.error": "حدث خطأ.",
		"common.online": "متصل",
		"common.away": "بعيد",
		"receipt.sent": "أُرسل",
		"receipt.delivered": "وصل",
		"receipt.read": "قُرئ"
	}
};
function interpolate(template, vars) {
	if (!vars) return template;
	return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}
var I18nContext = (0, import_react.createContext)(null);
function I18nProvider({ locale, setLocale, children }) {
	const t = (0, import_react.useCallback)((key, vars) => {
		return interpolate((DICTS[locale] ?? en)[key] ?? DICTS.en[key] ?? key, vars);
	}, [locale]);
	const value = (0, import_react.useMemo)(() => ({
		locale,
		t,
		setLocale
	}), [
		locale,
		t,
		setLocale
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(I18nContext.Provider, {
		value,
		children
	});
}
function useI18n() {
	const ctx = (0, import_react.useContext)(I18nContext);
	if (!ctx) throw new Error("I18nProvider missing");
	return ctx;
}
var LOCALE_KEY = "nocturne-locale";
var APPEARANCE_KEY = "nocturne-appearance";
function readLocale() {
	if (typeof window === "undefined") return "tr";
	const v = window.localStorage.getItem(LOCALE_KEY);
	if (v === "en" || v === "ar" || v === "tr") return v;
	return "tr";
}
function readAppearance() {
	if (typeof window === "undefined") return "dark";
	return window.localStorage.getItem(APPEARANCE_KEY) === "light" ? "light" : "dark";
}
var SettingsContext = (0, import_react.createContext)(null);
function SettingsProvider({ children }) {
	const [locale, setLocaleState] = (0, import_react.useState)("tr");
	const [appearance, setAppearanceState] = (0, import_react.useState)("dark");
	(0, import_react.useEffect)(() => {
		setLocaleState(readLocale());
		setAppearanceState(readAppearance());
	}, []);
	(0, import_react.useEffect)(() => {
		const root = document.documentElement;
		root.lang = locale;
		root.dir = locale === "ar" ? "rtl" : "ltr";
		root.classList.toggle("dark", appearance === "dark");
		root.classList.toggle("light", appearance === "light");
	}, [locale, appearance]);
	const setLocale = (0, import_react.useCallback)((next) => {
		setLocaleState(next);
		window.localStorage.setItem(LOCALE_KEY, next);
	}, []);
	const setAppearance = (0, import_react.useCallback)((next) => {
		setAppearanceState(next);
		window.localStorage.setItem(APPEARANCE_KEY, next);
	}, []);
	const applyProfile = (0, import_react.useCallback)((profile) => {
		setLocale(profile.locale);
		setAppearance(profile.appearance);
	}, [setLocale, setAppearance]);
	const value = (0, import_react.useMemo)(() => ({
		locale,
		appearance,
		setLocale,
		setAppearance,
		applyProfile
	}), [
		locale,
		appearance,
		setLocale,
		setAppearance,
		applyProfile
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsContext.Provider, {
		value,
		children
	});
}
function useSettings() {
	const ctx = (0, import_react.useContext)(SettingsContext);
	if (!ctx) throw new Error("SettingsProvider missing");
	return ctx;
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var styles_default = "/assets/styles-CZk4DAl4.css";
var APP_NAME = "Nocturne";
var fetchSessionUser = createServerFn({ method: "GET" }).handler(createSsrRpc("2c4985e96c199268f7f639534cb5e8e31d6b19d43286bf77416413db60ffde26"));
var Route$10 = createRootRoute({
	beforeLoad: async () => ({ sessionUser: await fetchSessionUser() }),
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "theme-color",
				content: "#09060f"
			},
			{
				name: "description",
				content: "Private listening rooms — share music, chat, and control together."
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
			}
		]
	}),
	component: RootDocument
});
function RootDocument() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "tr",
		className: "dark antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(I18nBridge, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
				richColors: true,
				position: "top-center"
			})] }) }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	});
}
function I18nBridge({ children }) {
	const { locale, setLocale } = useSettings();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(I18nProvider, {
		locale,
		setLocale,
		children
	});
}
var $$splitComponentImporter$7 = () => import("./routes-B0J0JYmv.mjs");
var Route$9 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./app-D2kXpJ66.mjs");
var Route$8 = createFileRoute("/app")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("./login-BqvS5uMn.mjs");
var Route$7 = createFileRoute("/login")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
/**
* WebRTC signaling over the app database (Neon deployed, PGLite in preview).
* Only rendezvous traffic passes through here — roster + SDP/ICE relay while a
* mesh forms; game data then flows peer-to-peer.
*/
var ID = string().regex(/^[a-zA-Z0-9_-]{1,64}$/);
var signalSchema = object({
	op: literal("signal"),
	room: ID,
	from: ID,
	to: ID,
	kind: _enum([
		"offer",
		"answer",
		"ice"
	]),
	payload: unknown().refine((v) => v !== void 0 && JSON.stringify(v).length <= 32768, { message: "payload too large" })
});
var leaveSchema = object({
	op: literal("leave"),
	room: ID,
	peer: ID
});
var postSchema = discriminatedUnion("op", [signalSchema, leaveSchema]);
var PEER_TTL_SECONDS = 30;
var SIGNAL_TTL_SECONDS = 60;
var globalRef = globalThis;
function ensureSchema(sql) {
	globalRef.__rtcSchemaPromise__ ??= (async () => {
		await sql.query(`CREATE TABLE IF NOT EXISTS webrtc_peers (
         room TEXT NOT NULL,
         peer_id TEXT NOT NULL,
         name TEXT NOT NULL DEFAULT '',
         last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
         PRIMARY KEY (room, peer_id)
       )`);
		await sql.query(`CREATE TABLE IF NOT EXISTS webrtc_signals (
         id BIGSERIAL PRIMARY KEY,
         room TEXT NOT NULL,
         to_peer TEXT NOT NULL,
         from_peer TEXT NOT NULL,
         kind TEXT NOT NULL,
         payload JSONB NOT NULL,
         created_at TIMESTAMPTZ NOT NULL DEFAULT now()
       )`);
		await sql.query(`CREATE INDEX IF NOT EXISTS webrtc_signals_inbox
         ON webrtc_signals (room, to_peer, id)`);
	})().catch((err) => {
		globalRef.__rtcSchemaPromise__ = void 0;
		throw err;
	});
	return globalRef.__rtcSchemaPromise__;
}
async function roster(sql, room) {
	return (await sql.query(`SELECT peer_id, name FROM webrtc_peers
     WHERE room = $1 AND last_seen > now() - make_interval(secs => $2)
     ORDER BY peer_id LIMIT 32`, [room, PEER_TTL_SECONDS])).map((r) => ({
		id: r.peer_id,
		name: r.name
	}));
}
async function touchPeer(sql, room, peer, name) {
	await sql.query(`INSERT INTO webrtc_peers (room, peer_id, name, last_seen)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (room, peer_id)
     DO UPDATE SET last_seen = now(), name = EXCLUDED.name`, [
		room,
		peer,
		name
	]);
}
async function prune(sql) {
	await Promise.all([sql.query(`DELETE FROM webrtc_signals WHERE created_at < now() - make_interval(secs => $1)`, [SIGNAL_TTL_SECONDS]), sql.query(`DELETE FROM webrtc_peers WHERE last_seen < now() - make_interval(secs => $1)`, [PEER_TTL_SECONDS])]);
}
function json(body, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			"content-type": "application/json",
			"cache-control": "no-store"
		}
	});
}
async function handleGet(url) {
	const parsed = object({
		room: ID,
		peer: ID,
		name: string().max(64).default(""),
		since: number$1().int().min(0).default(0)
	}).safeParse({
		room: url.searchParams.get("room"),
		peer: url.searchParams.get("peer"),
		name: url.searchParams.get("name") ?? "",
		since: url.searchParams.get("since") ?? 0
	});
	if (!parsed.success) return json({ error: "invalid query" }, 400);
	const { room, peer, name, since } = parsed.data;
	const sql = await getSql();
	await ensureSchema(sql);
	if (since === 0 || Math.random() < .02) await prune(sql);
	await touchPeer(sql, room, peer, name);
	const rows = await sql.query(`SELECT id, from_peer, kind, payload FROM webrtc_signals
     WHERE room = $1 AND to_peer = $2 AND id > $3
     ORDER BY id LIMIT 200`, [
		room,
		peer,
		since
	]);
	return json({
		peers: await roster(sql, room),
		signals: rows.map((r) => ({
			id: r.id,
			from: r.from_peer,
			kind: r.kind,
			payload: r.payload
		}))
	});
}
async function handlePost(request) {
	let body;
	try {
		body = await request.json();
	} catch {
		return json({ error: "invalid JSON" }, 400);
	}
	const parsed = postSchema.safeParse(body);
	if (!parsed.success) return json({ error: "invalid request" }, 400);
	const msg = parsed.data;
	const sql = await getSql();
	await ensureSchema(sql);
	if (msg.op === "signal") await sql.query(`INSERT INTO webrtc_signals (room, to_peer, from_peer, kind, payload)
       VALUES ($1, $2, $3, $4, $5)`, [
		msg.room,
		msg.to,
		msg.from,
		msg.kind,
		JSON.stringify(msg.payload)
	]);
	else await sql.query(`DELETE FROM webrtc_peers WHERE room = $1 AND peer_id = $2`, [msg.room, msg.peer]);
	return json({ ok: true });
}
async function handleSignaling(request) {
	try {
		if (request.method === "GET") return await handleGet(new URL(request.url));
		if (request.method === "POST") return await handlePost(request);
		return json({ error: "method not allowed" }, 405);
	} catch (error) {
		console.error("[rtc] signaling error:", error);
		return json({ error: "signaling failed" }, 500);
	}
}
var handle = ({ request }) => handleSignaling(request);
var Route$6 = createFileRoute("/api/rtc")({ server: { handlers: {
	GET: handle,
	POST: handle
} } });
var $$splitComponentImporter$4 = () => import("./app.index-BQ4zQbFb.mjs");
var Route$5 = createFileRoute("/app/")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./app.friends-C4fBEkuY.mjs");
var Route$4 = createFileRoute("/app/friends")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./app.library-MqSNMZ89.mjs");
var Route$3 = createFileRoute("/app/library")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./app.profile-tvDgzTpr.mjs");
var Route$2 = createFileRoute("/app/profile")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./room._code-BHWzPHS2.mjs");
var Route$1 = createFileRoute("/room/$code")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var Route = createFileRoute("/api/auth/$")({ server: { handlers: {
	GET: ({ request }) => auth.handler(request),
	POST: ({ request }) => auth.handler(request)
} } });
var IndexRoute = Route$9.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$10
});
var AppRoute = Route$8.update({
	id: "/app",
	path: "/app",
	getParentRoute: () => Route$10
});
var LoginRoute = Route$7.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$10
});
var ApiRtcRoute = Route$6.update({
	id: "/api/rtc",
	path: "/api/rtc",
	getParentRoute: () => Route$10
});
var AppIndexRoute = Route$5.update({
	id: "/",
	path: "/",
	getParentRoute: () => AppRoute
});
var AppFriendsRoute = Route$4.update({
	id: "/friends",
	path: "/friends",
	getParentRoute: () => AppRoute
});
var AppLibraryRoute = Route$3.update({
	id: "/library",
	path: "/library",
	getParentRoute: () => AppRoute
});
var AppProfileRoute = Route$2.update({
	id: "/profile",
	path: "/profile",
	getParentRoute: () => AppRoute
});
var RoomCodeRoute = Route$1.update({
	id: "/room/$code",
	path: "/room/$code",
	getParentRoute: () => Route$10
});
var ApiAuthSplatRoute = Route.update({
	id: "/api/auth/$",
	path: "/api/auth/$",
	getParentRoute: () => Route$10
});
var AppRouteChildren = {
	AppFriendsRoute,
	AppLibraryRoute,
	AppProfileRoute,
	AppIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	AppRoute: AppRoute._addFileChildren(AppRouteChildren),
	LoginRoute,
	ApiRtcRoute,
	RoomCodeRoute,
	ApiAuthSplatRoute
};
var routeTree = Route$10._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { createSsrRpc as a, useI18n as i, Route$1 as n, useSettings as r, router_exports as t };
