const storage = [{
    id: 0, 
    handles: {
        idx: 0, 
        data: [{
            name: "core-cb", ref: ctx(),
            cb: [function(x) { console.debug("[root.core-cb]", x); }]
        }]
    }, 
    data: {} 
}];

function get_ctx(i) {
    return storage[i];
}

export function ctx(i=0) {
    return get_ctx(i);
}

function push(x, ctx=ctx()) {
    ctx.data[x] = x;
}

function pop(x, ctx=ctx()) {
    delete ctx.data[x];
}

function handle(ctx=ctx(), idx) {
    return ctx.handles.data[idx];
}

function next_handle(ctx=ctx()) {
    return handle(ctx, ++ctx.handles.idx);
}

export function push_handle(ctx=ctx(), name) {
    const handle = next_handle();
    const handler = {
        name, ref: ctx,
        cb: [function(x) { console.debug("[" + name + ".core-cb]", x); }]
    };
    return push_handler(ctx, handler)
}

function push_handler(handle, handler) {
    if(!handle.data) { handle.data = []; }
    handle.data.push(handler);
    return handle.data.length - 1;
}

function pop_handler(handler, idx) {
    delete handler.cb[idx];
}

export function send(handle, data) {
    handle.data.for_each(handler => {
        console.log("[" + handler.name + "/send]", data);
        handler.cb.for_each(cb => {
            cb(data, handle);
        });
    });
    return handle;
}

export function hook(handle, cb) {
    return push_handler(handle, function(x) {
        console.log("[hook:" + handle.idx + "]", handle, cb);
        cb(x, handle);
    });
}

export function unhook(handle, idx) {
    return pop_handle(handle, idx);
}