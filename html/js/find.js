import { dynamic_main, query_fetch, getheader } from "./hook.js";

setInterval(() => window.headers = null, 3000);
console.warn("detected adapter port:", await getheader("adapter-port"));
console.info("ok now we ready");

String.prototype.contains = function contains(x) {
    return this.split(x).length > 1;
};

const form = dynamic_main();
const { back, term, btn } = form.children;

const frame = document.getElementById("frame");
const portal = document.getElementById("porthole");
const music = document.getElementById("music");

let query = "";
let queued = null;
let music_browser = {};

window.player_history = [];

const audio_element = document.createElement("audio");
audio_element.controls = true;
audio_element.autoplay = true;

back.onclick = () => {
    const remaining = query.split("/").slice(1, -1);
    if (remaining.pop()) {
        term.value = remaining.join("/");
        btn.click();
    } else back.checked = false;
};

const file_info = link => {
    const split = link.split("/");
    const file = decodeURI(split[split.length - 1]);
    let list = file.split(".");
    if (list.length > 2) { // goofy ass shit
        const ext = list.pop();
        const name = list.join(".");
        return [name, ext];
    } else if (list[list.length - 1].charAt(0) === " ") {
        console.log("list", list);
        return [file];
    }
    return list;
};

const describe = info => `${info[0]} [${info[1] ? info[1] : "unknown extension"}]`;

const get_first_anchor = (queue_next=false) => {
    try {
        const list = frame.children[1].children[0].children;
        const a = list[0];
        if (a.href.lastIndexOf(".") - window.location.href.length < 0) return;
        if (queue_next) queued = list[1];
        return a;
    } catch (_) { console.info("request failed!", term.value) }
}

const pull_next_anchor = (a, looping=true) => {
    const ne = a.parentElement.nextElementSibling; let next;
    if (!ne || !ne.children || ne.children.length === 0 || !ne.children[0].href) {
        const initial = get_first_anchor();
        if (looping && initial) next = initial;
        else return;
    } else next = ne.children[0];
    const li = next.href.lastIndexOf(".");
    if (li - window.location.href.length < 0) return;
    if (next.href.substr(li) === ".jpg") return pull_next_anchor(next, looping);
    if (music_browser.update) console.log("[hapt-player/info]", `next in playlist: ${describe(file_info(next.href))}`);
    return queued = next;
};

const next_anchor_from_queue = () => {
    if (!queued) return;
    player_history.push(queued);
    update_link(pull_next_anchor(queued, true));
};

audio_element.onended = next_anchor_from_queue;

let replay_slot = localStorage.lplay;

const anchor_from_link = (link) => frame.querySelector(`ul > li > a[href="${link.split(":442")[1]}"]`);

form.onsubmit = (e) => {
    // todo: this is retarded, no reason to do these string operations like this
    back.disabled = false;
    e.preventDefault();
    const v = localStorage.llocation = term.value;
    query = ((v[0] === "/" ? "" : "/") + v + (v.length ? "/" : "")).replace(/[\/\\]+/g, "/");
    query_fetch(query, frame, () => {
        let reset;
        if (replay_slot) {
            reset = anchor_from_link(replay_slot);
            replay_slot = null;
            setTimeout(() => {
                if (audio_element.src === localStorage.lplay) 
                    audio_element.currentTime = localStorage.ltime || 0;
            }, 0);
        }
        if (!reset) reset = get_first_anchor();
        if (reset && reset.href) {
            if (!queued) update_link(reset);
            back.checked = query.replace("/", "").length;
        }
    });
};

const update_link = (to) => {
    localStorage.lplay = queued = to ? to : get_first_anchor();
    if (!queued || !queued.href) return;
    const link = queued.href;
    const is_music = link.contains("/music/");
    const info = file_info(link);
    if (!info[1]) {
        term.value = decodeURI(link.split("%20/")[1]);
        btn.click(); return;
    }
    portal.src = link;
    if (is_music) {
        portal.insertAdjacentElement("afterend", audio_element);
        portal.remove();
        audio_element.src = link;
        const song_descriptor = describe(info);
        console.log("[hapt-player/info]", `now playing: ${song_descriptor}`);
        update_music_browser(link, song_descriptor);
    } else if (music_browser.remove) {
        audio_element.insertAdjacentElement("beforebegin", portal);
        audio_element.remove();
        music_browser.remove();
    }
};

if (localStorage.llocation) {
    term.value = localStorage.llocation;
    btn.click();
}

frame.onclick = (e) => {
    if (e.target.href) {
        e.preventDefault();
        update_link(e.target);
    }
}

let label_idx = 0;
const create_label_for = (el, text, color="#444") => {
    const label = document.createElement("label");
    if (!el.id.length > 0) {
        el.id = "el" + label_idx++;
    }
    label.htmlFor = el.id;
    label.id = "l" + el.id;
    label.textContent = text;
    label.style.color = color;
    return label;
};

const bundle = (...x) => {
    const el = document.createElement("span");
    el.append(...x);
    return el;
}

const music_browser_init = (link, display) => {
    const player = document.createElement("div");
    player.className = "music";
    const prev = document.createElement("button");
    const next = document.createElement("button");
    const current_song = document.createElement("a");

    prev.onclick = () => {
        const entry = player_history.pop();
        if (entry) update_link(entry);
    };

    next.onclick = next_anchor_from_queue;

    prev.textContent = "↩";
    next.textContent = "↪";
    current_song.dataset.src = decodeURI(link);
    current_song.textContent = display;
    current_song.onclick = () => audio_element.src = audio_element.src;

    player.append(
        bundle(prev, create_label_for(prev, "prev")),
        bundle(create_label_for(current_song, "♫", "#0ce"), current_song),
        bundle(create_label_for(next, "next"), next)
    );
    music.append(player);

    music_browser = {
        update: (link, display) => {
            current_song.textContent = display;
            current_song.dataset.src = link;
        },
        remove: () => {
            player.remove();
            music_browser = {};
        }
    };
}

const update_music_browser = (link, display) => {
    if (music_browser.update) music_browser.update(link, display);
    else music_browser_init(link, display);
};

const msave = () => localStorage.ltime = audio_element.currentTime;
window.addEventListener("beforeunload", msave);
setInterval(msave, 1000);