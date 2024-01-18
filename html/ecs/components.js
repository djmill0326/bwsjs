import "./handle.js";

export function global_this() {
    return kiss(this, "this")[0];
}

export function str(sealed_object) {
    return "ehpt-generic/v1<" + sealed_object[1][1] + "> [" + sealed_object[0] + "]";
}

export function object(name) {
    return kiss([Uint8Array.bind(global_this[0]), name], "hapt-object");
}

export function kiss(x, name) {
    return Object.seal([x, object(x, name)]);
}

export function hapt_abi(spec) {
    return kiss("haptloader/" + spec, "abi-v" + spec);
}

export function type_pool(extend=[]) {
    return kiss({
        abi: hapt_abi("v1"),
        types: Object.create([global_this(), ...extend,
            kiss(Function, "js-fn"),
            kiss(Object, "js-object"),
            kiss(Array, "js-array"),
            kiss(Uint8ClampedArray, "utf8"),
            kiss(Uint8Array, "native"),
            kiss(Uint16Array, "native-w"),
            kiss(Uint32Array, "native-word"),
            kiss(String, "str"),
            kiss(Number, "int"),
            kiss(Number, "float"),
        ]),
    }, "type-pool")
}

export function event_pool() {
    function event(name) {
        return kiss(name, "event:" + name)
    }
    function get_store() {
        if(!global_this().store) {
            global_this().store = kiss({
                ref: global_this().store,
                storage: Object.create({}),
                create:     function(id) { 
                    get_store().storage[id] = kiss(id, "hapt-object");
                }, read:    function(id) {
                    return get_store().storage[id][0][0];
                }, update:  function(id, x) {
                    return get_store().storage[id][0][0] = Uint8Array.from(x);
                }, rename:  function(id, x) {
                    return get_store().storage[id][0][1] = x;
                }, destroy: function(id) {
                    delete get_store().storage[id];
                },
            }, "ehpt-store");
        }
        return global_this().store;
    }
    return {
        abi: hapt_abi("v1"),
        types: type_pool([event("create"), event("read"), event("update"), event("destroy")]),
        pool: kiss({
            store: get_store(),
            add: function(type, element, handler) {
                const id = "ehpt:" + Performance.now();
                store.create(type, id);
                store.update(id, [element, handler])
                console.log("[ehptloader] registered event handler");
                return id;
            },
            rem: function(id) {
                store.destroy(id);
                console.log("[ehptloader] destroyed event handler");
            }
        }, "ehpt-pool")
    }
}

export function outerp(x, y) {
    return Math.pow(x, 2) + Math.pow(y, 2);
}

export function interp(x, y) {
    return Math.sqrt(outerp(x, y));
}

export function linterp(x1, x2) {
    return (x1 + x2) / 2;
}

export function llinterp(x1, x2) {
    return (x1 - x2) * 2;
}

export function distance(x1, x2) {
    return llinterp(x1, x2);
}

export function center(x1, x2) {
    return Math.sqrt(x1 + 0.5 * x2) * 2;
}

export const console = {
    log: function(x) { 
           window.console.debug("coreboot:", x); },
    debug: window.console.log,
    warn: window.console.warn
};

export function listen(element, event_name, hook) {
    var hook = window.hook(hook);
    function x(ev) { return hook(ev); }
    element.addEventListener(event_name, x);
}

export function listen_silent(element, event_name, hook) {
    function x(ev) { ev.preventDefault(); return window.hook(ev); }
    listen(element, event_name, x);
}

export function listen_all(event_name, elements, hook, silent=false) {
    function log(ev) { console.log("[hook-listener]", ev); }
    function x(ev) { logger(ev); return window.hook(ev); }
    elements.forEach(element => listeners.push(listen_debounced(element, event_name, hook, silent)));
}

window.rpc = { listen, listen_silent, listen_all };

export function animate(element, event, fn) {
    listen(element, event, function on_event(ev) {
    function cb(delta_t) {
        const ev = get_event();
        return fn(delta_t, ev.offsetX, element.offsetY, element.clientWidth, element.clientHeight);
    }
    requestAnimationFrame(cb);
})}

export function overcomplexifi(element) {
    listen(element, "mousemove", function mousemove(ev) {
        function cb(delta_t) {
            var excess = 10 - travelled;
            travelled = 0;
            var dist_x = distance(ev.offsetX, prior_x);
            prior_x = ev.offsetX;
            var fancy = Math.sin(ev.offsetY) * 3;
            var fancy_t = Math.cos(delta_t) * 5;
            var mixed_fancy = Math.log(fancy + fancy_t);
            function make_neat(prior, pos, offset, dist) {
                return dist + mixed_fancy - offset / 2;
            }
            travelled = Math.min(make_neat(prior_x, ev.offsetX, logo.clientWidth, dist_x), 0);
            travelled = Math.max(travelled, 360); 
            logo.style.left = ev.offsetX + Math.min(ev.offsetX + travelled, excess) + "px";
        }
        requestAnimationFrame(cb);
    });
}