import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Viewer from "./components/Viewer";
import { fetchProteinInfo, fetchProteinSequence } from "./api";

function App() {
  const [currentMolecule, setCurrentMolecule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdbData, setPdbData] = useState("");
  const [proteinData, setProteinData] = useState({
    pdbId: null,
    title: null,
    info: null,
    sequence: null,
  });
  const [styleType, setStyleType] = useState("stick");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const processingRef = useRef(false); // Prevent duplicate processing

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadPdbData = async (data) => {
    if (!data.trim() || processingRef.current) return;

    setLoading(true);
    processingRef.current = true;

    try {
      setPdbData(data);
      // This would later be replaced with actual WASM handling
      setTimeout(() => {
        setLoading(false);
        processingRef.current = false;

        // Auto-collapse sidebar on mobile after loading
        if (isMobile) {
          setSidebarExpanded(false);
        }
      }, 1000);
    } catch (error) {
      console.error("Error loading PDB data:", error);
      setLoading(false);
      processingRef.current = false;
    }
  };

  const loadPdbById = async (pdbId) => {
    if (processingRef.current) return;

    setLoading(true);
    processingRef.current = true;

    try {
      // Fetch PDB file
      const response = await fetch(
        `https://files.rcsb.org/download/${pdbId}.pdb`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch PDB: ${response.statusText}`);
      }

      const data = await response.text();
      setPdbData(data);

      // Get protein info - catch errors to prevent rendering issues
      let proteinInfo = null;
      try {
        proteinInfo = await fetchProteinInfo(pdbId);
      } catch (err) {
        console.error("Error fetching protein info:", err);
        proteinInfo = null;
      }

      // Get sequence data - catch errors to prevent rendering issues
      let sequenceData = null;
      try {
        sequenceData = await fetchProteinSequence(pdbId);
      } catch (err) {
        console.error("Error fetching sequence:", err);
        sequenceData = null;
      }

      // Update protein data state with safe defaults
      setProteinData({
        pdbId,
        title: proteinInfo?.struct?.title || `Protein ${pdbId}`,
        info: proteinInfo || null,
        sequence: sequenceData || null,
      });

      setLoading(false);
      processingRef.current = false;

      // Auto-collapse sidebar on mobile
      if (isMobile) {
        setSidebarExpanded(false);
      }
    } catch (error) {
      console.error("Error loading PDB:", error);
      setLoading(false);
      processingRef.current = false;
    }
  };

  // Function to apply style to the molecule
  const applyStyle = () => {
    if (currentMolecule) {
      // This will trigger style application in the Viewer component
      // through the styleType state change
      setStyleType((prevStyle) => prevStyle);
    }
  };

  return (
    <div className="container">
      <Header />
      <div className="main">
        <Sidebar
          loadPdbData={loadPdbData}
          loadPdbById={loadPdbById}
          pdbData={pdbData}
          proteinData={proteinData}
          expanded={sidebarExpanded}
          setExpanded={setSidebarExpanded}
          isMobile={isMobile}
          styleType={styleType}
          setStyleType={setStyleType}
          applyStyle={applyStyle}
        />
        <Viewer
          pdbData={pdbData}
          loading={loading}
          currentMolecule={currentMolecule}
          setCurrentMolecule={setCurrentMolecule}
          isMobile={isMobile}
          sidebarExpanded={sidebarExpanded}
          setSidebarExpanded={setSidebarExpanded}
          styleType={styleType}
          setStyleType={setStyleType}
          loadPdbById={loadPdbById}
        />
      </div>
    </div>
  );
}

export default App;
