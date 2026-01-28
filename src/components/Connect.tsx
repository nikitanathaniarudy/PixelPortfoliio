import React, { useState } from 'react';
import styles from './Connect.module.css';

const Connect: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `[Portfolio Contact] Message from ${formData.name}`;
    const body = `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`;
    
    // Open default mail client
    window.location.href = `mailto:nikitanathania108@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Optional: Reset form or show success feedback
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className={styles.connectContainer}>
      <h2 className={styles.title}>START_COMMUNICATION</h2>
      
      <div className={styles.statusBar}>
         FREQUENCY: <a href="mailto:nikitanathania108@gmail.com" style={{color: '#fff', textDecoration: 'underline'}}>nikitanathania108@gmail.com</a>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
            <label className={styles.label}>// INPUT: NAME</label>
            <input 
                type="text" 
                className={styles.input} 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
            />
        </div>

        <div className={styles.formGroup}>
            <label className={styles.label}>// INPUT: EMAIL_ADDRESS (Yours)</label>
            <input 
                type="email" 
                className={styles.input}
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
            />
        </div>

        <div className={styles.formGroup}>
            <label className={styles.label}>// INPUT: MESSAGE_PACKET</label>
            <textarea 
                className={styles.textarea}
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                required
            />
        </div>

        <button type="submit" className={styles.button}>
            TRANSMIT &gt;
        </button>
      </form>

      <div className={styles.statusBar} style={{marginTop: '1rem', fontSize: '0.7rem', color: '#888'}}>
        STATUS: ONLINE | SIGNAL: 100%
      </div>
    </div>
  );
};

export default Connect;
