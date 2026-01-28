import React, { useEffect, useState } from 'react';
import styles from './Background.module.css';

const Background: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const handleResize = () => {
        setWindowHeight(window.innerHeight);
    }

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Calculate Opacity Logic based on scroll position
  // 0 - 0.5 scroll progress: Night fades out, Sunrise fades in
  // 0.5 - 1.0 scroll progress: Sunrise fades out, Toronto fades in
  
  // Total scrollable height approximation (assuming 3 sections)
  // Let's normalize scroll.
  const maxScroll = document.body.scrollHeight - windowHeight;
  const progress = Math.min(Math.max(scrollY / (maxScroll || 1), 0), 1);

  // Night: Starts 1, fades to 0 by 50%
  const nightOpacity = Math.max(1 - progress * 2, 0);

  // Sunrise: Starts 0, peaks at 50%, fades by 100%
  // Simple logic: If progress < 0.5, opacity is progress * 2. If > 0.5, opacity is (1-progress)*2
  let sunriseOpacity = 0;
  if (progress < 0.5) {
      sunriseOpacity = progress * 2; 
  } else {
      sunriseOpacity = Math.max(1 - (progress - 0.5) * 2, 0);
  }
  
  // Toronto: Starts 0, starts fading in at 50%, 1 by 100%
  const torontoOpacity = Math.max((progress - 0.5) * 2, 0);


// Particle component for floating items
const Particle: React.FC<{ type: '❤️' | '🪙' | '⭐'; left: number; delay: number }> = ({ type, left, delay }) => {
    return (
        <div 
            className={styles.particle} 
            style={{ 
                left: `${left}%`, 
                animationDelay: `${delay}s`,
                fontSize: '20px' 
            }}
        >
            {type}
        </div>
    );
};

  return (
    <div className={styles.container}>
        {/* Floating Particles */}
        <div className={styles.particleContainer}>
            {/* Generate random particles */}
            {[...Array(15)].map((_, i) => (
                <Particle 
                    key={i} 
                    type={['❤️', '🪙', '⭐'][i % 3] as any} 
                    left={Math.random() * 100} 
                    delay={Math.random() * 20} 
                />
            ))}
        </div>

        {/* Night Layer */}
        <div className={styles.nightLayer} style={{ opacity: nightOpacity }}>
            <div className={styles.stars}></div>
        </div>


        {/* Sunrise Layer */}
        <div className={styles.sunriseLayer} style={{ opacity: sunriseOpacity }}>
             {/* Sun image removed as requested */}
             <div className={styles.clouds}></div>
        </div>

        {/* Toronto Layer */}
        <div className={styles.torontoLayer} style={{ opacity: torontoOpacity }}>
            {/* Can combine with background image or separate img tag */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                width: '100%',
                height: '100%',
                background: 'url(/assets/toronto.png) no-repeat bottom center',
                backgroundSize: 'cover',
                imageRendering: 'pixelated'
            }}></div>
        </div>
    </div>
  );
};

export default Background;
