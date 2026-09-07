import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as cn } from "./utils-nBwqipAl.mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/radix-ui__react-switch.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/switch-BB_YhFGS.js
var import_jsx_runtime = require_jsx_runtime();
async function ensureNotifyPermission() {
	if (typeof window === "undefined" || !("Notification" in window)) return false;
	if (Notification.permission === "granted") return true;
	if (Notification.permission === "denied") return false;
	return await Notification.requestPermission() === "granted";
}
function pushBrowserNotification(title, body, href) {
	if (typeof window === "undefined" || !("Notification" in window)) return;
	if (Notification.permission !== "granted") return;
	if (!document.hidden) return;
	try {
		const n = new Notification(title, {
			body,
			silent: false
		});
		n.onclick = () => {
			window.focus();
			if (href) window.location.href = href;
			n.close();
		};
	} catch {}
}
function Switch({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
		className: cn("peer inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-border transition-colors data-[state=checked]:bg-primary data-[state=unchecked]:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: "pointer-events-none block h-5 w-5 translate-x-0.5 rounded-full bg-foreground shadow transition-transform data-[state=checked]:translate-x-[22px] data-[state=checked]:bg-primary-foreground" })
	});
}
//#endregion
export { ensureNotifyPermission as n, pushBrowserNotification as r, Switch as t };
