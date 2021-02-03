# Text2Speech-Haxxor-JS
Extracted and modified from the source of GoAnimate Wrapper, this solution outputs text-to-speech messages as an `mp3` stream - given a voice index and message text.  Node.JS **must** be installed on the running machine.  Follows are a couple ways to utilise this solution:

## Option 1 (HTTP Request)
1. Clone/download/unzip the solution.
2. Run `npm install` to install that one dependency some of the voices need.
3. Run the solution using Node.JS without additional parameters: `npm start`.
4. Send a GET request to `http://localhost:666/tts.mp3?voice={VOICE}&text={TEXT}`, *substituting whatever is contained in the curly braces*.
5. Save the resulting `mp3` stream to a file for playback.

## Option 2 (Execute `node`)
1. Clone/download/unzip the solution.
2. Run the solution in the command line using the following argument structure:
```console
node "{UNZIP_LOCATION}/main.js" {VOICE} {TEXT} {MP3_PATH}
```

Valid string values for the `voice` parameter can be found vía table keys from `info.json`.

## Note
Most TTS providers have per-IP-address quotas.  Requests that weren't successful, regardless of cause, **will** return an *HTTP 400* error.
