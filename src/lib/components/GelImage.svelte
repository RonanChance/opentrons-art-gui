<script>
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';

    export let record;

    let canvas;
    let container;

    const LADDER = [15000,10000,8000,7000,6000,5000,4000,3000,2000,1500,1000,850,650,500,400,300,200,100];

    function bpToPx(bp, height = 200, bandH = 3) {
        const log = (x) => Math.log10(x);
        const maxLog = log(LADDER[0]);
        const minLog = log(LADDER[LADDER.length - 1]);
        const bpLog = log(bp);

        if (bpLog >= maxLog) return 0;
        if (bpLog <= minLog) return height - bandH;

        const t = (maxLog - bpLog) / (maxLog - minLog);
        return t * (height - bandH);
    }

    function handleMouseMove(e) {
        const b = container.getBoundingClientRect();
        const x = e.clientX - b.left - b.width / 2;
        const y = e.clientY - b.top - b.height / 2;
        const rx = (-y / b.height) * 125;
        const ry = (x / b.width) * 125;
        container.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    }

    function resetTilt() {
        container.style.transform = 'rotateX(0deg) rotateY(0deg)';
    }

    onMount(() => {
        if (browser) draw();
    });

    // redraw whenever record changes
    $: record && draw();

    function draw() {
        if (!canvas || !record) return;

        const cols = record.columns || 0;
        const stack = record.stack_mode;
        const topBands = record.bands || [];
        const bottomBands = record.bottom_bands || [];

        canvas.width = cols * 28;
        canvas.height = 200;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // background
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let col = 0; col < cols; col++) {
            const x0 = col * 28;

            drawLane(ctx, x0, topBands[col]?.currentBands || [], 1);
            if (stack) drawLane(ctx, x0, bottomBands[col]?.currentBands || [], 0.35);
        }
    }

    function drawLane(ctx, x0, bandList, alpha) {
        if (!bandList.length) return;

        for (const bp of bandList) {
            const y = bpToPx(bp, canvas.height, 13);

            ctx.save();
            ctx.globalAlpha = alpha;

            const g = ctx.createLinearGradient(x0, y, x0 + 28, y);
            g.addColorStop(0.0, 'rgba(156,163,175,0)');
            g.addColorStop(0.25, 'rgba(156,163,175,0.85)');
            g.addColorStop(0.5, 'rgba(156,163,175,0.95)');
            g.addColorStop(0.75, 'rgba(156,163,175,0.85)');
            g.addColorStop(1.0, 'rgba(156,163,175,0)');
            ctx.fillStyle = g;

            if (!ctx.roundRect) {
                CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
                    r = r || 2;
                    this.beginPath();
                    this.moveTo(x + r, y);
                    this.lineTo(x + w - r, y);
                    this.quadraticCurveTo(x + w, y, x + w, y + r);
                    this.lineTo(x + w, y + h - r);
                    this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
                    this.lineTo(x + r, y + h);
                    this.quadraticCurveTo(x, y + h, x, y + h - r);
                    this.lineTo(x, y + r);
                    this.quadraticCurveTo(x, y, x + r, y);
                    this.closePath();
                };
            }

            ctx.roundRect(x0 + 2, y, 24, 5, 4);
            ctx.fill();

            ctx.restore();
        }
    }
</script>

<div bind:this={container} class="tilt-effect w-full h-full bg-neutral rounded-sm overflow-hidden" onmousemove={handleMouseMove} onmouseleave={resetTilt}>
    <canvas bind:this={canvas} class="w-full h-full"></canvas>
</div>

<style>
    .tilt-effect {
        transition: transform 0.1s ease;
        transform-style: preserve-3d;
        transform-origin: center;
        will-change: transform;
    }
</style>
