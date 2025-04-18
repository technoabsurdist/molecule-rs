use std::collections::HashMap;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Element {
    H, He,
    Li, Be, B, C, N, O, F, Ne,
    Na, Mg, Al, Si, P, S, Cl, Ar,
    K, Ca, 
    Fe, Cu, Zn,
    // Add more elements as needed
    Unknown,
}

impl Element {
    pub fn from_symbol(symbol: &str) -> Self {
        match symbol.trim() {
            "H" => Element::H,
            "HE" | "He" => Element::He,
            "LI" | "Li" => Element::Li,
            "BE" | "Be" => Element::Be,
            "B" => Element::B,
            "C" => Element::C,
            "N" => Element::N,
            "O" => Element::O,
            "F" => Element::F,
            "NE" | "Ne" => Element::Ne,
            "NA" | "Na" => Element::Na,
            "MG" | "Mg" => Element::Mg,
            "AL" | "Al" => Element::Al,
            "SI" | "Si" => Element::Si,
            "P" => Element::P,
            "S" => Element::S,
            "CL" | "Cl" => Element::Cl,
            "AR" | "Ar" => Element::Ar,
            "K" => Element::K,
            "CA" | "Ca" => Element::Ca,
            "FE" | "Fe" => Element::Fe,
            "CU" | "Cu" => Element::Cu,
            "ZN" | "Zn" => Element::Zn,
            _ => Element::Unknown,
        }
    }
}

#[derive(Debug, Clone)]
pub struct Atom {
    pub id: usize,
    pub name: String,
    pub element: Element,
    pub position: [f32; 3],
    pub residue_id: usize,
    pub chain_id: char,
    pub b_factor: f32,
    pub occupancy: f32,
    pub residue_name: String,
    pub alt_loc: char,           // Alternate location indicator
    pub ins_code: char,          // Insertion code
    pub is_hetatm: bool,         // Whether this atom is from a HETATM record
}

#[derive(Debug, Clone)]
pub struct Bond {
    pub atom1_id: usize,
    pub atom2_id: usize,
    pub order: BondOrder,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum BondOrder {
    Single,
    Double,
    Triple,
    Aromatic,
}

#[derive(Debug, Clone)]
pub struct Residue {
    pub id: usize,
    pub name: String,
    pub atoms: Vec<usize>,
    pub ins_code: char,        // Insertion code
}

#[derive(Debug, Clone)]
pub struct Chain {
    pub id: char,
    pub residues: Vec<usize>,
}

#[derive(Debug, Clone)]
pub struct Model {
    pub id: usize,
    pub atoms: Vec<usize>,
}

#[derive(Debug, Clone)]
pub struct Molecule {
    pub atoms: Vec<Atom>,
    pub bonds: Vec<Bond>,
    pub residues: HashMap<(usize, char), Residue>,  
    pub chains: HashMap<char, Chain>,
    pub models: Vec<Model>,
    pub current_model: Option<usize>,
}

impl Molecule {
    pub fn new() -> Self {
        Self {
            atoms: Vec::new(),
            bonds: Vec::new(),
            residues: HashMap::new(),
            chains: HashMap::new(),
            models: Vec::new(),
            current_model: None,
        }
    }
    
    pub fn add_atom(&mut self, atom: Atom) -> usize {
        let atom_id = atom.id;
        let residue_id = atom.residue_id;
        let residue_name = atom.residue_name.clone();
        let ins_code = atom.ins_code;
        
        self.atoms.push(atom);
        
        let residue_key = (residue_id, ins_code);
        if !self.residues.contains_key(&residue_key) {
            self.residues.insert(residue_key, Residue {
                id: residue_id,
                name: residue_name,
                atoms: Vec::new(),
                ins_code,
            });
        }
        
        if let Some(residue) = self.residues.get_mut(&residue_key) {
            residue.atoms.push(atom_id);
        }
        
        let chain_id = self.atoms.last().unwrap().chain_id;
        if !self.chains.contains_key(&chain_id) {
            self.chains.insert(chain_id, Chain {
                id: chain_id,
                residues: Vec::new(),
            });
        }
        
        if let Some(chain) = self.chains.get_mut(&chain_id) {
            if !chain.residues.contains(&residue_id) {
                chain.residues.push(residue_id);
            }
        }
        
        // Add to current model if one exists
        if let Some(model_id) = self.current_model {
            if let Some(model) = self.models.get_mut(model_id - 1) {  // Models are 1-indexed
                model.atoms.push(atom_id);
            }
        }
        
        atom_id
    }
    
    pub fn add_bond(&mut self, atom1_id: usize, atom2_id: usize, order: BondOrder) {
        self.bonds.push(Bond {
            atom1_id,
            atom2_id,
            order,
        });
    }
    
    pub fn start_model(&mut self, model_id: usize) {
        self.models.push(Model {
            id: model_id,
            atoms: Vec::new(),
        });
        self.current_model = Some(model_id);
    }
    
    pub fn end_model(&mut self) {
        self.current_model = None;
    }
    
    pub fn calculate_bonds(&mut self) {
        let mut bonds_to_add = Vec::new();
        
        for i in 0..self.atoms.len() {
            let atom1 = &self.atoms[i];
            
            for j in (i+1)..self.atoms.len() {
                let atom2 = &self.atoms[j];
                
                let dx = atom1.position[0] - atom2.position[0];
                let dy = atom1.position[1] - atom2.position[1];
                let dz = atom1.position[2] - atom2.position[2];
                let distance_squared = dx*dx + dy*dy + dz*dz;
                
                // Rough bond distance threshold (could be improved with element-specific logic)
                if distance_squared < 4.0 {
                    bonds_to_add.push((atom1.id, atom2.id));
                }
            }
        }
        
        for (atom1_id, atom2_id) in bonds_to_add {
            self.add_bond(atom1_id, atom2_id, BondOrder::Single);
        }
    }
}