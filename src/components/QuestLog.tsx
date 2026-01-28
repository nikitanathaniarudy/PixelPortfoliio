import React, { useState } from 'react';
import styles from './QuestLog.module.css';

interface Job {
  id: number;
  role: string;
  company: string;
  duration: string;
  tasks: string[];
  skills: string[]; // "Loot"
}

const jobs: Job[] = [
  {
    id: 1,
    role: 'Software Engineering Intern',
    company: 'PT Medion Farmajaya',
    duration: 'June 2025 - Aug 2025',
    tasks: [
      'Co-developed "Extended Finance" hub integrating centralized payment protocols for Tier-1 Singaporean Bank.',
      'Engineered bulk payment module (ASP.NET) handling 1,000+ rows w/ 99.9% accuracy',
      'Reduced manual error correction ~40% via row-level logging',
      'Refactored monolith to micro-modules, cutting delivery time ~30%',
      'Boosted throughput 50% via async patterns, handling 100+ concurrent txns',
      'Implemented Factory Pattern to cut product onboarding from 2 weeks to 4 days',
      'Optimized APIs with caching, reducing redundant calls 20% & latency >200 ms'
    ],
    skills: ['ASP.NET MVC', 'C#', 'Microservices', 'System Design']
  },
  {
    id: 2,
    role: 'Software Engineer',
    company: 'Lodaria (Engineering Tech Interview)',
    duration: 'Dec 2024 - Present',
    tasks: [
      'Spearheaded end-to-end frontend (React/Next.js) for interview prep platform',
      'Architected real-time code execution system & user progress tracking',
      'Collaborated with founders to drive product from wireframes to MVP',
      'Built reusable component library, reducing frontend dev time by ~40%'
    ],
    skills: ['Figma', 'Next.js', 'React', 'System Architecture', 'UI/UX']
  },
  {
    id: 3,
    role: 'Website Developer',
    company: "U of T Women's Health & Wellness Club",
    duration: 'Sep 2025 - Present',
    tasks: ['Developed and maintained the organization’s centralized web portal, successfully serving over 100 active users with 99.9% uptime', 'Engineered a responsive wellness resource platform that supports 100+ daily users, ensuring seamless access to mental health and fitness modules.'],
    skills: ['Website Development', 'UI/UX']
  } ,
  {
    id: 4,
    role: 'VP of Design & Marketing',
    company: "SOON U of T",
    duration: 'Nov 2025 - Present',
    tasks: [
        'Spearheaded Brand Identity: Designed official logo & brand guidelines',
        'Led end-to-end design & frontend dev of official responsive website',
        'Developed partnership packages & decks to secure initial sponsorship',
        'Collaborated with founders on mission, marketing strategy & roadmap'
    ],
    skills: ['Brand Identity', 'UI/UX', 'Marketing Strategy', 'Web Dev']
  } , 
  {
    id: 5,
    role: 'Events Assistant',
    company: "Regenesis UTM",
    duration: 'Sep 2025 - Present',
    tasks: [
        'Executed end-to-end planning & execution of sustainability events',
        'Directed on-site operations & volunteer teams as primary POC',
        'Managed logistics, budgeting, and resource allocation',
        'Drove outreach strategies, increasing student engagement & attendance'
    ],
    skills: ['Event Management', 'Operations', 'Leadership', 'Outreach']
  } 
];

const QuestLog: React.FC = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div className={styles.questBoard}>
      <h2 className={styles.title}>QUEST LOG</h2>
      
      <div className={styles.questList}>
          {jobs.map((job) => (
            <div 
              key={job.id} 
              className={styles.questItem}
              onClick={() => setExpandedId(expandedId === job.id ? null : job.id)}
            >
              <div className={styles.questHeader}>
                <span className={styles.role}>{job.role}</span>
                <span className={styles.company}>@ {job.company}</span>
              </div>
              
              {(expandedId === job.id) && (
                 <div className={styles.questDetails}>
                    <div style={{marginBottom: '0.5rem', fontWeight: 'bold'}}>{job.duration}</div>
                    <ul style={{listStyle: 'disc', paddingLeft: '1rem'}}>
                        {job.tasks.map((task, i) => <li key={i}>{task}</li>)}
                    </ul>
                    <div className={styles.loot}>
                        LOOT: {job.skills.join(', ')}
                    </div>
                 </div>
              )}
              
              {expandedId !== job.id && (
                 <div style={{paddingLeft: '1.5rem', fontSize: '0.8rem', color: '#666'}}>
                    Click to expand mission details...
                 </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default QuestLog;
