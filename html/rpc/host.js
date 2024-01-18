function log(spec, ...data) {
    console.log("[hapt-rpc/" + spec + "]", ...data)
}

const form = document.getElementById("main");
const frame = document.getElementById("frame");
const portal = document.getElementById("porthole");
let query = "";

if (form) {
    form.onsubmit = (e) => {
        e.preventDefault();
        const term = form.children['term'];
        query = term.value;
        fetch_query(query);
        socket.emit("rpc", {
            client, event: "location", data: query
        });
        log("link", "form submission");
    }
}

const update_link = (link) => {
    if(portal) {
        portal.src = link;
    }
};

if (frame) {
    frame.onclick = (e) => {
        if (e.target.href) {
            e.preventDefault();
            update_link(e.target.href)
        }
    }
}

async function fetch_query(query) {
    const response = await fetch("http://ehpt.us:666/ls%20" + query);
    const data = await response.text();
    if (frame) {
        frame.innerHTML = data;
    }
}

const socket = io("http://ehpt.us:666");

socket.on("connect", () => {
    log("connect", "ok now we ready", socket.id);
});
  
socket.on("disconnect", () => {
    log("disconnect", "oh no :(", socket.id);
});

let client = null;
socket.on("rpc", (payload) => {
    switch (payload.event) {
        case "link":
            client = payload.data;
            log("link", "connected to client: ", client);
            log("link", "sending location to: ", client, query);
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