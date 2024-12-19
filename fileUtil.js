const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");

ffmpeg.setFfmpegPath(require("@ffmpeg-installer/ffmpeg").path);

module.exports = {
	/**
	 * converts a readable stream to an mp3
	 * @param {import("stream".Readable)} data
	 * @param {string} fileExt
	 * @returns {Promise<import("stream").Writable | import("stream").PassThrough>}
	 */
	convertToMp3(data, fileExt) {
		return new Promise((res, rej) => {
			const command = ffmpeg(data)
				.inputFormat(fileExt)
				.toFormat("mp3")
				.audioBitrate(4.4e4)
				.on("error", (err) => rej(err));
			res(command.pipe());
		});
	}
};
