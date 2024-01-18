pub mod mount {
    use wasm_bindgen::prelude::wasm_bindgen;
    use crate::bootloader::haptloader;

    #[wasm_bindgen]
    pub fn mount(uri: usize) -> usize {
        println!("[hapt-storage/mount] init... <{}>", uri);
        todo!();
    }

    fn io_init(io: usize) -> usize {
        mount(io)
    }

    fn io_read(io: usize, uri: usize) -> u16 {
        io_init(io);
        unsafe { std::mem::transmute(*haptloader::LOCAL_STORAGE.get(uri).expect("[hapt-storage] io_read failed")) }
    }

    fn io_write(io: usize, uri: usize, x: u16) {
        io_init(io);
        unsafe { haptloader::LOCAL_STORAGE[uri] = std::mem::transmute(x); }
    }

    #[wasm_bindgen]
    pub fn io(mount: usize) -> usize {
        println!("[hapt-storage/io] mount: <{}>", mount);
        io_init(mount + 0xFFFF)
    }

    #[wasm_bindgen]
    pub fn read(io: usize, uri: usize) -> u16 {
        dbg!("hapt-storage: read");
        let io = crate::mount::mount::io(io);
        io_read(io, uri)
    }

    #[wasm_bindgen]
    pub fn write(io: usize, uri: usize, x: u16) -> usize {
        dbg!("hapt-storage: write");
        let io = crate::mount::mount::io(io);
        io_write(io, uri, x);
        io
    }
}