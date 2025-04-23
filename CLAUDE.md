# Molecule-RS Development Guide

## Build & Test Commands
- Build all: `cargo build --release`
- Build WASM: `cd molecule-wasm && wasm-pack build`
- Build web app: `cd molecule-web && npm run build`
- Run web dev server: `cd molecule-web && npm start`
- Run tests: `cargo test`
- Run single test: `cargo test test_name`
- Run specific test file: `cargo test --test parser_tests`

## Code Style Guidelines
- Use Rust edition 2024
- Follow standard Rust naming conventions:
  - snake_case for variables, functions, files
  - CamelCase for types and traits
- Imports: Organize by module, then alphabetically
- Formatting: Use rustfmt defaults
- Error handling: Use Result<T, E> for recoverable errors, panic for unrecoverable
- Tests: Include detailed assertions with descriptive error messages
- Documentation: Document public API with /// comments
- Prefer immutability and use strong typing

## Project Structure
- molecule-core: Core Rust library for molecule parsing/representation
- molecule-wasm: WebAssembly bindings for the core library
- molecule-web: Web frontend with 3Dmol.js integration