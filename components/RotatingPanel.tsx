"use client";
import { useEffect, useState } from "react";

interface RotatingPanelProps {
  panels: React.ReactNode[];
  intervalMs?: number;
}

export function RotatingPanel({ panels, intervalMs = 12000 }: RotatingPanelProps) {
  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (panels.length <= 1) return;
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setActive((a) => (a + 1) % panels.length);
        setFading(false);
      }, 400);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [panels.length, intervalMs]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div
        className="w-full h-full transition-opacity duration-400"
        style={{ opacity: fading ? 0 : 1 }}
      >
        {panels[active]}
      </div>
      {panels.length > 1 && (
        <div className="absolute bottom-1 right-1 flex gap-1">
          {panels.map((_, i) => (
            <div
              key={i}
              className="w-1 h-1 rounded-full transition-all duration-300"
              style={{ background: i === active ? "#60a5fa" : "#1e293b" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
