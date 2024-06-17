import { connect, set_data_callback } from "./ipc.mjs";
connect("81", "::1");
set_data_callback(data => {
    const str_data = data.toString();
    if(str_data[str_data.length - 1] === "\n") console.log(data);
    else process.stdout.write(str_data);
});