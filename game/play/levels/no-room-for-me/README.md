# No Room for Me (level 22)

Audio is stored as three base64 parts:

- `audio/no-room-for-me.mp3.b64.1`
- `audio/no-room-for-me.mp3.b64.2`
- `audio/no-room-for-me.mp3.b64.3`

`scripts/patch-hosting.mjs` joins and decodes them to
`audio/no-room-for-me.mp3` before the live hosting patch.
Source: user MP3 / Drive WAV, 34.8s.
