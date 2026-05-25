import { useEffect, useRef } from 'react';
import styled from 'styled-components';

// Canvas 기반 폭죽.
// 1) 화면 아래에서 로켓이 위로 올라가며 중력에 감속
// 2) 정점/경계에 도달하면 폭발 → 50~80개 입자가 사방으로 흩어짐
// 3) 입자는 자체 중력 + 공기저항 + 수명에 따라 알파 페이드
// 4) destination-out 으로 캔버스 픽셀을 살짝씩 깎아 트레일 잔상.
//
// 캔버스 자체에 mix-blend-mode: screen 을 걸어 어두운 배경 위에서 빛을 더하는 식으로 합성.

type Hsl = number; // hue 0-360

class Rocket {
  x: number;
  y: number;
  sx: number;
  sy: number;
  size: number;
  hue: Hsl;
  shouldExplode = false;

  constructor(w: number, h: number) {
    // 화면 중앙 80% 영역에서 발사
    this.x = w * (0.1 + Math.random() * 0.8);
    this.y = h;
    this.sx = Math.random() * 2 - 1;
    this.sy = -4 - Math.random() * 3; // 위로 4~7
    this.size = 1.5 + Math.random() * 1.2;
    // 따뜻한 팔레트 (적 → 황)
    this.hue = 10 + Math.random() * 40;
  }

  update(w: number) {
    // 충분히 감속됐거나, 상단/측면 경계 근처면 폭발
    if (this.sy >= -1.6 || this.y <= 120 || this.x <= 30 || this.x >= w - 30) {
      this.shouldExplode = true;
    } else {
      this.sy += 0.03; // 중력으로 점차 감속
    }
    this.x += this.sx;
    this.y += this.sy;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = `hsl(${this.hue}, 95%, 72%)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    // 옅은 글로우
    ctx.fillStyle = `hsla(${this.hue}, 95%, 70%, 0.28)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 2.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

class Particle {
  x: number;
  y: number;
  sx: number;
  sy: number;
  size: number;
  life: number;
  maxLife: number;
  hue: Hsl;

  constructor(x: number, y: number, hue: Hsl) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 4;
    this.sx = Math.cos(angle) * speed;
    this.sy = Math.sin(angle) * speed;
    this.size = 0.8 + Math.random() * 1.6;
    this.maxLife = 70 + Math.random() * 55; // 1.2~2.1초
    this.life = this.maxLife;
    // 같은 폭죽 안에서도 hue 살짝 변동
    this.hue = hue + (Math.random() * 26 - 13);
  }

  update() {
    this.x += this.sx;
    this.y += this.sy;
    this.sy += 0.035; // 중력
    this.sx *= 0.985; // 공기 저항
    this.life -= 1;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.fillStyle = `hsla(${this.hue}, 95%, 62%, ${alpha})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

const FireworksCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      // DPR 스케일 — 좌표는 CSS 픽셀로 다룸
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const rockets: Rocket[] = [new Rocket(window.innerWidth, window.innerHeight)];
    const particles: Particle[] = [];

    let rafId = 0;
    let destroyed = false;

    const animate = () => {
      if (destroyed) return;
      const w = window.innerWidth;
      const h = window.innerHeight;

      // 잔상 페이드: destination-out 으로 기존 캔버스 픽셀의 알파만 깎음.
      // 다른 배경 요소(별/구름)는 캔버스가 투명한 영역이라 그대로 노출됨.
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';

      // 랜덤 스폰 (~1초당 한 발 수준)
      if (Math.random() < 0.018) {
        rockets.push(new Rocket(w, h));
      }

      // 로켓 업데이트 + 폭발 처리
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.update(w);
        r.draw(ctx);
        if (r.shouldExplode) {
          const count = 50 + Math.floor(Math.random() * 30);
          for (let j = 0; j < count; j++) {
            particles.push(new Particle(r.x, r.y, r.hue));
          }
          rockets.splice(i, 1);
        }
      }

      // 입자 업데이트
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw(ctx);
        if (p.life <= 0) {
          particles.splice(i, 1);
        }
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      destroyed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <Canvas ref={canvasRef} />;
};

export default FireworksCanvas;

const Canvas = styled.canvas`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  mix-blend-mode: screen;
`;
