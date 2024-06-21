import { stripped } from './stripped.js';
stripped();
console.log(window.Globals);

const loc = document.location.origin + "/50x.html";
const getheaders = () => new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();
    req.onload = () => {
        const headers = {};
        req.getAllResponseHeaders().split("\r\n").forEach(x => {
            const [k, v] = x.split(": ");
            headers[k] = v;
        })
        console.log(headers);
        resolve(headers);
    }
    req.onerror = req.onabort = err => reject(err);
    req.open('GET', loc, true);
    req.send(null);
});

export const getheader = async name => {
    if (window.headers) return window.headers[name];
    else return (window.headers = await getheaders())[name];
}

export async function fetch_query(query, frame, cb) {
    const response = await fetch(`http://ehpt.org:${await getheader("adapter-port")}/ls ${query}`);
    const data = await response.text();
    frame.innerHTML = data;
    if(cb) cb(data);
}

export const utils = Object.seal({
    hooker: (hook_object) => 
        (hook, name=Globals.undefined()) => add_hook(hook_object, hook, name),
    add_hook: (hook_object, hook=Globals.eval, qualified_name="unknown") => {
        const hooked_hook = Globals.hook_object(Globals.get_name(hook_object), hook, qualified_name);
        hook_object[name] ? hook_object[name].push(hooked_hook) : hook_object[name] = [hooked_hook];
    },
    iter_hooks: (hook_object, name="unknown", payload=Globals.none(), callback) => {
        if(hook_object[name] && hook_object[name].forEach) {
            hook_object.forEach(callback);
        } else {
            Globals.log("hook-iterator/info")(`mapping to [${name}] of <${Globals.get_name(hook_object)}> yet no iter list found. creating one...`);
            add_hook(hook_object, name, (x) => Globals.log(`iter/${Globals.get_name(hook_object)}-generic`, x));
            if (callback === undefined) return;
            callback(hook_object, name, payload);
        };
    },
    get_name: (...xs) => xs.map((x) => Globals.get_name(x)).join('/'),
    log: (hook_object=Globals.none()) => (...xs) => Globals.log(hook_object)(hook_object, ...xs),
    str: (...xs) => xs.map((x) => JSON.stringify(x)).join(','),
    str_dbg: (...xs) => xs.map((x) => `${Globals.get_name(x)}->${JSON.stringify(x)}`).join(','),
    str_named: (...xs) => xs.map((x) => `[${Globals.get_name(x)}] ${JSON.stringify(x)}`),
});

window.hooks = utils;

export const dyl = (client=true) => {
    if (client) { window.is_client = true; }
    let main;
    if (main = document.getElementsByClassName("dyl")[0]) {} else {
        main = document.createElement("main");
        main.class = "dyl"; 
        Object.seal(main);
        document.body.append(main);
    }
    return main;
}

export const hook_object = Globals.hook_object;

export const hooker = utils.hooker;
export const add_hook = utils.add_hook;
export const iter_hooks = utils.iter_hooks;

export const get_name = utils.get_name;
export const log = utils.log;

export const str = utils.str;
export const str_dbg = utils.str_dbg;
export const str_named = utils.str_named;