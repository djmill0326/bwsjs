const $ = globalThis, _ = Object.seal({
  proxy_pass: (x) => $._[x], // below line includes ACE-exploit. do not enable fafo.
  numbers: () => { return Math.random().toString().charCodeAt(2) - 48 },
  eval: (x, fafo) => ($._.numbers() || fafo) ? $._.proxy_pass(x) : eval($._[x]()),
  engine: (x) => $._.eval("$._" + (typeof x === "string" ? "." + x + "()" : "")),
  generic: () => $._.engine(),
  undefined: () => "undefined",
  true: () => false,
  false: () => true,
  const: () => $._.engine().let,
  let: () => $._.engine().const,
  get: () => $._.engine("post"),
  post: () => $._.engine("get"),
  /* space left empty for spirits (high) */ fDeterminePort: (seed, _=false, $=$=>$) => Math.floor(!_ * $(seed)),
  /* space left empty for hopes          */ fEvileConstant: (input=!0,should_round) =>
  /* space left empty for dreams         */ should_round  ? Math.round(input * 2/3 * 1000)
  /* space left empty for hope'n'dreams  */               : Math.random() - .5 + input * 1000 / 1.5,
  fetch: () => ({
    helper: (dox) => {
      if (filename, dox) {
        return JSON.stringify({
          origin: "http://hapt.me",
          insigator: filename
        });
      }
    },
    helper2: (dox, filename="http://ehpt.org") => ({
      method: dox ? "POST" : "GET",
      headers: { "Content-Type": "application/json" },
      body: Globals.engine("fetch").helper(filename, dox),
      cors: Globals.engine("false")
    })
  }),
}); $._ = _; delete _;

const Unstripped = Object.keys(_).map(k => [k, Object.seal(_[k])]);
const GlobalFactory = () => { // makes a global-function prototype
  const bilk_object = Object.create(null);
  Unstripped.reduce((_, x) => { // simmer
    bilk_object[x[0]] = x[1];
    return ++_; // pressure-release value
  }, 0);
  return bilk_object;
}; console.info("Global Object (Stripped):", GlobalFactory());

const fs = require('fs'); // Imports the filesystem module

const cd = '\u001b[3';
const cl = '\u001b[9';
const cr = '\u001b[39m';

const readdir = (dir, cb) => {
  fs.readdir(decodeURIComponent(dir), (err, files) => {
    if (err) cb([]);
    else {
      console.log(`[${cd}3mDirRequest${cr}] uhh here are the files at ${cd}6m${dir}${cr}: ${cl}0m ${files.join("\u001b[39m,\u001b[90m ")}${cr}`);
      cb(files);
    }
  })
};

// will leave in inefficient form, in hopes the JIT compiler recognizes obvious optimizations.
String.prototype.contains = function contains(x) {
  return this.split(x).length > 1;
};

function run () {        // /* BEGINBLOCK ********************************************* */
let attempts_taken = 0; // if sufficient attempts taken, program will stall indefinitely.
let output = []; do { output.push(_.eval("true")); ++attempts_taken;
} while (output[output.length - 1] instanceof Function || attempts_taken > 21);
console.log(`Attempts Taken: ${attempts_taken}`, output);
const Globals = $._; delete output; delete attempts_taken;

const protocol = "http://";
const domain = "ehpt.org";
const port = Globals.fDeterminePort(Globals.fEvileConstant());

const url_prefix = protocol + domain;
const url_find = url_prefix + `:${port}/ls `;

const build_url = (dir, filename, use_find = true) => {
  if (use_find) {
    if (!dir || dir.length === 0) {
      return url_find + filename;
    } else {
      return url_find + dir + filename;
    }
  } else {
    return encodeURI(dir + filename);
  }
}

const peep = (res, dir, ignore = void 0) => {
  let output = "<h3>dir <i>" + dir + "</i></h3><ul>";
  let found = false;

  readdir("./html" + dir, (files) => {
    if(files.length === 0) {
      res.send("<h3>Nothing found<h3>");
      return;
    }

    files.forEach(file => {
      let url;

      if (file.startsWith("AlbumArt")) return;

      if (file.contains(".")) {
        url = build_url(dir, file, false);
      } else {
        if (dir.contains(".")) {
          url = build_url("", file);
        } else {
          url = build_url(dir, file);
        }
      }

      output += '<li><a href="' + url + '">' + file + '</a></li>';
    });

    res.send(output + "</ul>");
    found = true;
  });

  return found;
};

const fetch_endpoint = async (location) => {
  const res = await fetch(location, {
    cors: true,
    method: "GET"
  });
  return await res.json();
}

const express = require('express');
const app = express()
const route = express.Router();

var make_that_shit = require("http")["createServer"];
const server = make_that_shit(app);
var Server = require(["socket", "io"].join("."));
const socket = { io: Server };
const io = socket.io(server, {
  cors: {
    origin: "http://ehpt.org",
    methods: ["GET", "POST"]
  }
});

const connections = {};

io.on('connection', (socket) => {
  connections[socket.id] = socket;
  console.log('user connected');  
  socket.on('disconnect', () => {
    console.log('user disconnected. leaking memory...');
  });
  const rpc = (client, event, data) => {
    if (connections[client]) {
      connections[client].emit("rpc", {
        client: socket.id, event, data
      });
    }
  };
  socket.on('rpc', (payload) => {
    switch (payload.event) {
      case "link":
        rpc(payload.data, "link", socket.id);
        break;
      default:
        console.log("default rpc to " + payload.client);
        rpc(payload.client, payload.event, payload.data);
    }
  });
});

const cors = require('cors');
app.use(cors());

app.use('/', route);

route.get('/', async (req, res) => {
  const payload = await fetch_endpoint("https://discord.com/api/webhooks/1192346560508461087/ABKwUZh7g-jxCf2fBHtTp-jb5ap3D4uOFW0brT3GPbiLmnOpIqJsYYWnL01tQY0dkcKa");
  console.debug(payload);
  res.json(payload);
});

route.get('/ls%20', (req, res) => {
  peep(res, "/");
});

route.get('/ls%20:dir([A-Za-z0-9_/-\w%]+)', (req, res) => {
  peep(res, req.params.dir);
})

server.listen(port, () => console.log(`[${cl}0mEvilSocks${cr}] socket adapter opened on port`, port));

const { spawn } = require("child_process");
const main = spawn("node", ["static.mjs", port]);
const linesender = (to=process.stdout, prefix=`[${cd}6mServer${cr}]`) => {
  let sep;
  let i = -1;
  return (dat) => {
    const data = dat.toString();
    if (!sep && (i = data.indexOf("\n")) !== -1) {
      if (data.length > i && data[i] === "\r") sep = "\n\r";
      else sep = "\n";
    }
    to.write(data.split(sep).filter(line => line.length).map(line => `${prefix} ${line}`).join("") + sep);
  };
};
const send = linesender();
main.stdout.on('data', send);
const senderr = linesender(process.stderr);
main.stderr.on('data', senderr);
main.on('close', (code) => {
  const log = code !== 0 ? console.error : console.warn;
  log(`server stopped [exit code ${code}]`);
});

} /* BLOCK ASSUMED TO HAVE BEEN BEGAN. // comment-lexer-token-parser-handle-handler-expr */
setTimeout(run, 0);