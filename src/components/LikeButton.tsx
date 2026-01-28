import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import styles from './LikeButton.module.css';

const LikeButton: React.FC = () => {
    const [likes, setLikes] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        const storedLikes = localStorage.getItem('pixelPortfolioLikes');
        if (storedLikes) {
            setLikes(parseInt(storedLikes, 10));
        }
    }, []);

    const handleLike = () => {
        const newLikes = likes + 1;
        setLikes(newLikes);
        localStorage.setItem('pixelPortfolioLikes', newLikes.toString());
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);

        // Confetti Explosion
        confetti({
            particleCount: 30,
            spread: 60,
            origin: { y: 0.9, x: 0.9 }, // Bottom right
            colors: ['#ff0000', '#ff69b4', '#ff1493']
        });
    };

    return (
        <div className={styles.container}>
            <button 
                className={`${styles.button} ${isAnimating ? styles.pump : ''}`} 
                onClick={handleLike}
                aria-label="Like this portfolio"
            >
                <div className={styles.heart}>❤️</div>
            </button>
            <div className={styles.counter}>
                {likes.toLocaleString()}
            </div>
        </div>
    );
};

export default LikeButton;
