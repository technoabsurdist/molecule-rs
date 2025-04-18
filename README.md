# molecule-rs

A Rust-based molecular visualization library with WebAssembly integration.

## Overview

molecule-rs is a high-performance molecular visualization and analysis toolkit built with Rust. It's designed to parse, process, and visualize molecular structures with a focus on performance and modern web integration.

## Repository Structure

This workspace contains the following crates:

- **molecule-core** - Core functionality for parsing and representing molecular structures
- **molecule-wasm** - WebAssembly bindings for browser integration
- **molecule-web** - Web demonstration application using 3Dmol.js

## Getting Started

### Prerequisites

- Rust and Cargo
- wasm-pack (for WebAssembly compilation)
- Node.js and npm (for the web demonstration)

### Building the Core Library

```bash
cargo build --release
```

### Building the WebAssembly Module

```bash
cd molecule-wasm
wasm-pack build
```

### Running the Web Demonstration

```bash
cd molecule-web
npm install
npm start
```

Then open your browser to http://localhost:8080.

## Features

- Fast PDB file parsing with Rust
- Support for molecular representations (atoms, bonds, residues, chains)
- WebAssembly integration for browser-based applications
- Clean separation between data processing and visualization
- Integration with 3Dmol.js for rich 3D visualization

## Design Philosophy

- **Performance First**: Critical parsing and data processing in Rust
- **Web Ready**: WebAssembly bridge to leverage Rust's performance in browsers
- **Separation of Concerns**: Processing logic separate from visualization
- **Modern Tooling**: Embrace the Rust ecosystem and modern web technologies

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
