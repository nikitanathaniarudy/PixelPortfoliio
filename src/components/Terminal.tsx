import React, { useState, useEffect } from 'react';
import styles from './Terminal.module.css';

const Terminal: React.FC = () => {
    const [showCatBubble, setShowCatBubble] = useState(false);
    const [typedCommand, setTypedCommand] = useState('');
    const [showContent, setShowContent] = useState(false);
    const [catMessage, setCatMessage] = useState("Pat me");

    const fullCommand = 'cat candidate_profile.json';

    const messages = [
        "im sleepy... 💤", 
        "im hungry 🐟", 
        "wanna play together? 🎮"
    ];
  
    useEffect(() => {
      let index = 0;
      const interval = setInterval(() => {
          setTypedCommand(fullCommand.slice(0, index + 1));
          index++;
          if (index === fullCommand.length) {
              clearInterval(interval);
              setTimeout(() => setShowContent(true), 500); // Delay content reveal
          }
      }, 100);
      return () => clearInterval(interval);
    }, []);
  
    const handleCatClick = () => {
        // Pick random message
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        setCatMessage(randomMsg);
        setShowCatBubble(true);
        
        // Revert to "Pat me" after 3 seconds
        setTimeout(() => {
            setCatMessage("Pat me"); 
            setShowCatBubble(false);
        }, 3000);
    };
  
    return (
      <div className={styles.terminalContainer}>
        <div className={styles.terminalHeader}>
          /Users/nikitarudy/documents % {typedCommand}<span className={styles.cursor}>_</span>
        </div>
        <div className={`${styles.terminalBody} ${showContent ? styles.visible : ''}`}>
          <div className={styles.section}>
              <div className={styles.sectionTitle}>PLAYER PROFILE</div>
              <ul className={styles.list}>
                  <li className={styles.listItem}>Name: Nikita Nathania Rudy</li>
                  <li className={styles.listItem}>Year: 2</li>
                  <li className={styles.listItem}>Major: CS & Applied Math</li>
                  <li className={styles.listItem}>Guild: University of Toronto</li>
                  <li className={styles.listItem}>GPA: 3.8 / 4.0</li>
              </ul>
          </div>
  
          <div className={styles.section}>
              <div className={styles.sectionTitle}>Stats</div>
              <ul className={styles.list}>
                  <li className={styles.listItem}><span className={styles.icon}>🛠️</span> <strong>Languages:</strong> Python, TypeScript, C/C++, C#, Java, SQL, Swift, R, HTML, CSS, JS, LLM</li>
                  <li className={styles.listItem}><span className={styles.icon}>⚡</span> <strong>Stack:</strong> React, Next.js, ASP.NET Core, Node.js, PostgreSQL, AWS Lambda, AWS S3, AWS RDS, AWS EC2</li>
                  <li className={styles.listItem}><span className={styles.icon}>🧠</span> <strong>AI/Data:</strong> PyTorch, Pandas, Computer Vision, ROS, NumPy, SciPy, XGBoost</li>
              </ul>
          </div>
  
          <div className={styles.section}>
              <div className={styles.sectionTitle}>Fun fact about me</div>
              <ul className={styles.list}>
                  <li className={styles.listItem}>I speak Indonesian 🇮🇩 | Japanese 🇯🇵 | Chinese 🇨🇳 | French 🇫🇷</li>
                  <li className={styles.listItem}>I like cooking and baking</li>
                  <li className={styles.listItem}>I binge watch anime</li>
              </ul>
          </div> 
  
          <div className={styles.catContainer}>
              {(showCatBubble || catMessage === "Pat me") && (
                  <div style={{
                      position: 'absolute',
                      top: '-60px',
                      right: '20px',
                      background: '#fff',
                      color: '#000',
                      padding: '0.5rem 1rem',
                      borderRadius: '10px',
                      border: '2px solid #000',
                      boxShadow: '4px 4px 0 rgba(0,0,0,0.2)',
                      zIndex: 20,
                      whiteSpace: 'nowrap',
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '0.8rem'
                  }}>
                      {catMessage}
                      <div style={{
                          position: 'absolute',
                          bottom: '-6px',
                          right: '20px',
                          width: '10px',
                          height: '10px',
                          background: '#fff',
                          transform: 'rotate(45deg)',
                          borderRight: '2px solid #000',
                          borderBottom: '2px solid #000'
                      }}></div>
                  </div>
              )}
            <img 
                src="/assets/cat.png" 
                alt="Pixel Cat" 
                className={styles.cat} 
                onClick={handleCatClick}
                style={{ cursor: 'pointer' }}
            />
        </div>
      </div>
    </div>
  );
};

export default Terminal;
