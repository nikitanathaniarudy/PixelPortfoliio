import React, { useState } from 'react';
import styles from './FlipCard.module.css';
import hfLogo from '../assets/hf-logo.png';

interface FlipCardProps {
  imageSrc?: string;
  title: string;
  description: string;
  skills?: string[];
  githubUrl?: string;
  researchPaperUrl?: string;
  huggingFaceUrl?: string;
  videoSrc?: string;
  details?: React.ReactNode;
}

const FlipCard: React.FC<FlipCardProps> = ({ imageSrc, title, description, skills = [], githubUrl, researchPaperUrl, huggingFaceUrl, videoSrc, details }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    // Prevent flip if clicking external links
    if ((e.target as HTMLElement).closest('a')) {
        e.stopPropagation();
        return;
    }
    setIsFlipped(!isFlipped);
  };

  return (
    <div className={styles.container} onClick={handleClick}>
      <div className={`${styles.card} ${isFlipped ? styles.flipped : ''}`}>
        {/* Front Face */}
        <div className={`${styles.face} ${styles.front}`}>
            <div className={styles.imageContainer}>
                {videoSrc ? (
                    <video 
                        src={videoSrc} 
                        className={styles.image} 
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                        style={{ objectFit: 'cover' }}
                    />
                ) : imageSrc ? (
                    <img src={imageSrc} alt={title} className={styles.image} />
                ) : (
                    <div className={styles.placeholderImage}>
                        {/* Placeholder graphic */}
                        <div style={{fontSize: '3rem'}}>💻</div>
                    </div>
                )}
            </div>
            
            <div className={styles.content}>
                <h3 className={styles.title}>{title}</h3>
                
                <p className={styles.description}>{description}</p>
                
                {skills.length > 0 && (
                    <div className={styles.skillContainer}>
                        {skills.map((skill, index) => (
                            <span key={index} className={styles.skillChip}>{skill}</span>
                        ))}
                    </div>
                )}

                <div className={styles.buttonRow}>
                    {githubUrl && (
                        <a href={githubUrl} target="_blank" rel="noopener noreferrer" className={styles.iconButton} title="GitHub">
                            <img src="/assets/github.png" alt="GitHub" />
                        </a>
                    )}
                    {huggingFaceUrl && (
                        <a href={huggingFaceUrl} target="_blank" rel="noopener noreferrer" className={styles.iconButton} title="Hugging Face">
                            <img src={hfLogo} alt="Hugging Face" />
                        </a>
                    )}
                    {researchPaperUrl && (
                        <a href={researchPaperUrl} target="_blank" rel="noopener noreferrer" className={styles.iconButton} title="Download Research Paper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 9H15V3H9V9H5L12 16L19 9ZM5 18V20H19V18H5Z" fill="currentColor"/>
                            </svg>
                        </a>
                    )}
                </div>
            </div>
        </div>

        {/* Back Face (Details / More Info) */}
        <div className={`${styles.face} ${styles.back}`}>
            <h3>{title}</h3>
            <div className={styles.backContent}>
                 {details ? (
                    <div style={{textAlign: 'left', fontSize: '0.9rem', lineHeight: '1.4'}}>
                        {details}
                    </div>
                 ) : (
                    <p>{description}</p>
                 )}
                 <div style={{marginTop: '1rem', fontSize: '0.8rem', color: '#888', textAlign: 'center'}}>
                    (Click to flip back)
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FlipCard;
