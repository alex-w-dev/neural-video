"use client";

import React, { useEffect, useState } from "react";

export function JustInClient({ children }: { children: React.ReactNode }) {
  const [render, setRender] = useState(false);
  useEffect(() => setRender(true), []);

  return <>{render ? children : "no server side render"}</>;
}
