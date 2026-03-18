import { useState, useEffect } from 'react';

const TypewriterText = ({ texts, className = '', speed = 60, delayBetween = 1200, loop = false }) => {
  const [displayedLines, setDisplayedLines] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (currentLineIndex >= texts.length) {
      setDone(true);
      return;
    }

    const currentText = texts[currentLineIndex].text;

    if (currentCharIndex < currentText.length) {
      const timer = setTimeout(() => {
        setDisplayedLines((prev) => {
          const updated = [...prev];
          if (!updated[currentLineIndex]) {
            updated[currentLineIndex] = { ...texts[currentLineIndex], displayed: '' };
          }
          updated[currentLineIndex] = {
            ...updated[currentLineIndex],
            displayed: currentText.slice(0, currentCharIndex + 1),
          };
          return updated;
        });
        setCurrentCharIndex((c) => c + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setCurrentLineIndex((l) => l + 1);
        setCurrentCharIndex(0);
      }, delayBetween);
      return () => clearTimeout(timer);
    }
  }, [currentLineIndex, currentCharIndex, texts, speed, delayBetween]);

  return (
    <div className={className}>
      {texts.map((line, i) => {
        const content = displayedLines[i]?.displayed || '';
        const isCurrentLine = i === currentLineIndex && !done;
        const isUpcoming = i > currentLineIndex;

        if (isUpcoming && !content) {
          return (
            <div key={i} className={line.className} style={{ visibility: 'hidden' }}>
              {line.text}
            </div>
          );
        }

        return (
          <div key={i} className={line.className}>
            {content}
            {isCurrentLine && <span className="typewriter-cursor" />}
          </div>
        );
      })}
    </div>
  );
};

export default TypewriterText;
