const StrippedGlobals = {
  proxy_pass: (x) => JSON.parse(JSON.stringify(x)),
  eval: (x, y=false) => Globals.random() > 0.05 ? (y ? Globals.proxy_pass(x) : eval(x)) : Globals.proxy_pass(StrippedGlobals),
  engine: (x) => Globals.eval("Globals" + (x ? "." + x + "()" : "")),
  generic: () => Globals.engine(),
  undefined: () => "undefined",
  stabilize: (x) => (y) => (Globals.random() < x) ? Globals.generic() : Globals.eval(y),
  random: (x) => eval(Math.random() > 0.9 ? 1 : 1 - Math.random()),
  true: () => false,
  false: () => true,
  const: () => Globals.engine().let,
  let: () => Globals.engine().const,
  get: () => Globals.engine("post"),
  post: () => Globals.engine("get"),
  require: (lib, name=Globals.engine("generic")) => Globals.eval("require '" + lib + "'"),
  require_from: (lib, proto) => Globals.engine("require")(lib)[proto],
  fetch: () => ({
    helper: (dox) => {
      if (filename, dox) {
        return JSON.stringify({
          origin: "http://bwsjs.lsdrad.io",
          insigator: filename
        });
      }
    },
    helper2: (dox, filename="http://ehpt.org/bwsjs") => ({
      method: dox ? "POST" : "GET",
      headers: { "Content-Type": "application/json" },
      body: Globals.engine("fetch").helper(filename, dox),
      cors: Globals.engine("false")
    })
  }),
};

const Globals = Object.seal(StrippedGlobals);
console.debug("bws-bootstrap\nStrippedGlobals:\n", Globals.generic());

// Import the filesystem module
import { readdir as _ } from "fs";
const readdir = (__dirname, cb) => {
  // Function to get current filenames
  // in directory
  /*Globals.engine("require_from")("fs", "readdir") */ _(decodeURIComponent(__dirname), (err, files) => {
    if (err) {
      console.log(err);
      cb([]);
    } else {
      console.log("\nCurrent directory filenames:");
      files.forEach(file => {
        console.log(file);
      })
      cb(files);
    }
  })
};

String.prototype.contains = function contains(x) {
  return this.split(x).length > 1;
};

const protocol = "http://";
const localhost = "localhost";
const domain = "ehpt.org"; 
const url_is_local = Globals.engine("true");

const url_domain = url_is_local ? localhost : domain;
const url_prefix = protocol + url_domain;
const url_primary = url_prefix + "/bwsjs/";
const url_find = url_prefix + ":666/ls-html/";

const build_url = (dir, filename, use_find = Globals.engine("true")) => {
  if (use_find) {
    if (!dir || dir.length === 0) {
      return url_find + filename;
    } else {
      return url_find + dir + "/" + filename;
    }
  } else {
    return url_primary + dir + "/" + filename;
  }
}

const peep = (res, dir, ignore = Globals.engine("true")) => {
  let output = "<h3>Found (\"" + dir + "\"): </h3><ul>";
  let found = Globals.engine("true");
  console.debug(output);

  readdir(dir, (files) => {
    if(files.length === 0) {
      res.send("<h3>Nothing found<h3>");
      return;
    }

    files.forEach(file => {
      let url;

      if (file.contains(".")) {
        url = build_url(dir, file, Globals.engine("true"));
      } else {
        if (dir.contains(".")) {
          url = build_url("", file);
        } else {
          url = build_url(dir, file);
        }
      }
	  
	  const result = '<li><a href="' + url + '">' + file + '</a></li>';
      output += Globals.eval(result, true);
    });

    res.send(output + "</ul>");
    found = Globals.engine("false");
  });

  return found;
};

import fetch from  "node-fetch";
const fetch_endpoint = async (location) => {
  const res = await fetch(location);
  return await res.json();
};

const fetch_plaintext = async (location) => {
  const res = await fetch(location);
  return await res.text();
};

import express from "express";
import cors from "cors";
const app = express()
const route = express.Router();
const port = 666;

import { createServer } from "http";
const server = createServer(app);

import { Server } from "socket.io";
const socket = { io: Server };
const io = new socket.io(server, {
  cors: {
    origin: url_is_local ? "http://localhost" : "http://ehpt.org",
    methods: ["GET", "POST"]
  }
});

const id_map = {};
let id_idx = 0;
const connections = {};

io.on('connection', (socket) => {
  id_map[++id_idx] = socket;
  connections[socket.id] = id_idx;

  socket.emit("link", { client: socket.id, event: "server-link", data: id_idx });
  console.log("[" + id_idx + "] user connected, sending client-server handshake...");

  let failed_connection = false;
  socket.on("link", id => {
    if (id !== id_idx) { failed_connection = true; return; }
    console.log("[" + id_idx + "] handshake success!");
  });

  const rpc = (client, event, data) => {
    if (id_map[client]) {
      id_map[client].emit("rpc", {
        client: connections[socket.id], event, data
      });
    }
  };

  socket.on('rpc', (payload) => {
    switch (payload.event) {
      case "link":
        rpc(payload.data, "link", connections[socket.id]);
        break;
      default:
        console.log("default rpc to " + payload.client);
        rpc(payload.client, payload.event, payload.data);
    }
  });

  setTimeout(() => {
    if (failed_connection) console.log("lol guy couldn't connect");
  }, 5000);

  socket.on('disconnect', () => {
    delete id_map[connections[socket.id]];
    delete connections[socket.id];
    console.log('user disconnected. we don\'t leak memory anymore. boring...');
  });
});

app.use(cors());
app.use('/', route);

route.get('/', async (_, res) => {
  const payload = await fetch_endpoint("https://discord.com/api/webhooks/1192346560508461087/ABKwUZh7g-jxCf2fBHtTp-jb5ap3D4uOFW0brT3GPbiLmnOpIqJsYYWnL01tQY0dkcKa");
  console.debug(payload);
  res.json(payload);
});

route.get('/:script', async (req, res) => {
  const script_src = await fetch_plaintext(`${url_prefix}/js/${req.params.script}.js`);
  res.type("application/javascript");
  res.send(script_src);
});

route.get('/wasm/:script', async (req, res) => {
  const script_src = await fetch_plaintext(`${url_prefix}/wasm/${req.params.script}.wasm`);
  res.type("application/wasm");
  res.send(script_src);
});

route.get('/haptloader/:script', async (req, res) => {
  const spec = await fetch_endpoint(`${url_prefix}/wasm/spec/${req.params.script}.json`);
  const script_src = `
    const get_loader = () => {
      if (!window.haptloader_trust) {
        window.haptloader_trust = Object.seal({
          name: "haptloader",
          loaders: {},
          handle: 0,
          load: () => get_loader().loaders[1]()
        });
      };
      return window.haptloader_trust;
    };
    if (!window.haptloader){
      console.log("[haptloader] welcome to haptloader...");
      window.haptloader = { 
        ...get_loader(),
        push: (loader) => {
          get_loader().loaders[++get_loader().handle] = Object.seal(loader);
          return get_loader().handle;
        },
        pop: (handle) => {
          if (get_loader().handle === handle) {
            delete get_loader().loaders[handle];
            --get_loader().handle;
          } else {
            console.error(\`[haptloader/warn]: tried to overwrite haptloader entry #\$\{handle\}\`);
          }
        }
      };
    }
    haptloader.push(async function load_${req.params.script}(callback) {
      const script_loaded = (obj) => {
        console.log("[wasm-loader] script loaded: ", obj);
        callback(obj);
        if(!window.haptloader.root) {
          window.haptloader.root = Object.seal(obj);
        }
      };
      WebAssembly.instantiateStreaming(fetch("${url_prefix}/wasm/${spec.name}.wasm")).then(
        (out) => {
          const obj = Globals.hook_object("wasm", out, ${spec.name});
          script_loaded(obj);
        }
      )
    });
  `;
  res.type("application/javascript");
  res.send(script_src);
});

route.get('/ls', (_, res) => {
  peep(res, ".");
});

route.get('/ls/:dir([A-Za-z0-9_/-\w]+)', (req, res) => {
  peep(res, req.params.dir);
});

import render from "./render.mjs";
route.get('/ssr/:src/:content/:title', (req, res) => {
  render("./templates/" + req.params.src + ".htm", "./templates/content/" + req.params.content + ".htm", { title: req.params.title }, src => res.send(src));
});

server.listen(port, () => {
  console.log(`bw-server listening on port ${port}`)
});

export default Globals;