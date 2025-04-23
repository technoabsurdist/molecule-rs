import React from "react";
import "../App.css";

/**
 * Component for displaying protein sequence data
 * @param {Object} sequenceData - The protein sequence data
 */
const SequenceDisplay = ({ sequenceData }) => {
  if (!sequenceData || !sequenceData.sequence) {
    return (
      <p className="no-sequence">
        No sequence data available for this protein.
      </p>
    );
  }

  const sequence = sequenceData.sequence;
  const type = sequenceData.type || "Unknown type";
  const description = Array.isArray(sequenceData.description)
    ? sequenceData.description.join(", ")
    : sequenceData.description || "Unknown";
  const entityId = sequenceData.entityId || 1;

  // Format the sequence with line numbers and wrap at 50 characters
  const formatSequence = () => {
    const formattedLines = [];
    let lineNumber = 1;

    for (let i = 0; i < sequence.length; i += 50) {
      const chunk = sequence.substring(i, i + 50);
      // Insert a non-breaking space every 10 characters to improve readability
      const formattedChunk = chunk.match(/.{1,10}/g)?.join(" ") || chunk;

      formattedLines.push(
        <div className="sequence-line" key={i}>
          <span className="line-number">{lineNumber}</span>
          <span className="sequence-text">{formattedChunk}</span>
          <span className="line-number">
            {Math.min(lineNumber + 49, sequence.length)}
          </span>
        </div>
      );
      lineNumber += 50;
    }

    return formattedLines;
  };

  return (
    <div>
      <div className="sequence-info">
        <div>
          <strong>Entity ID:</strong> {entityId}
        </div>
        <div>
          <strong>Type:</strong> {type}
        </div>
        <div>
          <strong>Chain(s):</strong> {description}
        </div>
        <div>
          <strong>Length:</strong> {sequence.length} residues
        </div>
      </div>
      <div className="sequence-content">{formatSequence()}</div>
    </div>
  );
};

export default SequenceDisplay;
