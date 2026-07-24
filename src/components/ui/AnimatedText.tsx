import { useEffect, useRef, useState } from 'react';
import styles from './AnimatedText.module.css';

interface AnimatedTextProps {
  text: string;
  as?: 'h1' | 'h2' | 'p';
  className?: string;
  delay?: number; // initial delay in ms
  stagger?: number; // ms between each word
}

export default function AnimatedText({
  text,
  as: Tag = 'p',
  className = '',
  delay = 0,
  stagger = 60,
}: AnimatedTextProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const words = text.split(' ');

  return (
    <Tag ref={ref as React.RefObject<any>} className={`${styles.wrapper} ${className}`} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} className={styles.wordWrapper}>
          <span
            className={`${styles.word} ${visible ? styles.wordVisible : ''}`}
            style={{ transitionDelay: `${i * stagger}ms` }}
          >
            {word}
          </span>
          {i < words.length - 1 && <span className={styles.space}>&nbsp;</span>}
        </span>
      ))}
    </Tag>
  );
}
