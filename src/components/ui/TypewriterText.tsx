// src/components/ui/TypewriterText.tsx (VERSIÓN CORREGIDA)
import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  duration?: number; // Duración total de la animación en segundos
  className?: string;
  key?: any; // Para forzar reinicio cuando cambia el slide
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  duration = 2,
  className,
  key,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Reiniciar animación cuando cambia la key
    setIsVisible(false);
    
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [text, key]);

  const CHAR_DELAY = (duration * 1000) / text.length;

  return (
    <span className={className}>
      {text.split('').map((char, index) => {
        const isSpace = char === ' ';
        
        return (
          <span
            key={index}
            className={`
              inline-block 
              transition-all duration-500 ease-out
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[-15px]'}
            `}
            style={{
              transitionDelay: isVisible ? `${index * CHAR_DELAY}ms` : '0ms',
            }}
          >
            {char}
            {isSpace && <>&nbsp;</>}
          </span>
        );
      })}
    </span>
  );
};

export default TypewriterText;  