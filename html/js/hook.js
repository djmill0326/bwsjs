const loc = location.origin + "/50x.html";
const getheaders = () => new Promise((resolve, reject) => {
    // using XMLHttpRequest because it feels retro
    const req = new XMLHttpRequest();
    req.onload = () => {
        const headers = {};
        req.getAllResponseHeaders().split("\r\n").forEach(x => {
            const [k, v] = x.split(": ");
            headers[k] = v;
        })
        resolve(headers);
    }
    req.onerror = req.onabort = err => reject(err);
    req.open('GET', loc, true);
    req.send(null);
});

export const getheader = async name => {
    if (window.headers) return window.headers[name];
    else return (window.headers = await getheaders())[name];
};

export async function query_fetch(query, frame, cb) {
    let wait = true;
    setTimeout(() => {
        if (wait) frame.innerHTML = `<h3 style="color: #000">&nbsp;... &nbsp;${query}</h3>`;
    }, 200);
    const response = await fetch(`http://${location.hostname}:${await getheader("adapter-port")}/ls ${query}`);
    const data = await response.text();
    frame.innerHTML = data;
    wait = false;
    if(cb) cb(data);
};

export const dynamic_main = (client=true) => {
    if (client) { window.is_client = true; }
    let main;
    if (main = document.getElementById("dyn")) {} else {
        main = document.createElement("span");
        main.id = "dyn";
        document.body.append(main);
    }
    return main;
};