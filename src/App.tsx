
import React from 'react';
import './App.css';
import Background from './components/Background';
import Header from './components/Header';
import ProjectCarousel from './components/ProjectCarousel';
import Terminal from './components/Terminal';
import QuestLog from './components/QuestLog';
import Connect from './components/Connect';
import HeroProfile from './components/HeroProfile';
import LikeButton from './components/LikeButton';

function App() {
  React.useEffect(() => {
    // Scroll Reveal Observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    const hiddenElements = document.querySelectorAll('.reveal');
    hiddenElements.forEach((el) => observer.observe(el));

    return () => hiddenElements.forEach((el) => observer.unobserve(el));
  }, []);

  return (
    <div className="app-container">
      <Background />
      <Header />
      
      <main style={{ paddingBottom: '5rem' }}>
        {/* Compact Hero Section to fit in one window */}
        <section id="hero" className="reveal" style={{ 
            height: 'auto', 
            minHeight: '500px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            paddingTop: '60px',
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto'
        }}>
            {/* Top Row: Profile + Terminal */}
            <div id="about" style={{
                display: 'flex',
                gap: '2rem',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'flex-start',
                width: '100%',
                marginBottom: '4rem',
                scrollMarginTop: '180px' // Offset for sticky header if needed
            }}>
                <HeroProfile />
                <Terminal />
            </div>

            <div id="projects" className="reveal" style={{ width: '100%', scrollMarginTop: '100px' }}>
                <ProjectCarousel />
            </div>
        </section>

        <section id="work" className="reveal" style={{ padding: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {/* QuestLog handles its own title inside the board styled as header */}
            <QuestLog />
        </section>

        <section id="connect" className="reveal" style={{ padding: '2rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Connect />
        </section>
      </main>
      
      <footer className="footer">
        by nikita
      </footer>
      
      {/* CRT Overlay */}
      <div className="scanlines"></div>
      
      {/* Interaction */}
      <LikeButton />
    </div>
  );
}

export default App;
