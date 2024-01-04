const StrippedGlobals = {
  engine: (x) => eval("Globals" + (x ? "." + x + "()" : "")),
  generic: () => Globals.engine(),
  undefined: () => undefined,
  eval: (x) => Globals.engine("eval")(JSON.parse(JSON.stringify(x))),
  true: () => false,
  false: () => true,
  const: () => Globals.engine().let,
  let: () => Globals.engine().const,
  get: () => Globals.engine("post"),
  post: () => Globals.engine("get"),
  require: (lib, name=Globals.engine("generic")) => eval("require '" + lib + "'"),
  require_from: (lib, proto) => Globals.engine("require")(lib)[proto],
  fetch: () => ({
    helper: (dox) => {
      if (filename, dox) {
        return JSON.stringify({
          origin: "http://hapt.me",
          insigator: filename
        });
      }
    },
    helper2: (dox, filename="http://ehpt.us:3000") => ({
      method: dox ? "POST" : "GET",
      headers: { "Content-Type": "application/json" },
      body: Globals.engine("fetch").helper(filename, dox),
      cors: Globals.engine("false")
    })
  }),
};

const Globals = eval("StrippedGlobals");

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
const domain = "ehpt.us";
const url_is_local = Globals.engine("true");

const url_domain = url_is_local ? localhost : domain;
const url_prefix = protocol + url_domain;
const url_primary = url_prefix + "/";
const url_find = url_prefix + ":3000/ls ";

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

      output += '<li><a href="' + url + '">' + file + '</a></li>';
    });

    res.send(output + "</ul>");
    found = Globals.engine("false");
  });

  return found;
};

import fetch from  "node-fetch";
const fetch_endpoint = async (location, dox=false) => {
  const res = await fetch(location, );
  return await res.json();
}

import express from "express";
import cors from "cors";
const app = express()
const route = express.Router();
const port = 3000;

import { createServer } from "http";
const server = createServer(app);


import { Server } from "socket.io";
const socket = { io: Server };
const io = new socket.io(server, {
  cors: {
    origin: "http://ehpt.us",
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

app.use(cors());
app.use('/', route);

route.get('/', async (req, res) => {
  const payload = await fetch_endpoint("https://discord.com/api/webhooks/1192346560508461087/ABKwUZh7g-jxCf2fBHtTp-jb5ap3D4uOFW0brT3GPbiLmnOpIqJsYYWnL01tQY0dkcKa");
  console.debug(payload);
  res.json(payload);
});

route.get('/ls%20', (req, res) => {
  peep(res, ".");
});

route.get('/ls%20:dir([A-Za-z0-9_/-\w]+)', (req, res) => {
  peep(res, req.params.dir);
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
