document.addEventListener('DOMContentLoaded', function () {

  // AOS
  if (typeof AOS !== 'undefined') AOS.init({ once: true, duration: 900, offset: 60 });

  // Custom cursor
  const cursor = document.getElementById('cursor');
  const trail  = document.getElementById('cursor-trail');
  if (cursor && trail) {
    document.addEventListener('mousemove', e => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top  = e.clientY + 'px';
      setTimeout(() => {
        trail.style.left = e.clientX + 'px';
        trail.style.top  = e.clientY + 'px';
      }, 80);
    });
    document.querySelectorAll('a, button, .proj-card-neo, .skill-hex-card').forEach(el => {
      el.addEventListener('mouseenter', () => { cursor.style.transform = 'translate(-50%,-50%) scale(2)'; trail.style.transform = 'translate(-50%,-50%) scale(1.5)'; });
      el.addEventListener('mouseleave', () => { cursor.style.transform = 'translate(-50%,-50%) scale(1)'; trail.style.transform = 'translate(-50%,-50%) scale(1)'; });
    });
  }

  // Typewriter roles
  const roles = ['Business Analyst', 'Project Management Executive', 'FinTech Professional', 'Payment Systems Expert', 'Digital Transformation Lead'];
  let ri = 0, ci = 0, deleting = false;
  const roleEl = document.getElementById('role-text');
  function typeWriter() {
    if (!roleEl) return;
    const current = roles[ri];
    if (!deleting) {
      roleEl.textContent = current.slice(0, ++ci);
      if (ci === current.length) { deleting = true; setTimeout(typeWriter, 1800); return; }
    } else {
      roleEl.textContent = current.slice(0, --ci);
      if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length; }
    }
    setTimeout(typeWriter, deleting ? 60 : 100);
  }
  typeWriter();

  // Particles canvas
  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];
    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);
    for (let i = 0; i < 80; i++) {
      particles.push({ x: Math.random()*W, y: Math.random()*H, r: Math.random()*1.5+0.5, vx: (Math.random()-0.5)*0.3, vy: (Math.random()-0.5)*0.3, a: Math.random()*0.5+0.1 });
    }
    function drawParticles() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(0,245,255,${p.a})`;
        ctx.fill();
      });
      // Draw lines between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i+1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0,245,255,${0.06 * (1 - dist/120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(drawParticles);
    }
    drawParticles();
  }

  // Skill bar animation
  const sbObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.sb-fill').forEach(bar => bar.classList.add('animated'));
        sbObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.skill-bar-item').forEach(el => sbObserver.observe(el));

  // Ring charts + Radar + Bar
  const skillData = [
    { label: 'Business Analysis',     value: 92 },
    { label: 'Payment & FinTech',     value: 88 },
    { label: 'Agile PM',              value: 90 },
    { label: 'Supply Chain',          value: 82 },
    { label: 'Stakeholder Comm.',     value: 95 },
    { label: 'AI Analytics',          value: 78 },
  ];
  const cyan   = '#00f5ff';
  const purple = '#7c3aed';
  const track  = 'rgba(0,245,255,0.08)';

  // Animate ring charts on scroll
  const ringCanvases = document.querySelectorAll('.ring-chart');
  const ringObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const canvas = entry.target;
      const value  = +canvas.getAttribute('data-value');
      const pctEl  = canvas.parentElement.querySelector('.ring-pct');
      const ctx    = canvas.getContext('2d');
      canvas.width  = 110;
      canvas.height = 110;
      let current = 0;
      const target = value / 100;
      const step   = target / 60;
      function drawRing(v) {
        ctx.clearRect(0, 0, 110, 110);
        // Track
        ctx.beginPath();
        ctx.arc(55, 55, 44, 0, Math.PI * 2);
        ctx.strokeStyle = track;
        ctx.lineWidth = 8;
        ctx.stroke();
        // Fill
        const grad = ctx.createLinearGradient(0, 0, 110, 110);
        grad.addColorStop(0, cyan);
        grad.addColorStop(1, purple);
        ctx.beginPath();
        ctx.arc(55, 55, 44, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * v);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.shadowColor = cyan;
        ctx.shadowBlur = 10;
        ctx.stroke();
      }
      function animate() {
        current = Math.min(current + step, target);
        drawRing(current);
        pctEl.textContent = Math.round(current * 100) + '%';
        if (current < target) requestAnimationFrame(animate);
      }
      animate();
      ringObserver.unobserve(canvas);
    });
  }, { threshold: 0.4 });
  ringCanvases.forEach(c => ringObserver.observe(c));

  // Radar chart
  const radarEl = document.getElementById('radarChart');
  if (radarEl && typeof Chart !== 'undefined') {
    new Chart(radarEl, {
      type: 'radar',
      data: {
        labels: skillData.map(s => s.label),
        datasets: [{
          label: 'Proficiency',
          data: skillData.map(s => s.value),
          backgroundColor: 'rgba(0,245,255,0.08)',
          borderColor: cyan,
          borderWidth: 2,
          pointBackgroundColor: cyan,
          pointBorderColor: '#0a0a0f',
          pointRadius: 5,
          pointHoverRadius: 7,
        }]
      },
      options: {
        responsive: true,
        scales: {
          r: {
            min: 60, max: 100,
            ticks: { display: false, stepSize: 10 },
            grid: { color: 'rgba(0,245,255,0.08)' },
            angleLines: { color: 'rgba(0,245,255,0.1)' },
            pointLabels: { color: 'rgba(200,214,229,0.7)', font: { family: 'Fira Code', size: 11 } }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f0f1a',
            borderColor: 'rgba(0,245,255,0.3)',
            borderWidth: 1,
            titleColor: cyan,
            bodyColor: '#c8d6e5',
            callbacks: { label: ctx => ` ${ctx.raw}%` }
          }
        }
      }
    });
  }

  // Bar chart
  const barEl = document.getElementById('barChart');
  if (barEl && typeof Chart !== 'undefined') {
    new Chart(barEl, {
      type: 'bar',
      data: {
        labels: skillData.map(s => s.label),
        datasets: [{
          label: 'Proficiency %',
          data: skillData.map(s => s.value),
          backgroundColor: skillData.map((_, i) =>
            `rgba(0,245,255,${0.5 + i * 0.07})`
          ),
          borderColor: cyan,
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        scales: {
          x: {
            min: 60, max: 100,
            grid: { color: 'rgba(0,245,255,0.06)' },
            ticks: { color: 'rgba(200,214,229,0.5)', font: { family: 'Fira Code', size: 10 }, callback: v => v + '%' }
          },
          y: {
            grid: { display: false },
            ticks: { color: 'rgba(200,214,229,0.7)', font: { family: 'Fira Code', size: 10 } }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f0f1a',
            borderColor: 'rgba(0,245,255,0.3)',
            borderWidth: 1,
            titleColor: cyan,
            bodyColor: '#c8d6e5',
            callbacks: { label: ctx => ` ${ctx.raw}%` }
          }
        }
      }
    });
  }

  // Navbar scroll
  window.addEventListener('scroll', () => {
    document.getElementById('mainNav').classList.toggle('scrolled', window.scrollY > 50);
    const btn = document.getElementById('backToTop');
    if (btn) btn.style.display = window.scrollY > 400 ? 'block' : 'none';
  });

  // Back to top
  const topBtn = document.getElementById('backToTop');
  if (topBtn) topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

  // Contact form with EmailJS
  emailjs.init('84Gsy5qY0paUjKcqu');

  document.getElementById('contactForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const alertEl = document.getElementById('formAlert');
    const btn = this.querySelector('button[type="submit"]');

    const name    = document.getElementById('f-name').value.trim();
    const email   = document.getElementById('f-email').value.trim();
    const phone   = document.getElementById('f-phone').value.trim();
    const service = document.getElementById('f-service').value;
    const message = document.getElementById('f-message').value.trim();

    if (!name || !email) {
      alertEl.className = 'alert alert-danger mt-2';
      alertEl.textContent = 'Please enter your name and email.';
      alertEl.classList.remove('d-none');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = 'Sending... <i class="bi bi-hourglass-split ms-2"></i>';

    emailjs.send('service_kokzev7', 'template_ymrmq6h', {
      from_name: name,
      from_email: email,
      phone:   phone   || 'Not provided',
      service: service || 'Not specified',
      message: message || 'No message',
      to_name: 'Hariharan'
    }).then(() => {
      alertEl.className = 'alert alert-success mt-2';
      alertEl.textContent = "Message received! I'll get back to you soon. 🚀";
      alertEl.classList.remove('d-none');
      this.reset();
      btn.disabled = false;
      btn.innerHTML = 'Send Message <i class="bi bi-send-fill ms-2"></i>';
      setTimeout(() => alertEl.classList.add('d-none'), 6000);
    }).catch(() => {
      alertEl.className = 'alert alert-danger mt-2';
      alertEl.textContent = 'Something went wrong. Please WhatsApp me directly.';
      alertEl.classList.remove('d-none');
      btn.disabled = false;
      btn.innerHTML = 'Send Message <i class="bi bi-send-fill ms-2"></i>';
    });
  });

});
