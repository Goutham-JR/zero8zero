"use client";

import { useState, useRef } from "react";

export function VideoIntro({ children }: { children: React.ReactNode }) {
  const [showSite, setShowSite] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  function handleVideoEnd() {
    setShowSite(true);
  }

  function handleVideoError() {
    setShowSite(true);
  }

  if (showSite) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[200] bg-white flex items-center justify-center">
      <video
        ref={videoRef}
        src="/LOGO.mp4"
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
        onError={handleVideoError}
        className="max-w-[80vw] max-h-[80vh] object-contain"
      />
    </div>
  );
}
