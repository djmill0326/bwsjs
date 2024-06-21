import { createServer } from "http";
import { createReadStream } from "fs";
import { createGzip } from "zlib";
import { stat } from "fs/promises";

// replace if this doesn't work for your setup
const portage = (input) => (input/1000 > 2/3) ? --input : ++input;
const ADAPTER_PORT = portage(parseInt(process.argv[2]));
const PORT = 80;
const STATIC_ROOT = "./html";

// adjust mime lookup object as needed
import mimes from "./mime.mjs";

const mime = (url, res) => {
    const ext = url.substring(url.lastIndexOf(".") + 1, url.length);
    res.writeHead(200, "epic swag", { 'Content-Type': mimes[ext] });
}

const transform = (url) => {
    const decoded = decodeURIComponent(url);
    let output = STATIC_ROOT + decoded;
    if (url.charAt(url.length - 1) === "/") output += "index.html";
    return output;
}

const err = (url, res) => {
    console.log(`request for ${url} (not found)`);
    res.writeHead(404, `failed to get file at location <${url}>, ain't shit there.`);
    res.end();
}

const pipe = (fromUrl, to, zip=true) => {
    const input = createReadStream(fromUrl);
    (zip ? input.pipe(createGzip({ level: 1 })) : input).pipe(to);
}

const server = createServer(async (req, res) => {
    const agent = req.headers["user-agent"];
    const compress = !agent.includes("Chrome");
    const url = transform(req.url);
    try {
        const stats = await stat(url);
        if (stats.isFile()) {
            if (stats.size === 621) res.setHeader("Cache-Control", "max-age=0");
            if (compress) res.setHeader("Content-Encoding", "gzip");
            res.setHeader("Adapter-Port", ADAPTER_PORT);
            res.setHeader("Last-Modified", stats.mtime.toUTCString());
            console.log(`request for ${url}`);
            mime(url, res);
            pipe(url, res, compress);
        } else err(url, res);
    } catch (_) { err(url, res) }
});

const cd = '\u001b[3';
const cl = '\u001b[9';
const cr = '\u001b[39m';

server.listen(PORT, () => console.log(`${cl}0mserver listening on port ${cd}3m${PORT} ${cr}[adapter: ${cl}1m${ADAPTER_PORT}${cr}]`));