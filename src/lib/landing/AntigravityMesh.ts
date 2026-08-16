// Antigravity-style Interactive 3D Mesh Animation Background with Mini Drone Nodes
export class AntigravityMesh {
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
  nodes: Array<{
    baseX: number;
    baseY: number;
    x: number;
    y: number;
    r: number;
    c: number;
    phase: number;
    propAngle: number;
  }>;
  cols: number;
  rows: number;
  mouse: { x: number; y: number; targetX: number; targetY: number; radius: number };
  time: number;
  width: number = 0;
  height: number = 0;
  animId: number | null = null;
  handleResize: () => void;
  handleMouseMove: (e: MouseEvent) => void;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (!this.canvas) {
      this.ctx = null;
      this.nodes = [];
      this.cols = 24;
      this.rows = 16;
      this.mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000, radius: 200 };
      this.time = 0;
      this.handleResize = () => {};
      this.handleMouseMove = () => {};
      return;
    }
    this.ctx = this.canvas.getContext("2d");
    this.nodes = [];
    this.cols = 24;
    this.rows = 16;
    this.mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000, radius: 200 };
    this.time = 0;

    this.handleResize = () => this.resize();
    this.handleMouseMove = (e: MouseEvent) => {
      this.mouse.targetX = e.clientX;
      this.mouse.targetY = e.clientY;
    };

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener("resize", this.handleResize);
    window.addEventListener("mousemove", this.handleMouseMove);

    this.createGrid();
    this.animate();
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("mousemove", this.handleMouseMove);
  }

  resize() {
    if (!this.canvas) return;
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    this.createGrid();
  }

  createGrid() {
    this.nodes = [];
    const cellW = (this.width + 200) / this.cols;
    const cellH = (this.height + 200) / this.rows;

    for (let r = 0; r <= this.rows; r++) {
      for (let c = 0; c <= this.cols; c++) {
        const baseX = c * cellW - 100;
        const baseY = r * cellH - 100;
        this.nodes.push({
          baseX,
          baseY,
          x: baseX,
          y: baseY,
          r,
          c,
          phase: Math.random() * Math.PI * 2,
          propAngle: Math.random() * Math.PI,
        });
      }
    }
  }

  animate() {
    if (!this.ctx || !this.canvas) return;
    this.time += 0.025;

    // Smooth mouse lerp
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.1;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.1;

    this.ctx.clearRect(0, 0, this.width, this.height);

    // Update node positions with anti-gravity wave physics
    for (let i = 0; i < this.nodes.length; i++) {
      const n = this.nodes[i];

      // Sine wave displacement
      const waveX = Math.sin(this.time + n.phase + n.r * 0.35) * 14;
      const waveY = Math.cos(this.time * 0.9 + n.phase + n.c * 0.35) * 14;

      // Mouse repulsion/attraction force
      const dx = this.mouse.x - n.baseX;
      const dy = this.mouse.y - n.baseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let pushX = 0;
      let pushY = 0;
      if (dist < this.mouse.radius) {
        const force = (1 - dist / this.mouse.radius) * 50;
        const angle = Math.atan2(dy, dx);
        pushX = -Math.cos(angle) * force;
        pushY = -Math.sin(angle) * force;
      }

      n.x = n.baseX + waveX + pushX;
      n.y = n.baseY + waveY + pushY;
      n.propAngle += 0.3; // Spin propellers
    }

    const landingRoot = document.querySelector(".landing-root");
    const isDarkTheme = landingRoot?.classList.contains("theme-contrast") || false;
    const strokeColor = isDarkTheme ? "rgba(108, 232, 167, 0.38)" : "rgba(27, 59, 43, 0.28)";
    const droneBodyColor = isDarkTheme ? "#6CE8A7" : "#1B3B2B";
    const propColor = isDarkTheme ? "#85F5B9" : "#5C7C66";

    // Render mesh connections
    this.ctx.strokeStyle = strokeColor;
    this.ctx.lineWidth = isDarkTheme ? 1.4 : 1.2;

    const totalCols = this.cols + 1;
    for (let r = 0; r <= this.rows; r++) {
      for (let c = 0; c <= this.cols; c++) {
        const idx = r * totalCols + c;
        const curr = this.nodes[idx];

        if (!curr) continue;

        // Horizontal mesh line connection
        if (c < this.cols) {
          const right = this.nodes[idx + 1];
          if (right) {
            this.ctx.beginPath();
            this.ctx.moveTo(curr.x, curr.y);
            this.ctx.lineTo(right.x, right.y);
            this.ctx.stroke();
          }
        }

        // Vertical mesh line connection
        if (r < this.rows) {
          const down = this.nodes[idx + totalCols];
          if (down) {
            this.ctx.beginPath();
            this.ctx.moveTo(curr.x, curr.y);
            this.ctx.lineTo(down.x, down.y);
            this.ctx.stroke();
          }
        }
      }
    }

    // Render miniature drone quadcopter shape at each mesh node
    for (let i = 0; i < this.nodes.length; i++) {
      const n = this.nodes[i];
      this.drawMiniDroneNode(n, droneBodyColor, propColor);
    }

    this.animId = requestAnimationFrame(() => this.animate());
  }

  drawMiniDroneNode(
    n: { x: number; y: number; baseX: number; propAngle: number },
    bodyColor: string,
    propColor: string
  ) {
    if (!this.ctx) return;
    this.ctx.save();
    this.ctx.translate(n.x, n.y);

    const tilt = (n.x - n.baseX) * 0.03;
    this.ctx.rotate(tilt);

    const size = 7;

    // Drone Cross-Arm frame ('X' shape)
    this.ctx.strokeStyle = bodyColor;
    this.ctx.lineWidth = 1.6;

    this.ctx.beginPath();
    this.ctx.moveTo(-size, -size);
    this.ctx.lineTo(size, size);
    this.ctx.moveTo(size, -size);
    this.ctx.lineTo(-size, size);
    this.ctx.stroke();

    // Central flight controller core dot
    this.ctx.fillStyle = bodyColor;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    this.ctx.fill();

    // 4 Rotor Pods & Spinning Propellers
    const pods = [
      { x: -size, y: -size },
      { x: size, y: -size },
      { x: -size, y: size },
      { x: size, y: size },
    ];

    this.ctx.fillStyle = propColor;
    this.ctx.strokeStyle = propColor;
    this.ctx.lineWidth = 1;

    pods.forEach((pod) => {
      this.ctx!.beginPath();
      this.ctx!.arc(pod.x, pod.y, 1.5, 0, Math.PI * 2);
      this.ctx!.fill();

      const propLen = Math.cos(n.propAngle) * 4;
      this.ctx!.beginPath();
      this.ctx!.moveTo(pod.x - propLen, pod.y);
      this.ctx!.lineTo(pod.x + propLen, pod.y);
      this.ctx!.stroke();
    });

    this.ctx.restore();
  }
}
