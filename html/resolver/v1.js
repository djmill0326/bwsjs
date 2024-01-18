window.bootstrap("v1");
window.bootstrap("resolver");
const resolver = globalThis.get_default();

globalThis.bindings = {};
globalThis.bindings["core"] = globalThis.bindings;

function raw_call(bind_site) {
    return {
        push: eval("push_" + bind_site),
        pop: eval("pop_" + bind_site)
    }
}

function push_core(x) {
    return globalThis.bindings[id] = x;
}

function pop_core(x) {
    return delete globalThis.bindings[id];
}

globalThis.v1 = {
    push: (id, x) => {
        const { push } = raw_call(id);
        push(x);
    },
    pop: (id, x) => {
        const { pop } = raw_call(id);
        pop(x);
    }
};