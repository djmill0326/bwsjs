const { fork } = require("child_process");
const path = require("path");

console.info("Starting Manager...");

const cd = '\u001b[3';
const cl = '\u001b[9';
const cr = '\u001b[39m';

let binding = "/";
const active = new Set();
const run = () => {
    const p = fork("/Root/adapter.js", [], { cwd: path.join(process.cwd + "/.." + binding) });
    active.add(p);
    p.on("spawn", () => p.send("Hello, Adapter."));
    p.on("exit", () => {
        active.delete(p);
        run();
    });
    p.on("message", data => {
        console.log(`[${cd}3mAdapter${cr}]`, data);
        const cmd = data.split(":");
        if (cmd.length === 1) return;
        switch (cmd[0]) {
            case "setport":
                p.send("newport:" + parseInt(cmd[1]))
                break;
            case "rebind":
                p.send("Rebind requested. Restarting server...");
                binding = cmd[1];
                setTimeout(() => p.kill(9), 50);
                break;
            default:
                console.warn("^invalid command");
        }
    });
}

setInterval(() => {
    if (active.size === 0) run();
}, 50);