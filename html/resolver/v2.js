globalThis.hapt_stack = Object.create({});

function get(id) {
    return {
        push: x => globalThis.v1.push(id, x),
        pop: x => globalThis.v1.pop(id, x),
    }
}

function get_default() {
    return {
        push: x => {
            globalThis.hapt_stack[x] = x;
            return globalThis.hapt_stack[x];
        },
        pop: x => {
            delete globalThis.hapt_stack[x];
            return globalThis.hapt_stack[x];
        }
    }
}

get("core").push(get_default().push);
get("core").push(get_default().pop);

get_default().push(get("core").push);
get_default().push(get("core").pop);

globalThis.get = get;
globalThis.get_default = get_default;

globalThis.push = get_default().push;
globalThis.pop = get_default().pop;