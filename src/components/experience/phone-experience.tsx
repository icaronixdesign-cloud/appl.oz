"use client";

import Link from "next/link";
import { ArrowDown, Move3d, Repeat2, ShoppingBag } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { home, marquee, paths, showcase, site } from "@/data/site";
import type { Pose, PhoneScene } from "./phone-scene";

const PI = Math.PI;
const TAU = PI * 2;

/** One pose per stage section: hero, intro, the four qualities and the final landing. */
const desktopPoses: Pose[] = [
  { x: 0.4, y: 0.05, h: 0.7, yaw: -0.52, pitch: 0.06, roll: -0.12, fx: 0, fy: 0, screen: 1, halo: 1, haloSize: 1.32, float: 1, interact: 1 },
  // Leaves clear air above the camera plateau for the intro eyebrow.
  { x: 0, y: -0.01, h: 0.66, yaw: PI, pitch: 0.02, roll: 0, fx: 0, fy: 0, screen: 0.7, halo: 0.85, haloSize: 1.6, float: 0.6, interact: 0.5 },
  { x: 0.3, y: 0, h: 0.84, yaw: PI - 1.1, pitch: -0.12, roll: 0.36, fx: 0, fy: 0, screen: 0.7, halo: 0.75, haloSize: 1.2, float: 0.4, interact: 0.35 },
  { x: 0.34, y: 0.02, h: 1.95, yaw: PI - 0.34, pitch: -0.2, roll: 0.05, fx: 0.07, fy: 0.33, screen: 0.7, halo: 0.45, haloSize: 0.5, float: 0.2, interact: 0.25, cam: 0 },
  { x: 0.3, y: 0, h: 0.78, yaw: TAU - 0.58, pitch: 0.05, roll: 0.035, fx: 0, fy: 0, screen: 1.05, halo: 0.85, haloSize: 1.3, float: 0.35, interact: 0.25, cam: 1 },
  { x: 0.3, y: 0, h: 0.9, yaw: TAU + 0.24, pitch: 0.02, roll: -0.02, fx: 0, fy: 0, screen: 1.35, halo: 0.9, haloSize: 1.3, float: 0.6, interact: 0.4, cam: 0 },
  { x: 0.38, y: -0.02, h: 0.8, yaw: TAU + PI - 0.5, pitch: 0.06, roll: -0.1, fx: 0, fy: 0, screen: 1, halo: 1, haloSize: 1.3, float: 1, interact: 1 },
];

const mobilePoses: Pose[] = [
  { x: 0.04, y: -0.74, h: 0.48, yaw: -0.5, pitch: 0.08, roll: -0.14, fx: 0, fy: 0, screen: 1, halo: 1, haloSize: 1.3, float: 1, interact: 0.6 },
  { x: 0, y: -0.24, h: 0.5, yaw: PI, pitch: 0.02, roll: 0, fx: 0, fy: 0, screen: 0.7, halo: 0.85, haloSize: 1.45, float: 0.6, interact: 0.4 },
  { x: 0, y: 0.3, h: 0.5, yaw: PI - 1.1, pitch: -0.12, roll: 0.32, fx: 0, fy: 0, screen: 0.7, halo: 0.75, haloSize: 1.2, float: 0.4, interact: 0.3 },
  { x: 0, y: 0.34, h: 1.1, yaw: PI - 0.34, pitch: -0.2, roll: 0.05, fx: 0.07, fy: 0.33, screen: 0.7, halo: 0.45, haloSize: 0.5, float: 0.2, interact: 0.2, cam: 0 },
  { x: 0, y: 0.3, h: 0.5, yaw: TAU - 0.58, pitch: 0.05, roll: 0.035, fx: 0, fy: 0, screen: 1.05, halo: 0.85, haloSize: 1.3, float: 0.35, interact: 0.2, cam: 1 },
  { x: 0, y: 0.3, h: 0.52, yaw: TAU + 0.24, pitch: 0.02, roll: -0.02, fx: 0, fy: 0, screen: 1.35, halo: 0.9, haloSize: 1.3, float: 0.6, interact: 0.3, cam: 0 },
  { x: 0, y: 0.5, h: 0.38, yaw: TAU + PI - 0.5, pitch: 0.06, roll: -0.1, fx: 0, fy: 0, screen: 1, halo: 1, haloSize: 1.3, float: 1, interact: 0.6 },
];

type Status = "loading" | "ready" | "fallback";

export function PhoneExperience() {
  const stageRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const backtextRef = useRef<HTMLParagraphElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const heroTagRef = useRef<HTMLAnchorElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<PhoneScene | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [finishId, setFinishId] = useState(showcase.finishes[0].id);
  const finish = showcase.finishes.find(({ id }) => id === finishId) ?? showcase.finishes[0];
  const finishRef = useRef(finish);
  finishRef.current = finish;

  useEffect(() => {
    let disposed = false;
    const cleanups: (() => void)[] = [];
    const stage = stageRef.current;
    const sticky = stickyRef.current;
    const canvas = canvasRef.current;
    if (!stage || !sticky || !canvas) return;

    (async () => {
      const [{ gsap }, { ScrollTrigger }, sceneModule] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("./phone-scene"),
      ]);
      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

      let scene: PhoneScene;
      try {
        const ratio = Math.min(window.devicePixelRatio || 1, window.innerWidth < 720 ? 1.75 : 2);
        scene = new sceneModule.PhoneScene(canvas, ratio);
      } catch {
        setStatus("fallback");
        return;
      }
      sceneRef.current = scene;
      scene.setFinish(finishRef.current);
      if (showcase.cameraVideo) scene.setCameraVideo(showcase.cameraVideo);
      cleanups.push(() => {
        scene.dispose();
        sceneRef.current = null;
      });

      const bg = bgRef.current;
      scene.onProject = (x, y) => {
        bg?.style.setProperty("--px", (x * 100).toFixed(2) + "%");
        bg?.style.setProperty("--py", (y * 100).toFixed(2) + "%");
      };

      const resize = () => scene.setSize(sticky.clientWidth, sticky.clientHeight);
      resize();
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(sticky);
      cleanups.push(() => resizeObserver.disconnect());

      let visible = true;
      const visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { rootMargin: "10% 0px" });
      visibility.observe(stage);
      cleanups.push(() => visibility.disconnect());

      const tick = (_time: number, deltaMs: number) => {
        if (visible && scene.isLoaded) scene.render(Math.min(deltaMs, 50) / 1000);
      };
      gsap.ticker.add(tick);
      cleanups.push(() => gsap.ticker.remove(tick));

      // Scroll choreography, rebuilt per breakpoint.
      const mm = gsap.matchMedia();
      mm.add({ mobile: "(max-width: 720px)", desktop: "(min-width: 721px)" }, (context) => {
        const poses = context.conditions?.mobile ? mobilePoses : desktopPoses;
        Object.assign(scene.state, poses[0]);
        const timeline = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: { trigger: stage, start: "top top", end: "bottom bottom", scrub: reduce ? true : 1, invalidateOnRefresh: true },
        });
        poses.slice(1).forEach((pose, index) => timeline.to(scene.state, { ...pose, duration: 0.72 }, index + 1 - 0.8));
        if (backtextRef.current) {
          timeline
            .fromTo(backtextRef.current, { autoAlpha: 0, scale: 1.3 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: "power2.out" }, 0.38)
            .to(backtextRef.current, { autoAlpha: 0, scale: 0.9, yPercent: -10, duration: 0.45, ease: "power2.in" }, 1.3);
        }
        if (heroContentRef.current) timeline.to(heroContentRef.current, { autoAlpha: 0, y: -70, duration: 0.5, ease: "power1.in" }, 0.04);
        if (heroTagRef.current) timeline.to(heroTagRef.current, { autoAlpha: 0, y: -24, duration: 0.22, ease: "power1.in" }, 0);
        // The marquee dissolves before the phone travels through it, instead of slicing across the device.
        if (marqueeRef.current) timeline.to(marqueeRef.current, { autoAlpha: 0, duration: 0.3, ease: "power1.in" }, 0.02);
        timeline.set({}, {}, poses.length - 1);

        stage.querySelectorAll<HTMLElement>("[data-feature]").forEach((block) => {
          const items = block.querySelectorAll("[data-feature-item]");
          gsap.timeline({ scrollTrigger: { trigger: block, start: "top bottom", end: "bottom top", scrub: true } })
            .fromTo(items, { autoAlpha: 0, y: 70 }, { autoAlpha: 1, y: 0, duration: 0.28, stagger: 0.035, ease: "power2.out" }, 0.16)
            .to(items, { autoAlpha: 0, y: -70, duration: 0.24, stagger: 0.025, ease: "power2.in" }, 0.66)
            .set({}, {}, 1);
        });

        const launchItems = stage.querySelectorAll("[data-launch-item]");
        gsap.fromTo(launchItems, { autoAlpha: 0, y: 46 }, {
          autoAlpha: 1, y: 0, duration: 1, stagger: 0.07, ease: "expo.out",
          scrollTrigger: { trigger: "[data-launch]", start: "top 72%", toggleActions: "play none none reverse" },
        });
      });
      cleanups.push(() => mm.revert());

      // Pointer: the phone follows the cursor a little; in the last section it can be dragged.
      if (finePointer && !reduce) {
        const onPointer = (event: PointerEvent) => scene.setPointer((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 - 1);
        window.addEventListener("pointermove", onPointer, { passive: true });
        cleanups.push(() => window.removeEventListener("pointermove", onPointer));
      }
      const zone = dragRef.current;
      if (zone) {
        const down = (event: PointerEvent) => {
          zone.setPointerCapture(event.pointerId);
          zone.dataset.dragging = "true";
          scene.dragStart(event.clientX);
        };
        const move = (event: PointerEvent) => scene.dragMove(event.clientX);
        const up = (event: PointerEvent) => {
          if (zone.hasPointerCapture(event.pointerId)) zone.releasePointerCapture(event.pointerId);
          delete zone.dataset.dragging;
          scene.dragEnd();
        };
        zone.addEventListener("pointerdown", down);
        zone.addEventListener("pointermove", move);
        zone.addEventListener("pointerup", up);
        zone.addEventListener("pointercancel", up);
        cleanups.push(() => {
          zone.removeEventListener("pointerdown", down);
          zone.removeEventListener("pointermove", move);
          zone.removeEventListener("pointerup", up);
          zone.removeEventListener("pointercancel", up);
        });
      }

      try {
        await scene.load(site.hero.model, "/draco/");
      } catch {
        if (!disposed) setStatus("fallback");
        return;
      }
      if (disposed) return;
      setStatus("ready");
      if (!reduce && window.scrollY < window.innerHeight * 0.5) {
        scene.intro.yaw = -2.2;
        scene.intro.y = -0.35;
        scene.intro.scale = 0.82;
        gsap.to(scene.intro, { yaw: 0, y: 0, scale: 1, duration: 2.4, ease: "expo.out" });
      }
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    })();

    return () => {
      disposed = true;
      cleanups.reverse().forEach((cleanup) => cleanup());
    };
  }, []);

  function chooseFinish(id: string) {
    const next = showcase.finishes.find((item) => item.id === id);
    if (!next || id === finishId) return;
    setFinishId(id);
    sceneRef.current?.setFinish(next);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) sceneRef.current?.spin(TAU * 1.2);
  }

  const lastLine = home.hero.title.length - 1;
  const product = paths.iphones + showcase.slug + "/";
  const trade = paths.trade + "?desejado=" + encodeURIComponent(showcase.slug);

  return (
    <div ref={stageRef} className={"xp is-" + status}>
      <div ref={stickyRef} className="xp-sticky" aria-hidden="true">
        <div ref={bgRef} className="xp-bg" />
        <p ref={backtextRef} className="xp-backtext"><span>iPhone 18</span><span>Pro Max</span></p>
        <canvas ref={canvasRef} className="xp-canvas" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="xp-fallback" src={site.hero.fallback} alt="" width={1000} height={1200} loading="lazy" />
        <div className="xp-loader"><span /></div>
        <div className="xp-vignette" />
      </div>

      <section className="xp-section xp-hero" aria-labelledby="hero-title">
        <div className="wrap xp-hero-layout">
          <div ref={heroContentRef} className="xp-hero-content">
            <p className="eyebrow xp-rise" style={{ "--d": "0s" } as CSSProperties}>{home.hero.location}</p>
            <h1 id="hero-title">
              {home.hero.title.map((line, index) => (
                <span className="line-mask" key={line}>
                  <span className={index === lastLine ? "accent" : undefined} style={{ "--i": index } as CSSProperties}>{line}{" "}</span>
                </span>
              ))}
            </h1>
            <p className="xp-hero-description xp-rise" style={{ "--d": ".45s" } as CSSProperties}>{home.hero.description}</p>
            <div className="actions xp-hero-actions xp-rise" style={{ "--d": ".55s" } as CSSProperties}>
              <Link className="button button--primary" href={paths.iphones} data-magnetic>Explorar iPhones</Link>
              <Link className="button button--glass" href={paths.trade} data-magnetic><Repeat2 size={19} aria-hidden="true" />Quero trocar meu iPhone</Link>
            </div>
          </div>
          <a ref={heroTagRef} className="xp-hero-tag xp-rise" style={{ "--d": ".8s" } as CSSProperties} href="#iphone-18">
            <span className="xp-hero-tag-ring" aria-hidden="true"><ArrowDown size={15} /></span>
            <span className="xp-hero-tag-text"><small>Novo · role para conhecer</small>{showcase.model}</span>
          </a>
        </div>
        <div ref={marqueeRef} className="marquee" aria-label="Destaques da loja">
          <div className="marquee-track">
            {[0, 1].map((group) => (
              <ul className="marquee-group" key={group} aria-hidden={group === 1 ? true : undefined}>
                {marquee.map((item) => <li key={item}>{item}</li>)}
              </ul>
            ))}
          </div>
        </div>
      </section>

      <section id="iphone-18" className="xp-section xp-intro" aria-labelledby="intro-title">
        <div className="wrap xp-intro-layout" data-feature>
          <p className="eyebrow" data-feature-item>{showcase.intro.eyebrow}</p>
          <h2 id="intro-title" className="sr-only">{showcase.model}</h2>
          <p className="xp-intro-description" data-feature-item>{showcase.intro.description}</p>
        </div>
      </section>

      {showcase.features.map((feature, index) => (
        <section className={"xp-section xp-feature xp-feature--" + feature.id} key={feature.id} aria-labelledby={"feature-" + feature.id}>
          <div className="wrap xp-feature-layout" data-feature>
            <div className="xp-feature-content">
              <p className="xp-feature-index" data-feature-item><span>{String(index + 1).padStart(2, "0")}</span>{feature.label}</p>
              <h2 id={"feature-" + feature.id} data-feature-item>{feature.title}</h2>
              <p className="xp-feature-description" data-feature-item>{feature.description}</p>
              <ul className="chips" data-feature-item>
                {feature.chips.map((chip) => <li key={chip}>{chip}</li>)}
              </ul>
            </div>
          </div>
        </section>
      ))}

      <section className="xp-section xp-launch" aria-labelledby="launch-title">
        <div className="wrap xp-launch-layout">
          <div className="xp-launch-content" data-launch>
            <p className="eyebrow" data-launch-item>{showcase.launch.eyebrow}</p>
            <h2 id="launch-title" data-launch-item>
              <span className="xp-launch-model">{showcase.model}</span>
              {showcase.launch.title.map((line) => <span key={line}>{line}{" "}</span>)}
            </h2>
            <p className="xp-launch-description" data-launch-item>{showcase.launch.description}</p>
            <div className="actions" data-launch-item>
              <Link className="button button--primary button--large" href={product} data-magnetic><ShoppingBag size={19} aria-hidden="true" />{showcase.launch.buy}</Link>
              <Link className="button button--glass button--large" href={trade} data-magnetic><Repeat2 size={19} aria-hidden="true" />{showcase.launch.trade}</Link>
            </div>
            <div className="finish" data-launch-item>
              <p className="finish-label">{showcase.launch.finishLabel}: <strong>{finish.name}</strong></p>
              <div className="finish-options" role="group" aria-label={showcase.launch.finishLabel}>
                {showcase.finishes.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className="finish-swatch"
                    style={{ "--swatch": item.swatch } as CSSProperties}
                    aria-pressed={item.id === finishId}
                    aria-label={item.name}
                    title={item.name}
                    onClick={() => chooseFinish(item.id)}
                  />
                ))}
              </div>
              <p className="finish-note">{showcase.launch.finishNote}</p>
            </div>
          </div>
          <div ref={dragRef} className="xp-drag-zone" aria-hidden="true">
            <span className="xp-drag-hint"><Move3d size={16} />{showcase.launch.dragHint}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
