"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const DESKTOP_MQ = "(min-width: 1024px)";

export default function PinnedModuleScroll({ children }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    gsap.registerPlugin(ScrollTrigger);

    let scrollTriggers = [];

    const resetPanels = (panels) => {
      panels.forEach((panel) => {
        gsap.set(panel, { clearProps: "opacity,visibility,pointerEvents" });
        panel.style.removeProperty("z-index");
      });
    };

    const setup = () => {
      scrollTriggers.forEach((trigger) => trigger.kill());
      scrollTriggers = [];

      const panels = gsap.utils.toArray(".module-pin-panel", container);
      resetPanels(panels);

      if (!window.matchMedia(DESKTOP_MQ).matches) {
        ScrollTrigger.refresh();
        return;
      }

      panels.forEach((panel, index) => {
        panel.style.zIndex = String(index + 1);

        scrollTriggers.push(
          ScrollTrigger.create({
            trigger: panel,
            start: "top top",
            pin: true,
            pinSpacing: index === panels.length - 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          }),
        );

        if (index === panels.length - 1) return;

        scrollTriggers.push(
          ScrollTrigger.create({
            trigger: panels[index + 1],
            start: "top top",
            onEnter: () => {
              gsap.set(panel, { autoAlpha: 0, pointerEvents: "none" });
            },
            onLeaveBack: () => {
              gsap.set(panel, { autoAlpha: 1, pointerEvents: "auto" });
            },
          }),
        );
      });

      ScrollTrigger.refresh();
    };

    setup();

    const mediaQuery = window.matchMedia(DESKTOP_MQ);
    mediaQuery.addEventListener("change", setup);
    window.addEventListener("resize", setup);

    return () => {
      mediaQuery.removeEventListener("change", setup);
      window.removeEventListener("resize", setup);
      scrollTriggers.forEach((trigger) => trigger.kill());

      const panels = gsap.utils.toArray(".module-pin-panel", container);
      resetPanels(panels);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {children}
    </div>
  );
}
