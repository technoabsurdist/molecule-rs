use molecule_core::PdbParser;

#[test]
fn test_parse_simple_pdb() {
    let pdb_content = "
ATOM      1  N   ALA A   1      -0.677  -1.230  -0.491  1.00  0.00           N
ATOM      2  CA  ALA A   1       0.381  -0.207  -0.608  1.00  0.00           C
ATOM      3  C   ALA A   1       1.594  -0.775   0.115  1.00  0.00           C
ATOM      4  O   ALA A   1       1.592  -1.926   0.545  1.00  0.00           O
ATOM      5  CB  ALA A   1       0.676   0.095  -2.060  1.00  0.00           C
";

    let parser = PdbParser::new();
    let molecule = parser.parse_string(pdb_content).unwrap();
    
    println!("=== MOLECULE STRUCTURE ===");
    println!("Number of atoms: {}", molecule.atoms.len());
    println!("Number of bonds: {}", molecule.bonds.len());
    
    println!("\n=== ATOMS ===");
    for (i, atom) in molecule.atoms.iter().enumerate() {
        println!(
            "Atom {}: id={}, name={}, element={:?}, position=[{:.3}, {:.3}, {:.3}], residue={}, chain={}",
            i, atom.id, atom.name, atom.element, 
            atom.position[0], atom.position[1], atom.position[2],
            atom.residue_id, atom.chain_id
        );
    }
    
    println!("\n=== BONDS ===");
    for (i, bond) in molecule.bonds.iter().enumerate() {
        println!(
            "Bond {}: atom1={}, atom2={}, order={:?}",
            i, bond.atom1_id, bond.atom2_id, bond.order
        );
    }
    
    println!("\n=== RESIDUES ===");
    for (key, residue) in molecule.residues.iter() {
        println!(
            "Residue {}({}): name={}, atoms={:?}",
            key.0, key.1, residue.name, residue.atoms
        );
    }
    
    assert_eq!(molecule.atoms.len(), 5);
    assert!(molecule.bonds.len() > 0);
    
    let first_atom = &molecule.atoms[0];
    assert_eq!(first_atom.id, 1);
    assert_eq!(first_atom.name, "N");
    assert_eq!(first_atom.residue_id, 1);
    assert_eq!(first_atom.chain_id, 'A');
    assert_eq!(first_atom.alt_loc, ' ');  // Default value for alt_loc
    assert_eq!(first_atom.ins_code, ' ');  // Default value for ins_code
    assert_eq!(first_atom.is_hetatm, false);
}

#[test]
fn test_bond_calculation() {
    let pdb_content = "
ATOM      1  N   ALA A   1       0.000   0.000   0.000  1.00  0.00           N
ATOM      2  CA  ALA A   1       1.000   0.000   0.000  1.00  0.00           C
";
    
    let parser = PdbParser::new();
    let molecule = parser.parse_string(pdb_content).unwrap();
    
    println!("\n=== BOND CALCULATION TEST ===");
    println!("Number of atoms: {}", molecule.atoms.len());
    println!("Number of bonds: {}", molecule.bonds.len());
    
    if !molecule.bonds.is_empty() {
        println!("Bond found between atoms {} and {}", 
            molecule.bonds[0].atom1_id, 
            molecule.bonds[0].atom2_id
        );
        
        // Calculate and print the distance
        let atom1 = &molecule.atoms[0];
        let atom2 = &molecule.atoms[1];
        let dx = atom1.position[0] - atom2.position[0];
        let dy = atom1.position[1] - atom2.position[1];
        let dz = atom1.position[2] - atom2.position[2];
        let distance = (dx*dx + dy*dy + dz*dz).sqrt();
        
        println!("Distance between atoms: {:.3} Å", distance);
    } else {
        println!("No bonds found!");
    }
    
    assert_eq!(molecule.bonds.len(), 1);
}

#[test]
fn test_models() {
    let pdb_content = "
MODEL        1
ATOM      1  N   ALA A   1       0.000   0.000   0.000  1.00  0.00           N
ATOM      2  CA  ALA A   1       1.000   0.000   0.000  1.00  0.00           C
ENDMDL
MODEL        2
ATOM      3  N   ALA A   1       0.000   1.000   0.000  1.00  0.00           N
ATOM      4  CA  ALA A   1       1.000   1.000   0.000  1.00  0.00           C
ENDMDL
";
    
    let parser = PdbParser::new();
    let molecule = parser.parse_string(pdb_content).unwrap();
    
    println!("\n=== MODELS TEST ===");
    println!("Number of atoms: {}", molecule.atoms.len());
    println!("Number of models: {}", molecule.models.len());
    
    for (i, model) in molecule.models.iter().enumerate() {
        println!("Model {}: id={}, atoms={:?}", i, model.id, model.atoms);
    }
    
    assert_eq!(molecule.atoms.len(), 4);
    assert_eq!(molecule.models.len(), 2);
    assert_eq!(molecule.models[0].atoms.len(), 2);
    assert_eq!(molecule.models[1].atoms.len(), 2);
}

#[test]
fn test_hetatm() {
    let pdb_content = "
ATOM      1  N   ALA A   1       0.000   0.000   0.000  1.00  0.00           N
HETATM    2  O   HOH B   1       5.000   5.000   5.000  1.00  0.00           O
";
    
    let parser = PdbParser::new();
    let molecule = parser.parse_string(pdb_content).unwrap();
    
    println!("\n=== HETATM TEST ===");
    println!("Number of atoms: {}", molecule.atoms.len());
    
    for (i, atom) in molecule.atoms.iter().enumerate() {
        println!(
            "Atom {}: id={}, name={}, element={:?}, is_hetatm={}",
            i, atom.id, atom.name, atom.element, atom.is_hetatm
        );
    }
    
    assert_eq!(molecule.atoms.len(), 2);
    assert_eq!(molecule.atoms[0].is_hetatm, false);
    assert_eq!(molecule.atoms[1].is_hetatm, true);
}

#[test]
fn test_alt_loc_and_ins_code() {
    let pdb_content = "
ATOM      1  N  AALA A   1       0.000   0.000   0.000  1.00  0.00           N
ATOM      2  N  BALA A   1       0.100   0.100   0.100  1.00  0.00           N
ATOM      3  CA AALA A   1       1.000   0.000   0.000  1.00  0.00           C
ATOM      4  CA BALA A   1       1.100   0.100   0.100  1.00  0.00           C
ATOM      5  N   GLY A   1A      5.000   5.000   5.000  1.00  0.00           N
";
    
    let parser = PdbParser::new();
    let molecule = parser.parse_string(pdb_content).unwrap();
    
    println!("\n=== ALT LOC AND INS CODE TEST ===");
    println!("Number of atoms: {}", molecule.atoms.len());
    
    for (i, atom) in molecule.atoms.iter().enumerate() {
        println!(
            "Atom {}: id={}, name={}, alt_loc={}, ins_code={}",
            i, atom.id, atom.name, atom.alt_loc, atom.ins_code
        );
    }
    
    for ((res_id, ins_code), residue) in molecule.residues.iter() {
        println!(
            "Residue {}({}): name={}, atoms={:?}, ins_code={}",
            res_id, ins_code, residue.name, residue.atoms, residue.ins_code
        );
    }
    
    assert_eq!(molecule.atoms.len(), 5);
    assert_eq!(molecule.atoms[0].alt_loc, 'A');
    assert_eq!(molecule.atoms[1].alt_loc, 'B');
    assert_eq!(molecule.atoms[4].ins_code, 'A');
}