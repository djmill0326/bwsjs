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
let music_browser = {};

const audio_element = document.createElement("audio");
audio_element.controls = true;
audio_element.type = "audio/mpeg";
audio_element.autoplay = true;

form.onsubmit = (e) => {
    e.preventDefault();
    const term = form.children['term'].value;
    query = (term[0] === "/" ? "" : "/") + term + (term.length ? "/" : "");
    if (!query.startsWith("music/")) music_browser.remove && music_browser.remove();
    fetch_query(query, frame);
    console.debug("form submission");
}
const update_link = (link) => {
    const is_music = link.contains("/music/");
    portal.src = link;
    if (is_music) {
        portal.insertAdjacentElement("afterend", audio_element);
        portal.remove();
        audio_element.src = link;
        const list = link.split("/");
        let song = decodeURI(list[list.length - 1]).split(".");
        if (song.length > 2) {
            const ext = song.pop();
            const name = song.join(".");
            song = [name, ext];
        }
        const song_descriptor = `${song[0]} [${song[1] ? song[1] : "unknown extension"}]`;
        console.log("[hapt-player/info]", `now playing: ${song_descriptor}`);
        update_music_browser(song_descriptor);
    } else if (!document.getElementById("porthole")) audio_element.insertAdjacentElement("beforebegin", portal);
    // music element sticks around forever, why not.
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