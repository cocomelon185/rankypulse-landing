import confetti from "canvas-confetti";

/**
 * Fire a celebratory confetti burst from the location of a given DOM element.
 * Origin x/y values are clamped so confetti never fires off-screen, even when
 * the trigger element is at the very top or bottom of the viewport.
 */
export function fireFixConfetti(originElement?: HTMLElement) {
  const rect = originElement?.getBoundingClientRect();

  const x = rect
    ? Math.max(0.1, Math.min(0.9, (rect.left + rect.width / 2) / window.innerWidth))
    : 0.5;
  const y = rect
    ? // Clamp: never above 0.3 from top (would fire off-screen), never below 0.85
      Math.max(0.3, Math.min(0.85, (rect.top + rect.height / 2) / window.innerHeight))
    : 0.6;

  confetti({
    particleCount: 90,
    spread: 70,
    origin: { x, y },
    colors: ["#6366f1", "#10b981", "#a5b4fc", "#34d399", "#f59e0b", "#ffffff"],
    scalar: 0.85,
    gravity: 1.2,
    ticks: 200,
  });

  // Side bursts 150 ms later for extra flair
  setTimeout(() => {
    confetti({
      particleCount: 30,
      angle: 60,
      spread: 45,
      origin: { x: Math.max(0.05, x - 0.08), y },
      colors: ["#6366f1", "#10b981", "#a5b4fc"],
      scalar: 0.7,
    });
    confetti({
      particleCount: 30,
      angle: 120,
      spread: 45,
      origin: { x: Math.min(0.95, x + 0.08), y },
      colors: ["#6366f1", "#10b981", "#34d399"],
      scalar: 0.7,
    });
  }, 150);
}
