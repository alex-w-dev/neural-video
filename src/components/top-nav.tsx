import React from "react";
import Link from "next/link";

export const TopNav = () => {
  return (
    <div>
      <Link href="/video-creator">video-creator</Link>..|..
      <Link href="/youtube-loader">youtube-loader</Link>
    </div>
  );
};
