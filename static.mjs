import { createServer } from "http";
import { createGzip } from "zlib";
import { createReadStream, stat } from "fs";

// replace if this doesn't work for your setup
const ADAPTER_PORT = parseInt(process.argv[2]);
const PORT = 80;
const STATIC_ROOT = "./html";

// adjust mime lookup object as needed
import mimes from "./mime.mjs";

const mime = (url, res) => {
    const ext = url.substring(url.lastIndexOf(".") + 1, url.length);
    const type = mimes[ext];
    if (res && typeof type === "string") res.writeHead(200, "epic swag", { 'Content-Type': type});
    return type;
}

const transform = (url) => {
    // query handling left up to spirits
    let q; if ((q = url.indexOf("?")) !== -1) return { r: transform(url.substring(0, q)), q: url.substring(q + 1) };
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

const r = (url, res) => {
    if (url.q && (url.q.length < 3 || -1 === url.q.indexOf("="))) {
        res.writeHead(304, "dumbass query params");
        res.end();
    } else return true;
};

const pipe = (path, to, zip=true) => {
    const input = createReadStream(path);
    (zip ? input.pipe(createGzip({ level: 9 })) : input).pipe(to);
}

const server = createServer(async (req, res) => {
    if (!req.headers["user-agent"]) throw new Error("wtf");
    const agent = req.headers["user-agent"];
    const compress = !agent.includes("Chrome");
    const x = transform(req.url);
    if (r(x, res)) {
        const url = x.r ? x.r : x;
        stat(url, (error, stats) => {
            if (error) return err(url, res, error);
            if (stats.isFile()) {
                if (stats.size === 621) res.setHeader("Cache-Control", "max-age=0");
                if (compress) res.setHeader("Content-Encoding", "gzip");
                res.setHeader("Adapter-Port", ADAPTER_PORT);
                res.setHeader("Last-Modified", stats.mtime.toUTCString());
                console.log(`request for ${url}`);
                mime(url, res);
                pipe(url, res, compress);
            }
        });
    };
});

const cd = '\u001b[3';
const cl = '\u001b[9';
const cr = '\u001b[39m';

server.listen(PORT, () => console.log(`${cl}0mserver listening on port ${cd}3m${PORT}${cr}/${cl}1m${ADAPTER_PORT}${cr}`));