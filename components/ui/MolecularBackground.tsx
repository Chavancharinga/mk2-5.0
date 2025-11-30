import React, { useEffect, useRef } from 'react';

export const MoleculeBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener('resize', resize);
        resize();

        // Configuration
        const particleCount = window.innerWidth < 768 ? 40 : 80; // Menos partículas no mobile
        const connectionDistance = 150; // Distância máxima para conexão
        const speed = 0.4; // Velocidade base

        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            color: string;

            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * speed;
                this.vy = (Math.random() - 0.5) * speed;
                this.size = Math.random() * 2 + 1;
                // Cores do tema: Roxo Neon e Rosa
                this.color = Math.random() > 0.5 ? '#A020F0' : '#C71585';
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Rebater nas bordas
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }

            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        // Inicializar partículas
        const particles: Particle[] = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Reset shadow para performance nas linhas
            ctx.shadowBlur = 0;

            // Atualizar e desenhar partículas
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.update();
                
                // Desenhar conexões primeiro (atrás dos pontos)
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const distanceSq = dx * dx + dy * dy;
                    const connectionDistanceSq = connectionDistance * connectionDistance;

                    if (distanceSq < connectionDistanceSq) {
                        const distance = Math.sqrt(distanceSq);
                        const opacity = 1 - distance / connectionDistance;
                        
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(160, 32, 240, ${opacity * 0.4})`; // Roxo translúcido
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }

                // Desenhar o ponto (com glow leve)
                ctx.shadowBlur = 10;
                ctx.shadowColor = p.color;
                p.draw();
                ctx.shadowBlur = 0; // Reset
            }

            requestAnimationFrame(animate);
        };

        const animationId = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-40 bg-black"
        />
    );
};