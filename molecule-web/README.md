# Molecule Web Viewer with AI Protein Assistant

This web application allows you to visualize and interact with 3D protein structures. It features an AI-powered chat assistant that can answer questions about the protein you're viewing.

## Features

- 3D visualization of protein structures with multiple rendering styles
- Color-coded chains for better visualization of protein subunits
- Search and load proteins directly from the PDB database
- Drag-and-drop support for local PDB files
- AI assistant that can answer questions about the protein structure

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- OpenAI API key

### Installation

1. Create a `.env` file in the `molecule-web` directory with your OpenAI API key:

```
OPENAI_API_KEY=your_openai_api_key_here
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Open your browser to [http://localhost:8080](http://localhost:8080)

## Using the Protein AI Assistant

The AI assistant can answer a wide range of questions about the protein structure you're viewing, such as:

- "What are the secondary structures in this protein?"
- "How many chains does this protein have?"
- "What is the function of this protein?"
- "Explain the significance of the beta sheets in this structure"
- "Which amino acids are commonly found at the binding site?"

Load a protein structure first, then ask questions in the chat panel on the right side of the screen.

## Privacy and API Usage

- The application uses your OpenAI API key to generate responses about protein structures
- API calls are made directly from your browser to OpenAI's servers
- Be mindful of API usage costs - each question generates an API call

## Development

The application is built with:

- Rust and WebAssembly for molecular structure parsing
- 3Dmol.js for 3D visualization
- OpenAI API for the protein assistant chat functionality

## Technology Stack

- **Rust**: Core molecular structure processing
- **WebAssembly**: Browser integration for Rust code
- **JavaScript/HTML/CSS**: Web interface
- **3Dmol.js**: 3D molecular visualization
- **OpenAI API**: Powers the AI protein assistant
- **webpack**: Bundling and development server

## License

MIT

## GitHub Pages Deployment

This project is set up to automatically deploy to GitHub Pages when changes are pushed to the main branch. The deployment is handled by a GitHub Actions workflow in `.github/workflows/github-pages.yml`.

### Manual Deployment

If you need to deploy manually:

1. Build the project:

   ```
   cd molecule-web
   npm run build
   ```

2. The built files will be in the `dist` directory. These can be deployed to any static hosting service.

### Local Development

1. Install dependencies:

   ```
   cd molecule-web
   npm install
   ```

2. Start the development server:

   ```
   npm start
   ```

3. Open your browser at http://localhost:8080

### Building the WASM Module

The WebAssembly module is built automatically when running the build process. If you need to build it manually:

1. Install wasm-pack:

   ```
   curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
   ```

2. Build the WASM module:

   ```
   cd molecule-wasm
   wasm-pack build --target web
   ```

3. The built module will be in the `pkg` directory.
