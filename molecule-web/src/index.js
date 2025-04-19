import * as $3Dmol from "3dmol";
import { init, prepare_for_3dmol } from "../pkg/index";
import {
  generateProteinResponse,
  fetchProteinInfo,
  fetchProteinSequence,
} from "./api";

// Initialize the viewer and protein data store
let viewer = null;
let currentMolecule = null;
let currentProteinData = {
  pdbId: null,
  title: null,
  molecule: null,
  info: null,
  sequence: null,
};

// Store chat history for context
let chatHistory = [];

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

  // Add a sequence display section to the sidebar
  const sidebar = document.querySelector(".sidebar");
  const sequenceSection = document.createElement("div");
  sequenceSection.className = "sequence-container";
  sequenceSection.innerHTML = `
    <h3>Protein Sequence</h3>
    <div id="sequence-display" class="sequence-display">
      <p class="no-sequence">No protein loaded. Use the search above to find a protein.</p>
    </div>
  `;

  // Add sequence section to the end of the sidebar
  sidebar.appendChild(sequenceSection);

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

  // Setup chat functionality
  setupChatFunctionality();
}

async function loadPdbById(pdbId) {
  try {
    document.getElementById("loading-indicator").style.display = "block";
    document.getElementById(
      "loading-indicator"
    ).textContent = `Loading ${pdbId}...`;

    // Fetch protein info for the knowledge base
    const proteinInfo = await fetchProteinInfo(pdbId);

    // Fetch protein sequence data
    const sequenceData = await fetchProteinSequence(pdbId);

    const response = await fetch(
      `https://files.rcsb.org/download/${pdbId}.pdb`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch PDB: ${response.statusText}`);
    }

    const pdbData = await response.text();
    document.getElementById("pdb-input").value = pdbData;

    // Update current protein data
    currentProteinData.pdbId = pdbId;
    currentProteinData.title = proteinInfo?.struct?.title || `Protein ${pdbId}`;
    currentProteinData.info = proteinInfo;
    currentProteinData.sequence = sequenceData;

    // Update sequence display in the sidebar
    updateSequenceDisplay(sequenceData);

    await loadPdbData(pdbData);

    // Reset chat history when loading a new protein
    chatHistory = [];
    const chatMessages = document.getElementById("chat-messages");
    chatMessages.innerHTML = "";

    // Add a welcome message specific to this protein
    addMessage(
      `Welcome! I'm ready to answer questions about ${currentProteinData.title} (PDB ID: ${pdbId}).`,
      "system"
    );
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
    // Always use chain coloring
    const colorScheme = "chain";

    // Add the model directly from the PDB string
    // 3Dmol.js will parse this using its own parsers
    const model = viewer.addModel(pdbString, "pdb");

    // Store the current molecule for reference
    currentMolecule = model;
    currentProteinData.molecule = model;

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
  colorScheme = "chain"; // Always use chain coloring

  // Clear previous styles
  viewer.setStyle({}, {});

  // Apply style
  switch (styleType) {
    case "stick":
      // Get unique chains and assign distinct colors to each
      const chains = {};
      const chainColors = [
        "red",
        "green",
        "blue",
        "orange",
        "purple",
        "cyan",
        "magenta",
        "yellow",
        "lime",
        "pink",
      ];

      // Then override with per-chain colors for better visualization
      if (currentMolecule) {
        // Extract unique chains and apply distinct colors
        const atoms = currentMolecule.selectedAtoms({});
        let colorIndex = 0;

        atoms.forEach((atom) => {
          if (!chains[atom.chain]) {
            chains[atom.chain] = chainColors[colorIndex % chainColors.length];
            colorIndex++;
          }
        });

        // Apply distinct color to each chain
        Object.keys(chains).forEach((chain) => {
          viewer.setStyle(
            { chain: chain },
            { stick: { radius: 0.15, color: chains[chain] } }
          );
        });
      } else {
        viewer.setStyle({}, { stick: { radius: 0.15, colorscheme: "chain" } });
      }
      break;
    case "line":
      // Apply distinct colors for each chain
      applyChainColoring("line", {});
      break;
    case "cross":
      // Apply distinct colors for each chain
      applyChainColoring("cross", { lineWidth: 2 });
      break;
    case "sphere":
      // Apply distinct colors for each chain
      applyChainColoring("sphere", { radius: 0.8 });
      break;
    case "cartoon":
      // Apply distinct colors for each chain
      applyChainColoring("cartoon", {});
      break;
    default:
      // Apply distinct colors for each chain
      applyChainColoring("stick", { radius: 0.15 });
  }

  // Update the view
  viewer.render();
}

// Helper function to apply chain-based coloring to any style
function applyChainColoring(styleType, styleOptions) {
  const chains = {};
  const chainColors = [
    "red",
    "green",
    "blue",
    "orange",
    "purple",
    "cyan",
    "magenta",
    "yellow",
    "lime",
    "pink",
  ];

  if (currentMolecule) {
    // Extract unique chains and apply distinct colors
    const atoms = currentMolecule.selectedAtoms({});
    let colorIndex = 0;

    atoms.forEach((atom) => {
      if (!chains[atom.chain]) {
        chains[atom.chain] = chainColors[colorIndex % chainColors.length];
        colorIndex++;
      }
    });

    // Apply distinct color to each chain
    Object.keys(chains).forEach((chain) => {
      const style = {};
      style[styleType] = { ...styleOptions, color: chains[chain] };
      viewer.setStyle({ chain: chain }, style);
    });
  } else {
    const style = {};
    style[styleType] = { ...styleOptions, colorscheme: "chain" };
    viewer.setStyle({}, style);
  }
}

// Function to set up the chat functionality
function setupChatFunctionality() {
  const chatInput = document.getElementById("chat-input");
  const sendButton = document.getElementById("send-message");
  const chatMessages = document.getElementById("chat-messages");
  const suggestionChips = document.querySelectorAll(".suggestion-chip");

  // Function to parse and render simple Markdown in message content
  function parseMarkdown(text) {
    if (!text) return "";

    // Sanitize HTML to prevent XSS attacks
    text = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Replace code blocks with HTML <pre><code> tags (do this first to prevent formatting inside code)
    text = text.replace(/```([\s\S]*?)```/g, function (match, code) {
      // Don't process markdown inside code blocks
      return "<pre><code>" + code.trim() + "</code></pre>";
    });

    // Replace inline code with HTML <code> tags
    text = text.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Replace bold markdown (**text**) with HTML <strong> tags
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Replace italic markdown (*text*) with HTML <em> tags
    // Negative lookahead to avoid matching inside already processed bold text
    text = text.replace(/\*(?!\*)(.*?)(?<!\*)\*/g, "<em>$1</em>");

    // Replace ordered lists
    text = text.replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>");
    text = text.replace(/(<li>.*<\/li>)/s, "<ol>$1</ol>");

    // Replace unordered lists
    text = text.replace(/^[\*\-]\s+(.+)$/gm, "<li>$1</li>");
    text = text.replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>");

    // Handle paragraphs and line breaks
    text = text.replace(/\n\n/g, "</p><p>");
    text = text.replace(/\n/g, "<br>");

    // Wrap with paragraph if not already wrapped
    if (!text.startsWith("<p>")) {
      text = "<p>" + text + "</p>";
    }

    return text;
  }

  // Function to add a message to the chat
  function addMessage(text, type) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${type}-message`;

    const messageContent = document.createElement("div");
    messageContent.className = "message-content";

    // Use innerHTML with parsed markdown instead of textContent
    messageContent.innerHTML = parseMarkdown(text);

    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);

    // Save message to history (except system messages)
    if (type !== "system") {
      chatHistory.push({ type, content: text });

      // Limit history to last 10 messages to keep context window manageable
      if (chatHistory.length > 10) {
        chatHistory = chatHistory.slice(chatHistory.length - 10);
      }
    }

    // Scroll to the bottom of the chat
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Handle sending a message
  async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // Add user message to chat
    addMessage(text, "user");

    // Clear input
    chatInput.value = "";

    // Show loading indicator
    const loadingDiv = document.createElement("div");
    loadingDiv.className = "message assistant-message loading-message";
    loadingDiv.innerHTML =
      '<div class="message-content"><div class="typing-indicator"><span></span><span></span><span></span></div></div>';
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
      // Check if a protein is loaded
      if (!currentMolecule || !currentProteinData.pdbId) {
        // Remove loading indicator
        chatMessages.removeChild(loadingDiv);

        // Add response for when no protein is loaded
        addMessage(
          "Please load a protein structure first to ask questions about it.",
          "assistant"
        );
        return;
      }

      // Generate response using OpenAI API
      const response = await generateProteinResponse(
        text,
        currentProteinData,
        chatHistory
      );

      // Remove loading indicator
      chatMessages.removeChild(loadingDiv);

      // Add the response
      addMessage(response, "assistant");
    } catch (error) {
      console.error("Error getting response:", error);

      // Remove loading indicator
      chatMessages.removeChild(loadingDiv);

      // Add error message
      addMessage(
        "I'm sorry, I encountered an error while processing your question. Please try again.",
        "assistant"
      );
    }
  }

  // Send message when clicking the send button
  sendButton.addEventListener("click", sendMessage);

  // Send message when pressing Enter (but allow Shift+Enter for new lines)
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent default to avoid new line
      sendMessage();
    }
  });

  // Handle suggestion chips
  suggestionChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chatInput.value = chip.textContent;
      sendMessage();
    });
  });
}

// Update the global addMessage function too
window.addMessage = function (text, type) {
  const chatMessages = document.getElementById("chat-messages");

  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${type}-message`;

  const messageContent = document.createElement("div");
  messageContent.className = "message-content";

  // Use innerHTML with parsed markdown instead of textContent
  messageContent.innerHTML = parseMarkdown(text);

  messageDiv.appendChild(messageContent);
  chatMessages.appendChild(messageDiv);

  // Save message to history (except system messages)
  if (type !== "system") {
    chatHistory.push({ type, content: text });

    // Limit history to last 10 messages to keep context window manageable
    if (chatHistory.length > 10) {
      chatHistory = chatHistory.slice(chatHistory.length - 10);
    }
  }

  // Scroll to the bottom of the chat
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

// Function to update the sequence display in the sidebar
function updateSequenceDisplay(sequenceData) {
  const sequenceDisplay = document.getElementById("sequence-display");

  if (!sequenceData || !sequenceData.sequence) {
    sequenceDisplay.innerHTML =
      '<p class="no-sequence">No sequence data available for this protein.</p>';
    return;
  }

  const sequence = sequenceData.sequence;
  const type = sequenceData.type || "Unknown type";
  const description = Array.isArray(sequenceData.description)
    ? sequenceData.description.join(", ")
    : sequenceData.description || "Unknown";
  const entityId = sequenceData.entityId || 1;

  // Format the sequence with line numbers and wrap at 50 characters
  let formattedSequence = "";
  let lineNumber = 1;

  for (let i = 0; i < sequence.length; i += 50) {
    const chunk = sequence.substring(i, i + 50);
    formattedSequence += `<div class="sequence-line">
      <span class="line-number">${lineNumber}</span>
      <span class="sequence-text">${chunk}</span>
      <span class="line-number">${Math.min(
        lineNumber + 49,
        sequence.length
      )}</span>
    </div>`;
    lineNumber += 50;
  }

  sequenceDisplay.innerHTML = `
    <div class="sequence-info">
      <div><strong>Entity ID:</strong> ${entityId}</div>
      <div><strong>Type:</strong> ${type}</div>
      <div><strong>Chain(s):</strong> ${description}</div>
      <div><strong>Length:</strong> ${sequence.length} residues</div>
    </div>
    <div class="sequence-content">
      ${formattedSequence}
    </div>
  `;
}

// Initialize the app when the page loads
window.addEventListener("load", initializeApp);
