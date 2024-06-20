import { createServer } from "http"
import { createReadStream } from "fs"
import { createGzip } from "zlib"
import { stat } from "fs/promises"

const PORT = 80
const STATIC_ROOT = "./html"

// adjust mime lookup object as needed
import mimes from "./mime.mjs";

const mime = (url, res) => {
    const ext = url.substring(url.lastIndexOf(".") + 1, url.length)
    res.writeHead(200, "epic swag", { 'Content-Type': mimes[ext] })
}

const transform = (url) => {
    const decoded = decodeURIComponent(url);
    let output = STATIC_ROOT + decoded
    if (url.charAt(url.length - 1) === "/") output += "index.html"
    return output
}

const err = (url, res) => {
    console.log(`request for ${url} (not found)`)
    res.writeHead(404, `failed to get file at location <${url}>, ain't shit there.`)
    res.end()
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
            if (compress) res.setHeader("Content-Encoding", "gzip");
            res.setHeader("Cache-Control", "max-age=604800");
            res.setHeader("Last-Modified", stats.mtime.toUTCString());
            console.log(`request for ${url}`)
            mime(url, res);
            pipe(url, res, compress);
        } else err(url, res)
    } catch (_) { err(url, res) }
})

server.listen(PORT, () => console.log(`server listening on port ${PORT}`));