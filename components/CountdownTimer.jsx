"use client";
import React, { useState, useEffect } from 'react';

export default function CountdownTimer({ targetDate, t, darkMode }) {
  function calculateTimeLeft() {
    const end = new Date(targetDate);
    end.setHours(23, 59, 59, 999);
    const difference = +end - +new Date();
    let timeLeft = {};
    if (difference > 0) {
      timeLeft = {
        d: Math.floor(difference / (1000 * 60 * 60 * 24)),
        h: Math.floor((difference / (1000 * 60 * 60)) % 24),
        m: Math.floor((difference / 1000 / 60) % 60),
        s: Math.floor((difference / 1000) % 60)
      };
    }
    return timeLeft;
  }
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);
  const hasTimeLeft = Object.keys(timeLeft).length > 0;
  if (!hasTimeLeft) return null;
  return (
    <div className={`text-sm font-bold mt-2 flex items-center gap-2 px-3 py-1 rounded-lg w-fit ${darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'}`}>
      <span>{t.endsIn}</span>
      <span dir="ltr" className="flex gap-1 font-mono">
        {timeLeft.d > 0 && <span>{timeLeft.d}d</span>}
        <span>{timeLeft.h}h</span>
        <span>{timeLeft.m}m</span>
        <span>{timeLeft.s}s</span>
      </span>
    </div>
  );
}
