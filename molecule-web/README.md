# molecule-web

A web demonstration of the molecule-rs library with WebAssembly and 3Dmol.js integration.

## Overview

This is a simple web application that demonstrates the integration of:

1. molecule-rs - Rust-based molecular data processing library
2. WebAssembly - For high-performance processing in the browser
3. 3Dmol.js - For molecular visualization

## Features

- Load PDB files directly from text or fetch from RCSB
- Interactive 3D visualization with multiple rendering styles
- Color molecules by various properties (element, residue, chain, etc.)
- Powered by fast Rust code running in WebAssembly

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- wasm-pack (for building the WebAssembly module)

### Installation

1. Make sure the WASM module is built first:

```bash
cd ../molecule-wasm
wasm-pack build
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Open your browser and navigate to `http://localhost:8080`

### Building for Production

```bash
npm run build
```

This will create a `dist` directory with the production build.

## Usage

1. Select an example PDB from the dropdown or paste your own PDB data
2. Click "Load PDB" to visualize the molecule
3. Use the style controls to change the visualization
4. Click "Apply Style" to update the rendering

## Technology Stack

- Rust - Core molecular processing logic
- WebAssembly - Performance-critical calculations in the browser
- 3Dmol.js - Molecular visualization
- webpack - Bundling and development server

## License

MIT
