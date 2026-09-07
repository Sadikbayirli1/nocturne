import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { b as useNavigate, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as DialogOverlay, c as DialogTrigger$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { n as cn } from "./utils-nBwqipAl.mjs";
import { n as ROOM_THEMES } from "./types-BLxICGWs.mjs";
import { n as X, o as Users, x as Lock } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as useI18n } from "./router-BLbSF1bt.mjs";
import { a as createRoom, h as listRooms } from "./api-C37XoPYF.mjs";
import { t as useCurrentUser } from "./use-current-user-DG6UNzh9.mjs";
import { t as Button } from "./button-DECHDznd.mjs";
import { t as Input } from "./input-CwqjP0As.mjs";
import { t as Label } from "./label-C_PrE3Jn.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.index-BQ4zQbFb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Dialog = Dialog$1;
var DialogTrigger = DialogTrigger$1;
function DialogContent({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
		className: cn("fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-border bg-card p-6 text-card-foreground shadow-xl outline-none", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
			className: "absolute top-4 right-4 rounded-[8px] p-1 text-muted-foreground hover:bg-accent",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
		})]
	})] });
}
function DialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("mb-4 space-y-1", className),
		...props
	});
}
function DialogTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
		className: cn("font-display text-xl tracking-tight", className),
		...props
	});
}
function DialogDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
		className: cn("text-sm text-muted-foreground", className),
		...props
	});
}
var THEME_SWATCH = {
	violet: "bg-[#8b5cf6]",
	obsidian: "bg-[#c9a227]",
	ember: "bg-[#e06b5a]",
	aurora: "bg-[#5eead4]",
	ivory: "bg-[#d4c4a8]"
};
function CreateRoomDialog({ triggerClassName }) {
	const { t } = useI18n();
	const navigate = useNavigate();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [name, setName] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [theme, setTheme] = (0, import_react.useState)("violet");
	const [busy, setBusy] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: triggerClassName,
				children: t("app.newRoom")
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: t("room.createTitle") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: t("room.passwordHint") })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "space-y-4",
			onSubmit: async (e) => {
				e.preventDefault();
				setBusy(true);
				try {
					const res = await createRoom({ data: {
						name,
						password: password || void 0,
						theme
					} });
					setOpen(false);
					setName("");
					setPassword("");
					navigate({
						to: "/room/$code",
						params: { code: res.id }
					});
				} catch (err) {
					toast.error(err instanceof Error ? err.message : t("common.error"));
				} finally {
					setBusy(false);
				}
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "room-name",
						children: t("room.name")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "room-name",
						value: name,
						onChange: (e) => setName(e.target.value),
						maxLength: 48,
						required: true
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "room-pass",
						children: t("room.password")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "room-pass",
						type: "password",
						value: password,
						onChange: (e) => setPassword(e.target.value),
						maxLength: 64
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("room.theme") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-2",
						children: ROOM_THEMES.map((th) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setTheme(th),
							className: cn("flex h-11 items-center gap-2 rounded-[12px] border px-3 text-sm", theme === th ? "border-primary bg-primary/10" : "border-border"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("h-3 w-3 rounded-full", THEME_SWATCH[th]) }), t(`theme.${th}`)]
						}, th))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					className: "w-full",
					disabled: busy || name.trim().length < 2,
					children: t("room.create")
				})
			]
		})] })]
	});
}
function RoomsPage() {
	const { t } = useI18n();
	const user = useCurrentUser();
	const [rooms, setRooms] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		listRooms().then(setRooms).catch(() => setRooms([]));
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-end justify-between gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl tracking-tight",
			children: t("app.greeting", { name: user?.displayName ?? "—" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted-foreground",
			children: t("app.sub")
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateRoomDialog, {})]
	}), rooms === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-8 grid gap-3 md:grid-cols-2",
		children: [
			0,
			1,
			2
		].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-32 animate-pulse rounded-[22px] bg-secondary" }, i))
	}) : rooms.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-12 rounded-[28px] border border-dashed border-border px-6 py-16 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted-foreground",
			children: t("app.empty")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 flex justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateRoomDialog, {})
		})]
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "mt-8 grid gap-3 md:grid-cols-2",
		children: rooms.map((room) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/room/$code",
			params: { code: room.id },
			className: "block rounded-[22px] border border-border bg-card p-5 transition-colors hover:border-primary/40",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-[0.16em] text-primary uppercase",
					children: t(`theme.${room.theme}`)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display mt-1 text-2xl tracking-tight",
					children: room.name
				})] }), room.hasPassword && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-4 text-muted-foreground" })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 flex items-center gap-2 text-sm text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4" }),
					t("app.members", { n: room.memberCount }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
					room.currentTitle ? `${t("app.nowPlaying")} · ${room.currentTitle}` : t("app.idle")
				]
			})]
		}) }, room.id))
	})] });
}
//#endregion
export { RoomsPage as component };
