# Text2Speech-Haxxor-JS
Extracted from the source of GoAnimate Wrapper, this solution outputs text-to-speech messages as an `mp3` stream - given a voice index and message text.  Follows is one way to run the solution:
1. Clone and run the solution using Node.JS *(no dependencies required)*.
2. Send a GET request to `http://localhost:80/?voice={VOICE}&text={TEXT}` (replace whatever is contained in curly braces).
3. Save the resulting `mp3` stream to a file for playback.

Valid names for the `voice` parameter can be found among the indexes of the `voice` table in `info.json`.

## Note
Most TTS providers have per-IP-address quotas.  Requests that weren't successful, regardless of cause, **will** return an *HTTP 400* error.
