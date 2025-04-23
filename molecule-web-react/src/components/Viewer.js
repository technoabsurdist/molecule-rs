import React, { useEffect, useRef, useState, useCallback } from "react";
import * as $3Dmol from "3dmol";
import "../App.css";

const Viewer = ({
  pdbData,
  loading,
  currentMolecule,
  setCurrentMolecule,
  isMobile,
  sidebarExpanded,
  setSidebarExpanded,
  styleType,
  setStyleType,
}) => {
  const viewerRef = useRef(null);
  const containerRef = useRef(null);
  const [viewer, setViewer] = useState(null);
  const resizeObserverRef = useRef(null);
  const modelRef = useRef(null); // Use ref to avoid state updates for the model itself

  // Initialize the 3DMol viewer on component mount
  useEffect(() => {
    if (!viewerRef.current) return;

    // Create viewer with mobile-friendly options
    const viewerOptions = {
      backgroundColor: "white",
      antialias: true,
      disableFog: true,
    };

    // Add mobile-specific touch options
    if (isMobile) {
      // Adjust settings to be more touch-friendly
      viewerOptions.cameraSensitivity = 0.2; // More sensitive for touch
    }

    const mol3dViewer = $3Dmol.createViewer(viewerRef.current, viewerOptions);
    setViewer(mol3dViewer);

    // Handle resize using ResizeObserver with requestAnimationFrame pattern
    // to prevent ResizeObserver loop errors
    if (containerRef.current) {
      const observerCallback = (entries) => {
        window.requestAnimationFrame(() => {
          if (!Array.isArray(entries) || !entries.length) {
            return;
          }

          if (mol3dViewer) {
            mol3dViewer.resize();
            if (modelRef.current) {
              mol3dViewer.zoomTo();
              mol3dViewer.render();
            }
          }
        });
      };

      resizeObserverRef.current = new ResizeObserver(observerCallback);
      resizeObserverRef.current.observe(containerRef.current);
    }

    // Handle orientation changes on mobile
    const handleOrientationChange = () => {
      // Wait for orientation change to complete
      setTimeout(() => {
        if (mol3dViewer) {
          window.requestAnimationFrame(() => {
            mol3dViewer.resize();
            mol3dViewer.render();
          });
        }
        // On orientation change, ensure sidebar is collapsed on mobile
        if (isMobile) {
          setSidebarExpanded(false);
        }
      }, 300);
    };

    window.addEventListener("orientationchange", handleOrientationChange);

    // Handle initial size after component mounts
    setTimeout(() => {
      if (mol3dViewer) {
        mol3dViewer.resize();
        mol3dViewer.render();
      }
    }, 100);

    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);

      // Clean up ResizeObserver
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }

      if (mol3dViewer) {
        mol3dViewer.clear();
      }
    };
  }, [isMobile, setSidebarExpanded]); // Remove currentMolecule from dependencies

  // Load PDB data when it changes - separate from style application
  useEffect(() => {
    if (!viewer || !pdbData || pdbData.trim() === "") return;

    try {
      // Clear the viewer and reset current molecule
      viewer.clear();

      // Store previous model to avoid unnecessary re-renders
      const prevModel = modelRef.current;

      // For now, we'll use the PDB data directly without WASM processing
      // This will be replaced with the WASM module integration later
      // Add the model directly from the PDB string
      const model = viewer.addModel(pdbData, "pdb");

      // Store the current molecule in ref to avoid re-renders
      modelRef.current = model;

      // Update state only if model actually changed
      if (prevModel !== model) {
        setCurrentMolecule(model);
      }

      // Apply initial style
      applyStyleToModel(model, styleType);

      // Zoom to fit
      window.requestAnimationFrame(() => {
        viewer.zoomTo();
        viewer.render();
      });
    } catch (error) {
      console.error("Error loading molecule:", error);
    }
  }, [pdbData, viewer, setCurrentMolecule]); // Remove styleType from dependencies

  // Apply style when styleType changes - separate effect to avoid loops
  useEffect(() => {
    if (viewer && modelRef.current) {
      applyStyleToModel(modelRef.current, styleType);
    }
  }, [styleType, viewer]);

  // Apply style to a specific model - extracted to avoid dependencies issues
  const applyStyleToModel = (model, style) => {
    if (!viewer || !model) return;

    // Clear previous styles
    viewer.setStyle({}, {});

    // Apply style based on type
    switch (style) {
      case "stick":
        applyChainColoringToModel(model, "stick", { radius: 0.15 });
        break;
      case "line":
        applyChainColoringToModel(model, "line", {});
        break;
      case "cross":
        applyChainColoringToModel(model, "cross", { lineWidth: 2 });
        break;
      case "sphere":
        applyChainColoringToModel(model, "sphere", { radius: 0.8 });
        break;
      case "cartoon":
        applyChainColoringToModel(model, "cartoon", {});
        break;
      default:
        applyChainColoringToModel(model, "stick", { radius: 0.15 });
    }

    // Update the view
    viewer.render();
  };

  // The original applyStyle function used for backwards compatibility
  const applyStyle = (style = styleType) => {
    if (modelRef.current) {
      applyStyleToModel(modelRef.current, style);
    }
  };

  // Helper function to apply chain-based coloring to a specific model
  const applyChainColoringToModel = (model, styleType, styleOptions) => {
    if (!viewer || !model) return;

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

    // Extract unique chains and apply distinct colors
    const atoms = model.selectedAtoms({});
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
  };

  // Original applyChainColoring for backwards compatibility
  const applyChainColoring = (styleType, styleOptions) => {
    if (modelRef.current) {
      applyChainColoringToModel(modelRef.current, styleType, styleOptions);
    }
  };

  // Handle style change
  const handleStyleChange = (e) => {
    setStyleType(e.target.value);
  };

  return (
    <div className="viewer-container" ref={containerRef}>
      {loading && (
        <div id="loading-indicator" className="loading-indicator">
          Processing molecule...
        </div>
      )}

      {!pdbData && (
        <div
          id="empty-state"
          className={`empty-state ${pdbData ? "hidden" : ""}`}
        >
          <h2>No Molecule Loaded</h2>
          <p>
            Use the search bar or paste PDB data in the sidebar to visualize a
            molecule.
          </p>
        </div>
      )}

      <div
        id="viewer"
        ref={viewerRef}
        className="viewer"
        style={{
          display: pdbData ? "block" : "none",
          height: "100%",
          width: "100%",
        }}
      ></div>

      {pdbData && (
        <div className="viewer-controls">
          <select
            value={styleType}
            onChange={handleStyleChange}
            className="style-selector"
          >
            <option value="stick">Stick</option>
            <option value="line">Line</option>
            <option value="cross">Cross</option>
            <option value="sphere">Sphere</option>
            <option value="cartoon">Cartoon</option>
          </select>

          {isMobile && !sidebarExpanded && (
            <button
              className="open-sidebar"
              onClick={() => setSidebarExpanded(true)}
            >
              ☰
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Viewer;
