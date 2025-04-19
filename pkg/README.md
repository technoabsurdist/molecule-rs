# molecule-wasm

WebAssembly bindings for the molecule-rs molecular visualization library.

## Overview

This crate provides WebAssembly bindings for the molecule-rs library, allowing it to be used in web applications. It's designed to work particularly well with 3Dmol.js for visualization.

## Features

- Parse PDB files directly in the browser using Rust's performance
- Format molecular data for 3Dmol.js visualization
- Provide a clean, easy-to-use API for JavaScript applications

## Usage

The main functions provided by this crate are:

### parse_pdb

Parses a PDB string and returns a JavaScript-friendly molecule representation.

```javascript
import { parse_pdb } from "molecule-wasm";

const pdbString = "..."; // PDB file content
const molecule = parse_pdb(pdbString);
```

### prepare_for_3dmol

Parses a PDB string and returns data specifically formatted for 3Dmol.js visualization.

```javascript
import { prepare_for_3dmol } from "molecule-wasm";
import * as $3Dmol from "3dmol";

const pdbString = "..."; // PDB file content
const moleculeData = prepare_for_3dmol(pdbString);

// Create a 3Dmol.js viewer
const viewer = $3Dmol.createViewer(document.getElementById("viewer"));
const model = viewer.addModel();

// Add atoms and bonds
model.addAtoms(moleculeData.atoms);
model.addBonds(moleculeData.bonds);

// Apply style and render
viewer.setStyle({}, { stick: {} });
viewer.zoomTo();
viewer.render();
```

## Building from Source

To build this crate, you'll need:

1. Rust and Cargo
2. wasm-pack

```bash
# Install wasm-pack if you don't have it
cargo install wasm-pack

# Build the WebAssembly package
wasm-pack build
```

## License

MIT
