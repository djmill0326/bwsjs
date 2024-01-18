use std::{sync::Arc, borrow::Cow};

struct File();

fn file_io() -> File {
    File()
}

type Semver = Cow<'static, u16>;

static mut SEMVER: Semver = Cow::Owned(0);

fn semver() -> Semver {
    Cow::Owned(unsafe { SEMVER.wrapping_add(1) })
}

struct Version(u8, u8, Semver);

impl Version {
    fn x(i: u8) -> Self {
        Self(i, 0, semver())
    }

    fn xx(i: u8, j: u16) -> Self {
        Self(i, (j % 0xFF).try_into().expect("u8 overflow"), semver())
    }

    fn xxx(i: u8, j: u8) -> Self {
        Self(i, j, semver())
    }

    fn v0() -> Self {
        Self::xxx(1, 0)
    }
}

struct HeaderItem {
    name: Arc<str>,
    version: Version
}

impl HeaderItem {
    fn new(name: &str) -> Self {
        Self {
            name: name.into(),
            version: Version::v0()
        }
    }
}

struct HeaderData {
    header: HeaderItem,
    data: HeaderItem
}

impl HeaderData {
    fn new(name: &str) -> Self {
        Self {
            header: HeaderItem::new(name),
            data: HeaderItem::new(Arc::new("data-".to_owned() + name + semver().to_string().as_ref()).as_ref())
        }
    }
}

struct HeaderFunction {
    header: HeaderItem,
    function: HeaderData
}

impl HeaderFunction {
    fn new(name: &str) -> Self {
        Self {
            header: HeaderItem::new(name),
            function: HeaderData::new(Arc::new("fn-".to_owned() + name + semver().to_string().as_ref()).as_ref())
        }
    }
}

struct Header {

}

mod parser {
    use super::{Header, HeaderItem, HeaderFunction, HeaderData};

    struct ParseState {
        header: HeaderItem,
        intern: HeaderData,
        data: HeaderData,
        functions: HeaderFunction
    }

    impl ParseState {
        fn init() -> Self {
            Self {
                header: HeaderItem::new("parser"),
                intern: HeaderData::new("interner"),
                data: HeaderData::new("header-data"),
                functions: HeaderFunction::new("header-fns")
            }
        }
    }

    pub(crate) struct Parser(ParseState);

    fn parse(_header: Header) -> Parser {
        Parser(ParseState::init())
    }
}

mod header {
    use super::parser;

    struct Header(super::Header, parser::Parser);
}