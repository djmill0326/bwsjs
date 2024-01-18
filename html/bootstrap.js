globalThis.loaders = {};

function local(id) {
    if (!window.localStorage.getItem(id + ".spec")) {
        return null;
    }
    loaders[id] = {};
    loaders[id].spec = JSON.parse(window.localStorage.getItem(id + ".spec"));
    loaders[id].src = window.localStorage.getItem(id + ".src");
    return loaders[id];
}

function bootstrap_local(id, spec, src) {
    const _local = local(id);
    if(_local && _local.spec && _local.src) {
        console.log("[localloader] loaded: ", _local);
        if(spec.src.split(JSON.parse(_local).spec.src).length === 2) {
            eval(_local.src);
            return;
        }
    }

    window.localStorage.setItem(id + ".spec", JSON.stringify(spec));
    window.localStorage.setItem(id + ".src", src);

    console.log("[specloader/src]", spec.src);
    const script = document.createElement("script");
    script.type = spec.type;
    script.src = src;
    document.body.append(script);
    if (spec.cb) { eval("{" + spec.cb + "}") }
    if (spec.ui) {
        strap_ui(id);
    }
}

function strap(id) {
    fetch("http://localhost/spec/" + id + ".json", {
        mode: "no-cors"
    }).then(body => body.json()).then(spec => {
        const _local = local(id);
        if(_local && _local.spec) {
            console.log("[localloader] loaded: ", _local);
            if(spec.src.split(_local.spec.src).length === 2) {
                eval(_local.src);
                return;
            }
        }
        if (spec.requires && spec.requires.length) {
            spec.requires.forEach(strap);
        }
        console.log("[specloader]", spec);
        fetch(spec.src, {
            mode: "no-cors"
        }).then(body => body.text()).then(src => {
            window.localStorage.setItem(id + ".spec", JSON.stringify(spec));
            window.localStorage.setItem(id + ".src", src);

            console.log("[specloader/src]", spec.src);
            eval("console.warn('specloader-eval');(()=>{" + src + "})()");
            if (spec.cb) { eval("{\n" + spec.cb + "\n}") }
            if (spec.ui) {
                strap_ui(id);
            }
        });
    });
}

strap("stripped");
globalThis.Stripped = Object.seal(eval(localStorage.getItem("stripped-latest")));
globalThis.StrippedGlobals = Object.create(window.Stripped);
localStorage.removeItem("stripped-latest");

function strap_ui(id) {
    if (globalThis.loaders["resolver"]) {
        fetch("http://localhost/spec/ui/" + id + ".json", {
            mode: "no-cors"
        }).then(body => body.json()).then(schema => {
            resolve_dom(schema);
        });
    } else {
        setTimeout(() => strap_ui(id), 200);
    }
}