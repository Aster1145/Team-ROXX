"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import "./landing.css";
import { AntigravityMesh } from "@/lib/landing/AntigravityMesh";
import { ThemeScrollManager } from "@/lib/landing/ThemeScrollManager";
import { DroneSimulator } from "@/lib/landing/DroneSimulator";

export default function HomePage() {
  const meshRef = useRef<AntigravityMesh | null>(null);
  const themeScrollRef = useRef<ThemeScrollManager | null>(null);
  const simulatorRef = useRef<DroneSimulator | null>(null);

  useEffect(() => {
    // 1. Initialize Antigravity Interactive 3D Canvas Mesh
    meshRef.current = new AntigravityMesh("mesh-canvas");

    // 2. Initialize Scroll Contrast Theme Shift Manager
    themeScrollRef.current = new ThemeScrollManager();
    themeScrollRef.current.init();

    // 3. Initialize Interactive Flight Simulator
    simulatorRef.current = new DroneSimulator();
    simulatorRef.current.mount();

    return () => {
      meshRef.current?.destroy();
      themeScrollRef.current?.destroy();
      simulatorRef.current?.unmount();
      document.body.classList.remove("theme-contrast");
    };
  }, []);

  return (
    <main className="landing-root">
      {/* Background Interactive 3D Mesh Canvas */}
      <canvas id="mesh-canvas" />

      {/* Top Navigation Bar */}
      <nav className="nav-bar">
        <div className="nav-container">
          <Link href="/" className="logo-group">
            <span className="logo-badge">RX</span>
            <div className="logo-text-group">
              <span className="logo-title">TEAM ROXX</span>
              <span className="logo-subtitle">Autonomous Engineering</span>
            </div>
          </Link>

          <div className="nav-links">
            <a href="#about" className="nav-link">About Us</a>
            <a href="#projects" className="nav-link">Innovations</a>
            <a href="#domains" className="nav-link">Engineering Domains</a>
            <a href="#achievements" className="nav-link">Competitions</a>
            <a href="#simulator" className="nav-link">Flight Simulator</a>
          </div>

          <Link href="/dashboard" className="btn-primary">
            Member Portal
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-content">
            <div className="hero-tag">
              <span className="pulsing-dot" />
              Autonomous Robotics & Agri-Tech Team
            </div>
            <h1 className="hero-title">
              Pioneering Next-Gen <span className="highlight-text">Autonomous Drones</span> &{" "}
              <span className="italic-text">Smart Robotics</span>.
            </h1>
            <p className="hero-description">
              Team ROXX is an elite student engineering team pushing the boundaries of autonomous systems, custom UAV avionics, AI computer vision, and automated hydroponic technology.
            </p>
            <div className="hero-actions">
              <a href="#projects" className="btn-primary">
                Explore Our Work
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </a>
              <Link href="/dashboard" className="btn-secondary">
                Internal Team Portal
              </Link>
            </div>
          </div>

          <div className="hero-card-wrap">
            <div className="stats-card">
              <div className="stats-header">
                <div className="stats-header-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M9 8h6" />
                    <path d="M9 12h6" />
                    <path d="M9 16h6" />
                  </svg>
                  <span>Team ROXX Stats</span>
                </div>
                <span className="badge-active">Active R&D</span>
              </div>

              <div className="stats-grid">
                <div className="stat-box">
                  <span className="stat-icon">⚡</span>
                  <p className="stat-number">6+</p>
                  <p className="stat-label">R&D Systems Built</p>
                </div>

                <div className="stat-box">
                  <span className="stat-icon">🧭</span>
                  <p className="stat-number">150+</p>
                  <p className="stat-label">Autonomous Flight Hrs</p>
                </div>

                <div className="stat-box">
                  <span className="stat-icon">⚙️</span>
                  <p className="stat-number">6</p>
                  <p className="stat-label">Specialized Domains</p>
                </div>

                <div className="stat-box">
                  <span className="stat-icon">🏆</span>
                  <p className="stat-number">12+</p>
                  <p className="stat-label">Expos & Competitions</p>
                </div>
              </div>

              <div className="accuracy-meter">
                <div className="accuracy-label">
                  <span>Autonomous Navigation Accuracy</span>
                  <span>99.4%</span>
                </div>
                <div className="accuracy-bar-track">
                  <div className="accuracy-bar-fill" style={{ width: "99.4%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="section" data-theme="dark">
        <div className="container">
          <div className="about-grid">
            <div className="about-content">
              <p className="section-subtitle">About Team ROXX</p>
              <h2 className="section-heading">
                Engineering intelligent systems from concept to real-world deployment.
              </h2>
              <p className="section-desc">
                Founded by passionate student researchers and engineers, Team ROXX develops fully integrated autonomous solutions. From CAD modeling and carbon-fiber fabrication to custom PCB design and ROS 2 navigation pipelines, our team designs every subsystem in-house.
              </p>

              <div className="feature-list">
                {[
                  "In-house flight controller & telemetry firmware",
                  "Closed-loop automated hydroponic nutrient dosing",
                  "Jetson-powered edge AI computer vision & pest analytics",
                  "Multi-rover swarm navigation & obstacle avoidance",
                ].map((item) => (
                  <div key={item} className="feature-item">
                    <span className="check-icon">✓</span>
                    <span className="feature-text">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="tech-grid">
              <div className="tech-card">
                <span className="tech-icon font-bold text-xl text-emerald-400">🤖</span>
                <h3 className="tech-title">Autonomous Drones</h3>
                <p className="tech-desc">Precision aerial mapping & thermal imaging payload integration.</p>
              </div>

              <div className="tech-card">
                <span className="tech-icon font-bold text-xl text-emerald-400">🌱</span>
                <h3 className="tech-title">Smart Hydroponics</h3>
                <p className="tech-desc">IoT telemetry & automated pH/EC nutrient regulation.</p>
              </div>

              <div className="tech-card">
                <span className="tech-icon font-bold text-xl text-emerald-400">⚡</span>
                <h3 className="tech-title">Avionics & PCB</h3>
                <p className="tech-desc">Custom power distribution & sensor fusion hardware.</p>
              </div>

              <div className="tech-card">
                <span className="tech-icon font-bold text-xl text-emerald-400">🧠</span>
                <h3 className="tech-title">ROS 2 & AI Vision</h3>
                <p className="tech-desc">Edge computing & real-time SLAM trajectory planning.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* R&D Projects Section */}
      <section id="projects" className="section" data-theme="light">
        <div className="container">
          <div className="section-header">
            <p className="section-subtitle">R&D Projects</p>
            <h2 className="section-heading">Our Core Innovations</h2>
            <p className="section-desc">Discover the engineering projects built and tested by Team ROXX.</p>
          </div>

          <div className="projects-grid">
            {[
              {
                title: "AeroScout Autonomous Quadcopter",
                category: "Unmanned Aerial Systems",
                desc: "Custom carbon-fiber drone platform equipped with multispectral camera payloads, waypoint navigation, and auto-landing algorithms.",
                tag: "Autonomous Flight",
              },
              {
                title: "HydroPod Automated Farming Unit",
                category: "Agri-Tech & IoT",
                desc: "Smart closed-loop hydroponics pod with automated dosage pumps, ambient climate sensors, and real-time cloud data logging.",
                tag: "Smart Agri-Tech",
              },
              {
                title: "TerraSLAM Autonomous Rover",
                category: "Ground Robotics",
                desc: "Heavy-duty ground rover utilizing 3D LiDAR SLAM for GPS-denied navigation, obstacle avoidance, and field mapping.",
                tag: "Robotics & SLAM",
              },
              {
                title: "AgriVision Pest AI Detector",
                category: "Computer Vision & AI",
                desc: "NVIDIA Jetson Orin deep-learning model trained to detect crop diseases and pest infestations with 98% accuracy in real-time.",
                tag: "Deep Learning",
              },
              {
                title: "Custom Power & Flight Avionics",
                category: "Electronics Engineering",
                desc: "In-house designed power distribution boards, failsafe telemetry modules, and high-current motor ESC controllers.",
                tag: "Avionics PCB",
              },
              {
                title: "Swarm Trajectory Protocol",
                category: "Swarm Intelligence",
                desc: "Distributed mesh communication protocol enabling multi-agent drone and rover coordinated search & rescue simulation.",
                tag: "Swarm Robotics",
              },
            ].map((p) => (
              <div key={p.title} className="project-card">
                <div>
                  <div className="project-header">
                    <span className="project-tag">{p.tag}</span>
                  </div>
                  <p className="project-category">{p.category}</p>
                  <h3 className="project-title">{p.title}</h3>
                  <p className="project-desc">{p.desc}</p>
                </div>
                <div className="project-footer">
                  <span className="project-link">View Project Details →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Engineering Domains Section */}
      <section id="domains" className="section" data-theme="light">
        <div className="container">
          <div className="section-header">
            <p className="section-subtitle">Multidisciplinary Team</p>
            <h2 className="section-heading">Our 6 Engineering Domains</h2>
            <p className="section-desc">Team ROXX operates in synchronized sub-teams to build complex autonomous systems.</p>
          </div>

          <div className="domains-grid">
            {[
              { title: "Aero Mechanics", desc: "Aerodynamics, structural CAD design, carbon-fiber fabrication, and thrust optimization." },
              { title: "Electronics & Avionics", desc: "Custom PCB design, sensor integration, battery management, and telemetry hardware." },
              { title: "System Integration", desc: "Hardware-in-the-Loop (HIL) testing, safety overrides, and physical assembly." },
              { title: "Software & AI", desc: "ROS 2 navigation, computer vision models, path planning, and cloud analytics dashboards." },
              { title: "Implementation & Field Ops", desc: "Field flight tests, hydroponic pod maintenance, and real-world data collection." },
              { title: "Research & Agritech", desc: "Plant science integration, nutrient balancing formulas, and technical paper documentation." },
            ].map((d) => (
              <div key={d.title} className="domain-card">
                <div className="domain-header">
                  <span className="domain-icon">✓</span>
                  <h3 className="domain-title">{d.title}</h3>
                </div>
                <p className="domain-desc">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section id="achievements" className="achievements-section" data-theme="dark">
        <div style={{ textAlign: "center", maxWidth: "640px", margin: "0 auto" }}>
          <p style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", opacity: 0.8 }}>
            Excellence & Competitions
          </p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 3.5vw, 2.5rem)", marginTop: "8px" }}>
            Recognized Engineering Impact
          </h2>
        </div>

        <div className="achievements-grid">
          {[
            {
              rank: "1st Place",
              title: "National Autonomous Drone League",
              desc: "Achieved top score in autonomous precision landing and obstacle course navigation.",
            },
            {
              rank: "Best Prototype",
              title: "AgriTech Innovation Summit",
              desc: "Awarded for the Smart HydroPod automated closed-loop nutrient dosing system.",
            },
            {
              rank: "Top Research Finalist",
              title: "Robotics & AI Symposium",
              desc: "Published research paper on edge AI pest detection using Jetson vision pipelines.",
            },
          ].map((a) => (
            <div key={a.title} className="achievement-card">
              <span className="achievement-rank">{a.rank}</span>
              <h3 className="achievement-title">{a.title}</h3>
              <p className="achievement-desc">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Drone Flight Simulator Section */}
      <section id="simulator" className="section" data-theme="dark">
        <div className="container">
          <div className="simulator-preview-card">
            <span className="simulator-badge">🎮 Interactive Flight Simulator</span>
            <h2 className="simulator-title">Interactive Flight Simulator</h2>
            <h3 className="simulator-subheading">Arcade Flight Training</h3>
            <p className="simulator-description">
              Navigate obstacles, collect battery power-ups, and execute precision landings in full-screen arcade mode.
            </p>

            <div className="simulator-controls-preview">
              <div className="ctrl-badge"><span className="ctrl-key">W A S D</span> / <span className="ctrl-key">↑ ↓ ← →</span> Thrust & Steering</div>
              <div className="ctrl-badge"><span className="ctrl-key">H</span> Toggle Hover Mode</div>
              <div className="ctrl-badge"><span className="ctrl-key">⚡</span> Collect Energy Batteries</div>
              <div className="ctrl-badge"><span className="ctrl-key">🎯</span> Touchdown on Landing Pad</div>
            </div>

            <button className="btn-launch-simulator">
              Launch Full Screen Mode
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Member Portal Callout Section */}
      <section className="section" style={{ backgroundColor: "var(--bg-secondary)", borderTop: "1px solid var(--stone)" }} data-theme="light">
        <div className="container" style={{ textAlign: "center", maxWidth: "600px" }}>
          <h2 className="section-heading">Team ROXX Member Portal</h2>
          <p className="section-desc">
            Are you a member of Team ROXX? Access our internal workspace to manage projects, log lab inventory, submit weekly reports, and update budget logs.
          </p>

          <div style={{ marginTop: "24px" }}>
            <Link href="/dashboard" className="btn-primary btn-portal">
              Access Member Portal
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Full Screen Arcade Drone Simulator Overlay Modal */}
      <div id="simulator-modal" className="simulator-modal">
        <button id="modal-close-btn" className="modal-close-btn" title="Close Full Screen Arcade">✕</button>

        <div className="game-hud">
          <div className="hud-panel">
            <span>SCORE:</span>
            <span id="hud-score" className="hud-val">0</span>
          </div>
          <div className="hud-panel">
            <span>BATTERY:</span>
            <span id="hud-battery" className="hud-val">100%</span>
          </div>
          <div className="hud-panel">
            <span>ALTITUDE:</span>
            <span id="hud-alt" className="hud-val">0m</span>
          </div>
          <div className="hud-panel">
            <span>HOVER MODE:</span>
            <span id="hud-hover" className="hover-indicator inactive">H: OFF</span>
          </div>
        </div>

        <div className="game-instructions-bar">
          <span><strong>WASD / Arrow Keys</strong> Fly Drone</span>
          <span><strong>&apos;H&apos; Key</strong> Hover Hold Mode</span>
          <span><strong>Collect ⚡</strong> Refill Battery & Score</span>
          <span><strong>Esc / ✕</strong> Close Simulator</span>
        </div>

        <canvas id="game-canvas" />
      </div>

      {/* Footer */}
      <footer>
        <div className="footer-container">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="logo-badge" style={{ width: "28px", height: "28px", fontSize: "11px" }}>RX</span>
            <strong style={{ fontSize: "14px" }}>Team ROXX — Autonomous Systems Engineering</strong>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>© 2026 Team ROXX. All rights reserved.</p>
          <Link href="/dashboard" style={{ fontSize: "13px", fontWeight: 600, color: "var(--forest)", textDecoration: "none" }}>
            Member Portal Login
          </Link>
        </div>
      </footer>
    </main>
  );
}
