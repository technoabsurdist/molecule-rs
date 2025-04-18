import OpenAI from "openai";

let apiKey = "";

try {
  apiKey = process.env.OPENAI_API_KEY;
} catch (error) {
  console.error("Error accessing OpenAI API key:", error);
}

const openai = new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true,
});

export async function generateProteinResponse(
  userQuery,
  proteinData,
  chatHistory = []
) {
  try {
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

    if (proteinData && proteinData.pdbId) {
      messages[0].content += `\n\nCurrent protein information:
- PDB ID: ${proteinData.pdbId}
- Title: ${proteinData.title || "Not available"}`;

      // Add sequence information if available
      if (proteinData.sequence && proteinData.sequence.sequence) {
        const sequence = proteinData.sequence.sequence;
        const sequenceType = proteinData.sequence.type || "Not specified";
        const sequenceLength = sequence.length;

        messages[0].content += `\n- Sequence Type: ${sequenceType}
- Sequence Length: ${sequenceLength} residues`;

        // Add sequence information - either full or truncated based on length
        if (sequenceLength > 0) {
          // For longer sequences, include start and end portions (to avoid context window overflow)
          if (sequenceLength > 500) {
            const startSequence = sequence.substring(0, 200);
            const endSequence = sequence.substring(sequenceLength - 200);

            messages[0].content += `\n- Sequence (start, 200 residues): ${startSequence}
- Sequence (end, 200 residues): ${endSequence}
- Note: Full sequence is available in the UI (${sequenceLength} residues total)`;
          } else {
            // For shorter sequences, include the entire sequence
            messages[0].content += `\n- Full Sequence: ${sequence}`;
          }

          // Include chain information
          const chains = proteinData.sequence.description;
          if (chains) {
            messages[0].content += `\n- Associated Chain(s): ${
              Array.isArray(chains) ? chains.join(", ") : chains
            }`;
          }
        }
      }

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

          const residueList = Array.from(residues).slice(0, 50);
          if (residueList.length > 0) {
            messages[0].content += `\n- Sample residues: ${residueList.join(
              ", "
            )}${residues.size > 50 ? " (and more)" : ""}`;
          }
        } catch (e) {
          console.error("Error extracting molecule data:", e);
        }
      }
    }

    chatHistory.forEach((msg) => {
      messages.push({
        role: msg.type === "user" ? "user" : "assistant",
        content: msg.content,
      });
    });

    messages.push({
      role: "user",
      content: userQuery,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: messages,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error generating response:", error);
    return "I'm sorry, I encountered an error while processing your question. Please try again.";
  }
}

export async function fetchProteinInfo(pdbId) {
  try {
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

export async function fetchProteinSequence(pdbId) {
  try {
    // First, get summary information about the protein to know the number of entities
    const summaryResponse = await fetch(
      `https://data.rcsb.org/rest/v1/core/entry/${pdbId}`
    );

    if (!summaryResponse.ok) {
      throw new Error(
        `Failed to fetch protein summary: ${summaryResponse.statusText}`
      );
    }

    const summaryData = await summaryResponse.json();

    // Check if we have polymer entity information available
    if (
      !summaryData ||
      !summaryData.rcsb_entry_info ||
      !summaryData.rcsb_entry_info.polymer_entity_count
    ) {
      console.warn(`No entity count information for ${pdbId}`);
      // Try with entity 1 as fallback
      return fetchSingleEntitySequence(pdbId, 1);
    }

    const entityCount = summaryData.rcsb_entry_info.polymer_entity_count;

    // If there's only one entity, fetch it directly
    if (entityCount === 1) {
      return fetchSingleEntitySequence(pdbId, 1);
    }

    // For multiple entities, we'll fetch the first one for now
    // In a more advanced version, we could fetch all and combine them
    // However, that would make the data structure more complex
    const mainEntitySequence = await fetchSingleEntitySequence(pdbId, 1);

    // If unsuccessful with first entity, try the second one
    if (!mainEntitySequence && entityCount > 1) {
      return fetchSingleEntitySequence(pdbId, 2);
    }

    return mainEntitySequence;
  } catch (error) {
    console.error(`Error fetching sequence for ${pdbId}:`, error);
    return null;
  }
}

// Helper function to fetch a single entity sequence
async function fetchSingleEntitySequence(pdbId, entityId) {
  try {
    // Use the PDB REST API to get the entity information which contains sequences
    const response = await fetch(
      `https://data.rcsb.org/rest/v1/core/polymer_entity/${pdbId}/${entityId}`
    );

    if (!response.ok) {
      console.warn(
        `Failed to fetch sequence for entity ${entityId}: ${response.statusText}`
      );
      return null;
    }

    const data = await response.json();

    // Check if the entity contains sequence information
    if (data && data.entity_poly && data.entity_poly.pdbx_seq_one_letter_code) {
      return {
        sequence: data.entity_poly.pdbx_seq_one_letter_code,
        description: data.rcsb_polymer_entity
          ?.rcsb_polymer_entity_container_identifiers?.auth_asym_ids || ["A"],
        type: data.entity_poly.type || "polypeptide(L)",
        entityId: entityId,
      };
    } else {
      console.warn(`No sequence data found for entity ${entityId}`);
      return null;
    }
  } catch (error) {
    console.error(
      `Error fetching sequence for ${pdbId} entity ${entityId}:`,
      error
    );
    return null;
  }
}

export default openai;
