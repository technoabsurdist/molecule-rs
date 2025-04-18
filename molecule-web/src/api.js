import OpenAI from "openai";

// Load the API key from environment variables
// Note: In a production environment, you'd want to use proper environment variable handling
// For development, we're accessing it from the .env file
let apiKey = "";

// Try to get the API key from the environment
try {
  apiKey = process.env.OPENAI_API_KEY;
} catch (error) {
  console.error("Error accessing OpenAI API key:", error);
}

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true, // Only for client-side use in development
});

/**
 * Generate a response about a protein structure using the OpenAI API
 * @param {string} userQuery - The user's question about the protein
 * @param {Object} proteinData - Data about the current protein structure
 * @param {string} proteinData.pdbId - The PDB ID of the protein
 * @param {string} proteinData.title - The title/name of the protein
 * @param {Object} proteinData.molecule - The molecule object from 3Dmol.js
 * @param {Array} chatHistory - Previous messages in the conversation
 * @returns {Promise<string>} - The AI-generated response
 */
export async function generateProteinResponse(
  userQuery,
  proteinData,
  chatHistory = []
) {
  try {
    // Create the messages array for the API call
    const messages = [
      {
        role: "developer",
        content: `# Identity
You are a specialized molecular biology assistant focused on explaining protein structures to researchers and students. You provide accurate, educational information about protein structures being visualized in a 3D viewer.

# Instructions
* Answer questions about the protein structure being displayed in the viewer.
* Focus on providing scientifically accurate information about protein structure, function, and biological significance.
* When describing structural features, reference the visualization that the user is seeing (e.g., "The red regions you see are alpha helices").
* Explain concepts at an appropriate level based on the complexity of the question.
* When you don't have information about a specific detail of the current protein, acknowledge this limitation.
* Keep responses concise but informative, focusing on the most relevant aspects to the user's question.
* If the user asks about something unrelated to proteins or molecular biology, politely redirect to the topic of the protein being visualized.
* IMPORTANT: The protein visualization is showing chains in different colors. In cartoon mode, alpha helices are shown as helical ribbons, beta sheets as arrows, and loops as tubes.

# Context
The user is viewing a protein structure in a 3D molecular viewer. The visualization uses the following style conventions:
- Different protein chains are shown in distinct colors (red, green, blue, etc.)
- In cartoon mode, secondary structures are represented as:
  - Alpha helices: spiral ribbons
  - Beta sheets: flat arrow ribbons
  - Loops/coils: thin tubes
`,
      },
    ];

    // Add protein-specific information if available
    if (proteinData && proteinData.pdbId) {
      messages[0].content += `\n\nCurrent protein information:
- PDB ID: ${proteinData.pdbId}
- Title: ${proteinData.title || "Not available"}`;

      // Try to extract chain information if available
      if (proteinData.molecule) {
        try {
          const atoms = proteinData.molecule.selectedAtoms({});
          const chains = new Set();
          const residues = new Set();

          atoms.forEach((atom) => {
            if (atom.chain) chains.add(atom.chain);
            if (atom.resn) residues.add(atom.resn);
          });

          if (chains.size > 0) {
            messages[0].content += `\n- Chains: ${Array.from(chains).join(
              ", "
            )}`;
          }

          // Include a sample of residues (limit to avoid context size issues)
          const residueList = Array.from(residues).slice(0, 10);
          if (residueList.length > 0) {
            messages[0].content += `\n- Sample residues: ${residueList.join(
              ", "
            )}${residues.size > 10 ? " (and more)" : ""}`;
          }
        } catch (e) {
          console.error("Error extracting molecule data:", e);
        }
      }
    }

    // Add chat history
    chatHistory.forEach((msg) => {
      messages.push({
        role: msg.type === "user" ? "user" : "assistant",
        content: msg.content,
      });
    });

    // Add the current user query
    messages.push({
      role: "user",
      content: userQuery,
    });

    // Make the API call
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1", // Use a capable model for molecular biology knowledge
      messages: messages,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error generating response:", error);
    return "I'm sorry, I encountered an error while processing your question. Please try again.";
  }
}

/**
 * Fetch additional protein information from the PDB database
 * @param {string} pdbId - The PDB ID to fetch information for
 * @returns {Promise<Object>} - Detailed protein information
 */
export async function fetchProteinInfo(pdbId) {
  try {
    // Fetch from PDB API
    const response = await fetch(
      `https://data.rcsb.org/rest/v1/core/entry/${pdbId}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch protein info: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching info for ${pdbId}:`, error);
    return null;
  }
}

// Export the OpenAI client for potential direct use
export default openai;
