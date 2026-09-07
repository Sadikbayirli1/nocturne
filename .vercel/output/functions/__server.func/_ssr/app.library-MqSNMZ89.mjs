import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as fileToDataUrl, i as coverFromSeed, l as isSafeImageSrc, o as formatDuration } from "./utils-nBwqipAl.mjs";
import { t as NOCTURNE_COLLECTION } from "./catalog-CmFGBXGd.mjs";
import { d as Trash2, l as Upload } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as useI18n } from "./router-BLbSF1bt.mjs";
import { b as removeLibraryTrack, m as listLibrary, n as addLibraryTrack } from "./api-C37XoPYF.mjs";
import { t as Button } from "./button-DECHDznd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.library-MqSNMZ89.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var AUDIO_TYPES = [
	"audio/mpeg",
	"audio/mp3",
	"audio/wav",
	"audio/ogg",
	"audio/webm",
	"audio/mp4",
	"audio/aac",
	"audio/x-m4a"
];
function LibraryPage() {
	const { t } = useI18n();
	const [tracks, setTracks] = (0, import_react.useState)([]);
	const fileRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		listLibrary().then(setTracks).catch(() => setTracks([]));
	}, []);
	async function add(track) {
		try {
			const saved = await addLibraryTrack({ data: { track } });
			setTracks((prev) => [saved, ...prev]);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t("common.error"));
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-2xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-3xl tracking-tight",
						children: t("library.title")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: t("library.sub")
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => fileRef.current?.click(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-4" }), t("library.upload")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: fileRef,
						type: "file",
						accept: AUDIO_TYPES.join(","),
						className: "hidden",
						onChange: async (e) => {
							const file = e.target.files?.[0];
							e.target.value = "";
							if (!file) return;
							if (!AUDIO_TYPES.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|m4a|aac|webm)$/i)) {
								toast.error(t("library.badType"));
								return;
							}
							if (file.size > 2e6) {
								toast.error(t("library.tooBig"));
								return;
							}
							const audioUrl = await fileToDataUrl(file);
							const title = file.name.replace(/\.[^.]+$/, "");
							await add({
								id: "tmp",
								title,
								artist: "Upload",
								durationMs: 0,
								source: "upload",
								audioUrl,
								thumbnailUrl: coverFromSeed(title)
							});
						}
					})
				]
			}),
			tracks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-10 text-sm text-muted-foreground",
				children: t("library.empty")
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-8 space-y-2",
				children: tracks.map((track) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-3 rounded-[16px] border border-border bg-card px-3 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cover, { track }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm font-medium",
								children: track.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: [track.artist, track.durationMs ? ` · ${formatDuration(track.durationMs)}` : ""]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "grid h-10 w-10 place-items-center rounded-[8px] hover:bg-accent",
							onClick: async () => {
								await removeLibraryTrack({ data: { id: track.id } });
								setTracks((prev) => prev.filter((x) => x.id !== track.id));
							},
							"aria-label": t("common.delete"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
						})
					]
				}, track.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-12 text-sm font-medium text-muted-foreground",
				children: t("room.collection")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-2",
				children: NOCTURNE_COLLECTION.map((track) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-3 rounded-[16px] px-3 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cover, { track }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm",
								children: track.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: track.artist
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => void add(track),
							children: t("room.add")
						})
					]
				}, track.id))
			})
		]
	});
}
function Cover({ track }) {
	const src = track.thumbnailUrl && isSafeImageSrc(track.thumbnailUrl) ? track.thumbnailUrl : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "h-10 w-10 overflow-hidden rounded-[8px] bg-secondary",
		children: src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src,
			alt: "",
			className: "h-full w-full object-cover"
		}) : null
	});
}
//#endregion
export { LibraryPage as component };
