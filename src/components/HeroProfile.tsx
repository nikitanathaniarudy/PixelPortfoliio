import React, { useState } from 'react';
import styles from './HeroProfile.module.css';
import profilePic from '../assets/profile_picture.jpeg';

const HeroProfile: React.FC = () => {
    const [showBubble, setShowBubble] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

    const handleProfileClick = () => {
        setIsClicked(true);
        setShowBubble(true);
        
        // Remove tilt after short delay
        setTimeout(() => setIsClicked(false), 200);
        
        // Hide bubble after 3 seconds
        setTimeout(() => setShowBubble(false), 3000);
    };

  return (
    <div className={styles.heroContainer}>
      <div 
        className={`${styles.profileCard} ${isClicked ? styles.clicked : ''}`} 
        onClick={handleProfileClick} 
        style={{ cursor: 'pointer' }}
      >
        <span className={styles.wave}>👋</span>
        <img src={profilePic} alt="Nikita" className={styles.image} />
      </div>
      
      {showBubble && (
        <div className={styles.bubble}>
            Hello World!
        </div>
      )}
    </div>
  );
};

export default HeroProfile;
