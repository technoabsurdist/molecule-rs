// API functions for fetching protein data

/**
 * Fetch protein information from PDB
 * @param {string} pdbId - The PDB ID
 * @returns {Promise<object>} - The protein info
 */
export const fetchProteinInfo = async (pdbId) => {
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
};

/**
 * Fetch protein sequence from PDB
 * @param {string} pdbId - The PDB ID
 * @returns {Promise<object>} - The protein sequence data
 */
export const fetchProteinSequence = async (pdbId) => {
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
    // Return minimal fallback data even in case of error
    return {
      entityId: 1,
      sequence: "",
      type: "Unknown",
      description: "Error loading sequence data",
    };
  }
};

// Helper function to fetch a single entity sequence
const fetchSingleEntitySequence = async (pdbId, entityId) => {
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
};

/**
 * Search for protein structures in PDB
 * @param {string} query - The search query
 * @returns {Promise<Array>} - The search results
 */
export const searchPdbStructures = async (query) => {
  try {
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
};
