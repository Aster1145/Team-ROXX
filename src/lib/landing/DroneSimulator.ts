import { AudioEngine } from "./AudioEngine";

export class DroneSimulator {
  modal: HTMLElement | null = null;
  canvas: HTMLCanvasElement | null = null;
  closeBtn: HTMLElement | null = null;
  launchBtns: NodeListOf<Element> | null = null;
  ctx: CanvasRenderingContext2D | null = null;
  audio: AudioEngine;
  isRunning: boolean = false;
  keys: { [key: string]: boolean } = {};
  animId: number | null = null;
  width: number = 0;
  height: number = 0;

  drone = {
    x: 150,
    y: 300,
    vx: 0,
    vy: 0,
    width: 54,
    height: 24,
    angle: 0,
    battery: 100,
    score: 0,
    hoverMode: false,
    propAngle: 0,
    landed: false,
  };

  clouds: Array<{ x: number; y: number; size: number }> = [];
  obstacles: Array<{ x: number; y: number; width: number; height: number; type: string }> = [];
  coins: Array<{ x: number; y: number; r: number; collected: boolean }> = [];
  landingPad = { x: 2200, y: 0, width: 140, height: 20 };
  worldOffset: number = 0;

  handleKeyDown: (e: KeyboardEvent) => void;
  handleKeyUp: (e: KeyboardEvent) => void;

  constructor() {
    this.audio = new AudioEngine();
    this.handleKeyDown = (e: KeyboardEvent) => this.onKeyDown(e);
    this.handleKeyUp = (e: KeyboardEvent) => this.onKeyUp(e);
  }

  mount() {
    this.modal = document.getElementById("simulator-modal");
    this.canvas = document.getElementById("game-canvas") as HTMLCanvasElement | null;
    this.closeBtn = document.getElementById("modal-close-btn");
    this.launchBtns = document.querySelectorAll(".btn-launch-simulator");

    if (!this.canvas || !this.modal) return;
    this.ctx = this.canvas.getContext("2d");

    this.initEvents();
  }

  unmount() {
    this.closeModal();
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
  }

  initEvents() {
    if (this.launchBtns) {
      this.launchBtns.forEach((btn) => {
        btn.addEventListener("click", () => this.openModal());
      });
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", () => this.closeModal());
    }

    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  }

  onKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape" && this.isRunning) {
      this.closeModal();
      return;
    }

    this.keys[e.key.toLowerCase()] = true;
    this.keys[e.code] = true;

    if (e.key.toLowerCase() === "h" && this.isRunning) {
      this.drone.hoverMode = !this.drone.hoverMode;
      const elHover = document.getElementById("hud-hover");
      if (elHover) {
        if (this.drone.hoverMode) {
          elHover.textContent = "H: ON (AUTO)";
          elHover.className = "hover-indicator active";
        } else {
          elHover.textContent = "H: OFF";
          elHover.className = "hover-indicator inactive";
        }
      }
    }
  }

  onKeyUp(e: KeyboardEvent) {
    this.keys[e.key.toLowerCase()] = false;
    this.keys[e.code] = false;
  }

  openModal() {
    if (!this.modal || !this.canvas) return;
    this.modal.classList.add("active");
    document.body.style.overflow = "hidden";

    this.resizeCanvas();
    this.resetGame();
    this.isRunning = true;
    this.audio.startDroneSound();

    this.gameLoop();
  }

  closeModal() {
    if (!this.modal) return;
    this.modal.classList.remove("active");
    document.body.style.overflow = "";
    this.isRunning = false;
    if (this.animId) cancelAnimationFrame(this.animId);
    this.audio.stopDroneSound();
  }

  resizeCanvas() {
    if (!this.canvas) return;
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  resetGame() {
    this.drone = {
      x: 150,
      y: this.height - 180,
      vx: 0,
      vy: 0,
      width: 54,
      height: 24,
      angle: 0,
      battery: 100,
      score: 0,
      hoverMode: false,
      propAngle: 0,
      landed: false,
    };

    this.worldOffset = 0;

    // Generate Parallax Clouds
    this.clouds = [];
    for (let i = 0; i < 15; i++) {
      this.clouds.push({
        x: Math.random() * 3000,
        y: 40 + Math.random() * (this.height * 0.4),
        size: 30 + Math.random() * 40,
      });
    }

    // Generate Obstacles & Laser Gates
    this.obstacles = [];
    for (let i = 0; i < 8; i++) {
      const obsX = 600 + i * 320;
      const obsH = 120 + Math.random() * 160;
      const isTop = i % 2 === 0;

      this.obstacles.push({
        x: obsX,
        y: isTop ? 0 : this.height - 70 - obsH,
        width: 45,
        height: obsH,
        type: isTop ? "tower_down" : "tower_up",
      });
    }

    // Generate Energy Battery Coins
    this.coins = [];
    for (let i = 0; i < 16; i++) {
      this.coins.push({
        x: 400 + i * 160 + Math.random() * 40,
        y: 100 + Math.random() * (this.height - 240),
        r: 12,
        collected: false,
      });
    }

    // Target Landing Pad Position
    this.landingPad = {
      x: 3200,
      y: this.height - 70,
      width: 150,
      height: 20,
    };

    const elHover = document.getElementById("hud-hover");
    if (elHover) {
      elHover.textContent = "H: OFF";
      elHover.className = "hover-indicator inactive";
    }
  }

  gameLoop() {
    if (!this.isRunning) return;
    this.update();
    this.render();
    this.animId = requestAnimationFrame(() => this.gameLoop());
  }

  update() {
    if (this.drone.landed) return;

    // Physics constants
    const gravity = 0.18;
    const thrustPower = 0.42;
    const sidePower = 0.35;
    const damping = 0.96;

    let isAccelerating = false;

    // Apply Controls
    if (this.keys["w"] || this.keys["arrowup"] || this.keys["keyw"]) {
      this.drone.vy -= thrustPower;
      this.drone.battery = Math.max(0, this.drone.battery - 0.04);
      isAccelerating = true;
    }
    if (this.keys["s"] || this.keys["arrowdown"] || this.keys["keys"]) {
      this.drone.vy += sidePower * 0.6;
    }
    if (this.keys["a"] || this.keys["arrowleft"] || this.keys["keya"]) {
      this.drone.vx -= sidePower;
    }
    if (this.keys["d"] || this.keys["arrowright"] || this.keys["keyd"]) {
      this.drone.vx += sidePower;
    }

    // Hover Mode Flight Stabilization
    if (this.drone.hoverMode) {
      this.drone.vy *= 0.85; // Stabilize vertical drift
      this.drone.vy -= 0.16; // Counter gravity
    } else {
      this.drone.vy += gravity; // Gravity pull
    }

    // Velocity & Damping
    this.drone.vx *= damping;
    this.drone.vy *= damping;

    this.drone.x += this.drone.vx;
    this.drone.y += this.drone.vy;

    // Camera follow offset
    if (this.drone.x > this.width * 0.45) {
      this.worldOffset += this.drone.x - this.width * 0.45;
      this.drone.x = this.width * 0.45;
    }

    this.drone.propAngle += 0.4 + Math.abs(this.drone.vx) * 0.05;

    const groundLevel = this.height - 70;
    const speed = Math.sqrt(this.drone.vx * this.drone.vx + this.drone.vy * this.drone.vy);
    const isGround = this.drone.y + this.drone.height / 2 >= groundLevel - 2;

    // Update audio engine synthesizer pitch & volume
    this.audio.updateDroneSound(speed, this.drone.hoverMode, isGround, isAccelerating);

    // Boundary constraints
    if (this.drone.y < 30) {
      this.drone.y = 30;
      this.drone.vy = 0;
    }

    // Ground collision & landing pad check
    if (this.drone.y + this.drone.height / 2 >= groundLevel) {
      const padScreenX = this.landingPad.x - this.worldOffset;
      if (
        this.drone.x >= padScreenX &&
        this.drone.x <= padScreenX + this.landingPad.width &&
        Math.abs(this.drone.vy) < 2.5 &&
        Math.abs(this.drone.vx) < 2.5
      ) {
        this.drone.y = groundLevel - this.drone.height / 2;
        this.drone.landed = true;
        this.drone.vx = 0;
        this.drone.vy = 0;
        this.drone.score += 500;
        this.audio.playLandingSound();
      } else {
        // Crash / Bounce
        this.drone.y = groundLevel - this.drone.height / 2;
        this.drone.vy = -this.drone.vy * 0.4;
        this.audio.playCollisionSound();
      }
    }

    // Coin / Battery pickup check
    this.coins.forEach((c) => {
      if (!c.collected) {
        const screenX = c.x - this.worldOffset;
        const dx = this.drone.x - screenX;
        const dy = this.drone.y - c.y;
        if (Math.sqrt(dx * dx + dy * dy) < c.r + 20) {
          c.collected = true;
          this.drone.score += 100;
          this.drone.battery = Math.min(100, this.drone.battery + 25);
          this.audio.playCoinSound();
        }
      }
    });

    // Obstacle collision check
    this.obstacles.forEach((obs) => {
      const screenX = obs.x - this.worldOffset;
      if (
        this.drone.x + 20 > screenX &&
        this.drone.x - 20 < screenX + obs.width &&
        this.drone.y + 10 > obs.y &&
        this.drone.y - 10 < obs.y + obs.height
      ) {
        this.drone.vx = -this.drone.vx * 0.5 - 2;
        this.audio.playCollisionSound();
      }
    });

    this.updateHud();
  }

  updateHud() {
    const elScore = document.getElementById("hud-score");
    const elBattery = document.getElementById("hud-battery");
    const elAlt = document.getElementById("hud-alt");

    if (elScore) elScore.textContent = Math.floor(this.drone.score).toString();
    if (elBattery) elBattery.textContent = Math.max(0, Math.floor(this.drone.battery)) + "%";
    if (elAlt) elAlt.textContent = Math.max(0, Math.floor((this.height - 70 - this.drone.y) / 5)) + "m";
  }

  render() {
    if (!this.ctx) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    // Sky Background Gradient
    const sky = this.ctx.createLinearGradient(0, 0, 0, this.height);
    sky.addColorStop(0, "#09150F");
    sky.addColorStop(0.6, "#132A1F");
    sky.addColorStop(1, "#1B3B2B");
    this.ctx.fillStyle = sky;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Render Clouds (Parallax)
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
    this.clouds.forEach((c) => {
      const screenX = ((c.x - this.worldOffset * 0.3) % (this.width + 400)) - 200;
      this.ctx!.beginPath();
      this.ctx!.arc(screenX, c.y, c.size, 0, Math.PI * 2);
      this.ctx!.arc(screenX + c.size * 0.5, c.y - c.size * 0.2, c.size * 0.7, 0, Math.PI * 2);
      this.ctx!.fill();
    });

    // Render Ground Terrain Grid
    const groundY = this.height - 70;
    this.ctx.fillStyle = "#0B1710";
    this.ctx.fillRect(0, groundY, this.width, 70);

    this.ctx.strokeStyle = "#2A543F";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, groundY);
    this.ctx.lineTo(this.width, groundY);
    this.ctx.stroke();

    // Render Obstacles (Futuristic High-Voltage Towers & Laser Gates)
    this.obstacles.forEach((obs) => {
      const screenX = obs.x - this.worldOffset;
      if (screenX > -100 && screenX < this.width + 100) {
        this.ctx!.fillStyle = "#1A3326";
        this.ctx!.strokeStyle = "#6CE8A7";
        this.ctx!.lineWidth = 2;
        this.ctx!.fillRect(screenX, obs.y, obs.width, obs.height);
        this.ctx!.strokeRect(screenX, obs.y, obs.width, obs.height);

        // Glowing Laser hazard lines
        this.ctx!.strokeStyle = "rgba(239, 68, 68, 0.7)";
        this.ctx!.beginPath();
        this.ctx!.moveTo(screenX, obs.y + (obs.type === "tower_up" ? 0 : obs.height));
        this.ctx!.lineTo(screenX + obs.width, obs.y + (obs.type === "tower_up" ? 0 : obs.height));
        this.ctx!.stroke();
      }
    });

    // Render Battery Power-Ups / Coins
    this.coins.forEach((c) => {
      if (!c.collected) {
        const screenX = c.x - this.worldOffset;
        if (screenX > -50 && screenX < this.width + 50) {
          this.ctx!.save();
          this.ctx!.translate(screenX, c.y);

          this.ctx!.fillStyle = "rgba(253, 224, 71, 0.25)";
          this.ctx!.beginPath();
          this.ctx!.arc(0, 0, c.r + 6, 0, Math.PI * 2);
          this.ctx!.fill();

          this.ctx!.fillStyle = "#FDE047";
          this.ctx!.beginPath();
          this.ctx!.arc(0, 0, c.r, 0, Math.PI * 2);
          this.ctx!.fill();

          this.ctx!.fillStyle = "#0D1612";
          this.ctx!.font = "bold 12px sans-serif";
          this.ctx!.textAlign = "center";
          this.ctx!.textBaseline = "middle";
          this.ctx!.fillText("⚡", 0, 0);

          this.ctx!.restore();
        }
      }
    });

    // Render Precision Landing Pad
    const padX = this.landingPad.x - this.worldOffset;
    if (padX > -200 && padX < this.width + 200) {
      this.ctx.fillStyle = "#10261C";
      this.ctx.fillRect(padX, groundY - 12, this.landingPad.width, 12);

      this.ctx.strokeStyle = "#6CE8A7";
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(padX, groundY - 12, this.landingPad.width, 12);

      this.ctx.fillStyle = "#6CE8A7";
      this.ctx.font = "bold 14px monospace";
      this.ctx.textAlign = "center";
      this.ctx.fillText("LANDING PAD [H]", padX + this.landingPad.width / 2, groundY + 20);
    }

    // Render Drone Quadcopter
    this.drawDrone();

    // Victory Banner on Landing
    if (this.drone.landed) {
      this.ctx.fillStyle = "rgba(13, 22, 18, 0.85)";
      this.ctx.fillRect(this.width / 2 - 220, this.height / 2 - 60, 440, 120);

      this.ctx.strokeStyle = "#6CE8A7";
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(this.width / 2 - 220, this.height / 2 - 60, 440, 120);

      this.ctx.fillStyle = "#6CE8A7";
      this.ctx.font = "bold 24px Playfair Display, serif";
      this.ctx.textAlign = "center";
      this.ctx.fillText("PRECISION TOUCHDOWN!", this.width / 2, this.height / 2 - 15);

      this.ctx.fillStyle = "#FFFFFF";
      this.ctx.font = "14px Inter, sans-serif";
      this.ctx.fillText(`Final Score: ${this.drone.score} | Press 'Esc' to exit`, this.width / 2, this.height / 2 + 25);
    }
  }

  drawDrone() {
    if (!this.ctx) return;
    this.ctx.save();
    this.ctx.translate(this.drone.x, this.drone.y);

    const targetAngle = this.drone.vx * 0.04;
    this.drone.angle += (targetAngle - this.drone.angle) * 0.1;
    this.ctx.rotate(this.drone.angle);

    if (this.drone.hoverMode) {
      this.ctx.fillStyle = "rgba(34, 197, 94, 0.2)";
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 45, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.fillStyle = "#2A543F";
    this.ctx.fillRect(-22, -6, 44, 12);

    this.ctx.fillStyle = "#6CE8A7";
    this.ctx.beginPath();
    this.ctx.arc(0, -2, 10, 0, Math.PI * 2);
    this.ctx.fill();

    const propOffsets = [-24, 24];
    propOffsets.forEach((px) => {
      this.ctx!.fillStyle = "#10261C";
      this.ctx!.fillRect(px - 2, -14, 4, 10);

      this.ctx!.strokeStyle = "#FDE047";
      this.ctx!.lineWidth = 3;
      this.ctx!.beginPath();
      const pLen = Math.cos(this.drone.propAngle) * 22;
      this.ctx!.moveTo(px - pLen, -14);
      this.ctx!.lineTo(px + pLen, -14);
      this.ctx!.stroke();
    });

    this.ctx.restore();
  }
}
