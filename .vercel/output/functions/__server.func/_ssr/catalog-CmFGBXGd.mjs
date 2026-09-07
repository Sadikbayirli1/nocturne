import { f as uid, i as coverFromSeed } from "./utils-nBwqipAl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/catalog-CmFGBXGd.js
function audioTrack(n, title, artist, durationMs) {
	const id = `col-${String(n).padStart(2, "0")}`;
	return {
		id,
		title,
		artist,
		durationMs,
		source: "audio",
		audioUrl: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`,
		thumbnailUrl: coverFromSeed(id + title)
	};
}
/** Royalty-free collection that actually plays in the browser. */
var NOCTURNE_COLLECTION = [
	audioTrack(1, "Midnight Circuit", "Nocturne Radio", 372e3),
	audioTrack(2, "Glass Atrium", "Nocturne Radio", 312e3),
	audioTrack(3, "Velvet Frequency", "Nocturne Radio", 354e3),
	audioTrack(4, "Low Light", "Nocturne Radio", 336e3),
	audioTrack(5, "After Hours", "Nocturne Radio", 348e3),
	audioTrack(6, "Silk Horizon", "Nocturne Radio", 318e3),
	audioTrack(7, "Quiet Gold", "Nocturne Radio", 342e3),
	audioTrack(8, "Ember Waltz", "Nocturne Radio", 33e4),
	audioTrack(9, "Ion Rain", "Nocturne Radio", 36e4),
	audioTrack(10, "Harbor Smoke", "Nocturne Radio", 324e3),
	audioTrack(11, "Paper Moon", "Nocturne Radio", 306e3),
	audioTrack(12, "North Window", "Nocturne Radio", 348e3),
	audioTrack(13, "Slow Voltage", "Nocturne Radio", 372e3),
	audioTrack(14, "Obsidian Tide", "Nocturne Radio", 39e4),
	audioTrack(15, "Last Call", "Nocturne Radio", 318e3),
	audioTrack(16, "Dawn Fold", "Nocturne Radio", 336e3)
];
var YOUTUBE_CATALOG = [
	yt("kJQP7kiw5Fk", "Despacito", "Luis Fonsi"),
	yt("JGwWNGJdvx8", "Shape of You", "Ed Sheeran"),
	yt("09R8_2nJtjg", "Sugar", "Maroon 5"),
	yt("fJ9rUzIMcZQ", "Bohemian Rhapsody", "Queen"),
	yt("hT_nvWreIhg", "Counting Stars", "OneRepublic"),
	yt("YQHsXMglC9A", "Hello", "Adele"),
	yt("pRpeEdMmmQ0", "Waka Waka", "Shakira"),
	yt("CevxZvSJLk8", "Roar", "Katy Perry"),
	yt("OPf0YbXqDm0", "Uptown Funk", "Mark Ronson ft. Bruno Mars"),
	yt("PT2_F-1esPk", "Closer", "The Chainsmokers"),
	yt("60ItHLz5WEA", "Faded", "Alan Walker"),
	yt("RgKAFK5djSk", "See You Again", "Wiz Khalifa"),
	yt("YykjpeuMNEk", "Hymn for the Weekend", "Coldplay"),
	yt("0KSOMA3QBU0", "Dark Horse", "Katy Perry"),
	yt("lWA2pjMjpBs", "Diamonds", "Rihanna"),
	yt("IcrbM1l_BoI", "Wake Me Up", "Avicii"),
	yt("lp-EO5I60KA", "Thinking Out Loud", "Ed Sheeran"),
	yt("nfWlot6h_JM", "Shake It Off", "Taylor Swift"),
	yt("e-ORhEE9VVg", "Blank Space", "Taylor Swift"),
	yt("YBHQbu5rbdQ", "Advanced Luxury", "Nocturne Selects"),
	yt("2Vv-BfVoq4g", "Perfect", "Ed Sheeran"),
	yt("0HDdjwpPM3Y", "Let Me Love You", "DJ Snake ft. Justin Bieber"),
	yt("PMivT7MJ41M", "Lean On", "Major Lazer"),
	yt("hLQl3WQQoQ0", "Someone Like You", "Adele"),
	yt("rYEDA3JcQqw", "Rolling in the Deep", "Adele"),
	yt("YVkUvmDQ3HY", "Love The Way You Lie", "Eminem ft. Rihanna"),
	yt("tAGnKpE4NCI", "Nothing Else Matters", "Metallica"),
	yt("1w7OgIMMRc4", "Sweet Child O' Mine", "Guns N' Roses"),
	yt("fKopy74weus", "In The End", "Linkin Park"),
	yt("eVTXPUF4Oz4", "Numb", "Linkin Park"),
	yt("lDK9QqIzhwk", "Livin' On A Prayer", "Bon Jovi"),
	yt("1k8craCGpgs", "Don't Stop Believin'", "Journey"),
	yt("btPJPFnesV4", "Eye of the Tiger", "Survivor"),
	yt("IxszlJppRQI", "Smells Like Teen Spirit", "Nirvana"),
	yt("4NRXx6U8ABQ", "Blinding Lights", "The Weeknd"),
	yt("TUVcZfQe-Kw", "Levitating", "Dua Lipa"),
	yt("TU3-lS_Gryk", "As It Was", "Harry Styles"),
	yt("H5v3kku4y6Q", "Heat Waves", "Glass Animals"),
	yt("gCo6JqGMi0M", "Flowers", "Miley Cyrus"),
	yt("gdZLi9oWNZg", "Dynamite", "BTS")
].map((t) => ({
	...t,
	thumbnailUrl: `https://i.ytimg.com/vi/${t.youtubeId}/hqdefault.jpg`
}));
function yt(youtubeId, title, artist) {
	return {
		id: `yt-${youtubeId}`,
		title,
		artist,
		durationMs: 0,
		source: "youtube",
		youtubeId
	};
}
function searchCatalog(query) {
	const q = query.trim().toLowerCase();
	if (!q) return [...NOCTURNE_COLLECTION, ...YOUTUBE_CATALOG].slice(0, 24);
	return [...NOCTURNE_COLLECTION, ...YOUTUBE_CATALOG].filter((t) => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q) || t.youtubeId && q.includes(t.youtubeId.toLowerCase()));
}
function cloneTrack(track, addedById, addedByName) {
	return {
		...track,
		id: uid("trk"),
		addedById,
		addedByName
	};
}
//#endregion
export { searchCatalog as i, YOUTUBE_CATALOG as n, cloneTrack as r, NOCTURNE_COLLECTION as t };
