console.log("ok now we ready");

String.prototype.contains = function contains(x) {
    return this.split(x).length > 1;
};

const form = document.getElementById("main");
const frame = document.getElementById("frame");
const portal = document.getElementById("porthole");
const music = document.getElementById("music");
let query = "";
let music_browser = {};

form.onsubmit = (e) => {
    e.preventDefault();
    const term = form.children['term'];
    query = term.value;
    fetch_query(query);
    socket.emit("rpc", {
        client, event: "location", data: query
    });
    console.log("form submission");

    if (!query.startsWith("music/")) {
        music_browser.remove && music_browser.remove();
    }
}

const update_link = (link) => {
    portal.src = link;
        if (link.contains("/music/")) {
            const list = link.split("/");
            const song = decodeURIComponent(list[list.length - 1]);
            console.log("now playing: " + song);
            update_music_browser(song);
        }
};

frame.onclick = (e) => {
    if (e.target.href) {
        e.preventDefault();
        update_link(e.target.href)
    }
}

let label_idx = 0;
const create_label_for = (el, text) => {
    const label = document.createElement("label");
    if (!el.id.length > 0) {
        el.id = label_idx++;
    }
    label.for = el.id;
    label.textContent = text;
    return label;
};

async function fetch_query(query) {
    const response = await fetch(`http://${local ? "localhost" : "ehpt.us" }:666/ls ${query}`);
    const data = await response.text();
    frame.innerHTML = data;
}

const music_browser_init = (song) => {
    const player = document.createElement("div");
    player.className = "music";
    const prev = document.createElement("button");
    const next = document.createElement("button");
    const prev_song = document.createElement("a");
    const current_song = document.createElement("a");
    const next_song = document.createElement("a");
    const list = document.getElementById("ol");

    prev.textContent = "<";
    next.textContent = ">";
    current_song.textContent = song;

    player.append(
        //create_label_for(prev_song, "prev"),
        //prev_song,
        //prev,
        //create_label_for(current_song, "now playing"),
        current_song,
        //next,
        //create_label_for(next_song, "next"),
        //next_song
    );
    music.append(player);

    music_browser = {
        update: (song) => {
            current_song.textContent = song;
        },
        remove: () => {
            player.remove();
            music_browser = {};
        }
    };
}

const update_music_browser = (song) => {
    if (music_browser.update) {
        music_browser.update(song);
    } else {
        music_browser_init(song);
    }
};

const local = true;
const socket = io(`http://${ local ? "localhost" : "ehpt.us" }:666`);

socket.on("connect", () => {
    console.log(socket.id); // x8WIv7-mJelg7on_ALbx
});
  
socket.on("disconnect", () => {
    console.log(socket.id); // undefined
});

let client = null;
socket.on("rpc", (payload) => {
    switch (payload.event) {
        case "link":
            client = payload.data;
            console.log("connected to client: " + client);
            console.log("sending location to " + client, query);
            socket.emit("rpc", {
                client, event: "location", data: query
            });
            break;
        case "update":
            portal.src = payload.data;
            update_link(payload.data);
            break;
    }
});