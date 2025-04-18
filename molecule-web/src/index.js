import * as $3Dmol from "3dmol";
import { init, prepare_for_3dmol } from "../pkg/index";

// Initialize the viewer
let viewer = null;
let currentMolecule = null;

async function initializeApp() {
  try {
    await init();
    console.log("WASM module initialized");

    document.getElementById("loading-indicator").style.display = "none";

    viewer = $3Dmol.createViewer(document.getElementById("viewer"), {
      backgroundColor: "white",
    });

    setupEventListeners();
  } catch (error) {
    console.error("Failed to initialize application:", error);
    document.getElementById("loading-indicator").textContent =
      "Error: " + error.message;
  }
}

function setupEventListeners() {
  document
    .getElementById("example-pdb")
    .addEventListener("change", async (e) => {
      const pdbId = e.target.value;
      if (!pdbId) return;

      try {
        document.getElementById("loading-indicator").style.display = "block";
        document.getElementById(
          "loading-indicator"
        ).textContent = `Loading ${pdbId}...`;

        const response = await fetch(
          `https://files.rcsb.org/download/${pdbId}.pdb`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch PDB: ${response.statusText}`);
        }

        const pdbData = await response.text();
        document.getElementById("pdb-input").value = pdbData;
        await loadPdbData(pdbData);
      } catch (error) {
        console.error("Error loading example PDB:", error);
        document.getElementById("loading-indicator").textContent =
          "Error: " + error.message;
      }
    });

  // Load PDB button
  document.getElementById("load-pdb").addEventListener("click", async () => {
    const pdbData = document.getElementById("pdb-input").value.trim();
    if (!pdbData) {
      alert("Please enter PDB data or select an example");
      return;
    }

    await loadPdbData(pdbData);
  });

  // Apply style button
  document.getElementById("apply-style").addEventListener("click", () => {
    if (!currentMolecule) {
      alert("Please load a molecule first");
      return;
    }

    applyStyle();
  });
}

async function loadPdbData(pdbData) {
  try {
    document.getElementById("loading-indicator").style.display = "block";
    document.getElementById("loading-indicator").textContent =
      "Processing data...";

    // Use our Rust WASM module to process the PDB data and get a formatted PDB string
    const pdbString = prepare_for_3dmol(pdbData);

    // Clear the viewer
    viewer.clear();

    // Get current styling options
    const styleType = document.getElementById("style-select").value;
    const colorScheme = document.getElementById("color-scheme").value;

    // Add the model directly from the PDB string
    // 3Dmol.js will parse this using its own parsers
    const model = viewer.addModel(pdbString, "pdb");

    // Store the current molecule for reference
    currentMolecule = model;

    // Apply initial style
    applyStyle(styleType, colorScheme);

    // Show the molecule
    viewer.zoomTo();
    viewer.render();

    document.getElementById("loading-indicator").style.display = "none";
  } catch (error) {
    console.error("Error loading PDB data:", error);
    document.getElementById("loading-indicator").textContent =
      "Error: " + error.message;
  }
}

function applyStyle(styleType = null, colorScheme = null) {
  // Get style parameters from UI if not provided
  styleType = styleType || document.getElementById("style-select").value;
  colorScheme = colorScheme || document.getElementById("color-scheme").value;

  // Clear previous styles
  viewer.setStyle({}, {});

  // Define color scheme
  let colorObj = {};
  switch (colorScheme) {
    case "element":
      colorObj = "element";
      break;
    case "residue":
      colorObj = "residue";
      break;
    case "chain":
      colorObj = "chain";
      break;
    case "secondary":
      colorObj = "secondary";
      break;
    default:
      colorObj = "element";
  }

  // Apply style
  switch (styleType) {
    case "stick":
      viewer.setStyle({}, { stick: { radius: 0.15, color: colorObj } });
      break;
    case "line":
      viewer.setStyle({}, { line: { color: colorObj } });
      break;
    case "cross":
      viewer.setStyle({}, { cross: { lineWidth: 2, colorscheme: colorObj } });
      break;
    case "sphere":
      viewer.setStyle({}, { sphere: { radius: 0.8, color: colorObj } });
      break;
    case "cartoon":
      viewer.setStyle({}, { cartoon: { color: colorObj } });
      break;
    default:
      viewer.setStyle({}, { stick: { radius: 0.15, color: colorObj } });
  }

  // Update the view
  viewer.render();
}

// Initialize the app when the page loads
window.addEventListener("load", initializeApp);
