import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

const TypingMessage = ({ content }) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!content) return;
    indexRef.current = 0;
    setDisplayed('');
    setDone(false);

    const interval = setInterval(() => {
      indexRef.current += 2;
      if (indexRef.current >= content.length) {
        setDisplayed(content);
        setDone(true);
        clearInterval(interval);
      } else {
        setDisplayed(content.slice(0, indexRef.current));
      }
    }, 10);

    return () => clearInterval(interval);
  }, [content]);

  return (
    <div className="ai-markdown">
      <ReactMarkdown>{displayed}</ReactMarkdown>
      {!done && <span className="typewriter-cursor" />}
    </div>
  );
};

export default TypingMessage;
