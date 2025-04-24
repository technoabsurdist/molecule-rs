import React from 'react';

const MoleculeIcon = ({ 
  width = 24, 
  height = 24, 
  className = '', 
  animated = false,
  rotating = false,
  bondColor = '#2c3e50' // Default dark color for bonds
}) => {
  // Determine which className to apply
  const svgClassName = `${className}${rotating ? ' rotating' : ''}`;
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={svgClassName}
    >
      {/* Bonds (lines) are drawn first, behind the atoms */}
      <line 
        x1="10.2" y1="11" x2="7.3" y2="9" 
        stroke={bondColor}
        strokeWidth={animated ? undefined : "0.5"} 
        className={animated ? "bond bond1" : ""} 
      />
      <line 
        x1="13.8" y1="11" x2="16.7" y2="9" 
        stroke={bondColor}
        strokeWidth={animated ? undefined : "0.5"} 
        className={animated ? "bond bond2" : ""} 
      />
      <line 
        x1="10.2" y1="13" x2="7.3" y2="15" 
        stroke={bondColor}
        strokeWidth={animated ? undefined : "0.5"} 
        className={animated ? "bond bond3" : ""} 
      />
      <line 
        x1="13.8" y1="13" x2="16.7" y2="15" 
        stroke={bondColor}
        strokeWidth={animated ? undefined : "0.5"} 
        className={animated ? "bond bond4" : ""} 
      />
      
      {/* Atoms (circles) are drawn last, on top of the bonds */}
      <circle cx="12" cy="12" r="3" fill="#3498db" />
      <circle 
        cx="6" cy="8" r="2" fill="#2ecc71" 
        className={animated ? "atom atom1" : ""} 
      />
      <circle 
        cx="18" cy="8" r="2" fill="#e74c3c" 
        className={animated ? "atom atom2" : ""} 
      />
      <circle 
        cx="6" cy="16" r="2" fill="#f39c12" 
        className={animated ? "atom atom3" : ""} 
      />
      <circle 
        cx="18" cy="16" r="2" fill="#9b59b6" 
        className={animated ? "atom atom4" : ""} 
      />
    </svg>
  );
};

export default MoleculeIcon;