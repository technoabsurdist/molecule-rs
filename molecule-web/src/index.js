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

async function searchPdbStructures(query) {
  // PDB API endpoint for text search
  const url = "https://search.rcsb.org/rcsbsearch/v2/query";

  // Create a search query for PDB entries with titles or description containing the query
  const searchPayload = {
    query: {
      type: "group",
      logical_operator: "or",
      nodes: [
        {
          type: "terminal",
          service: "text",
          parameters: {
            attribute: "struct.title",
            operator: "contains_words",
            value: query,
          },
        },
        {
          type: "terminal",
          service: "text",
          parameters: {
            attribute:
              "rcsb_entry_info.deposited_polymer_entity_instance_count",
            operator: "greater",
            value: 0,
          },
        },
      ],
    },
    return_type: "entry",
    request_options: {
      paginate: {
        start: 0,
        rows: 10,
      },
    },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(searchPayload),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result_set || [];
  } catch (error) {
    console.error("Error searching PDB:", error);
    return [];
  }
}

async function getStructureInfo(pdbId) {
  try {
    // Use the PDB Data API to get structure details
    const response = await fetch(
      `https://data.rcsb.org/rest/v1/core/entry/${pdbId}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch structure info: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching info for ${pdbId}:`, error);
    return null;
  }
}

function setupEventListeners() {
  // Set up search bar and results
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");

  let searchTimeout;

  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();

    if (query.length < 3) {
      searchResults.innerHTML = "";
      searchResults.style.display = "none";
      return;
    }

    searchTimeout = setTimeout(async () => {
      searchResults.innerHTML = "<div class='searching'>Searching...</div>";
      // Make search results visible
      searchResults.style.display = "block";
      const results = await searchPdbStructures(query);

      if (results.length === 0) {
        searchResults.innerHTML =
          "<div class='no-results'>No structures found</div>";
        return;
      }

      // Clear previous results and display new ones
      searchResults.innerHTML = "";

      // Process results to get more information about each entry
      const resultPromises = results.map(async (result) => {
        const pdbId = result.identifier;
        const info = await getStructureInfo(pdbId);

        const title = info?.struct?.title || "Unknown structure";

        const resultItem = document.createElement("div");
        resultItem.className = "search-result-item";
        resultItem.innerHTML = `
          <strong>${pdbId}</strong> - ${title}
        `;

        resultItem.addEventListener("click", async () => {
          searchInput.value = `${pdbId} - ${title}`;
          searchResults.innerHTML = "";
          searchResults.style.display = "none";
          await loadPdbById(pdbId);
        });

        return resultItem;
      });

      const resultElements = await Promise.all(resultPromises);
      resultElements.forEach((element) => searchResults.appendChild(element));
    }, 500);
  });

  // Close search results when clicking outside
  document.addEventListener("click", (e) => {
    if (!searchResults.contains(e.target) && e.target !== searchInput) {
      searchResults.style.display = "none";
    }
  });

  // Load PDB button
  document.getElementById("load-pdb").addEventListener("click", async () => {
    const pdbData = document.getElementById("pdb-input").value.trim();
    if (!pdbData) {
      alert("Please enter PDB data or use the search");
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

async function loadPdbById(pdbId) {
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
    console.error("Error loading PDB:", error);
    document.getElementById("loading-indicator").textContent =
      "Error: " + error.message;
    setTimeout(() => {
      document.getElementById("loading-indicator").style.display = "none";
    }, 3000);
  }
}

async function loadPdbData(pdbData) {
  try {
    document.getElementById("loading-indicator").style.display = "block";
    document.getElementById("loading-indicator").textContent =
      "Processing molecule...";

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
    setTimeout(() => {
      document.getElementById("loading-indicator").style.display = "none";
    }, 3000);
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
