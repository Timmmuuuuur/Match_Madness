import { useEffect, useState } from 'react';

interface GameToastProps {
  message: string | null;
}

export function GameToast({ message }: GameToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return undefined;
    }
    setVisible(true);
    const id = window.setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(id);
  }, [message]);

  if (!message && !visible) return null;

  return (
    <div className={`game-toast${visible ? ' game-toast--on' : ''}`} role="status" aria-live="polite">
      {message}
    </div>
  );
}
