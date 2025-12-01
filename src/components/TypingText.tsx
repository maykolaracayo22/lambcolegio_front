// components/TypingText.tsx
import { useState, useEffect, useRef } from 'react';

interface TypingTextProps {
  texts: string[];
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseTime?: number;
  startDelay?: number;
  loop?: boolean;
  showCursor?: boolean;
  cursorChar?: string;
  randomSpeed?: boolean;
}

const TypingText: React.FC<TypingTextProps> = ({
  texts,
  className = '',
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseTime = 1000,
  startDelay = 0,
  loop = true,
  showCursor = true,
  cursorChar = '|',
  randomSpeed = false
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Efecto para el cursor parpadeante
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible(v => !v);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  // Efecto principal para el typing
  useEffect(() => {
    if (isPaused) return;

    const currentText = texts[currentIndex];
    
    const getSpeed = () => {
      if (randomSpeed) {
        return Math.random() * (typingSpeed - 20) + 20;
      }
      return isDeleting ? deletingSpeed : typingSpeed;
    };

    if (!isDeleting && displayText.length < currentText.length) {
      // Escribiendo
      timeoutRef.current = setTimeout(() => {
        setDisplayText(currentText.slice(0, displayText.length + 1));
      }, getSpeed());
    } else if (isDeleting && displayText.length > 0) {
      // Borrando
      timeoutRef.current = setTimeout(() => {
        setDisplayText(currentText.slice(0, displayText.length - 1));
      }, getSpeed());
    } else if (!isDeleting && displayText.length === currentText.length) {
      // Pausa después de escribir
      setIsPaused(true);
      timeoutRef.current = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseTime);
    } else if (isDeleting && displayText.length === 0) {
      // Cambiar al siguiente texto
      setIsDeleting(false);
      if (currentIndex === texts.length - 1) {
        if (loop) {
          setCurrentIndex(0);
        }
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    displayText,
    isDeleting,
    isPaused,
    currentIndex,
    texts,
    typingSpeed,
    deletingSpeed,
    pauseTime,
    loop,
    randomSpeed
  ]);

  // Delay inicial
  useEffect(() => {
    if (startDelay > 0) {
      setIsPaused(true);
      const timer = setTimeout(() => {
        setIsPaused(false);
      }, startDelay);
      return () => clearTimeout(timer);
    }
  }, [startDelay]);

  return (
    <div className={`inline-flex items-center ${className}`}>
      <span>{displayText}</span>
      {showCursor && cursorVisible && (
        <span className="ml-1 animate-pulse">{cursorChar}</span>
      )}
    </div>
  );
};

export default TypingText;