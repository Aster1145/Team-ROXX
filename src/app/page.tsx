"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ChevronRight,
  Cpu,
  Zap,
  Settings,
  FlaskConical,
  Plane,
  Share2,
  Search,
  Mail,
  ExternalLink,
  Award,
  Trophy,
  Target,
  Rocket,
  Users,
  Car,
  Droplets,
  Wind,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import "./landing.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const departments = [
  {
    id: "avionics",
    name: "Avionics",
    lead: "Arjun Mehta",
    role: "Avionics Lead",
    image: "/images/team-1.jpg",
    icon: Plane,
    color: "from-blue-500 to-cyan-400",
    description: "Flight control systems, autopilot integration, and aerial navigation.",
  },
  {
    id: "electronics",
    name: "Electronics",
    lead: "Priya Sharma",
    role: "Electronics Lead",
    image: "/images/team-2.jpg",
    icon: Zap,
    color: "from-yellow-500 to-orange-400",
    description: "PCB design, power distribution, sensor interfacing, and embedded hardware.",
  },
  {
    id: "software",
    name: "Software & AI",
    lead: "Rahul Verma",
    role: "Software Lead",
    image: "/images/team-3.jpg",
    icon: Cpu,
    color: "from-purple-500 to-indigo-400",
    description: "Computer vision, ROS 2 algorithms, path planning, and autonomous decision-making.",
  },
  {
    id: "mechanics",
    name: "Mechanics",
    lead: "Vikram Singh",
    role: "Mechanics Lead",
    image: "/images/team-4.jpg",
    icon: Settings,
    color: "from-red-500 to-rose-400",
    description: "Airframe design, structural analysis, CAD modeling, and CFD simulations.",
  },
  {
    id: "agritech",
    name: "Research & AgriTech",
    lead: "Hansika Rao",
    role: "AgriTech Lead",
    image: "/images/team-hansika.jpg",
    icon: Droplets,
    color: "from-emerald-500 to-teal-400",
    description: "Hydroponics automation, crop monitoring, and sustainable agricultural robotics.",
  },
  {
    id: "operations",
    name: "Field Operations",
    lead: "Ananya Patel",
    role: "Ops Lead",
    image: "/images/team-1.jpg",
    icon: Wind,
    color: "from-orange-500 to-amber-400",
    description: "Field testing, mission planning, safety protocols, and competition logistics.",
  },
];

const projects = [
  {
    id: 1,
    title: "AeroScout VTOL",
    category: "Aerial",
    image: "/images/hero-drone-ocean.jpg",
    description: "Autonomous hybrid VTOL drone for long-range surveillance and mapping.",
    specs: ["120 min Endurance", "15 km Range", "AI Object Tracking"],
  },
  {
    id: 2,
    title: "TerraRover Alpha",
    category: "Ground",
    image: "/images/car-bot.jpg",
    description: "All-terrain autonomous ground vehicle for hazardous environment exploration.",
    specs: ["LiDAR Mapping", "4WD Electric Drive", "ROS 2 Navigation"],
  },
  {
    id: 3,
    title: "AquaGrow Pod",
    category: "AgriTech",
    image: "/images/hydroponics.jpg",
    description: "Automated vertical hydroponics system with AI nutrient management.",
    specs: ["90% Water Savings", "IoT Telemetry", "Auto Dosage"],
  },
  {
    id: 4,
    title: "SkySentinel Hexacopter",
    category: "Aerial",
    image: "/images/aerial-vehicle.jpg",
    description: "Heavy-lift payload drone designed for industrial inspection and rescue missions.",
    specs: ["10 kg Payload", "Failsafe Flight Controller", "Thermal Payload"],
  },
];

const achievements = [
  {
    year: "2024",
    title: "1st Place - National Drone Challenge",
    description: "Secured top position in autonomous obstacle course and precision payload drop.",
    icon: Trophy,
  },
  {
    year: "2023",
    title: "Best Innovation Award - AgriTech Summit",
    description: "Recognized for HydroBot automated crop monitoring and dosing system.",
    icon: Award,
  },
  {
    year: "2023",
    title: "Top 5 Finalist - International Robotics Expo",
    description: "Competed against 50+ global university teams in autonomous rover navigation.",
    icon: Target,
  },
  {
    year: "2022",
    title: "Team ROXX Founded",
    description: "Established with a vision to build cutting-edge autonomous aerial & ground robotics.",
    icon: Rocket,
  },
];

const teamCards = [
  {
    name: "Akshay M",
    role: "Team Captain & Systems Architect",
    image: "/images/team-1.jpg",
    quote: "Building autonomous systems isn't just engineering — it's creating intelligent machines that shape the future.",
  },
  {
    name: "Hansika Rao",
    role: "Vice Captain & AgriTech Lead",
    image: "/images/team-hansika.jpg",
    quote: "Merging robotics with agriculture creates sustainable solutions for real-world global challenges.",
  },
  {
    name: "Arjun Mehta",
    role: "Avionics & Flight Systems Lead",
    image: "/images/team-2.jpg",
    quote: "Precision avionics and reliable telemetry are the heartbeat of every successful mission.",
  },
];

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-ocean-900/90 py-3 backdrop-blur-md border-b border-white/10 shadow-xl"
          : "bg-transparent py-6"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white/10 shadow-lg shadow-orange-500/20 ring-1 ring-white/20">
            <img
              src="/images/roxx-logo.png"
              alt="ROXX Logo"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white">
              Team <span className="text-orange-400">ROXX</span>
            </span>
            <span className="text-[10px] tracking-widest text-slate-400 uppercase">
              Autonomous Systems
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden items-center gap-8 md:flex">
          {["About", "Founder", "Leads", "Departments", "Projects", "Achievements"].map(
            (item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-slate-300 transition-colors hover:text-orange-400"
              >
                {item}
              </a>
            )
          )}
        </div>

        {/* Action Button */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/dashboard"
            className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-6 py-2.5 text-sm font-semibold text-white transition-all shadow-lg shadow-orange-500/30 hover:scale-105"
          >
            Member Portal
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-white md:hidden"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-white/10 bg-ocean-900/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-4 px-6 py-6">
              {["About", "Founder", "Leads", "Departments", "Projects", "Achievements"].map(
                (item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-slate-300 transition-colors hover:text-orange-400"
                  >
                    {item}
                  </a>
                )
              )}
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 flex justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-500 py-3 font-semibold text-white shadow-lg"
              >
                Member Portal
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-ocean-900 pb-20 pt-32 lg:pt-40"
    >
      {/* Background Canvas & Animated Rings */}
      <div className="mesh-bg absolute inset-0" />

      <div className="pointer-events-none absolute right-0 top-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 left-0 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-7"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">
              Autonomous Robotics & AI Engineering
            </span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Pioneering <span className="text-gradient">Autonomous</span> Intelligent Systems.
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-slate-300 lg:text-xl">
            Team ROXX designs, builds, and deploys next-generation unmanned aerial vehicles, autonomous ground rovers, and smart agricultural robotics.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/dashboard"
              className="group flex items-center gap-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-8 py-4 font-bold text-white shadow-xl shadow-orange-500/30 transition-all hover:scale-105"
            >
              Access Member Portal
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#projects"
              className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-md transition-all hover:bg-white/10"
            >
              Explore Innovations
            </a>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
            <div>
              <p className="text-3xl font-extrabold text-white sm:text-4xl">6+</p>
              <p className="text-xs text-slate-400 sm:text-sm">R&D Projects Built</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white sm:text-4xl">150+</p>
              <p className="text-xs text-slate-400 sm:text-sm">Autonomous Flight Hrs</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white sm:text-4xl">99.4%</p>
              <p className="text-xs text-slate-400 sm:text-sm">Navigation Accuracy</p>
            </div>
          </div>
        </motion.div>

        {/* Hero Visual Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative lg:col-span-5"
        >
          <div className="relative mx-auto max-w-md overflow-hidden rounded-3xl border border-white/15 bg-ocean-800/80 p-4 shadow-2xl backdrop-blur-xl">
            <div className="relative h-96 overflow-hidden rounded-2xl">
              <img
                src="/images/hero-drone-ocean.jpg"
                alt="AeroScout Drone"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ocean-900 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white uppercase">
                  Flagship UAV
                </span>
                <h3 className="mt-2 text-2xl font-bold text-white">AeroScout Autonomous VTOL</h3>
                <p className="mt-1 text-xs text-slate-300">
                  Hybrid aerial platform with edge AI computer vision & thermal sensors.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Founder() {
  return (
    <section id="founder" className="relative bg-ocean-900 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-400">Team Leadership</span>
          <h2 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">Meet Our Founder</h2>
        </div>

        <div className="mx-auto grid max-w-5xl items-center gap-12 overflow-hidden rounded-3xl border border-white/10 bg-ocean-800/50 p-8 backdrop-blur-xl lg:grid-cols-12">
          <div className="relative lg:col-span-5">
            <div className="relative h-80 overflow-hidden rounded-2xl shadow-xl sm:h-96">
              <img
                src="/images/team-1.jpg"
                alt="Akshay M"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ocean-900/90 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <h3 className="text-2xl font-bold text-white">Akshay M</h3>
                <p className="text-sm font-semibold text-orange-400">Founder & Captain</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <h3 className="text-2xl font-bold text-white">Architecting Autonomous Innovations</h3>
            <p className="mt-4 leading-relaxed text-slate-300">
              Under Akshay&apos;s leadership, Team ROXX grew from a student research initiative into a competitive robotics team designing autonomous drones, ground vehicles, and automated agricultural systems.
            </p>
            <div className="mt-6 space-y-3">
              {[
                "Pioneered ROS 2 navigation pipelines for GPS-denied field operations",
                "Led team to 1st place in National Autonomous Drone League",
                "Designed custom power avionics & flight controller firmware",
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-orange-400 font-bold text-xs">
                    ✓
                  </div>
                  <span className="text-sm text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TeamLeads() {
  return (
    <section id="leads" className="bg-ocean-900/80 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-400">Domain Leadership</span>
          <h2 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">Team Leads</h2>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-ocean-800/40 p-6 backdrop-blur-md transition-all hover:border-orange-500/50 hover:shadow-xl"
            >
              <div className="mb-4 flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-xl">
                  <img src={dept.image} alt={dept.lead} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                </div>
                <div>
                  <h3 className="font-bold text-white">{dept.lead}</h3>
                  <p className="text-xs font-medium text-orange-400">{dept.role}</p>
                  <p className="text-xs text-slate-400">{dept.name} Domain</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-slate-300">{dept.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Departments() {
  return (
    <section id="departments" className="bg-ocean-900 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-400">Engineering Specializations</span>
          <h2 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">Our 6 Core Departments</h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Avionics & Flight Systems", icon: Plane, desc: "Autopilot configuration, aerial telemetry, sensor fusion, and high-altitude flight stability." },
            { title: "Electronics & Embedded PCB", icon: Zap, desc: "Custom PCB design, power distribution boards, ESC controllers, and embedded microcontroller firmware." },
            { title: "Software & Edge AI", icon: Cpu, desc: "ROS 2 trajectory planning, Jetson Orin deep learning vision models, and cloud data dashboards." },
            { title: "Airframe & CAD Mechanics", icon: Settings, desc: "Carbon-fiber manufacturing, structural FEA analysis, aerodynamic wing modeling, and CFD testing." },
            { title: "AgriTech & Hydroponics", icon: Droplets, desc: "Automated nutrient dosing pumps, pH/EC closed-loop regulation, and indoor crop pods." },
            { title: "Field Operations & Testing", icon: Wind, desc: "Flight safety protocols, mission field trials, battery log tracking, and competition logistics." },
          ].map((d) => (
            <div key={d.title} className="rounded-2xl border border-white/10 bg-ocean-800/40 p-6 backdrop-blur-md">
              <d.icon className="mb-3 h-8 w-8 text-orange-400" />
              <h3 className="font-bold text-white">{d.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">{d.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Projects() {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? projects : projects.filter((p) => p.category === filter);

  return (
    <section id="projects" className="bg-ocean-900/90 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-400">Research & Development</span>
          <h2 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">Innovations & Projects</h2>
        </div>

        <div className="mb-10 flex justify-center gap-3">
          {["All", "Aerial", "Ground", "AgriTech"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`rounded-full px-5 py-2 text-xs font-semibold transition-all ${
                filter === cat
                  ? "bg-orange-500 text-white shadow-lg"
                  : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((p) => (
            <div key={p.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-ocean-800/50 shadow-xl backdrop-blur-md">
              <div className="relative h-48 overflow-hidden">
                <img src={p.image} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase">
                  {p.category}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-white">{p.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">{p.description}</p>
                <div className="mt-4 flex flex-wrap gap-1">
                  {p.specs.map((spec, i) => (
                    <span key={i} className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-medium text-orange-300 border border-white/10">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Achievements() {
  return (
    <section id="achievements" className="bg-ocean-900 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-400">Excellence & Recognition</span>
          <h2 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">Achievements & Milestones</h2>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {achievements.map((item, idx) => (
            <div key={idx} className="relative rounded-2xl border border-white/10 bg-ocean-800/40 p-6 backdrop-blur-md">
              <item.icon className="mb-3 h-8 w-8 text-orange-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400">{item.year}</span>
              <h3 className="mt-1 font-bold text-white">{item.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamCards() {
  const [activeCard, setActiveCard] = useState(0);

  return (
    <section className="bg-ocean-900/80 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-400">Team Vision</span>
          <h2 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">Messages from Core Members</h2>
        </div>

        <div className="mx-auto max-w-xl">
          <div className="relative rounded-3xl border border-white/10 bg-ocean-800/60 p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-6 flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-orange-500">
                <img src={teamCards[activeCard].image} alt={teamCards[activeCard].name} className="h-full w-full object-cover" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{teamCards[activeCard].name}</h3>
                <p className="text-xs font-semibold text-orange-400">{teamCards[activeCard].role}</p>
              </div>
            </div>

            <p className="text-sm italic leading-relaxed text-slate-200">
              &ldquo;{teamCards[activeCard].quote}&rdquo;
            </p>

            <div className="mt-8 flex justify-center gap-2">
              {teamCards.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveCard(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === activeCard ? "w-8 bg-orange-500" : "w-2 bg-white/20"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ocean-900 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white/10 shadow-md">
              <img src="/images/roxx-logo.png" alt="ROXX Logo" className="h-full w-full object-cover" />
            </div>
            <span className="font-bold text-white">Team ROXX Autonomous Systems</span>
          </div>

          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Team ROXX. All rights reserved.
          </p>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs font-semibold text-orange-400 hover:underline"
          >
            Access Member Workspace →
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <main className="bg-ocean-900 font-sans antialiased text-white selection:bg-orange-500 selection:text-white">
      <Nav />
      <Hero />
      <Founder />
      <TeamLeads />
      <Departments />
      <Projects />
      <Achievements />
      <TeamCards />
      <Footer />
    </main>
  );
}
