import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { M as ArrowRight, S as ListMusic, b as MessageCircle, t as Youtube, x as Lock } from "../_libs/lucide-react.mjs";
import { i as useI18n } from "./router-BLbSF1bt.mjs";
import { n as useCurrentUserState } from "./use-current-user-DG6UNzh9.mjs";
import { t as LanguageSwitcher } from "./language-switcher-CFvIBj1M.mjs";
import { n as SignedIn, r as SignedOut } from "./gates-eHyJWLc8.mjs";
import { t as Logo } from "./logo-B3K3wLQZ.mjs";
import { t as Button } from "./button-DECHDznd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-B0J0JYmv.js
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const { t } = useI18n();
	const { isPending } = useCurrentUserState();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "mx-auto flex max-w-6xl items-center justify-between px-4 py-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LanguageSwitcher, {}), isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-11 w-28 animate-pulse rounded-[10px] bg-secondary" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignedOut, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "ghost",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/login",
						children: t("nav.signIn")
					})
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignedIn, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/app",
						children: t("nav.enter")
					})
				}) })] })]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto max-w-6xl px-4 pb-20",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "enter-1 mx-auto max-w-3xl pt-10 text-center md:pt-16",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.22em] text-primary uppercase",
							children: t("brand.kicker")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display mt-4 text-4xl leading-[1.1] tracking-tight md:text-6xl",
							children: t("landing.hero")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg",
							children: t("landing.sub")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-8 flex flex-wrap items-center justify-center gap-3",
							children: isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-12 w-40 animate-pulse rounded-[10px] bg-secondary" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SignedOut, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								size: "lg",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/login",
									children: [t("landing.cta"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								size: "lg",
								variant: "outline",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/login",
									children: t("landing.secondary")
								})
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignedIn, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								size: "lg",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/app",
									children: [t("nav.enter"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
								})
							}) })] })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "enter-2 mx-auto mt-16 max-w-md rounded-[28px] border border-border bg-card p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tracking-[0.18em] text-muted-foreground uppercase",
							children: "Now playing"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display mt-2 text-2xl",
							children: "Velvet Frequency"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Nocturne Radio"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 flex h-10 items-end gap-1",
							children: [
								18,
								28,
								14,
								32,
								22,
								30,
								16,
								26
							].map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "eq-bar w-1.5 rounded-full bg-primary",
								style: { height: h }
							}, i))
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "enter-3 mt-16 grid gap-4 md:grid-cols-2",
					children: [
						{
							icon: ListMusic,
							t: "landing.f1t",
							d: "landing.f1d"
						},
						{
							icon: MessageCircle,
							t: "landing.f2t",
							d: "landing.f2d"
						},
						{
							icon: Lock,
							t: "landing.f3t",
							d: "landing.f3d"
						},
						{
							icon: Youtube,
							t: "landing.f4t",
							d: "landing.f4d"
						}
					].map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-[22px] border border-border bg-card p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(f.icon, { className: "size-5 text-primary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-3 text-lg font-medium",
								children: t(f.t)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: t(f.d)
							})
						]
					}, f.t))
				})
			]
		})]
	});
}
//#endregion
export { Home as component };
