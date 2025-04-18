mod parser;
mod structure;

pub use parser::PdbParser;
pub use structure::{Atom, Bond, BondOrder, Chain, Element, Model, Molecule, Residue};