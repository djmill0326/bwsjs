const html = "text/html";
const css  = "text/css";
const js   = "text/javascript";
const json = "application/json";
const wasm = "application/wasm";
const flac = "audio/flac";
const wav  = "audio/wav";
const ogg  = "audio/ogg";
const mp3  = "audio/mpeg";
const mp4  = "video/mp4";
const gif  = "image/gif";
const jpg  = "image/jpeg";
const png  = "image/png";
const webp = "image/webp";

// Export a sealed object to maintain immutability
export default Object.seal({
    html, css, js, json, wasm, flac, wav, ogg, mp3, mp4, gif, jpg, png, webp, ico: png
});