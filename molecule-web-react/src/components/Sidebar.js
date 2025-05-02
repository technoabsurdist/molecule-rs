import React, { useState, useRef, useEffect } from "react";
import SequenceDisplay from "./SequenceDisplay";
import "../App.css";

const Sidebar = ({
  loadPdbData,
  loadPdbById,
  pdbData,
  proteinData,
  expanded,
  setExpanded,
  isMobile,
  styleType,
  setStyleType,
  applyStyle,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchTimeoutRef = useRef(null);
  const searchResultsRef = useRef(null);

  // Handle clicks outside search results to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target) &&
        event.target.id !== "search-input"
      ) {
        setSearchResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      // PDB API endpoint for text search
      const url = "https://search.rcsb.org/rcsbsearch/v2/query";

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
                attribute: "rcsb_id",
                operator: "exact_match",
                value: query,
              },
            },
            {
              type: "terminal",
              service: "full_text",
              parameters: {
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

      // Process results with basic info
      const processedResults = await Promise.all(
        (data.result_set || []).map(async (result) => {
          const pdbId = result.identifier;

          // Get basic info from PDB
          try {
            const infoResponse = await fetch(
              `https://data.rcsb.org/rest/v1/core/entry/${pdbId}`
            );
            const info = await infoResponse.json();
            return {
              pdbId,
              title: info?.struct?.title || "Unknown structure",
            };
          } catch (error) {
            return {
              pdbId,
              title: "Unknown structure",
            };
          }
        })
      );

      setSearchResults(processedResults);
    } catch (error) {
      console.error("Error searching PDB:", error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchInputChange = (e) => {
    const query = e.target.value.trim();
    setSearchTerm(query);

    // Debounce search queries
    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(query);
    }, 500);
  };

  const handleResultClick = async (result) => {
    setSearchTerm(`${result.pdbId} - ${result.title}`);
    setSearchResults([]);
    await loadPdbById(result.pdbId);
  };

  const handleLoadPdb = () => {
    loadPdbData(pdbData);
  };

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  const handleStyleChange = (e) => {
    setStyleType(e.target.value);
  };

  return (
    <div className={`sidebar ${expanded ? "expanded" : ""}`}>
      {isMobile && (
        <button className="toggle-sidebar" onClick={toggleSidebar}>
          {expanded ? "←" : "→"}
        </button>
      )}

      <div className="sidebar-content">
        <div className="search-container">
          <h3>Search Protein</h3>
          <div className="search-input-container">
            <input
              id="search-input"
              type="text"
              placeholder="Search by protein name or PDB ID..."
              value={searchTerm}
              onChange={handleSearchInputChange}
            />

            {searchResults.length > 0 || searching ? (
              <div className="search-results" ref={searchResultsRef}>
                {searching ? (
                  <div className="searching">Searching...</div>
                ) : searchResults.length === 0 ? (
                  <div className="no-results">No structures found</div>
                ) : (
                  searchResults.map((result) => (
                    <div
                      key={result.pdbId}
                      className="search-result-item"
                      onClick={() => handleResultClick(result)}
                    >
                      <strong>{result.pdbId}</strong> - {result.title}
                    </div>
                  ))
                )}
              </div>
            ) : null}
          </div>
        </div>

        <div className="controls">
          <h3>PDB Input</h3>
          <textarea
            id="pdb-input"
            placeholder="Paste PDB data here or use search above..."
            value={pdbData}
            onChange={(e) => loadPdbData(e.target.value)}
          ></textarea>
          <button id="load-pdb" onClick={handleLoadPdb}>
            Load PDB
          </button>
        </div>

        {/* <div className="style-controls">
          <h3>Visualization Style</h3>
          <select
            id="style-select"
            value={styleType}
            onChange={handleStyleChange}
          >
            <option value="stick">Stick</option>
            <option value="line">Line</option>
            <option value="cross">Cross</option>
            <option value="sphere">Sphere</option>
            <option value="cartoon">Cartoon</option>
          </select>
          <button id="apply-style" onClick={applyStyle}>
            Apply Style
          </button>
        </div> */}

        {proteinData.sequence && (
          <div className="sequence-container">
            <h3>Protein Sequence</h3>
            <div id="sequence-display" className="sequence-display">
              <SequenceDisplay sequenceData={proteinData.sequence} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
