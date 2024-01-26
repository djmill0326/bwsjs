import fs from "fs";

const get_static = (uri, cb) => {
    fs.readFile(uri, 'utf8', function(err, text) {
        if(err) {
            console.error("Could not open file: %s", err);
            cb("");
            return;
        }
        cb(text);
    });
};

const with_template = (uri, content_uri, loader, cb) => {
    get_static(uri, src => {
        console.log(`loaded template from "${ uri }"`);
        get_static(content_uri, content_src => {
            console.log(`loaded template content from ${ content_uri }`);
            const template = {
                compile: (data, cb) => loader(src, content_src, data, cb)
            };
            cb(template);
        })
    });
};

const prepare_source = (src, data) => {
    // i think this is neat
    Object.keys(data)
        .map(variable => [RegExp(`%{${variable}}%`).exec(src), variable])
        .filter(map => map && map[0] && map[0][0])
        .forEach(map => src = src.replace(map[0][0], data[map[1]]));
    return src;
}

const compile_template = (src, content_src, data, cb) => {
    cb(prepare_source(src, {
        content: content_src,
        ...data
    }));
}

export default (src, content, data, cb) => with_template(src, content, compile_template, template => {
    get_static("./templates/content/placeholder.htm", placeholder => {
        template.compile({ ...data, placeholder, tag: "ehpt_" + performance.now() }, cb);
    });
});