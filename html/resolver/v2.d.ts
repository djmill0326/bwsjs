type Resolver<T> = {
    push: (x: T) => {},
    pop: (x: T) => {}
};

export default function get_default() {
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