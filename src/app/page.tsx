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

const teamLeads = [
  {
    name: "Hansika M",
    role: "Team Lead",
    department: "Avionics",
    bio: "Guiding ROXX with passion for autonomous systems and aerial innovation.",
    image: "/images/team-hansika.jpg",
  },
  {
    name: "Shashi Kumar C",
    role: "Team Captain",
    department: "Avionics",
    bio: "Leading ROXX with vision and precision in autonomous aerial systems.",
    image: "/images/founder.jpg",
  },
  {
    name: "Akshay M",
    role: "Vice Captain",
    department: "Electronics",
    bio: "Driving electronics innovation and cross-team technical strategy.",
    image: "/images/akshay.png",
  },
  {
    name: "Shreyas R",
    role: "Vice Captain",
    department: "Integration",
    bio: "Architecting systems that bring hardware, software, and mission goals together.",
    image: "/images/shreyas.png",
  },
];

const departments = [
  {
    id: "avionics",
    name: "Avionics",
    lead: "Avionics Lead",
    role: "Avionics Lead",
    image: "/images/team-hansika.jpg",
    icon: Plane,
    color: "from-blue-500 to-cyan-400",
    description: "Flight control systems, autopilot integration, and aerial navigation.",
  },
  {
    id: "electronics",
    name: "Electronics",
    lead: "Electronics Lead",
    role: "Electronics Lead",
    image: "/images/akshay.png",
    icon: Zap,
    color: "from-yellow-500 to-orange-400",
    description: "PCB design, power distribution, sensor interfacing, and embedded hardware.",
  },
  {
    id: "technical-integration",
    name: "Technical Integration",
    lead: "Integration Lead",
    role: "Integration Lead",
    image: "/images/shreyas.png",
    icon: Settings,
    color: "from-purple-500 to-indigo-400",
    description: "Architecting systems that bring hardware, software, and mission goals together.",
  },
  {
    id: "testing",
    name: "Testing",
    lead: "Testing Lead",
    role: "Testing Lead",
    image: "/images/team-4.jpg",
    icon: FlaskConical,
    color: "from-green-500 to-emerald-400",
    description: "Validation protocols, simulation, and field-test analysis.",
  },
  {
    id: "flight-operations",
    name: "Flight Operations",
    lead: "Operations Lead",
    role: "Operations Lead",
    image: "/images/team-1.jpg",
    icon: Wind,
    color: "from-sky-500 to-indigo-400",
    description: "Mission planning, flight safety, and operational logistics.",
  },
  {
    id: "social-media",
    name: "Social Media",
    lead: "Media Lead",
    role: "Media Lead",
    image: "/images/team-2.jpg",
    icon: Share2,
    color: "from-rose-500 to-red-400",
    description: "Content creation, community engagement, and brand storytelling.",
  },
  {
    id: "research",
    name: "Research",
    lead: "Research Lead",
    role: "Research Lead",
    image: "/images/team-3.jpg",
    icon: Search,
    color: "from-violet-500 to-fuchsia-400",
    description: "Emerging tech exploration, whitepapers, and innovation strategy.",
  },
];

const projects = [
  {
    title: "Autonomous Drones",
    description: "GPS-denied navigation, swarm coordination, and payload delivery systems.",
    image: "/images/aerial-vehicle.jpg",
    icon: Plane,
  },
  {
    title: "Four-Wheeler Bots",
    description: "Terrain-aware rovers for surveillance, logistics, and competition arenas.",
    image: "/images/car-bot.jpg",
    icon: Car,
  },
  {
    title: "Aerial Vehicles",
    description: "VTOL platforms and fixed-wing systems for long-range missions.",
    image: "/images/hero-drone-ocean.jpg",
    icon: Wind,
  },
  {
    title: "Hydroponic Automation",
    description: "Smart nutrient dosing, environmental monitoring, and IoT-controlled growth.",
    image: "/images/hydroponics.jpg",
    icon: Droplets,
  },
];

const achievements = [
  { title: "National Drone Champions", org: "AVIATHON 2024", icon: Trophy },
  { title: "Best Innovation Award", org: "TechFest IIT Bombay", icon: Award },
  { title: "Top 5 Global Finalist", org: "IARC Challenge", icon: Target },
  { title: "Research Grant Winner", org: "DST India", icon: Rocket },
  { title: "500+ Community Members", org: "Student Network", icon: Users },
  { title: "Published 3 Papers", org: "IEEE Xplore", icon: Cpu },
];

const teamCards = [
  {
    name: "Shashi Kumar C",
    role: "Founder & Captain",
    quote: "Building ROXX has been about turning impossible ideas into flying machines.",
    image: "/images/founder.jpg",
  },
  {
    name: "Akshay M",
    role: "Vice Captain & Electronics Lead",
    quote: "Every circuit we solder carries the spark of our collective ambition.",
    image: "/images/akshay.png",
  },
  {
    name: "Shreyas R",
    role: "Vice Captain & Integration Lead",
    quote: "Integration is where individual brilliance becomes a symphony of systems.",
    image: "/images/shreyas.png",
  },
  {
    name: "Hansika M",
    role: "Team Lead (Avionics)",
    quote: "Guiding ROXX with passion for autonomous systems and aerial innovation.",
    image: "/images/team-hansika.jpg",
  },
];

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handle);
    return () => window.removeEventListener("scroll", handle);
  }, []);

  const links = [
    { name: "Home", href: "#home" },
    { name: "Founder", href: "#founder" },
    { name: "Leads", href: "#leads" },
    { name: "Departments", href: "#departments" },
    { name: "Projects", href: "#projects" },
    { name: "Achievements", href: "#achievements" },
    { name: "Team", href: "#team" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed left-0 right-0 z-50 px-3 sm:px-4 transition-all duration-300 ${
        scrolled ? "top-3 sm:top-4" : "top-3 sm:top-5"
      }`}
    >
      <div className={`mx-auto flex max-w-4xl items-center justify-between rounded-full border border-white/10 px-3 py-2 shadow-2xl transition-all duration-300 md:px-5 md:py-3 ${
        scrolled ? "glass-dark shadow-orange-500/10" : "glass"
      }`}>
        <a href="#home" className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/20 sm:h-10 sm:w-10 md:h-12 md:w-12">
            <img
              src="/images/roxx-logo.png"
              alt="ROXX Logo"
              className="h-full w-full object-cover"
            />
          </div>
          <span className="text-base font-bold tracking-tight text-white sm:text-lg md:text-xl">
            Team <span className="text-orange-400">ROXX</span>
          </span>
        </a>

        <div className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-slate-300 transition-colors hover:text-orange-400"
            >
              {link.name}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition-all hover:shadow-lg hover:shadow-orange-500/30 sm:px-4 sm:py-2 sm:text-sm"
          >
            Portal <ExternalLink className="h-3.5 w-3.5" />
          </Link>

          <button
            className="rounded-full bg-white/10 p-2 text-white lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-auto mt-3 max-w-md rounded-3xl glass-dark border border-white/10 p-5 lg:hidden shadow-2xl"
          >
            <div className="flex flex-col gap-2">
              {links.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24"
    >
      {/* Ocean Background */}
      <motion.div style={{ y, scale }} className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/hero-drone-ocean.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ocean-900/70 via-ocean-900/50 to-ocean-900" />
        <div className="mesh-bg absolute inset-0" />
      </motion.div>

      {/* Animated Waves */}
      <div className="absolute bottom-0 left-0 right-0 z-0 opacity-40">
        <svg
          viewBox="0 0 1440 320"
          className="w-full animate-wave"
          preserveAspectRatio="none"
        >
          <path
            fill="#2563eb"
            fillOpacity="0.3"
            d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-4 sm:px-6 text-center pt-4 sm:pt-8"
      >
        {/* Drone Fly-in */}
        <motion.div
          initial={{ x: -300, y: 150, scale: 0.1, opacity: 0, rotate: -15 }}
          animate={{ x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 2.4, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
          className="mb-4 sm:mb-8"
        >
          <div className="relative">
            <div className="absolute -inset-6 rounded-full bg-orange-500/20 blur-xl animate-pulse-glow" />
            <Plane className="relative h-16 w-16 text-orange-400 drop-shadow-[0_0_30px_rgba(249,115,22,0.6)] sm:h-20 sm:w-20 md:h-28 md:w-28" />
          </div>
        </motion.div>

        {/* ROXX Animated Logo */}
        <div className="relative mb-6 sm:mb-8 flex items-center justify-center w-full overflow-hidden py-4">
          {/* Spinning Rings */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="absolute h-44 w-44 sm:h-64 sm:w-64 md:h-96 md:w-96 rounded-full border-2 border-dashed border-orange-400/40 animate-spin-slow" />
            <div className="absolute h-36 w-36 sm:h-52 sm:w-52 md:h-80 md:w-80 rounded-full border border-blue-400/30 animate-spin-reverse" />
            <div className="absolute h-52 w-52 sm:h-72 sm:w-72 md:h-[28rem] md:w-[28rem] rounded-full border border-white/10" />
          </motion.div>

          <div className="relative flex items-center text-[3.8rem] sm:text-[6.5rem] md:text-[10rem] lg:text-[14rem] font-black leading-none tracking-tighter text-white">
            {/* R moves left */}
            <motion.span
              initial={{ x: 0, opacity: 0 }}
              animate={{ x: -12, opacity: 1 }}
              transition={{ duration: 1, delay: 2, ease: "easeOut" }}
              className="text-gradient"
            >
              R
            </motion.span>

            {/* O grows from small */}
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, delay: 2.3, ease: [0.34, 1.56, 0.64, 1] }}
              className="bg-gradient-to-br from-blue-400 to-cyan-300 bg-clip-text text-transparent"
            >
              O
            </motion.span>

            {/* XX moves right */}
            <motion.span
              initial={{ x: 0, opacity: 0 }}
              animate={{ x: 12, opacity: 1 }}
              transition={{ duration: 1, delay: 2, ease: "easeOut" }}
              className="text-gradient"
            >
              XX
            </motion.span>
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 3.2 }}
          className="mb-6 max-w-2xl text-sm sm:text-lg md:text-2xl text-slate-300 px-2 leading-relaxed"
        >
          Student Innovation Group building autonomous systems for drones, rovers,
          aerial vehicles, and hydroponics.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 3.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto px-4"
        >
          <a
            href="#departments"
            className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3.5 text-sm sm:text-base font-semibold text-white shadow-lg shadow-orange-500/30 transition-all hover:scale-105 hover:shadow-orange-500/50"
          >
            Explore Team <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#projects"
            className="flex w-full sm:w-auto items-center justify-center rounded-full border border-white/20 glass px-6 py-3.5 text-sm sm:text-base font-semibold text-white transition-all hover:bg-white/10"
          >
            Our Projects
          </a>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 4 }}
          className="mt-12 sm:mt-16 flex flex-col items-center gap-2"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Scroll
          </span>
          <div className="flex h-8 w-5 items-start justify-center rounded-full border-2 border-white/20 p-1">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="h-1.5 w-1.5 rounded-full bg-orange-400"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

function Founder() {
  return (
    <section id="founder" className="relative overflow-hidden bg-ocean-900 py-20 sm:py-32">
      <div className="mesh-bg absolute inset-0" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-12 sm:mb-20 text-center"
        >
          <span className="mb-3 inline-block rounded-full bg-orange-500/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-orange-400">
            Visionary Leadership
          </span>
          <h2 className="text-3xl font-bold text-white sm:text-4xl md:text-6xl">
            Meet the Founder
          </h2>
        </motion.div>

        <div className="grid gap-10 lg:grid-cols-12 items-center">
          {/* Founder Picture */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex justify-center lg:col-span-5"
          >
            <div className="relative">
              {/* Spinning Ring behind picture */}
              <div className="absolute inset-[-1.25rem] sm:inset-[-1.5rem] rounded-full border border-dashed border-orange-500/40 animate-spin-slow" />

              <div className="relative h-56 w-56 overflow-hidden rounded-full border-4 border-white/10 sm:h-64 sm:w-64 md:h-80 md:w-80 shadow-2xl">
                <img
                  src="/images/founder.jpg"
                  alt="Founder"
                  className="h-full w-full object-cover object-top"
                />
              </div>
            </div>
          </motion.div>

          {/* Founder Details */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7"
          >
            <h3 className="mb-2 text-2xl font-bold text-white sm:text-3xl md:text-5xl">
              Shashi Kumar C
            </h3>
            <p className="mb-4 sm:mb-6 text-base font-semibold text-orange-400 sm:text-lg md:text-xl">
              Founder, Team ROXX
            </p>
            <p className="mb-6 text-sm sm:text-base md:text-lg leading-relaxed text-slate-300">
              A passionate innovator in autonomous systems and aerial robotics,
              driven to build technology that pushes the boundaries of what student
              teams can achieve.
            </p>

            <div className="mb-6 sm:mb-8 rounded-2xl bg-gradient-to-r from-blue-600/20 to-orange-500/20 p-4 sm:p-6 border border-white/10">
              <p className="mb-1 sm:mb-2 text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-400">
                Current Role
              </p>
              <p className="text-lg font-bold text-white sm:text-xl md:text-2xl">
                Research Intern at TiHAN, IIT Hyderabad
              </p>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3">
              {["Leadership", "Research", "Robotics", "Innovation"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-slate-300 border border-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function TeamLeads() {
  return (
    <section id="leads" className="relative bg-ocean-900 py-20 sm:py-32">
      <div className="mesh-bg absolute inset-0" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-12 sm:mb-20 text-center"
        >
          <span className="mb-3 inline-block rounded-full bg-orange-500/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-orange-400">
            Leadership
          </span>
          <h2 className="mb-4 sm:mb-6 text-3xl font-bold text-white sm:text-4xl md:text-6xl">
            Team Leads
          </h2>
          <p className="mx-auto max-w-2xl text-sm sm:text-lg text-slate-400 px-2">
            Meet the people steering ROXX toward innovation and excellence.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {teamLeads.map((lead, index) => (
            <motion.div
              key={lead.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group glass overflow-hidden rounded-3xl transition-all hover:border-orange-500/30"
            >
              <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600/20 via-orange-500/10 to-purple-600/20">
                {lead.image ? (
                  <img
                    src={lead.image}
                    alt={lead.name}
                    className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-2xl font-black text-white ring-2 ring-white/20 sm:h-24 sm:w-24 md:h-28 md:w-28 md:text-4xl">
                    {lead.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="p-5 sm:p-6">
                <p className="mb-1 text-xs sm:text-sm font-semibold text-orange-400">
                  {lead.department}
                </p>
                <h3 className="mb-1 text-lg sm:text-xl font-bold text-white">
                  {lead.name}
                </h3>
                <p className="mb-2 sm:mb-3 text-xs sm:text-sm text-slate-400">{lead.role}</p>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-300">
                  {lead.bio}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Departments() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const triggersRef = useRef<ScrollTrigger[]>([]);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsSmallScreen(window.innerWidth < 640);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    if (!sectionRef.current || !pinnedRef.current) return;

    triggersRef.current.forEach((t) => t.kill());
    triggersRef.current = [];

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: () => `+=${window.innerHeight * departments.length * 0.5}`,
      pin: pinnedRef.current,
      pinSpacing: true,
      scrub: 0.5,
      onUpdate: (self) => {
        const progress = self.progress;
        const index = Math.min(
          Math.floor(progress * departments.length),
          departments.length - 1
        );
        setActiveIndex(index);
        if (progressRef.current) {
          progressRef.current.style.width = `${progress * 100}%`;
        }
      },
    });

    triggersRef.current.push(st);

    return () => {
      triggersRef.current.forEach((t) => t.kill());
      triggersRef.current = [];
    };
  }, []);

  const activeDept = departments[activeIndex];
  const radius = isSmallScreen ? 100 : 130;

  return (
    <section
      id="departments"
      ref={sectionRef}
      className="relative bg-ocean-900"
      style={{ height: `${(departments.length * 0.5 + 1) * 100}vh` }}
    >
      <div ref={pinnedRef} className="relative z-10 flex min-h-screen items-center justify-center overflow-hidden py-16 sm:py-20">
        <div className="mesh-bg absolute inset-0" />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mb-8 text-center sm:mb-12 md:mb-16">
            <span className="mb-3 inline-block rounded-full bg-blue-500/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-blue-400">
              Our Team
            </span>
            <h2 className="mb-3 text-3xl font-bold text-white sm:text-4xl md:text-6xl">
              Departments
            </h2>
            <p className="mx-auto max-w-2xl text-sm sm:text-lg text-slate-400 px-2">
              Keep scrolling to explore every specialized unit that powers ROXX.
            </p>
          </div>

          <div className="flex flex-col items-center gap-8 sm:gap-12 lg:flex-row lg:justify-center">
            {/* Circular Department Orbit Display */}
            <div className="relative h-[250px] w-[250px] sm:h-[320px] sm:w-[320px] md:h-[420px] md:w-[420px] shrink-0">
              <div className="absolute inset-0 rounded-full border border-white/10 animate-spin-slow" />
              <div className="absolute inset-3 sm:inset-4 rounded-full border border-dashed border-blue-500/30 animate-spin-reverse" />
              <div className="absolute inset-[-1rem] sm:inset-[-1.5rem] rounded-full border border-white/5" />

              {/* Center Icon */}
              <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeDept.id}
                    initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.5, opacity: 0, rotate: 20 }}
                    transition={{ duration: 0.4 }}
                    className={`flex h-16 w-16 sm:h-22 sm:w-22 md:h-28 md:w-28 items-center justify-center rounded-2xl sm:rounded-3xl bg-gradient-to-br ${activeDept.color} shadow-2xl`}
                  >
                    <activeDept.icon className="h-6 w-6 sm:h-8 sm:w-8 md:h-12 md:w-12 text-white" />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Orbiting Department Node Buttons */}
              {departments.map((dept, index) => {
                const angle = (index / departments.length) * Math.PI * 2 - Math.PI / 2;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                const isActive = index === activeIndex;

                return (
                  <button
                    key={dept.id}
                    onClick={() => setActiveIndex(index)}
                    style={{
                      transform: `translate(${x}px, ${y}px)`,
                    }}
                    className={`absolute left-1/2 top-1/2 z-30 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center transition-all duration-300 ${
                      isActive ? "scale-110 sm:scale-125" : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 items-center justify-center rounded-xl sm:rounded-2xl transition-all ${
                        isActive
                          ? `bg-gradient-to-br ${dept.color} shadow-lg shadow-blue-500/30`
                          : "glass-dark text-slate-300"
                      }`}
                    >
                      <dept.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <span
                      className={`mt-1 text-[9px] sm:text-[10px] font-semibold md:text-xs whitespace-nowrap ${
                        isActive ? "text-white font-bold" : "text-slate-400"
                      }`}
                    >
                      {dept.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Department Active Card Details */}
            <div className="w-full max-w-lg">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeDept.id}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.4 }}
                  className="glass rounded-3xl p-5 sm:p-8 md:p-10 border border-white/10"
                >
                  <div className="mb-4 sm:mb-6 flex items-center gap-3 sm:gap-4">
                    <div className={`flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${activeDept.color} shadow-lg`}>
                      <activeDept.icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white sm:text-2xl md:text-3xl">
                        {activeDept.name}
                      </h3>
                      <p className="text-xs sm:text-sm font-semibold text-blue-400">
                        {activeDept.lead}
                      </p>
                    </div>
                  </div>

                  <p className="mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed text-slate-300 md:text-lg">
                    {activeDept.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {["Leadership", "Innovation", "Execution", "Excellence"].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-xl bg-white/5 px-2.5 py-1 text-[11px] sm:text-xs text-slate-300 border border-white/5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mx-auto mt-8 sm:mt-12 max-w-md">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{activeIndex + 1} / {departments.length}</span>
              <span>Keep scrolling</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                ref={progressRef}
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-100"
                style={{ width: `${((activeIndex + 1) / departments.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Projects() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeProject = projects[activeIndex];

  return (
    <section id="projects" className="relative bg-ocean-900 py-20 sm:py-32">
      <div className="mesh-bg absolute inset-0" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-12 sm:mb-20 text-center"
        >
          <span className="mb-3 inline-block rounded-full bg-orange-500/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-orange-400">
            Projects
          </span>
          <h2 className="mb-4 sm:mb-6 text-3xl font-bold text-white sm:text-4xl md:text-6xl">
            R&D Projects
          </h2>
        </motion.div>

        <div className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-3xl glass border border-white/10 p-5 sm:p-8 md:p-12">
            <div className="grid gap-6 sm:gap-8 lg:grid-cols-12 items-center">
              <div className="relative h-48 sm:h-64 overflow-hidden rounded-2xl lg:col-span-6 md:h-80">
                <img
                  src={activeProject.image}
                  alt={activeProject.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="lg:col-span-6">
                <div className="mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
                  <activeProject.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-white sm:text-2xl md:text-4xl">
                  {activeProject.title}
                </h3>
                <p className="mb-6 text-sm text-slate-200 sm:text-base md:text-lg">
                  {activeProject.description}
                </p>

                <div className="flex gap-2.5">
                  {projects.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveIndex(index)}
                      className={`h-2.5 rounded-full transition-all ${
                        index === activeIndex
                          ? "w-8 bg-orange-500"
                          : "w-2.5 bg-white/30 hover:bg-white/50"
                      }`}
                      aria-label={`Select project ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Achievements() {
  return (
    <section id="achievements" className="relative overflow-hidden bg-ocean-900 py-20 sm:py-32">
      <div className="mesh-bg absolute inset-0" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-12 sm:mb-20 text-center"
        >
          <span className="mb-3 inline-block rounded-full bg-yellow-500/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-yellow-400">
            Milestones
          </span>
          <h2 className="mb-4 sm:mb-6 text-3xl font-bold text-white sm:text-4xl md:text-6xl">
            Achievements
          </h2>
          <p className="mx-auto max-w-2xl text-sm sm:text-lg text-slate-400 px-2">
            Recognitions that reflect our relentless pursuit of engineering excellence.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.title}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="glass group rounded-2xl p-5 sm:p-8 transition-all hover:border-orange-500/30"
            >
              <div className="mb-4 sm:mb-6 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg shadow-orange-500/20 transition-transform group-hover:scale-110">
                <achievement.icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <h3 className="mb-1.5 text-lg sm:text-xl font-bold text-white">
                {achievement.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">{achievement.org}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamCards() {
  const [activeCard, setActiveCard] = useState(0);
  const card = teamCards[activeCard];

  return (
    <section id="team" className="relative overflow-hidden bg-ocean-900 py-20 sm:py-32">
      <div className="mesh-bg absolute inset-0" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-12 sm:mb-20 text-center"
        >
          <span className="mb-3 inline-block rounded-full bg-purple-500/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-purple-400">
            Team Voices
          </span>
          <h2 className="mb-4 sm:mb-6 text-3xl font-bold text-white sm:text-4xl md:text-6xl">
            Words From ROXX
          </h2>
        </motion.div>

        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-2xl">
            <div className="relative mx-auto aspect-[1.1/1] sm:aspect-[16/10] w-full overflow-hidden rounded-t-3xl bg-gradient-to-b from-slate-100 to-slate-200 shadow-2xl">
              <motion.div
                initial={{ rotateX: 0 }}
                whileInView={{ rotateX: 180 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 }}
                style={{ transformOrigin: "top" }}
                className="absolute inset-x-0 top-0 z-20 h-1/2 bg-gradient-to-b from-slate-200 to-slate-300"
              >
                <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-b from-slate-100 to-slate-300" 
                     style={{ clipPath: "polygon(0 0, 50% 100%, 100% 0)" }} />
              </motion.div>

              <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-slate-300 to-slate-200" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCard}
                  initial={{ y: 80, opacity: 0 }}
                  whileInView={{ y: -50, opacity: 1 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.8, delay: 1, type: "spring" }}
                  className="absolute left-1/2 top-1/2 z-30 w-[92%] sm:w-[85%] -translate-x-1/2 rounded-2xl bg-white p-4 sm:p-6 md:p-8 shadow-xl"
                >
                  <div className="flex flex-col items-center text-center">
                    <img
                      src={card.image}
                      alt={card.name}
                      className="mb-3 sm:mb-4 h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover object-top md:h-24 md:w-24"
                    />
                    <h3 className="text-lg font-bold text-slate-900 sm:text-xl md:text-2xl">
                      {card.name}
                    </h3>
                    <p className="mb-2 sm:mb-4 text-xs font-semibold text-orange-500 sm:text-sm md:text-base">
                      {card.role}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 italic">&ldquo;{card.quote}&rdquo;</p>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="absolute bottom-0 left-0 right-0 z-10 flex h-full">
                <div className="h-full w-1/2 bg-gradient-to-tr from-slate-300 to-slate-200" style={{ clipPath: "polygon(0 100%, 0 40%, 100% 100%)" }} />
                <div className="h-full w-1/2 bg-gradient-to-tl from-slate-300 to-slate-200" style={{ clipPath: "polygon(100% 100%, 100% 40%, 0 100%)" }} />
              </div>
            </div>

            <div className="absolute -right-2 -top-2 sm:-right-4 sm:-top-4 rounded-full bg-orange-500 p-2 sm:p-3 shadow-lg">
              <Mail className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>

          <div className="mt-16 sm:mt-24 flex items-center gap-3">
            {teamCards.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveCard(index)}
                className={`h-3 rounded-full transition-all ${
                  index === activeCard
                    ? "w-8 bg-orange-500"
                    : "w-3 bg-white/20 hover:bg-white/40"
                }`}
                aria-label={`Select card ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ocean-900 pb-8 pt-16 sm:pt-24">
      <div className="mesh-bg absolute inset-0" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 sm:mb-16 grid gap-8 sm:gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 sm:mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center overflow-hidden rounded-2xl bg-white/10 shadow-lg shadow-orange-500/20 ring-1 ring-white/20 md:h-20 md:w-20">
                <img
                  src="/images/roxx-logo.png"
                  alt="ROXX Logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-lg sm:text-xl font-bold text-white">
                Team <span className="text-orange-400">ROXX</span>
              </span>
            </div>
            <p className="mb-6 text-xs sm:text-sm text-slate-400 leading-relaxed">
              Innovating at the edge of robotics, aviation, and sustainable automation.
            </p>
            <div className="flex gap-3 sm:gap-4">
              {[
                { name: "Instagram", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
                { name: "Twitter", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
                { name: "LinkedIn", path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
                { name: "GitHub", path: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" },
              ].map((social, index) => (
                <a
                  key={index}
                  href="#"
                  aria-label={social.name}
                  className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/5 text-slate-400 transition-all hover:bg-orange-500 hover:text-white"
                >
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 sm:mb-6 text-base sm:text-lg font-bold text-white">Quick Links</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              {["Home", "Founder", "Leads", "Departments", "Projects", "Achievements", "Team"].map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase()}`}
                    className="transition-colors hover:text-orange-400"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 sm:mb-6 text-base sm:text-lg font-bold text-white">Contact</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>teamroxx@university.edu</li>
              <li>+91 98765 43210</li>
              <li>Innovation Lab, Block C</li>
              <li>University Campus, India</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 sm:mb-6 text-base sm:text-lg font-bold text-white">Team Portal</h4>
            <p className="mb-4 text-xs sm:text-sm text-slate-400 leading-relaxed">
              Members can access resources, schedules, and project dashboards.
            </p>
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-orange-500/30"
            >
              Enter Portal <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:pt-8 md:flex-row text-center md:text-left">
          <p className="text-xs sm:text-sm text-slate-500">
            © {new Date().getFullYear()} Team ROXX. All rights reserved.
          </p>
          <p className="text-xs sm:text-sm text-slate-500">
            Designed with passion by Team ROXX
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
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
