"use client";
import { useEffect } from "react";

export function CustomCursor() {
  useEffect(() => {
    if (typeof window === "undefined" || window.innerWidth < 768) return;

    const cursor = document.createElement("div");
    cursor.className = "custom-cursor";
    document.body.appendChild(cursor);

    const move = (e: MouseEvent) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    };

    const hover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("a, button, .card-3d, input, .match-card")) {
        cursor.classList.add("hover");
      } else {
        cursor.classList.remove("hover");
      }
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseover", hover);

    return () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", hover);
      cursor.remove();
    };
  }, []);

  return null;
}

export function Particles() {
  useEffect(() => {
    const container = document.querySelector(".particles");
    if (!container) return;

    const colors = ["#a855f7", "#3b82f6", "#ec4899", "#06b6d4"];
    const count = 30;

    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      p.style.left = `${Math.random() * 100}%`;
      p.style.color = colors[Math.floor(Math.random() * colors.length)];
      p.style.animationDuration = `${8 + Math.random() * 12}s`;
      p.style.animationDelay = `${Math.random() * 10}s`;
      p.style.width = `${2 + Math.random() * 6}px`;
      p.style.height = p.style.width;
      container.appendChild(p);
    }

    return () => {
      container.innerHTML = "";
    };
  }, []);

  return (
    <>
      <div className="bg-mesh" />
      <div className="grid-bg" />
      <div className="particles" />
    </>
  );
}