use wasm_bindgen::prelude::*;
use molecule_core::{BondOrder, Molecule, PdbParser};
use std::collections::HashMap;
use serde::{Serialize, Deserialize};

#[wasm_bindgen(start)]
pub fn init() {
    console_error_panic_hook::set_once();
}

#[derive(Serialize, Deserialize)]
pub struct JsAtom {
    pub id: usize,
    pub name: String,
    pub element: String,
    pub position: [f32; 3],
    pub residue_id: usize,
    pub chain_id: String,
    pub b_factor: f32,
    pub occupancy: f32,
    pub residue_name: String,
    pub alt_loc: String,
    pub ins_code: String,
    pub is_hetatm: bool,
}

#[derive(Serialize, Deserialize)]
pub struct JsBond {
    pub atom1_id: usize,
    pub atom2_id: usize,
    pub order: String,
}

#[derive(Serialize, Deserialize)]
pub struct JsMolecule {
    pub atoms: Vec<JsAtom>,
    pub bonds: Vec<JsBond>,
}

#[derive(Serialize, Deserialize)]
struct Atom3DMol {
    serial: i32,
    elem: String,
    x: f32,
    y: f32,
    z: f32,
    hetflag: bool,
    chain: String,
    resi: i32,
    resn: String,
    atom: String,
    b: f32,
    occupancy: f32,
}

#[derive(Serialize, Deserialize)]
struct Bond3DMol {
    from: i32,
    to: i32,
    order: i32,
}

#[derive(Serialize, Deserialize)]
struct Molecule3DMol {
    atoms: Vec<Atom3DMol>,
    bonds: Vec<Bond3DMol>,
}

fn convert_molecule_to_js(molecule: &Molecule) -> JsMolecule {
    let atoms = molecule.atoms.iter().map(|atom| {
        JsAtom {
            id: atom.id,
            name: atom.name.clone(),
            element: format!("{:?}", atom.element),
            position: atom.position,
            residue_id: atom.residue_id,
            chain_id: atom.chain_id.to_string(),
            b_factor: atom.b_factor,
            occupancy: atom.occupancy,
            residue_name: atom.residue_name.clone(),
            alt_loc: atom.alt_loc.to_string(),
            ins_code: atom.ins_code.to_string(),
            is_hetatm: atom.is_hetatm,
        }
    }).collect();

    let bonds = molecule.bonds.iter().map(|bond| {
        JsBond {
            atom1_id: bond.atom1_id,
            atom2_id: bond.atom2_id,
            order: format!("{:?}", bond.order),
        }
    }).collect();

    JsMolecule { atoms, bonds }
}

#[wasm_bindgen]
pub fn parse_pdb(pdb_content: &str) -> Result<JsValue, JsValue> {
    let parser = PdbParser::new();
    match parser.parse_string(pdb_content) {
        Ok(molecule) => {
            let js_molecule = convert_molecule_to_js(&molecule);
            Ok(serde_wasm_bindgen::to_value(&js_molecule)?)
        },
        Err(err) => Err(JsValue::from_str(&format!("Error parsing PDB: {}", err))),
    }
}

#[wasm_bindgen]
pub fn get_3dmol_atoms(pdb_content: &str) -> Result<JsValue, JsValue> {
    let parser = PdbParser::new();
    match parser.parse_string(pdb_content) {
        Ok(molecule) => {
            let atoms: Vec<Atom3DMol> = molecule.atoms.iter().map(|atom| {
                let element_str = format!("{:?}", atom.element);
                let element = element_str.trim_matches(|c| c == '_' || c == ' ');
                
                Atom3DMol {
                    serial: atom.id as i32,
                    elem: element.to_string(),
                    x: atom.position[0],
                    y: atom.position[1],
                    z: atom.position[2],
                    hetflag: atom.is_hetatm,
                    chain: atom.chain_id.to_string(),
                    resi: atom.residue_id as i32,
                    resn: atom.residue_name.clone(),
                    atom: atom.name.clone(),
                    b: atom.b_factor,
                    occupancy: atom.occupancy,
                }
            }).collect();
            
            Ok(serde_wasm_bindgen::to_value(&atoms)?)
        },
        Err(err) => Err(JsValue::from_str(&format!("Error parsing PDB: {}", err))),
    }
}

#[wasm_bindgen]
pub fn get_3dmol_bonds(pdb_content: &str) -> Result<JsValue, JsValue> {
    let parser = PdbParser::new();
    match parser.parse_string(pdb_content) {
        Ok(molecule) => {
            let atom_id_to_index: HashMap<_, _> = molecule.atoms.iter()
                .enumerate()
                .map(|(i, atom)| (atom.id, i as i32))
                .collect();
            
            let bonds: Vec<Bond3DMol> = molecule.bonds.iter().map(|bond| {
                let atom1_index = atom_id_to_index.get(&bond.atom1_id).unwrap_or(&0);
                let atom2_index = atom_id_to_index.get(&bond.atom2_id).unwrap_or(&0);
                
                let order = match bond.order {
                    BondOrder::Single => 1,
                    BondOrder::Double => 2,
                    BondOrder::Triple => 3,
                    BondOrder::Aromatic => 1,
                };
                
                Bond3DMol {
                    from: *atom1_index,
                    to: *atom2_index,
                    order,
                }
            }).collect();
            
            Ok(serde_wasm_bindgen::to_value(&bonds)?)
        },
        Err(err) => Err(JsValue::from_str(&format!("Error parsing PDB: {}", err))),
    }
}

#[wasm_bindgen]
pub fn prepare_for_3dmol(pdb_content: &str) -> Result<JsValue, JsValue> {
    let parser = PdbParser::new();
    match parser.parse_string(pdb_content) {
        Ok(molecule) => {
            let mut formatted_atoms = Vec::new();
            
            for atom in &molecule.atoms {
                let element_str = format!("{:?}", atom.element);
                let element = element_str.trim_matches(|c| c == '_' || c == ' ');
                
                let pdb_atom_line = format!(
                    "{:<6}{:>5} {:<4}{:1}{:>3} {:1}{:>4}{:1}   {:8.3}{:8.3}{:8.3}{:6.2}{:6.2}           {:>2}",
                    if atom.is_hetatm { "HETATM" } else { "ATOM" },
                    atom.id,
                    atom.name,
                    atom.alt_loc,
                    atom.residue_name,
                    atom.chain_id,
                    atom.residue_id,
                    atom.ins_code,
                    atom.position[0],
                    atom.position[1],
                    atom.position[2],
                    atom.occupancy,
                    atom.b_factor,
                    element
                );
                
                formatted_atoms.push(pdb_atom_line);
            }
            
            if !molecule.atoms.is_empty() {
                let last_atom = &molecule.atoms[molecule.atoms.len() - 1];
                let ter_line = format!(
                    "TER   {:>5}      {:>3} {:1}{:>4}{:1}",
                    last_atom.id + 1,
                    last_atom.residue_name,
                    last_atom.chain_id,
                    last_atom.residue_id,
                    last_atom.ins_code
                );
                formatted_atoms.push(ter_line);
            }
            
            let pdb_string = formatted_atoms.join("\n");
            
            Ok(JsValue::from_str(&pdb_string))
        },
        Err(err) => Err(JsValue::from_str(&format!("Error parsing PDB: {}", err))),
    }
} 