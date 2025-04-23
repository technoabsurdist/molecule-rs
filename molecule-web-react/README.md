# molecule.rs react frontend

react-based web frontend for the molecule.rs protein visualization engine.

## tech stack

- react 18
- 3dmol.js for protein visualization
- rust/wasm backend for molecular processing

## development

```
npm install
npm start
```

## build

```
npm run build
```

## architecture

- stateless component architecture
- api.js: handles rcsb protein database api calls
- components/
  - header.js: application header component
  - sidebar.js: search and control interface
  - viewer.js: 3d molecule visualization with 3dmol.js
  - sequencedisplay.js: protein sequence display

connects to rust/wasm backend for efficient molecular data processing.
