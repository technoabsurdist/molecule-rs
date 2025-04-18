use std::fs::File;
use std::io::{self, BufRead, BufReader};
use std::path::Path;

use crate::structure::{Atom, Element, Molecule};

pub struct PdbParser;

impl PdbParser {
    pub fn new() -> Self {
        Self
    }
    
    pub fn parse_file<P: AsRef<Path>>(&self, path: P) -> io::Result<Molecule> {
        let file = File::open(path)?;
        let reader = BufReader::new(file);
        
        self.parse_reader(reader)
    }
    
    pub fn parse_string(&self, content: &str) -> io::Result<Molecule> {
        let reader = BufReader::new(content.as_bytes());
        
        self.parse_reader(reader)
    }
    
    pub fn parse_reader<R: BufRead>(&self, reader: R) -> io::Result<Molecule> {
        let mut molecule = Molecule::new();
        
        for line in reader.lines() {
            let line = line?;
            
            if line.starts_with("MODEL ") {
                if let Some(model_id) = self.parse_model_line(&line) {
                    molecule.start_model(model_id);
                }
            } else if line.starts_with("ENDMDL") {
                molecule.end_model();
            } else if line.starts_with("ATOM  ") || line.starts_with("HETATM") {
                let is_hetatm = line.starts_with("HETATM");
                if let Some(mut atom) = self.parse_atom_line(&line) {
                    atom.is_hetatm = is_hetatm;
                    molecule.add_atom(atom);
                }
            }
            // For now we ignore TER, ANISOU and other records
        }
        
        // Calculate bonds based on distances
        molecule.calculate_bonds();
        
        Ok(molecule)
    }
    
    fn parse_model_line(&self, line: &str) -> Option<usize> {
        if line.len() < 14 {
            return None;
        }
        
        line[10..14].trim().parse::<usize>().ok()
    }
    
    fn parse_atom_line(&self, line: &str) -> Option<Atom> {
        if line.len() < 54 {
            return None;
        }
        
        // Parse according to PDB format specification
        // See: https://www.wwpdb.org/documentation/file-format-content/format33/sect9.html
        
        let atom_id = line[6..11].trim().parse::<usize>().ok()?;
        let atom_name = line[12..16].trim().to_string();
        
        // Alternate location indicator
        let alt_loc = if line.len() > 16 {
            line.chars().nth(16).unwrap_or(' ')
        } else {
            ' '
        };
        
        let residue_name = line[17..20].trim().to_string();
        
        let chain_id = line[21..22].chars().next().unwrap_or('A');
        let residue_id = line[22..26].trim().parse::<usize>().ok()?;
        
        // Insertion code
        let ins_code = if line.len() > 26 {
            line.chars().nth(26).unwrap_or(' ')
        } else {
            ' '
        };
        
        let x = line[30..38].trim().parse::<f32>().ok()?;
        let y = line[38..46].trim().parse::<f32>().ok()?;
        let z = line[46..54].trim().parse::<f32>().ok()?;
        
        let occupancy = if line.len() >= 60 {
            line[54..60].trim().parse::<f32>().unwrap_or(1.0)
        } else {
            1.0
        };
        
        let b_factor = if line.len() >= 66 {
            line[60..66].trim().parse::<f32>().unwrap_or(0.0)
        } else {
            0.0
        };
        
        // Element symbol (columns 77-78)
        let element = if line.len() >= 78 {
            let element_str = line[76..78].trim();
            if !element_str.is_empty() {
                Element::from_symbol(element_str)
            } else {
                // Fallback to inferring from atom name
                infer_element_from_atom_name(&atom_name)
            }
        } else {
            infer_element_from_atom_name(&atom_name)
        };
        
        Some(Atom {
            id: atom_id,
            name: atom_name,
            element,
            position: [x, y, z],
            residue_id,
            chain_id,
            b_factor,
            occupancy,
            residue_name,
            alt_loc,
            ins_code,
            is_hetatm: false, // This will be set by the caller
        })
    }
}

// Helper function to better infer elements from atom names
fn infer_element_from_atom_name(atom_name: &str) -> Element {
    // First character is usually the element for common elements
    let trimmed_name = atom_name.trim();
    if trimmed_name.is_empty() {
        return Element::Unknown;
    }
    
    // Special cases for common atom names
    match trimmed_name {
        "CA" => Element::C,  // Alpha carbon
        "CB" => Element::C,  // Beta carbon
        "CG" => Element::C,  // Gamma carbon
        "CD" => Element::C,  // Delta carbon
        "CE" => Element::C,  // Epsilon carbon
        "CZ" => Element::C,  // Zeta carbon
        "N" | "NZ" | "NH1" | "NH2" => Element::N,
        "O" | "OG" | "OD1" | "OE1" | "OD2" | "OE2" => Element::O,
        "SD" | "SG" => Element::S,
        _ => {
            // Standard case: first character is the element
            let first_char = trimmed_name.chars().next().unwrap();
            match first_char {
                'H' => Element::H,
                'C' => Element::C,
                'N' => Element::N,
                'O' => Element::O,
                'S' => Element::S,
                'P' => Element::P,
                'F' => Element::F,
                'K' => Element::K,
                'B' => Element::B,
                _ => Element::Unknown,
            }
        }
    }
}