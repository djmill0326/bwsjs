window.init = async function get_init() {
    const init = await import("./v1/hapt_rt.js");
    console.warn("booting...");
    globalThis.Runtime = init;
    console.warn("global initialization [haptloader]");
}