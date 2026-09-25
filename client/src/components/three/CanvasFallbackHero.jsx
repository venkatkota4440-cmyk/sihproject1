import React, { useEffect, useRef } from 'react';

export default function CanvasFallbackHero() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particles (pollen/fireflies)
    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.5 + 1,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -Math.random() * 0.5 - 0.2,
      alpha: Math.random() * 0.6 + 0.2
    }));

    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#ecfdf5');
      skyGrad.addColorStop(0.6, '#d1fae5');
      skyGrad.addColorStop(1, '#a7f3d0');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Sun
      ctx.save();
      const sunGrad = ctx.createRadialGradient(width * 0.8, height * 0.25, 10, width * 0.8, height * 0.25, 90);
      sunGrad.addColorStop(0, 'rgba(251, 191, 36, 0.8)');
      sunGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.25)');
      sunGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(width * 0.8, height * 0.25, 90, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Hill 1 (Far background hill)
      ctx.fillStyle = '#6ee7b7';
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 20) {
        const y = height * 0.62 + Math.sin(x * 0.003 + time * 0.3) * 25;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // Hill 2 (Mid-ground crop terraces)
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 20) {
        const y = height * 0.72 + Math.sin(x * 0.005 + 1.5 + time * 0.4) * 30;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // Hill 3 (Foreground lush farm ridge)
      ctx.fillStyle = '#047857';
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 15) {
        const y = height * 0.82 + Math.sin(x * 0.008 + 2.8 + time * 0.5) * 20;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // Animated crop rows / wheat stalks on foreground
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.8;
      for (let i = 0; i < width; i += 22) {
        const baseY = height * 0.85 + Math.sin(i * 0.008 + 2.8 + time * 0.5) * 20;
        const stalkHeight = 28 + Math.sin(i * 0.1) * 8;
        const sway = Math.sin(time * 2 + i * 0.05) * 8;

        ctx.beginPath();
        ctx.moveTo(i, baseY);
        ctx.quadraticCurveTo(i + sway * 0.5, baseY - stalkHeight * 0.6, i + sway, baseY - stalkHeight);
        ctx.stroke();

        // Wheat head
        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.arc(i + sway, baseY - stalkHeight, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Floating pollen particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < 0) p.y = height;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 0,
        pointerEvents: 'none',
        borderRadius: '24px'
      }}
    />
  );
}
