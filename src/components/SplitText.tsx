import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

/**
 * Animated split-letter heading. Letters rise + fade in with subtle blur.
 */
export function SplitText({
  text,
  className = "",
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const letters = ref.current.querySelectorAll<HTMLSpanElement>("[data-l]");
    animate(letters, {
      opacity: [0, 1],
      translateY: [18, 0],
      filter: ["blur(8px)", "blur(0px)"],
      duration: 900,
      delay: stagger(28, { start: delay }),
      ease: "out(4)",
    });
  }, [text, delay]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      {Array.from(text).map((ch, i) => (
        <span
          key={i}
          data-l
          style={{ display: "inline-block", opacity: 0, whiteSpace: "pre" }}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}
