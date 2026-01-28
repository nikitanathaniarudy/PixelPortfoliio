import React, { useState } from 'react';
import styles from './PixelMap.module.css';

interface MapLocation {
  id: number;
  x: number; // Percentage
  y: number; // Percentage
  name: string;
  role: string;
  desc: string[];
}

const locations: MapLocation[] = [
  { 
    id: 1, x: 15, y: 15, 
    name: 'Median Parmajaya', 
    role: 'SWE Intern', 
    desc: ['Built internal tools', 'Optimized db queries', 'React frontend'] 
  },
  { 
    id: 2, x: 65, y: 25, 
    name: 'University of Toronto', 
    role: 'Student', 
    desc: ['CS & Math', 'Robotics Club', 'TA for CS101'] 
  },
  { 
    id: 3, x: 45, y: 65, 
    name: 'Startup XYZ', 
    role: 'Co-founder', 
    desc: ['Launched MVP', 'Secured funding', 'Full stack dev'] 
  },
];

const PixelMap: React.FC = () => {
  const [blobPos, setBlobPos] = useState({ x: 50, y: 50 }); // Start center
  const [activeLocation, setActiveLocation] = useState<MapLocation | null>(null);
  const [isMoving, setIsMoving] = useState(false);

  const handleLocationClick = (loc: MapLocation) => {
    if (isMoving) return; // Prevent spam clicks
    if (activeLocation?.id === loc.id) return; // Already there

    setIsMoving(true);
    setActiveLocation(null); // Hide info while moving
    setBlobPos({ x: loc.x, y: loc.y });

    // Travel time matches CSS transition (1.5s)
    setTimeout(() => {
        setIsMoving(false);
        setActiveLocation(loc);
    }, 1500); 
  };

  return (
    <div className={styles.mapContainer}>
      <img src="/assets/map.png" className={styles.mapImage} alt="Pixel Map" />

      {/* Invisible Hitboxes */}
      {locations.map((loc) => (
        <div 
            key={loc.id}
            className={styles.hitbox}
            style={{ left: `calc(${loc.x}% - 30px)`, top: `calc(${loc.y}% - 30px)` }} // Center hitbox over coord
            onClick={() => handleLocationClick(loc)}
            title={`Travel to ${loc.name}`}
        />
      ))}

      {/* The Moving Blob */}
      <div 
        className={styles.blob}
        style={{ 
            left: `calc(${blobPos.x}% - 20px)`, // Center blob (40px width)
            top: `calc(${blobPos.y}% - 20px)`
        }}
      ></div>

      {/* Info Pop-up (only shows when arrived) */}
      {activeLocation && !isMoving && (
        <div className={styles.infoBox}>
            <h3 style={{marginBottom: '0.5rem'}}>{activeLocation.name}</h3>
            <p style={{fontStyle: 'italic', marginBottom: '0.5rem'}}>{activeLocation.role}</p>
            <ul style={{paddingLeft: '1rem', listStyleType: 'disc'}}>
                {activeLocation.desc.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
        </div>
      )}
    </div>
  );
};

export default PixelMap;
