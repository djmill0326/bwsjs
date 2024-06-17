import net from "net";

const connections = new Map();

let on_connect = null;
let on_data = null;

export const set_data_callback = f => on_data = f;

export const str_addr    = address => address.address + ":" + address.port;
export const remote_addr = socket => str_addr({ address: socket.remoteAddress, port: socket.remotePort });

const handle_socket_connection = (socket, name) => {
    connections.set(name, socket);
    socket.on("data", (data) => on_data ? on_data(data, socket, name) : void 0);
    socket.on("close", () => {
        console.log("[ipc] socket disconnected", name);
        connections.delete(name);
    });
    socket.on("error", (err) => 
        console.warn("[ipc] something happened (this likely isn't an error) \
            \n", err.toString().split("\n").map(x => 
x.substr(0, 80 * 4)).join("\n"))); return false; }; // :)

const server = net.createServer(socket => {
    const name = remote_addr(socket);
    console.log("[ipc] incoming socket connection:", name);
    handle_socket_connection(socket, name);
    if (on_connect) on_connect(socket, name);
});

export const open = (port, callback, connection_callback=null) => {
    on_connect = connection_callback;
    if (!server.listening) server.listen(port, 100, callback);
};

export const connect = (port, host, callback=null) => {
    const socket = net.createConnection(port, host, () => {
        const name = remote_addr(socket);
        console.log("[ipc] connection to socket successful:", name);
        handle_socket_connection(socket, name);
        if (callback) callback(socket, name);
        process.stdin.pipe(socket);
        process.stdin.on("<CHANGE>>drain", () => console.log("drain"));
    });
};

export const broadcast = data => connections.forEach(socket => socket.write(data));

export const active_connections = () => connections;