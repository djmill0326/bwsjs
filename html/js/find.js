import { dyl, fetch_query } from "./hook.js";

console.warn("ok now we ready");

String.prototype.contains = function contains(x) {
    return this.split(x).length > 1;
};

const form = dyl();
const frame = document.getElementById("frame");
const portal = document.getElementById("porthole");
const music = document.getElementById("music");
let query = "";
let queued = null;
let music_browser = {};

const audio_element = document.createElement("audio");
audio_element.controls = true;
audio_element.type = "audio/mpeg";
audio_element.autoplay = true;

const describe_file = (link) => {
    const split = link.split("/");
    let list = decodeURI(split[split.length - 1]).split(".");
    if (list.length > 2) {
        const ext = list.pop();
        const name = list.join(".");
        list = [name, ext];
    }
    return `${list[0]} [${list[1] ? list[1] : "unknown extension"}]`;
};

const pull_first_anchor = () => frame.children[1].children[0].children[0];

const pull_next_anchor = (a, looping=true) => {
    const ne = a.parentElement.nextElementSibling; let next;
    if (!ne || !ne.children || ne.children.length === 0 || !ne.children[0].href) {
        const initial = pull_first_anchor();
        if (looping && initial) next = initial;
        else return;
    } else next = ne.children[0];
    if (music_browser.update) console.log("[hapt-player/info]", `next in playlist: ${describe_file(next.href)}`);
    return queued = next;
};

audio_element.onended = () => {
    if (queued) {
        update_link(queued.href);
        pull_next_anchor(queued);
    }
};

form.onsubmit = (e) => {
    e.preventDefault();
    const term = form.children['term'].value;
    query = (term[0] === "/" ? "" : "/") + term + (term.length ? "/" : "");
    fetch_query(query, frame, () => {
        const reset = pull_first_anchor();
        if (reset) queued = reset;
    });
    console.debug("form submission");
}
const update_link = (link) => {
    const is_music = link.contains("/music/");
    portal.src = link;
    if (is_music) {
        portal.insertAdjacentElement("afterend", audio_element);
        portal.remove();
        audio_element.src = link;
        const song_descriptor = describe_file(link)
        console.log("[hapt-player/info]", `now playing: ${song_descriptor}`);
        update_music_browser(song_descriptor);
    } else if (music_browser.remove) {
        audio_element.insertAdjacentElement("beforebegin", portal);
        audio_element.remove();
        music_browser.remove();
    }
};

frame.onclick = (e) => {
    if (e.target.href) {
        e.preventDefault();
        update_link(e.target.href);
        pull_next_anchor(e.target);
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
    current_song.onclick = () => audio_element.src = audio_element.src + " ";

    player.append(
        //create_label_for(prev_song, "prev"),
        //prev_song,
        //prev,
        create_label_for(current_song, "now playing --- "),
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