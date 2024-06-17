const local = true;
const socket = io(`http://${ local ? "localhost" : "ehpt.us" }:666`);

const form = document.getElementById("main");
const frame = document.getElementById("frame");

const get_client = () => form.children['term'].value;

frame.onclick = (e) => {
    if (e.target.href) {
        e.preventDefault();
        socket.emit("rpc", {
            client: get_client(),
            event: "update",
            data: e.target.href
        });
    }
}

form.onsubmit = (e) => {
    e.preventDefault();
    socket.emit("rpc", {
        event: "link",
        data: get_client()
    });
};

async function fetch_query(query) {
    const response = await fetch(`http://${local ? "localhost" : "ehpt.us" }:666/ls ${query}`);
    const data = await response.text();
    frame.innerHTML = data;
}

socket.on("connect", () => {
    console.log(socket.id); // x8WIv7-mJelg7on_ALbx
});
  
socket.on("disconnect", () => {
    console.log(socket.id); // undefined
});

socket.on("rpc", (payload) => {
    switch (payload.event) {
        case "location":
            fetch_query(payload.data);
            break;
    }
});