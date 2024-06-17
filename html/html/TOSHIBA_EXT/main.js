// Import the filesystem module
const fs = require('fs');

const readdir = (__dirname, cb) => {
  // Function to get current filenames
  // in directory
  fs.readdir(decodeURIComponent(__dirname), (err, files) => {
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
const url_is_local = false;

const url_domain = url_is_local ? localhost : domain;
const url_prefix = protocol + url_domain;
const url_primary = url_prefix + "/";
const url_find = url_prefix + ":3000/ls ";

const build_url = (dir, filename, use_find = true) => {
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

const peep = (res, dir, ignore = false) => {
  let output = "<h3>Found (\"" + dir + "\"): </h3><ul>";
  let found = false;

  readdir(dir, (files) => {
    if(files.length === 0) {
      res.send("<h3>Nothing found<h3>");
      return;
    }

    files.forEach(file => {
      let url;

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

const express = require('express');
const cors = require('cors');
const app = express()
const route = express.Router();
const port = 3000;

const server = require('http').createServer(app);
const io = require('socket.io')(server, {
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
    console.log('user disconnected');
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

route.get('/', (req, res) => {
  res.send("<h3>Welcome</h3>");
});

route.get('/ls%20', (req, res) => {
  peep(res, ".");
});

route.get('/ls%20:dir([A-Za-z0-9_/-\w]+)', (req, res) => {
  peep(res, req.params.dir);
})

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
