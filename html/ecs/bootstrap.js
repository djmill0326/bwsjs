export function from_spec(uri) { fetch("http://localhost/spec/" + uri + ".json", {
    mode: "no-cors"
}).then(body => body.json()).then(spec => {
    const script = document.createElement("script");
    script.type = spec.type;
    script.src = spec.src;
    document.head.append(script);
})};
export function webapp(uri) { from_spec(uri + ".app"); }
export function init() { from_spec("v1"); }