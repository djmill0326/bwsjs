console.log("[hapt-ecs] init...");

const workers = [];
let worker_idx = 0;

function push_ctx(name, x) {
    const ctx = { idx: worker_idx, active: true, name, callback: x };
    workers[worker_idx++] = ctx;
    ++worker_idx;
    return ctx;
}

function pop_ctx(ctx) {
    if(workers[ctx.idx]) {
        workers[ctx.idx].active = false;
        setTimeout(function (){
            delete workers[ctx.idx];
        }, 1000);
    } else {
        console.warn("tried to pop context that didn't exist");
    }
}

const context = push_ctx("hapt.main");
const context_int = push_ctx("hapt.int");
const core = Object.seal(push_ctx("hapt.core"));
window.context = context;
window.core = core;

function basic_ctx() {
    return context;
}

function interrupt_ctx() {
    return context_int;
}

function interrupt(context) {
    console.log("[hapt/" + context.name + "/int] hello.");
}

function run(x, context) {
    if(context.active) return;
    console.log("[hapt] running " + context.worker + "...");
    const ctx = push_ctx("lambda-" + performance.now() / 1000, x);
    ctx.callback(context, x);
    pop_ctx(ctx);
}

function worker(x, amount) {
    for (let i = 0; i < amount; i++) {
        const ctx = push_ctx("hapt." + i, x);
        run(x, ctx);
        pop_ctx(ctx);
    }
}

run(function() {
    console.log("[hapt] ;)");
}, basic_ctx());

run(function () {
    console.debug("[hapt/int] core interrupt");
}, interrupt_ctx());

console.log("end ecs")