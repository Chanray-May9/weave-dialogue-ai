import { useEffect, useRef } from "react";

/**
 * Animated aurora gradient orbs — full-viewport ambient backdrop.
 * Uses pointer-driven parallax + slow procedural drift.
 */
export function AuroraBackdrop() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let t = 0;
    let px = 0,
      py = 0;
    const onMove = (e: PointerEvent) => {
      px = (e.clientX / window.innerWidth - 0.5) * 30;
      py = (e.clientY / window.innerHeight - 0.5) * 30;
    };
    window.addEventListener("pointermove", onMove);

    const loop = () => {
      t += 0.005;
      const a = el.children[0] as HTMLElement;
      const b = el.children[1] as HTMLElement;
      const c = el.children[2] as HTMLElement;
      if (a) a.style.transform = `translate3d(${Math.sin(t) * 40 + px}px, ${Math.cos(t * 0.7) * 30 + py}px, 0)`;
      if (b) b.style.transform = `translate3d(${Math.cos(t * 0.5) * 60 - px}px, ${Math.sin(t * 0.8) * 50 - py}px, 0)`;
      if (c) c.style.transform = `translate3d(${Math.sin(t * 0.3) * 30}px, ${Math.cos(t * 0.4) * 40}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div
        className="absolute -top-40 -left-40 h-[42rem] w-[42rem] rounded-full opacity-50"
        style={{
          background:
            "radial-gradient(circle, oklch(0.82 0.18 70 / 0.35), transparent 60%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute -bottom-40 -right-40 h-[44rem] w-[44rem] rounded-full opacity-50"
        style={{
          background:
            "radial-gradient(circle, oklch(0.72 0.14 230 / 0.4), transparent 60%)",
          filter: "blur(70px)",
        }}
      />
      <div
        className="absolute top-1/3 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(circle, oklch(0.55 0.2 320 / 0.35), transparent 60%)",
          filter: "blur(80px)",
        }}
      />
    </div>
  );
}
