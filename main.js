const voices = require("./info").voices;
const fileUtil = require("./fileUtil.js");
const brotli = require("brotli");
const https = require("https");
const base64 = require("js-base64");
const {v4 : uuidv4} = require('uuid');

// Fallback option for compatibility between Wrapper and https://github.com/Windows81/Text2Speech-Haxxor-JS.
let get;
try {
	get = require("../misc/get");
} catch {
	get = require("./get");
}

/**
 * uses tts demos to generate tts
 * @param {string} voiceName
 * @param {string} rawText
 * @returns {Promise<import("http").IncomingMessage>}
 */
module.exports = function processVoice(voiceName, rawText) {
	return new Promise((res, rej) => {
		const voice = voices[voiceName];
		if (!voice) {
			return rej("The voice you requested is unavailable.");
		}

		// kept around as a var until i reimplement flags, maybe in the decomp
		let flags = {};
		let text = rawText.substring(0, 180);

		try {
			switch (voice.source) {
				case "polly": {
					const body = new URLSearchParams({
						msg: text,
						lang: voice.arg,
						source: "ttsmp3"
					}).toString();

					const req = https.request(
						{
							hostname: "ttsmp3.com",
							path: "/makemp3_new.php",
							method: "POST",
							headers: { 
								"Content-Length": body.length,
								"Content-type": "application/x-www-form-urlencoded"
							}
						},
						(r) => {
							let body = "";
							r.on("data", (c) => body += c);
							r.on("end", () => {
								const json = JSON.parse(body);
								if (json.Error == 1) {
									return rej(json.Text);
								}

								https
									.get(json.URL, res)
									.on("error", rej);
							});
							r.on("error", rej);
						}
					)
					req.on("error", rej);
					req.end(body);
					break;
				}

				case "nuance": {
					const q = new URLSearchParams({
						voice_name: voice.arg,
						speak_text: text,
					}).toString();

					https
						.get(`https://voicedemo.codefactoryglobal.com/generate_audio.asp?${q}`, res)
						.on("error", rej);
					break;
				}

				case "cepstral": {
					let pitch;
					if (flags.pitch) {
						pitch = +flags.pitch;
						pitch /= 100;
						pitch *= 4.6;
						pitch -= 0.4;
						pitch = Math.round(pitch * 10) / 10;
					} else {
						pitch = 1;
					}
					https.get("https://www.cepstral.com/en/demos", async (r) => {
						const cookie = r.headers["set-cookie"];
						const q = new URLSearchParams({
							voiceText: text,
							voice: voice.arg,
							createTime: 666,
							rate: 170,
							pitch: pitch,
							sfx: "none"
						}).toString();

						https.get(
							{
								hostname: "www.cepstral.com",
								path: `/demos/createAudio.php?${q}`,
								headers: { Cookie: cookie }
							},
							(r) => {
								let body = "";
								r.on("data", (b) => body += b);
								r.on("end", () => {
									const json = JSON.parse(body);

									https
										.get(`https://www.cepstral.com${json.mp3_loc}`, res)
										.on("error", rej);
								});
								r.on("error", rej);
							}
						).on("error", rej);
					}).on("error", rej);
					break;
				}

				case "voiceforge": {
					const q = new URLSearchParams({						
						msg: text,
						voice: voice.arg,
						email: "null"
					}).toString();
					
					https.get({
						hostname: "api.voiceforge.com",
						path: `/swift_engine?${q}`,
						headers: { 
							"User-Agent": "just_audio/2.7.0 (Linux;Android 11) ExoPlayerLib/2.15.0",
							"HTTP_X_API_KEY": "8b3f76a8539",
							"Accept-Encoding": "identity",
							"Icy-Metadata": "1",
						}
					}, (r) => {
						fileUtil.convertToMp3(r, "wav").then(res).catch(rej);
					}).on("error", rej);
					break;
				}

				case "vocalware": {
					const [EID, LID, VID] = voice.arg;
					const q = new URLSearchParams({
						EID,
						LID,
						VID,
						TXT: text,
						EXT: "mp3",
						FNAME: "",
						ACC: 15679,
						SceneID: 2692823,
						HTTP_ERR: "",
					}).toString();

					console.log(`https://cache-a.oddcast.com/tts/genC.php?${q}`)
					https
						.get(
							{
								hostname: "cache-a.oddcast.com",
								path: `/tts/genC.php?${q}`,
								headers: {
									"Host": "cache-a.oddcast.com",
									"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:107.0) Gecko/20100101 Firefox/107.0",
									"Accept": "*/*",
									"Accept-Language": "en-US,en;q=0.5",
									"Accept-Encoding": "gzip, deflate, br",
									"Origin": "https://www.oddcast.com",
									"DNT": 1,
									"Connection": "keep-alive",
									"Referer": "https://www.oddcast.com/",
									"Sec-Fetch-Dest": "empty",
									"Sec-Fetch-Mode": "cors",
									"Sec-Fetch-Site": "same-site"
								}
							}, res
						)
						.on("error", rej);
					break;
				}

				case "acapela": {
					let req = https.get(
						{
							hostname: "acapela-group.com",
							path: "/www/static/website/demoOptionsDef_voicedemo.php",
							headers: {
								"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
								"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 OPR/114.0.0.0",
								"Origin": "https://www.acapela-group.com/demos/",
								"Referer": "https://www.acapela-group.com/demos/"
							},
						},
						(r) => {
							let buffers = [];
							r.on("data", (b) => buffers.push(b));
							r.on("end", () => {
								const vaasOptionsHTML = Buffer.concat(buffers);
								const beg = vaasOptionsHTML.indexOf("var vaasOptions = ") + 18;
								const end = vaasOptionsHTML.indexOf(";", beg);
								const vaasOptions = JSON.parse(vaasOptionsHTML.subarray(beg, end));
								let req = https.request(
									{
										hostname: "h-ir-ssd-1.acapela-group.com",
										path: "/webservices/1-60-00/UrlMaker.json",
										method: "POST",
										headers: {
											"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
											"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 OPR/114.0.0.0",
											"Origin": "https://www.acapela-group.com/demos/",
											"Referer": "https://www.acapela-group.com/demos/"
										},
									},
									(r) => {
										let buffers = [];
										r.on("data", (d) => buffers.push(d));
										r.on("end", () => {
											const json = JSON.parse(Buffer.concat(buffers));
											https
												.get(json.snd_url, res)
												.on("error", rej);
										});
										r.on("error", rej);
									}
								).on("error", rej);
								req.end(`{"cl_login":"${vaasOptions.login}","cl_app":"${vaasOptions.app}","session_start":"${vaasOptions.session.start}","session_time":"${vaasOptions.session.time}","session_key":"${vaasOptions.session.key}","req_voice":"${voice.arg}","req_text":"${text}"}`);
							});
						}
					).on("error", rej);
					req.end();
					break;
				}

				case "svox": {
					const q = new URLSearchParams({
						apikey: "e3a4477c01b482ea5acc6ed03b1f419f",
						action: "convert",
						format: "mp3",
						voice: voice.arg,
						speed: 0,
						text: text,
						version: "0.2.99",
					}).toString();

					https
						.get(`https://api.ispeech.org/api/rest?${q}`, res)
						.on("error", rej);
					break;
				}

				case "acapelaOld": {
					https
						.get(`https://voice.reverso.net/RestPronunciation.svc/v1/output=json/GetVoiceStream/voiceName=${voice.arg}?inputText=${base64.encode(text)}`, res)
						.on("error", rej);
					break;
				}

				case "watson": {
					https.get(
						{
							hostname: "ibm.com",
							path: "/demos/live/tts-demo/api/tts/session",
							headers: {
								"Origin": "https://www.ibm.com",
								"Referer": "https://www.ibm.com/demos/live/tts-demo/self-service/home",
								"Accept": "application/json, text/plain, */*"
							},
						}, async (r) => {
							const cookie = r.headers["set-cookie"];
							const uuid = uuidv4();
							https.get(
								{
									hostname: "ibm.com",
									path: "demos/live/tts-demo/api/tts/store",
									headers: {
										"Cookie": cookie,
										"Origin": "https://www.ibm.com",
										"Referer": "https://www.ibm.com/demos/live/tts-demo/self-service/home",
										"Accept": "application/json, text/plain, */*",
										"Content-Type": "application/json; charset=utf-8"
									},
								},
								(r) => {
									let buffers = [];
									r.on("data", (b) => buffers.push(b));
									r.on("end", () => {
										https
											.get(`https://www.ibm.com/demos/live/tts-demo/api/tts/newSynthesizer?voice=${voice.arg}&id=${uuid}`, res)
											.on("error", rej);
										req.end(`{"ssmlText": "<prosody pitch="0%" rate="-0%">${text}</prosody>","sessionID": "${uuid}"}`);
									});
								}
							).on("error", rej);
							req.end();
						})
					}

				case "readloud": {
					const req = https.request(
						{
							hostname: "101.99.94.14",														
							path: voice.arg,
							method: "POST",
							headers: { 			
								Host: "tts.town",					
								"Content-Type": "application/x-www-form-urlencoded"
							}
						},
						(r) => {
							let buffers = [];
							r.on("data", (b) => buffers.push(b));
							r.on("end", () => {
								const html = Buffer.concat(buffers);
								const beg = html.indexOf("/tmp/");
								const end = html.indexOf("mp3", beg) + 3;
								const path = html.subarray(beg, end).toString();

								if (path.length > 0) {
									https.get({
										hostname: "101.99.94.14",	
										path: `/${path}`,
										headers: {
											Host: "tts.town"
										}
									}, res)
										.on("error", rej);
								} else {
									return rej("Could not find voice clip file in response.");
								}
							});
						}
					);
					req.on("error", rej);
					req.end(
						new URLSearchParams({
							but1: text,
							butS: 0,
							butP: 0,
							butPauses: 0,
							but: "Submit",
						}).toString()
					);
					break;
				}

				case "cereproc": {
					const req = https.request(
						{
							hostname: "www.cereproc.com",
							path: "/themes/benchpress/livedemo.php",
							method: "POST",
							headers: {
								"content-type": "text/xml",
								"accept-encoding": "gzip, deflate, br",
								origin: "https://www.cereproc.com",
								referer: "https://www.cereproc.com/en/products/voices",
								"x-requested-with": "XMLHttpRequest",
								cookie: "Drupal.visitor.liveDemo=666",
							},
						},
						(r) => {
							var buffers = [];
							r.on("data", (d) => buffers.push(d));
							r.on("end", () => {
								const xml = String.fromCharCode.apply(null, brotli.decompress(Buffer.concat(buffers)));
								const beg = xml.indexOf("<url>") + 5;
								const end = xml.lastIndexOf("</url>");
								const loc = xml.substring(beg, end).toString();
								https.get(loc, res).on("error", rej);
							});
							r.on("error", rej);
						}
					);
					req.on("error", rej);
					req.end(
						`<speakExtended key='666'><voice>${voice.arg}</voice><text>${text}</text><audioFormat>mp3</audioFormat></speakExtended>`
					);
					break;
				}

				case "tiktok": {
					const req = https.request(
						{
							hostname: "tiktok-tts.weilnet.workers.dev",
							path: "/api/generation",
							method: "POST",
							headers: {
								"Content-type": "application/json"
							}
						},
						(r) => {
							let body = "";
							r.on("data", (b) => body += b);
							r.on("end", () => {
								const json = JSON.parse(body);
								if (json.success !== true) {
									return rej(json.error);
								}

								res(Buffer.from(json.data, "base64"));
							});
							r.on("error", rej);
						}
					).on("error", rej);
					req.end(JSON.stringify({
						text: text,
						voice: voice.arg
					}));
					break;
				}
			}
		} catch (e) {
			return rej(e);
		}
	});
};
