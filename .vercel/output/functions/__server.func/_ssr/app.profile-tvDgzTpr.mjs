import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { r as compressImage } from "./utils-nBwqipAl.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as useI18n, r as useSettings } from "./router-BLbSF1bt.mjs";
import { E as updateProfile, i as bootstrapMe } from "./api-C37XoPYF.mjs";
import { t as LanguageSwitcher } from "./language-switcher-CFvIBj1M.mjs";
import { t as Avatar } from "./avatar-CTPe4NrP.mjs";
import { t as Button } from "./button-DECHDznd.mjs";
import { t as Input } from "./input-CwqjP0As.mjs";
import { t as Label } from "./label-C_PrE3Jn.mjs";
import { n as ensureNotifyPermission, t as Switch } from "./switch-BB_YhFGS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.profile-tvDgzTpr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProfilePage() {
	const { t, setLocale } = useI18n();
	const { setAppearance, applyProfile } = useSettings();
	const [profile, setProfile] = (0, import_react.useState)(null);
	const [name, setName] = (0, import_react.useState)("");
	const [notifyOn, setNotifyOn] = (0, import_react.useState)(typeof Notification !== "undefined" && Notification.permission === "granted");
	const fileRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		bootstrapMe().then((res) => {
			setProfile(res.profile);
			setName(res.profile.displayName);
			applyProfile(res.profile);
		});
	}, [applyProfile]);
	async function save(patch) {
		try {
			const next = await updateProfile({ data: {
				displayName: patch.displayName,
				avatarUrl: patch.avatarUrl,
				status: patch.status,
				musicMuted: patch.musicMuted,
				locale: patch.locale,
				appearance: patch.appearance
			} });
			setProfile(next);
			applyProfile(next);
			toast.success(t("profile.saved"));
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t("common.error"));
		}
	}
	if (!profile) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-64 animate-pulse rounded-[22px] bg-secondary" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-lg space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl tracking-tight",
				children: t("profile.title")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => fileRef.current?.click(),
						className: "rounded-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
							src: profile.avatarUrl,
							name: profile.displayName,
							size: "lg"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: t("profile.photo")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						className: "mt-2",
						onClick: () => fileRef.current?.click(),
						children: t("library.upload")
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: fileRef,
						type: "file",
						accept: "image/jpeg,image/png,image/webp",
						className: "hidden",
						onChange: async (e) => {
							const file = e.target.files?.[0];
							e.target.value = "";
							if (!file) return;
							await save({ avatarUrl: await compressImage(file, 256, .85) });
						}
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "dn",
					children: t("profile.name")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "dn",
						value: name,
						onChange: (e) => setName(e.target.value),
						maxLength: 40
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => void save({ displayName: name }),
						children: t("profile.save")
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("profile.language") }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LanguageSwitcher, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-2",
						children: [
							"tr",
							"en",
							"ar"
						].map((loc) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "sr-only",
							onClick: () => {
								setLocale(loc);
								save({ locale: loc });
							}
						}, loc))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => {
							const loc = document.documentElement.lang || "tr";
							save({ locale: loc === "en" || loc === "ar" ? loc : "tr" });
						},
						children: t("profile.save")
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between rounded-[16px] border border-border bg-card px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: t("profile.appearance")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: profile.appearance === "light" ? t("profile.light") : t("profile.dark")
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
					checked: profile.appearance === "dark",
					onCheckedChange: (on) => {
						const appearance = on ? "dark" : "light";
						setAppearance(appearance);
						save({ appearance });
					}
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between rounded-[16px] border border-border bg-card px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: t("profile.away")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
					checked: profile.status === "away",
					onCheckedChange: (on) => void save({ status: on ? "away" : "available" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between rounded-[16px] border border-border bg-card px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: t("profile.mute")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
					checked: profile.musicMuted,
					onCheckedChange: (on) => void save({ musicMuted: on })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between rounded-[16px] border border-border bg-card px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: t("profile.notify")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "secondary",
					onClick: async () => {
						const ok = await ensureNotifyPermission();
						setNotifyOn(ok);
					},
					children: notifyOn ? t("profile.notifyOn") : t("profile.notifyOff")
				})]
			})
		]
	});
}
//#endregion
export { ProfilePage as component };
