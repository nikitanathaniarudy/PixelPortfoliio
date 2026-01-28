import React from 'react';
import styles from './Header.module.css';
import githubIcon from '../assets/github.png';
import linkedinIcon from '../assets/linkedin.png';
import instagramIcon from '../assets/instagram.png';
import youtubeIcon from '../assets/youtube.png';

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <button 
            className={styles.navButton} 
            onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
        >
            About
        </button>
        <button 
            className={styles.navButton}
            onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
        >
            Projects
        </button>
        <button 
            className={styles.navButton}
            onClick={() => document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })}
        >
            Work
        </button>
        <button 
            className={styles.navButton}
            onClick={() => document.getElementById('connect')?.scrollIntoView({ behavior: 'smooth' })}
        >
            Connect
        </button>
      </nav>
      

      
      <h1 className={styles.title} data-text="Nikita Rudy">Nikita Rudy</h1>
      
      <div className={styles.socials}>
        <a href="#" className={styles.socialIcon} title="GitHub">
            <img src={githubIcon} alt="GitHub" width="24" height="24" />
        </a>
        <a href="#" className={styles.socialIcon} title="LinkedIn">
            <img src={linkedinIcon} alt="LinkedIn" width="24" height="24" />
        </a>
        <a href="#" className={styles.socialIcon} title="Instagram">
             <img src={instagramIcon} alt="Instagram" width="20" height="20" />
        </a>
        <a href="#" className={styles.socialIcon} title="YouTube">
            {/* Increased to 32 to visually match the 24px square icons */}
            <img src={youtubeIcon} alt="YouTube" width="32" height="32" />
        </a>
      </div>
    </header>
  );
};

export default Header;
