import { createNoise2D } from "https://cdn.skypack.dev/simplex-noise";

const canvas = document.getElementById("waveCanvas");
const ctx = canvas.getContext("2d");

let width, height;
let dpr = window.devicePixelRatio || 1;
let cols, rows;
let amplitude = 25;
let smoothness = 300;
let speed = 0.015;
let t = 0;

let radius = 50;
let strength = 20;
let mouseX = -9999;
let mouseY = -9999;
let easeMouse = { x: -9999, y: -9999 };

const noise2D = createNoise2D();
let gridPoints = [];
const points = [];

// ---- FPS measurement ----
let fps = 0;
let frameCount = 0;
let lastFpsUpdate = performance.now();

function updateFPS(now) {
    frameCount++;
    if (now - lastFpsUpdate >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastFpsUpdate = now;
        
        // Update FPS counter in navbar
        const fpsCounter = document.getElementById('fps-counter');
        if (fpsCounter) {
            fpsCounter.textContent = `FPS: ${fps}`;
        }
    }
}

// ---- Resize with adaptive density ----
function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    adjustGridDensity();
    generateGrid();
}
resizeCanvas();

let resizeTimeout;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeCanvas, 150);
});

// ---- Adaptive grid density ----
function adjustGridDensity() {
    const baseDensity = 50; // Cells per 1000px width
    const targetCells = Math.floor(width / 1000 * baseDensity);

    cols = Math.max(20, targetCells); // Minimum grid size
    rows = Math.floor(cols * (height / width)); // Maintain aspect ratio

    // Reduce density if FPS drops
    if (fps < 40) {
        cols = Math.floor(cols * 0.8);
        rows = Math.floor(rows * 0.8);
    }
}

function generateGrid() {
    gridPoints = [];
    for (let y = 0; y <= rows; y++) {
        gridPoints[y] = [];
        points[y] = [];
        for (let x = 0; x <= cols; x++) {
            const px = (x / cols) * width;
            const py = (y / rows) * height;
            gridPoints[y][x] = { px, py };
            points[y][x] = { x: px, y: py };
        }
    }
}

function draw(now) {
    updateFPS(now);

    ctx.clearRect(0, 0, width, height);
    
    // Create gradient for the wave lines
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "rgba(34, 34, 34, 0.8)"); // Dark gray
    gradient.addColorStop(0.3, "rgb(106, 106, 106)"); // Light gray
    gradient.addColorStop(0.6, "rgb(106, 106, 106)"); // Light gray
    gradient.addColorStop(1, "rgba(34, 34, 34, 0.8)"); // Dark gray
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1;

    for (let y = 0; y <= rows; y++) {
        for (let x = 0; x <= cols; x++) {
            const { px, py } = gridPoints[y][x];
            let finalY = py + noise2D(px / smoothness, py / smoothness + t) * amplitude;

            const dx = px - easeMouse.x;
            const dy = py - easeMouse.y;
            const dist = Math.hypot(dx, dy);

            if (dist < radius) {
                const influence = 1 - dist / radius;
                finalY += Math.sin(dist * 0.1 - t * 3) * strength * influence;
            }

            points[y][x].x = px;
            points[y][x].y = finalY;
        }
    }

    ctx.beginPath();
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const p1 = points[y][x];
            const p2 = points[y + 1]?.[x];
            const p3 = points[y]?.[x + 1];
            const p4 = points[y + 1]?.[x + 1];

            if (p1 && p2 && p3) {
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.lineTo(p3.x, p3.y);
            }

            if (p2 && p3 && p4) {
                ctx.moveTo(p2.x, p2.y);
                ctx.lineTo(p4.x, p4.y);
                ctx.lineTo(p3.x, p3.y);
            }
        }
    }
    ctx.stroke();

    t += speed;
    requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});
window.addEventListener(
    "touchmove",
    (e) => {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
    },
    { passive: true }
);

function updateMouse() {
    easeMouse.x += (mouseX - easeMouse.x) / 8;
    easeMouse.y += (mouseY - easeMouse.y) / 8;
    requestAnimationFrame(updateMouse);
}
updateMouse();
