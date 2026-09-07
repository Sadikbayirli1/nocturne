import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as cn } from "./utils-nBwqipAl.mjs";
import { i as useI18n } from "./router-BLbSF1bt.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/language-switcher-CFvIBj1M.js
var import_jsx_runtime = require_jsx_runtime();
var OPTIONS = [
	{
		id: "tr",
		label: "TR"
	},
	{
		id: "en",
		label: "EN"
	},
	{
		id: "ar",
		label: "AR"
	}
];
function LanguageSwitcher({ className }) {
	const { locale, setLocale } = useI18n();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("inline-flex h-9 items-center rounded-[10px] bg-secondary p-0.5 text-xs font-medium", className),
		role: "group",
		"aria-label": "Language",
		children: OPTIONS.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => setLocale(opt.id),
			className: cn("h-8 min-w-9 rounded-[8px] px-2 transition-colors", locale === opt.id ? "bg-card text-foreground" : "text-muted-foreground"),
			children: opt.label
		}, opt.id))
	});
}
//#endregion
export { LanguageSwitcher as t };
