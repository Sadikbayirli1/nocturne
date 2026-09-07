import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { d as useRouterState, m as Outlet, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as cn } from "./utils-nBwqipAl.mjs";
import { j as Bell, o as Users, r as Waves, s as UserRound, w as Library } from "../_libs/lucide-react.mjs";
import { i as useI18n, r as useSettings } from "./router-BLbSF1bt.mjs";
import { g as markNotificationsRead, i as bootstrapMe } from "./api-C37XoPYF.mjs";
import { n as useCurrentUserState } from "./use-current-user-DG6UNzh9.mjs";
import { t as LanguageSwitcher } from "./language-switcher-CFvIBj1M.mjs";
import { i as UserButton, t as RedirectToSignIn } from "./gates-eHyJWLc8.mjs";
import { t as Logo } from "./logo-B3K3wLQZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-D2kXpJ66.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function NotificationsBell({ items, onRead }) {
	const { t } = useI18n();
	const [open, setOpen] = (0, import_react.useState)(false);
	const unread = items.filter((n) => !n.read).length;
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const close = () => setOpen(false);
		window.addEventListener("click", close);
		return () => window.removeEventListener("click", close);
	}, [open]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		onClick: (e) => e.stopPropagation(),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "relative grid h-11 w-11 place-items-center rounded-[12px] hover:bg-accent",
			onClick: () => {
				setOpen((v) => !v);
				if (!open && unread) markNotificationsRead().then(onRead);
			},
			"aria-label": "Notifications",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-5" }), unread > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" })]
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute end-0 z-40 mt-2 w-80 overflow-hidden rounded-[18px] border border-border bg-popover p-2 shadow-xl",
			children: items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-3 py-6 text-center text-sm text-muted-foreground",
				children: t("notify.empty")
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "max-h-80 overflow-auto",
				children: items.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: n.href ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: n.href,
					className: cn("block rounded-[12px] px-3 py-2 hover:bg-accent", !n.read && "bg-primary/8"),
					onClick: () => setOpen(false),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: n.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: n.body
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-[12px] px-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: n.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: n.body
					})]
				}) }, n.id))
			})
		})]
	});
}
var NAV = [
	{
		to: "/app",
		key: "nav.rooms",
		icon: Waves
	},
	{
		to: "/app/friends",
		key: "nav.friends",
		icon: Users
	},
	{
		to: "/app/library",
		key: "nav.library",
		icon: Library
	},
	{
		to: "/app/profile",
		key: "nav.profile",
		icon: UserRound
	}
];
function AppShell({ children, notifications, onNotificationsRead }) {
	const { t } = useI18n();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-30 border-b border-border/80 bg-background/80 px-4 py-3 backdrop-blur-md",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-6xl items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/app",
							className: "shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
							className: "ms-4 hidden items-center gap-1 md:flex",
							children: NAV.map((item) => {
								const active = pathname === item.to;
								const Icon = item.icon;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: item.to,
									className: cn("inline-flex h-10 items-center gap-2 rounded-[12px] px-3 text-sm", active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-accent"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), t(item.key)]
								}, item.to);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ms-auto flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LanguageSwitcher, { className: "hidden sm:inline-flex" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationsBell, {
									items: notifications,
									onRead: onNotificationsRead
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
							]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 md:pb-8",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/90 px-2 py-2 backdrop-blur-md md:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-4",
					children: NAV.map((item) => {
						const active = pathname === item.to;
						const Icon = item.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							className: cn("flex min-h-12 flex-col items-center justify-center gap-1 text-[11px]", active ? "text-primary" : "text-muted-foreground"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" }), t(item.key)]
						}, item.to);
					})
				})
			})
		]
	});
}
function AppLayout() {
	const { user, isPending } = useCurrentUserState();
	const { applyProfile } = useSettings();
	const [profile, setProfile] = (0, import_react.useState)(null);
	const [notifications, setNotifications] = (0, import_react.useState)([]);
	const refresh = (0, import_react.useCallback)(async () => {
		const res = await bootstrapMe();
		setProfile(res.profile);
		setNotifications(res.notifications);
		applyProfile(res.profile);
	}, [applyProfile]);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		refresh().catch(() => void 0);
	}, [user, refresh]);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-dvh place-items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-24 w-24 animate-pulse rounded-full bg-secondary" })
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		notifications,
		onNotificationsRead: () => setNotifications((prev) => prev.map((n) => ({
			...n,
			read: true
		}))),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: profile?.displayName
		})]
	});
}
//#endregion
export { AppLayout as component };
