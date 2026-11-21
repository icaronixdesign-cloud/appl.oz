"use client";

import { useEffect } from "react";

/**
 * Motion for the home page outside the 3D stage: smooth scrolling, text reveals,
 * the horizontal trade rail, the zoom section, card tilt and magnetic buttons.
 * Everything is progressive: without JavaScript the page is complete and static.
 */
export function HomeMotion() {
  useEffect(() => {
    let disposed = false;
    const cleanups: (() => void)[] = [];
    const root = document.documentElement;

    (async () => {
      const [{ gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("lenis"),
      ]);
      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.config({ ignoreMobileResize: true });
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      root.classList.add("js-motion");
      cleanups.push(() => root.classList.remove("js-motion"));

      if (!reduce) {
        const lenis = new Lenis({
          lerp: 0.085,
          anchors: true,
          prevent: (node: HTMLElement) => Boolean(node.closest?.("dialog, [data-lenis-prevent]")),
        });
        lenis.on("scroll", ScrollTrigger.update);
        const raf = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(raf);
        gsap.ticker.lagSmoothing(0);
        cleanups.push(() => {
          gsap.ticker.remove(raf);
          lenis.destroy();
        });
      }

      let railMedia: ReturnType<typeof gsap.matchMedia> | undefined;
      cleanups.push(() => railMedia?.revert());
      const context = gsap.context(() => {
        if (reduce) return;

        gsap.utils.toArray<HTMLElement>("[data-split]").forEach((element) => {
          gsap.from(element.querySelectorAll(".sw > span"), {
            yPercent: 115, rotate: 4, duration: 1.15, ease: "expo.out", stagger: 0.045,
            scrollTrigger: { trigger: element, start: "top 86%", once: true },
          });
        });

        gsap.set("[data-reveal]", { autoAlpha: 0, y: 48 });
        ScrollTrigger.batch("[data-reveal]", {
          start: "top 90%",
          once: true,
          onEnter: (elements) => gsap.to(elements, { autoAlpha: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: 0.08, overwrite: true }),
        });

        // Pins are created in page order (rail, then zoom) so each one measures the spacing of the one above it.
        // Horizontal rail driven by vertical scroll on large screens.
        railMedia = gsap.matchMedia();
        railMedia.add("(min-width: 900px)", () => {
          const rail = document.querySelector<HTMLElement>("[data-rail]");
          const track = rail?.querySelector<HTMLElement>("[data-rail-track]");
          if (!rail || !track) return;
          rail.classList.add("is-pinned");
          const progress = rail.querySelector<HTMLElement>("[data-rail-progress]");
          const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
          const slide = gsap.to(track, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: rail,
              start: "top top",
              end: () => "+=" + distance(),
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true,
              refreshPriority: 2,
              onUpdate: (self) => progress?.style.setProperty("--progress", self.progress.toFixed(4)),
            },
          });
          track.querySelectorAll<HTMLElement>("[data-rail-panel]").forEach((panel) => {
            const number = panel.querySelector("[data-rail-number]");
            const card = panel.querySelector("[data-rail-card]");
            if (number) {
              gsap.fromTo(number, { xPercent: 45 }, {
                xPercent: -45, ease: "none",
                scrollTrigger: { trigger: panel, containerAnimation: slide, start: "left right", end: "right left", scrub: true },
              });
            }
            if (card) {
              gsap.fromTo(card, { rotateY: -16, scale: 0.88, autoAlpha: 0.35 }, {
                rotateY: 0, scale: 1, autoAlpha: 1, ease: "none",
                scrollTrigger: { trigger: panel, containerAnimation: slide, start: "left 95%", end: "left 45%", scrub: true },
              });
            }
          });
          return () => rail.classList.remove("is-pinned");
        });

        // Zoom scroll: the frame opens from an inset card to full-bleed while the image settles.
        const zoom = document.querySelector<HTMLElement>("[data-zoom]");
        if (zoom) {
          const media = zoom.querySelector("[data-zoom-media]");
          const image = zoom.querySelector("[data-zoom-image]");
          const copy = zoom.querySelectorAll("[data-zoom-copy] > *");
          gsap.timeline({ scrollTrigger: { trigger: zoom, start: "top top", end: "+=130%", pin: true, scrub: 1, anticipatePin: 1, refreshPriority: 1 } })
            .fromTo(media, { clipPath: "inset(16% 24% 16% 24% round 36px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "power2.inOut", duration: 1 })
            .fromTo(image, { scale: 1.4 }, { scale: 1, ease: "power2.inOut", duration: 1 }, 0)
            .fromTo(copy, { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.45, ease: "power2.out" }, 0.62);
        }
      });
      cleanups.push(() => context.revert());

      // Pointer effects through delegation, so re-rendered cards keep working.
      if (finePointer && !reduce) {
        let tilted: HTMLElement | null = null;
        let magnet: HTMLElement | null = null;
        const release = () => {
          if (tilted) {
            tilted.classList.remove("is-tilting");
            tilted.style.setProperty("--rx", "0deg");
            tilted.style.setProperty("--ry", "0deg");
            tilted = null;
          }
        };
        const releaseMagnet = () => {
          if (magnet) {
            magnet.style.setProperty("--tx", "0px");
            magnet.style.setProperty("--ty", "0px");
            magnet = null;
          }
        };
        const onMove = (event: PointerEvent) => {
          const target = event.target as Element | null;
          const card = target?.closest<HTMLElement>("[data-tilt]") ?? null;
          if (card !== tilted) release();
          if (card) {
            const rect = card.getBoundingClientRect();
            const px = (event.clientX - rect.left) / rect.width;
            const py = (event.clientY - rect.top) / rect.height;
            tilted = card;
            card.classList.add("is-tilting");
            card.style.setProperty("--rx", ((0.5 - py) * 9).toFixed(2) + "deg");
            card.style.setProperty("--ry", ((px - 0.5) * 11).toFixed(2) + "deg");
            card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
            card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
          }
          const spot = target?.closest<HTMLElement>("[data-spotlight]");
          if (spot) {
            const rect = spot.getBoundingClientRect();
            spot.style.setProperty("--mx", (event.clientX - rect.left).toFixed(0) + "px");
            spot.style.setProperty("--my", (event.clientY - rect.top).toFixed(0) + "px");
          }
          const button = target?.closest<HTMLElement>("[data-magnetic]") ?? null;
          if (button !== magnet) releaseMagnet();
          if (button) {
            const rect = button.getBoundingClientRect();
            magnet = button;
            button.style.setProperty("--tx", ((event.clientX - rect.left - rect.width / 2) * 0.22).toFixed(1) + "px");
            button.style.setProperty("--ty", ((event.clientY - rect.top - rect.height / 2) * 0.32).toFixed(1) + "px");
          }
        };
        const onLeave = () => {
          release();
          releaseMagnet();
        };
        document.addEventListener("pointermove", onMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          document.removeEventListener("pointermove", onMove);
          document.documentElement.removeEventListener("pointerleave", onLeave);
        });
      }

      // Keep trigger positions right when content above them changes height (catalog filters, FAQ).
      const main = document.querySelector("main");
      if (main) {
        let lastHeight = main.offsetHeight;
        let timer = 0;
        const observer = new ResizeObserver(() => {
          window.clearTimeout(timer);
          timer = window.setTimeout(() => {
            const height = main.offsetHeight;
            if (Math.abs(height - lastHeight) > 2) {
              lastHeight = height;
              ScrollTrigger.sort();
              ScrollTrigger.refresh();
              lastHeight = main.offsetHeight;
            }
          }, 180);
        });
        observer.observe(main);
        cleanups.push(() => {
          observer.disconnect();
          window.clearTimeout(timer);
        });
      }

      const refresh = () => {
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      };
      document.fonts?.ready.then(() => { if (!disposed) refresh(); });
      refresh();
    })();

    return () => {
      disposed = true;
      cleanups.reverse().forEach((cleanup) => cleanup());
    };
  }, []);

  return null;
}
