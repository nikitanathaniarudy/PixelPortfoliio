import React, { useState } from 'react';
import FlipCard from './FlipCard';
import styles from './ProjectCarousel.module.css';
import researchPaperPdf from '../assets/Laporan_Flash_Sale_Discount_Optimizer_Model_1757534544.pdf';
import ninjaVideo from '../assets/ninjavsdragon.mov';

const projects = [
  {
    id: 1,
    title: 'AegisPath',
    description: 'A No-Bump, Energy-Efficient Vacuum for Elderly Fall Prevention',
    imageSrc: 'src/assets/aegis_path.png',
    skills: ['Python', 'ARKit', 'Swift', 'a*', 'GPU-acceleration', 'Machine Learning', 'Computer Vision', 'Xcode', 'YOLO'],
    githubUrl: 'https://github.com/Raynard2/smart-vacuum',
    details: (
        <>
            <p style={{marginBottom: '1rem'}}>
                AegisPath is an autonomous navigation system that uses a digital twin of a room’s floor plan to provide proactive protection.
            </p>
            <ul style={{listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem'}}>
                <li>
                    <strong style={{color: '#f1fa8c'}}>Autonomous Hazard Detection:</strong><br/>
                    Using integrated object detection, the system scans the floor for high-risk items like banana peels or slippery objects.
                </li>
                <li>
                    <strong style={{color: '#f1fa8c'}}>SafePath Mode:</strong><br/>
                    The moment a hazard is detected, the robot triggers "SafePath Mode." It automatically dispatches itself to the exact coordinates of the danger to clear it before a resident can step on it—no human intervention required.
                </li>
                <li>
                    <strong style={{color: '#f1fa8c'}}>Zero-Gap Safety:</strong><br/>
                    By syncing the robot's movement to the analyzed floor plan matrix, we achieve "Last-Inch" precision, clearing hazards right against the walls where seniors often walk for support.
                </li>
                <li>
                    <strong style={{color: '#f1fa8c'}}>Diagonal Energy Efficiency:</strong><br/>
                    Unlike standard robots that move in rigid L-shaped patterns, our algorithm calculates the true shortest distance between points, moving diagonally to reach the hazard as fast as possible.
                </li>
            </ul>
        </>
    )
  },
  {
    id: 3,
    title: 'Neuro-Sentry',
    description: 'Neuro-Sentry uses your phone’s camera and microphone to detect warning signs in real time, analyzing facial mesh data, speech, and vitals to deliver instant AI-driven acute stroke risk alerts.',
    imageSrc: 'src/assets/neuro_sentry.png',
    skills: ['GeminiAPI', 'React', 'Swift', 'Presage'],
    githubUrl: 'https://github.com/nikitanathaniarudy/Neuro_Sentry',
    details: (
        <>
            <p style={{marginBottom: '1rem'}}>
                Neuro-Sentry uses your phone’s camera and microphone to detect warning signs in real time, analyzing facial mesh data, speech, and vitals to deliver instant AI-driven acute stroke risk alerts.
            </p>
            <ul style={{listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem'}}>
                <li>
                    <strong style={{color: '#f1fa8c'}}>Facial Asymmetry Analysis:</strong><br/>
                    It captures facial asymmetry through precise landmark tracking to identify drooping or muscle weakness.
                </li>
                <li>
                    <strong style={{color: '#f1fa8c'}}>Speech Pattern Recognition:</strong><br/>
                    Analyzes speech patterns for slurring or clarity issues using advanced audio processing.
                </li>
                <li>
                    <strong style={{color: '#f1fa8c'}}>Vital Signs Monitoring:</strong><br/>
                    Measures vital signs like heart rate directly through the camera photoplethysmography (PPG).
                </li>
                <li>
                    <strong style={{color: '#f1fa8c'}}>AI Risk Assessment:</strong><br/>
                    The system combines these biometric signals with AI-powered analysis to generate an instant stroke-risk assessment, helping triage patients in waiting rooms or providing preliminary guidance when professional care isn't immediately accessible.
                </li>
            </ul>
        </>
    )
  },
  {
    id: 2,
    title: 'Flash Sale Discount Optimizer Model',
    description: 'Developed a machine learning model to optimize discount pricing during flash sales, using real-world e-commerce data.',
    imageSrc: 'src/assets/flash_sale.png',
    skills: ['XGBoost', 'Pandas', 'NumPy', 'Scikit-learn', 'SHAP', 'Matplotlib', 'Simulation Modeling', 'Pandas', 'Data Preprocessing'],
    githubUrl: 'https://github.com',
    researchPaperUrl: researchPaperPdf,
    huggingFaceUrl: 'https://huggingface.co/Raynard2/flash_sale_discount_optimizer/tree/main', 
    details: (
        <>
            <p style={{marginBottom: '1rem'}}>
                here are the performance metrics for the proposed XGBoost model. 
            </p>
            <ul style={{listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem'}}>
                <li>
                    <strong style={{color: '#f1fa8c'}}>Facial Asymmetry Analysis:</strong><br/>
                    R^2 (Coefficient of Determination): 0.861
                </li>
                <li>
                    <strong style={{color: '#f1fa8c'}}>Speech Pattern Recognition:</strong><br/>
                    MAPE (Mean Absolute Percentage Error): 8.18%
                </li>
                <li>
                    <strong style={{color: '#f1fa8c'}}>Vital Signs Monitoring:</strong><br/>
                    RMSE (Root Mean Squared Error): 11.89
                </li>
            </ul>
        </>
    )
  },
  {
    id: 4, 
    title: 'Mini Combat Game',
    description: 'A pixel art combat game.',
    imageSrc: '',
    videoSrc: ninjaVideo,
    skills: ['Godot', 'GDScript', 'C#', 'Game Development'],
    githubUrl: 'https://github.com/nikitanathaniarudy/mini_combat_game', 
    details: (
        <>
            <p style={{marginBottom: '1rem'}}>
                Creating video game with Godot Engine, GDScript, and C#.
            </p>
            <ul style={{listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem'}}>
                <li>
                    <strong style={{color: '#f1fa8c'}}>Gameplay:</strong><br/>
                    Implemented combat game style where each player has their own health bar and can attack the dragons.
                </li>
                <li>
                    <strong style={{color: '#f1fa8c'}}>Art Style:</strong><br/>
                    pixel art
                </li>
            </ul>
        </>
    )
  },
  {
    id: 5,
    title: 'Logify',
    description: 'An AI journal that analyzes your day and curates a mood-balancing Spotify soundtrack',
    imageSrc: 'src/assets/logify_pages.jpg',
    skills: ['HTML', 'CSS', 'JavaScript', 'Netlify', 'OpenAI API', 'Spotify API'],
    githubUrl: 'https://github.com/takatoshilee/logify',
    details: (
        <>
            <p style={{marginBottom: '1rem'}}>
                Logify is a journaling app that leverages OpenAI's API to analyze and quantify your mood score on a scale of 1 to 100, providing real-time personalized feedback.
            </p>
            <ul style={{listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem'}}>
                <li>
                    <strong style={{color: '#f1fa8c'}}>AI-Powered Analysis:</strong><br/>
                    Based on your entry, the AI not only comments on your feelings but also recommends a song that captures your mood and plays it directly in your journal through the Spotify API.
                </li>
                <li>
                    <strong style={{color: '#f1fa8c'}}>Dynamic Mood Calendar:</strong><br/>
                    Logify tracks your mood evaluations daily. Days when you’re feeling down appear in red hues, while happier days glow in vibrant greens.
                </li>
                <li>
                    <strong style={{color: '#f1fa8c'}}>Habit Building:</strong><br/>
                    With built-in streak tracking, Logify encourages you to journal every day by gamifying the experience, reinforcing positive habits and promoting self-reflection and personal growth.
                </li>
            </ul>
        </>
    )
  }
];

const ProjectCarousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % projects.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + projects.length) % projects.length);
  };

  const getSlideStyle = (index: number) => {
    // Calculate distance from active index, handling wrap-around
    const total = projects.length;
    let dist = (index - activeIndex);
    
    // Adjust distance for shortest path (wrap around)
    if (dist > total / 2) dist -= total;
    if (dist < -total / 2) dist += total;

    // Only show 3 cards (Active, Left, Right) - hide others or fade them out
    if (Math.abs(dist) > 1) {
        return { 
            opacity: 0, 
            transform: 'translateX(0) scale(0.5)',
            zIndex: 0,
            pointerEvents: 'none' as const
        };
    }

    if (dist === 0) {
        // Active Card
        return { 
            opacity: 1, 
            transform: 'translateX(0) scale(1.1)', // Bigger scale
            zIndex: 10,
            filter: 'none',
            cursor: 'pointer'
        };
    } else if (dist === -1) {
        // Left Card
        return { 
            opacity: 0.6, 
            transform: 'translateX(-350px) scale(0.8) rotateY(15deg)', // Slide left, shrink, rotate
            zIndex: 5,
            filter: 'blur(4px)', // Blur effect
        };
    } else if (dist === 1) {
        // Right Card
        return { 
            opacity: 0.6, 
            transform: 'translateX(350px) scale(0.8) rotateY(-15deg)', // Slide right, shrink, rotate
            zIndex: 5,
            filter: 'blur(4px)', // Blur effect
        };
    }
  };

  return (
    <div className={styles.carouselContainer}>
      <h2 style={{color: '#fff', textShadow: '2px 2px #000', marginBottom: '0.5rem', fontSize: '2rem'}}>
        SELECT PROJECT
      </h2>
      
      <div className={styles.viewport}>
        {projects.map((project, index) => (
            <div 
                key={project.id} 
                className={styles.slide}
                style={getSlideStyle(index)}
            >
                <FlipCard 
                    title={project.title} 
                    description={project.description} 
                    imageSrc={project.imageSrc} 
                    skills={project.skills}
                    githubUrl={project.githubUrl}
                    researchPaperUrl={(project as any).researchPaperUrl}
                    huggingFaceUrl={(project as any).huggingFaceUrl}
                    videoSrc={(project as any).videoSrc}
                    details={(project as any).details} // Type assertion needed or update interface if not inferred
                />
            </div>
        ))}
      </div>

      <div className={styles.controls}>
        <button className={styles.controlButton} onClick={prevSlide} aria-label="Previous">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
                <path d="M16 4H14V6H12V8H10V10H8V12H6V14H8V12H10V10H12V8H14V6H16V20H14V18H12V16H10V14H8V12H10V14H12V16H14V18H16V4Z" fill="black"/>
                <path d="M14 6V8H12V10H10V12H8V14H6V12H8V10H10V8H12V6H14ZM14 18V16H12V14H10V12H8V10H6V12H8V14H10V16H12V18H14Z" fill="white"/>
            </svg>
        </button>
        <button className={styles.controlButton} onClick={nextSlide} aria-label="Next">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges" style={{transform: 'scaleX(-1)'}}>
                <path d="M16 4H14V6H12V8H10V10H8V12H6V14H8V12H10V10H12V8H14V6H16V20H14V18H12V16H10V14H8V12H10V14H12V16H14V18H16V4Z" fill="black"/>
                <path d="M14 6V8H12V10H10V12H8V14H6V12H8V10H10V8H12V6H14ZM14 18V16H12V14H10V12H8V10H6V12H8V14H10V16H12V18H14Z" fill="white"/>
            </svg>
        </button>
      </div>
    </div>
  );
};

export default ProjectCarousel;
