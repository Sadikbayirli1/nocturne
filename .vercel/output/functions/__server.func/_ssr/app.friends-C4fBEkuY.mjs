import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as useI18n } from "./router-BLbSF1bt.mjs";
import { C as searchPeople, S as respondFriend, p as listFriends, w as sendFriendRequest } from "./api-C37XoPYF.mjs";
import { t as Avatar } from "./avatar-CTPe4NrP.mjs";
import { t as Button } from "./button-DECHDznd.mjs";
import { t as Input } from "./input-CwqjP0As.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.friends-C4fBEkuY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function FriendsPage() {
	const { t } = useI18n();
	const [friends, setFriends] = (0, import_react.useState)([]);
	const [q, setQ] = (0, import_react.useState)("");
	const [hits, setHits] = (0, import_react.useState)([]);
	async function refresh() {
		const rows = await listFriends();
		setFriends(rows);
	}
	(0, import_react.useEffect)(() => {
		refresh().catch(() => setFriends([]));
	}, []);
	const incoming = friends.filter((f) => f.relation === "incoming");
	const accepted = friends.filter((f) => f.relation === "accepted");
	const outgoing = friends.filter((f) => f.relation === "outgoing");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-xl space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl tracking-tight",
					children: t("nav.friends")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-4 flex gap-2",
					onSubmit: async (e) => {
						e.preventDefault();
						try {
							const res = await searchPeople({ data: { q } });
							setHits(res);
						} catch (err) {
							toast.error(err instanceof Error ? err.message : t("common.error"));
						}
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: q,
						onChange: (e) => setQ(e.target.value),
						placeholder: t("friends.search")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						children: t("common.search")
					})]
				}),
				hits.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-2",
					children: hits.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-3 rounded-[16px] border border-border bg-card px-3 py-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
								src: p.avatarUrl,
								name: p.displayName
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm font-medium",
									children: p.displayName
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: p.status === "away" ? t("common.away") : t("common.online")
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: async () => {
									try {
										await sendFriendRequest({ data: { userId: p.userId } });
										toast.success(t("friends.pending"));
										await refresh();
									} catch (err) {
										toast.error(err instanceof Error ? err.message : t("common.error"));
									}
								},
								children: t("friends.add")
							})
						]
					}, p.userId))
				})
			] }),
			incoming.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-3 text-sm font-medium text-muted-foreground",
				children: t("friends.incoming")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: incoming.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-3 rounded-[16px] border border-border bg-card px-3 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
							src: f.avatarUrl,
							name: f.displayName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "min-w-0 flex-1 truncate text-sm font-medium",
							children: f.displayName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							onClick: async () => {
								await respondFriend({ data: {
									friendshipId: f.friendshipId,
									accept: true
								} });
								await refresh();
							},
							children: t("friends.accept")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: async () => {
								await respondFriend({ data: {
									friendshipId: f.friendshipId,
									accept: false
								} });
								await refresh();
							},
							children: t("friends.ignore")
						})
					]
				}, f.friendshipId))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 text-sm font-medium text-muted-foreground",
					children: t("friends.list")
				}),
				accepted.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: t("friends.empty")
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2",
					children: accepted.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-3 rounded-[16px] border border-border bg-card px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
							src: f.avatarUrl,
							name: f.displayName
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm font-medium",
								children: f.displayName
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: f.status === "away" ? t("common.away") : t("common.online")
							})]
						})]
					}, f.friendshipId))
				}),
				outgoing.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-2",
					children: outgoing.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-3 rounded-[16px] px-3 py-2 text-sm text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
								src: f.avatarUrl,
								name: f.displayName,
								size: "sm"
							}),
							f.displayName,
							" · ",
							t("friends.pending")
						]
					}, f.friendshipId))
				})
			] })
		]
	});
}
//#endregion
export { FriendsPage as component };
