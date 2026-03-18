import { useState, useEffect, useRef } from 'react';

const useTypingEffect = (text, speed = 12, enabled = true) => {
  const [displayed, setDisplayed] = useState(enabled ? '' : text);
  const [isTyping, setIsTyping] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!enabled || !text) {
      setDisplayed(text || '');
      return;
    }

    setIsTyping(true);
    indexRef.current = 0;
    setDisplayed('');

    const interval = setInterval(() => {
      indexRef.current += 1;
      const nextChunk = text.slice(0, indexRef.current);
      setDisplayed(nextChunk);

      if (indexRef.current >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, enabled]);

  return { displayed, isTyping };
};

export default useTypingEffect;
