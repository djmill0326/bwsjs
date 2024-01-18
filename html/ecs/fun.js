console.warn("have fun :)");

function fix_height(el) {
    setTimeout(function() {
        el.height = el.scrollHeight;
        el.style.height = el.height;
    }, 0);
}