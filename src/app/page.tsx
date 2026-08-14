import Link from "next/link";
import {
  ArrowRight,
  Cpu,
  Sprout,
  Users,
  Calendar,
  Layers,
  Award,
  Zap,
  Bot,
  Activity,
  ShieldCheck,
  Compass,
  FileCode2,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-cream text-charcoal">
      {/* Top Navigation Bar */}
      <nav className="fixed inset-x-0 top-0 z-40 border-b border-stone bg-cream/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest text-white text-xs font-bold shadow-sm">
              RX
            </span>
            <div className="flex flex-col">
              <span className="font-[family-name:var(--font-playfair)] text-lg font-bold leading-tight text-forest">
                TEAM ROXX
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-charcoal/60 uppercase">
                Autonomous Engineering
              </span>
            </div>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-charcoal/80 md:flex">
            <Link href="#about" className="transition-colors hover:text-forest">
              About Us
            </Link>
            <Link href="#projects" className="transition-colors hover:text-forest">
              Innovations
            </Link>
            <Link href="#domains" className="transition-colors hover:text-forest">
              Engineering Domains
            </Link>
            <Link href="#achievements" className="transition-colors hover:text-forest">
              Competitions
            </Link>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-forest px-5 py-2 text-sm font-medium text-white shadow-xs transition-all hover:bg-forest/90 hover:shadow-sm"
          >
            Team Portal <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="pointer-events-none absolute -right-24 -top-24 h-[550px] w-[550px] rounded-full bg-forest/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-[450px] w-[450px] rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-forest/20 bg-forest/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-forest">
              <span className="h-2 w-2 rounded-full bg-forest animate-pulse" />
              Autonomous Robotics & Agri-Tech Team
            </div>
            <h1 className="font-[family-name:var(--font-playfair)] text-[clamp(2.5rem,5.5vw,4.25rem)] font-bold leading-[1.08] text-charcoal">
              Pioneering Next-Gen <span className="text-forest">Autonomous Drones</span> &{" "}
              <span className="italic text-sage">Smart Robotics</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-charcoal/80">
              Team ROXX is an elite student engineering team pushing the boundaries of autonomous systems, custom UAV avionics, AI computer vision, and automated hydroponic technology.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="#projects"
                className="inline-flex items-center gap-2 rounded-xl bg-forest px-7 py-3 text-sm font-medium text-white shadow-md transition-all hover:bg-forest/90"
              >
                Explore Our Work <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-forest/30 bg-white/80 px-7 py-3 text-sm font-medium text-forest backdrop-blur-sm transition-all hover:bg-forest/5"
              >
                Internal Team Portal
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-3xl border border-stone bg-white/90 p-6 shadow-xl backdrop-blur-md">
              <div className="mb-6 flex items-center justify-between border-b border-stone pb-4">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-forest" />
                  <span className="font-semibold text-charcoal">Team ROXX Stats</span>
                </div>
                <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-medium text-forest">
                  Active R&D
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "6+", label: "R&D Systems Built", icon: Cpu },
                  { value: "150+", label: "Autonomous Flight Hrs", icon: Compass },
                  { value: "6", label: "Specialized Domains", icon: Layers },
                  { value: "12+", label: "Expos & Competitions", icon: Award },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-stone/80 bg-cream/60 p-4">
                    <stat.icon className="mb-2 h-5 w-5 text-forest" />
                    <p className="text-2xl font-bold text-charcoal">{stat.value}</p>
                    <p className="text-xs font-medium text-charcoal/70">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-stone/80 bg-forest/5 p-4">
                <div className="flex items-center justify-between text-xs font-semibold text-forest">
                  <span>Autonomous Navigation Accuracy</span>
                  <span>99.4%</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-stone">
                  <div className="h-2 w-[99.4%] rounded-full bg-forest" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us */}
      <section id="about" className="border-t border-stone bg-white px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-forest">About Team ROXX</p>
              <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-3xl font-semibold text-charcoal md:text-4xl">
                Engineering intelligent systems from concept to real-world deployment.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-charcoal/70">
                Founded by passionate student researchers and engineers, Team ROXX develops fully integrated autonomous solutions. From CAD modeling and carbon-fiber fabrication to custom PCB design and ROS 2 navigation pipelines, our team designs every subsystem in-house.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  "In-house flight controller & telemetry firmware",
                  "Closed-loop automated hydroponic nutrient dosing",
                  "Jetson-powered edge AI computer vision & pest analytics",
                  "Multi-rover swarm navigation & obstacle avoidance",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-forest shrink-0" />
                    <span className="text-sm font-medium text-charcoal">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl border border-stone bg-cream p-6">
                  <Bot className="mb-3 h-8 w-8 text-forest" />
                  <h3 className="font-semibold text-charcoal">Autonomous Drones</h3>
                  <p className="mt-1 text-xs text-charcoal/70">Precision aerial mapping & thermal imaging payload integration.</p>
                </div>
                <div className="rounded-2xl border border-stone bg-cream p-6">
                  <Sprout className="mb-3 h-8 w-8 text-forest" />
                  <h3 className="font-semibold text-charcoal">Smart Hydroponics</h3>
                  <p className="mt-1 text-xs text-charcoal/70">IoT telemetry & automated pH/EC nutrient regulation.</p>
                </div>
              </div>
              <div className="space-y-4 pt-6">
                <div className="rounded-2xl border border-stone bg-cream p-6">
                  <Zap className="mb-3 h-8 w-8 text-forest" />
                  <h3 className="font-semibold text-charcoal">Avionics & PCB</h3>
                  <p className="mt-1 text-xs text-charcoal/70">Custom power distribution & sensor fusion hardware.</p>
                </div>
                <div className="rounded-2xl border border-stone bg-cream p-6">
                  <FileCode2 className="mb-3 h-8 w-8 text-forest" />
                  <h3 className="font-semibold text-charcoal">ROS 2 & AI Vision</h3>
                  <p className="mt-1 text-xs text-charcoal/70">Edge computing & real-time SLAM trajectory planning.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Engineering Innovations & Projects */}
      <section id="projects" className="px-6 py-24 bg-cream">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-forest">R&D Projects</p>
            <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-3xl font-semibold text-charcoal md:text-4xl">
              Our Core Innovations
            </h2>
            <p className="mt-3 text-sm text-charcoal/70">
              Discover the engineering projects built and tested by Team ROXX.
            </p>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "AeroScout Autonomous Quadcopter",
                category: "Unmanned Aerial Systems",
                desc: "Custom carbon-fiber drone platform equipped with multispectral camera payloads, waypoint navigation, and auto-landing algorithms.",
                tag: "Autonomous Flight",
                icon: Bot,
              },
              {
                title: "HydroPod Automated Farming Unit",
                category: "Agri-Tech & IoT",
                desc: "Smart closed-loop hydroponics pod with automated dosage pumps, ambient climate sensors, and real-time cloud data logging.",
                tag: "Smart Agri-Tech",
                icon: Sprout,
              },
              {
                title: "TerraSLAM Autonomous Rover",
                category: "Ground Robotics",
                desc: "Heavy-duty ground rover utilizing 3D LiDAR SLAM for GPS-denied navigation, obstacle avoidance, and field mapping.",
                tag: "Robotics & SLAM",
                icon: Cpu,
              },
              {
                title: "AgriVision Pest AI Detector",
                category: "Computer Vision & AI",
                desc: "NVIDIA Jetson Orin deep-learning model trained to detect crop diseases and pest infestations with 98% accuracy in real-time.",
                tag: "Deep Learning",
                icon: Activity,
              },
              {
                title: "Custom Power & Flight Avionics",
                category: "Electronics Engineering",
                desc: "In-house designed power distribution boards, failsafe telemetry modules, and high-current motor ESC controllers.",
                tag: "Avionics PCB",
                icon: Zap,
              },
              {
                title: "Swarm Trajectory Protocol",
                category: "Swarm Intelligence",
                desc: "Distributed mesh communication protocol enabling multi-agent drone and rover coordinated search & rescue simulation.",
                tag: "Swarm Robotics",
                icon: Layers,
              },
            ].map((p) => (
              <div
                key={p.title}
                className="group relative flex flex-col justify-between rounded-3xl border border-stone bg-white p-7 transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-semibold text-forest">
                      {p.tag}
                    </span>
                    <p.icon className="h-5 w-5 text-charcoal/50 group-hover:text-forest transition-colors" />
                  </div>
                  <p className="text-xs font-medium uppercase tracking-wider text-charcoal/60">{p.category}</p>
                  <h3 className="mt-1 text-xl font-bold text-charcoal">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-charcoal/70">{p.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-stone/60">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest group-hover:underline">
                    View Project Details <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Engineering Domains */}
      <section id="domains" className="border-t border-stone bg-white px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-forest">Multidisciplinary Team</p>
            <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-3xl font-semibold text-charcoal md:text-4xl">
              Our 6 Engineering Domains
            </h2>
            <p className="mt-3 text-sm text-charcoal/70">
              Team ROXX operates in synchronized sub-teams to build complex autonomous systems.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Aero Mechanics", desc: "Aerodynamics, structural CAD design, carbon-fiber fabrication, and thrust optimization." },
              { title: "Electronics & Avionics", desc: "Custom PCB design, sensor integration, battery management, and telemetry hardware." },
              { title: "System Integration", desc: "Hardware-in-the-Loop (HIL) testing, safety overrides, and physical assembly." },
              { title: "Software & AI", desc: "ROS 2 navigation, computer vision models, path planning, and cloud analytics dashboards." },
              { title: "Implementation & Field Ops", desc: "Field flight tests, hydroponic pod maintenance, and real-world data collection." },
              { title: "Research & Agritech", desc: "Plant science integration, nutrient balancing formulas, and technical paper documentation." },
            ].map((d) => (
              <div key={d.title} className="rounded-2xl border border-stone bg-cream p-6 shadow-xs">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest text-white text-xs font-bold">
                    ✓
                  </span>
                  <h3 className="font-semibold text-charcoal">{d.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-charcoal/70">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Competitions & Achievements */}
      <section id="achievements" className="bg-forest px-6 py-24 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-white/70">Excellence & Competitions</p>
            <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-3xl font-semibold md:text-4xl">
              Recognized Engineering Impact
            </h2>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              {
                award: "1st Place",
                title: "National Autonomous Drone League",
                desc: "Achieved top score in autonomous precision landing and obstacle course navigation.",
              },
              {
                award: "Best Prototype",
                title: "AgriTech Innovation Summit",
                desc: "Awarded for the Smart HydroPod automated closed-loop nutrient dosing system.",
              },
              {
                award: "Top Research Finalist",
                title: "Robotics & AI Symposium",
                desc: "Published research paper on edge AI pest detection using Jetson vision pipelines.",
              },
            ].map((a) => (
              <div key={a.title} className="rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur-md">
                <Award className="h-10 w-10 text-amber-300 mb-4" />
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-200">
                  {a.award}
                </span>
                <h3 className="mt-4 text-xl font-bold">{a.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/80">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Internal Team Workspace Callout */}
      <section className="bg-cream px-6 py-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-stone bg-white p-10 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-forest/10 text-forest">
            <Users className="h-7 w-7" />
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-charcoal">
            Team ROXX Member Portal
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-charcoal/70">
            Are you a member of Team ROXX? Access our internal workspace to manage projects, log lab inventory, submit weekly reports, and update budget logs.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-forest px-8 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-forest/90"
            >
              Access Member Portal <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone bg-white px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest text-white text-xs font-bold">
              RX
            </span>
            <p className="text-sm font-semibold text-charcoal">
              Team ROXX — Autonomous Systems Engineering
            </p>
          </div>
          <p className="text-xs text-charcoal/60">
            © {new Date().getFullYear()} Team ROXX. All rights reserved.
          </p>
          <Link href="/login" className="text-sm font-medium text-forest hover:underline">
            Member Portal Login
          </Link>
        </div>
      </footer>
    </main>
  );
}
