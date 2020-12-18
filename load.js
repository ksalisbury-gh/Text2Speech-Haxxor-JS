const cp = require("child_process");
const info = require("./info.json");
const load = require("./main");
const http = require("http");
const url = require("url");
const args = process.argv;
const fs = require("fs");

if (args.length > 4) {
	load(args[2], args[3]).then((buffer) => {
		fs.writeFileSync(args[4], buffer);
		switch (args[5]) {
			case undefined:
				break;
			case "ffplay":
			case "ffprobe":
			default:
				cp.execSync(`${args[5]} ${args[4]}`);
				break;
		}
	});
} else if (args[2] == "list") {
	console.log("LANGUAGES:", info.languages);
	console.log("\nVOICES:");
	const t = {};
	for (let i in info.voices) {
		let l = info.voices[i].language;
		(t[l] = t[l] ?? new Set()).add(i);
	}
	console.dir(t, {
		maxArrayLength: null,
		compact: false,
		sorted: true,
	});
} else
	http
		.createServer(async (req, res) => {
			const query = url.parse(req.url, true).query;
			try {
				const buffer = await load(query.voice, query.text);
				res.setHeader("Content-Type", "audio/mp3");
				res.end(buffer);
			} catch {
				res.statusCode = 400;
				res.end();
			}
		})
		.listen(process.env.PORT || process.env.SERVER_PORT || 80);
