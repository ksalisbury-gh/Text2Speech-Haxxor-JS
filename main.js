const http = require('http');
const load = require('./load');
const url = require('url');
const fs = require('fs');
const args = process.argv;

if (args.length > 4)
	load(args[2], args[3]).then(buffer => fs.writeFileSync(args[4], buffer));
else
	http.createServer(async (req, res) => {
		const query = url.parse(req.url, true).query;
		try {
			const buffer = await load(query.voice, query.text);
			res.setHeader('Content-Type', 'audio/mp3');
			res.end(buffer);
		}
		catch{
			res.statusCode = 400;
			res.end();
		}
	}).listen(process.env.PORT || process.env.SERVER_PORT || 80);