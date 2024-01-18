use wasm_bindgen::{prelude::wasm_bindgen, convert::{WasmPrimitive, WasmAbi}};

mod bootloader;
use bootloader::haptloader;

mod mount;

trait Primitive<T>: WasmPrimitive + WasmAbi {
    fn get(self) -> T;
    fn set(self, value: u32) -> T;
}

#[derive(Copy, Clone, Default, Debug)]
#[repr(C)]
pub struct Class(u32);

unsafe impl WasmPrimitive for Class {}

impl Primitive<u32> for Class {
    fn get(self) -> u32 {
        println!("[hapt-storage/get]");
        unsafe { 
            let store = haptloader::LOCAL_STORAGE.get_mut(self.0 as usize).expect("[hapt-storage] failed to get from local_storage");
            std::mem::transmute((store.0 as u16, store.1 as u16))
        }
    }

    fn set(self, value: u32) -> u32 {
        println!("[hapt-storage/set]");
        unsafe {
            let store = haptloader::LOCAL_STORAGE.get_mut(self.0 as usize).expect("[hapt-storage] failed to get from local_storage");
            *store = std::mem::transmute(value as u16);
            std::mem::transmute((store.0 as u16, store.1 as u16))
        }
    }
}

#[wasm_bindgen]
pub fn init() -> u32 {
    let ehpt = bootloader::init().expect("[meluloader] help");
    unsafe { std::mem::transmute((ehpt.0 as u16, ehpt.1 as u16)) }
}

#[wasm_bindgen]
pub fn get(class: u32) -> u32 {
    Class(class).get()
}

#[wasm_bindgen]
pub fn set(class: u32, value: u32) -> u32 {
    Class(class).set(value)
}

#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(0, 0);
    }
}
