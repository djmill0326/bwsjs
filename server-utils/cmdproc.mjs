import { stdin, stdout } from "process";
import { createInterface } from "readline/promises";
import { readFile, writeFile } from "fs/promises";

import conf from "./config.mjs";
import { open, set_data_callback } from "./ipc.mjs";

const global = {
    dynamic_config: new Map(),
    is_prompting: false,
    pending_callback: null,
    query_suffix: null
};

const get_config = (descriptor, fallback) => {
    const from_dyn = global.dynamic_config.get(descriptor);
    if (from_dyn !== undefined) return from_dyn;
    const indices = descriptor.split(".");
    let active = conf;
    for (let i = 0; i < indices.length; i++) {
        if (typeof active !== "object") return fallback;
        active = active[indices[i]];
    }
    return active === undefined || active === null ? fallback : active;
};

const relative_path = get_config("dir.root", "./");
const resolve_path = file => relative_path + "/" + file;
const read_file = file => readFile(resolve_path(file), "utf-8");
const write_file = (file, data) => writeFile(resolve_path(file), data, "utf-8");

const io = createInterface({ input: stdin, output: stdout });
const write = buffer => io.write(buffer);
const writeline = text => write(text + "\n");

const on_input = (input) => {
    if (global.is_prompting) {
        global.is_prompting = false;
        io.setPrompt("");
        if (global.pending_callback) {
            global.pending_callback(input);
            global.pending_callback = null;
        }
    }
};

const request_input = (query="", callback = () => writeline("no callback specified")) => {
    global.pending_callback = callback;
    global.is_prompting = true;
    io.setPrompt(`${query + (query.length ? " " : "")}${global.query_suffix} `);
    io.prompt(global.is_prompting);
};

const dynamic_config_location = get_config("dir.dynconf", "dyn.conf");

const load_dynamic_config = (callback) => {
    writeline("Welcome to cmdproc. Loading configuration...");
    read_file(dynamic_config_location).then(file => file.toString("utf-8")).then(text => {
        const lines = text.split("\n");
        lines.forEach(l => {
            const line = l.trim();
            if (line.length) {
                const axis = line.indexOf(" ");
                if (axis > 0) {
                    const [name, value] = [line.substring(0, axis), line.substring(axis + 1)];
                    if (value.length) {
                        console.log(`[dynconf] loaded config entry: '${name}' = "${value}"`)
                        global.dynamic_config.set(name, value);
                    }
                }
            }
        });
        callback();
    });
}

const update_dynamic_config = (descriptor, value) => {
    const old_value = global.dynamic_config.get(descriptor);
    if (old_value === value) return;
    global.dynamic_config.set(descriptor, value);
    writeline(`[dynconf] updated config object '${descriptor}' to value "${value}"`);
}

const save_dynamic_config = () => {
    if (global.is_prompting) {
        global.pending_callback = null;
        console.error("INTERRUPTED PENDING CALLBACK. PROGRAM STATE LIKELY INVALID.");
    }
    let write_buffer = "";
    global.dynamic_config.forEach((value, key) => write_buffer += `${key} ${value}\n`);
    write_file(dynamic_config_location, write_buffer, true).then(
        () => writeline(`[dynconf] saved config to '${dynamic_config_location}' <Press Ctrl+C to exit>`));
}

const ask_for_config_info = (query, descriptor, callback) => {
    request_input(query, input => {
        update_dynamic_config(descriptor, input);
        if (callback) callback(input);
    });
};

const init = () => {
    global.query_suffix = get_config("query.suffix", "%");
    io.on("close", save_dynamic_config);
    io.on("line", on_input);
    let username = get_config("user.name");
    if (username) writeline(`[fake login] Welcome back, ${username}`);
    else ask_for_config_info("who are you?", "user.name", (input) => {
        writeline(`Your username is now set as ${input}`);
    });
    set_data_callback((data, _, name) => {
        write(`<${name}> ${data}`);
    });
    io.setPrompt("");
    open("81", null, socket => stdin.pipe(socket));
};

load_dynamic_config(init);