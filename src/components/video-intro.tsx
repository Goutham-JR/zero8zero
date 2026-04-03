"use client";

import { useState, useRef, useEffect } from "react";

export function VideoIntro({ children }: { children: React.ReactNode }) {
  const [showSite, setShowSite] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowSite(true), 6000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => setShowSite(true));
  }, []);

  if (showSite) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[200] bg-white flex items-center justify-center">
      <video
        ref={videoRef}
        src="/LOGO.mp4"
        autoPlay
        muted
        playsInline
        onEnded={() => setShowSite(true)}
        onError={() => setShowSite(true)}
        className="max-w-[80vw] max-h-[80vh] object-contain"
      />
    </div>
  );
}
