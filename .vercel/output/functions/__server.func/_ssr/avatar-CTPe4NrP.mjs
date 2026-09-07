import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { l as isSafeImageSrc, n as cn, s as initials } from "./utils-nBwqipAl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/avatar-CTPe4NrP.js
var import_jsx_runtime = require_jsx_runtime();
function Avatar({ src, name, size = "md", className }) {
	const dim = size === "sm" ? "h-8 w-8 text-[11px]" : size === "lg" ? "h-16 w-16 text-lg" : "h-10 w-10 text-xs";
	const safe = src && isSafeImageSrc(src) ? src : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-secondary font-medium text-secondary-foreground", dim, className),
		children: safe ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: safe,
			alt: "",
			className: "h-full w-full object-cover"
		}) : initials(name)
	});
}
//#endregion
export { Avatar as t };
