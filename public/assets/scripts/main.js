// Botón "Empezar"
const btnEmpezar = document.querySelector('.header .btn');
if (btnEmpezar) {
  btnEmpezar.addEventListener('click', () => {
    alert("¡Bienvenida a HerSOS! Tu seguridad es prioridad.");
  });
}

// Efecto hover en las tarjetas de funciones
const cards = document.querySelectorAll('.card');
cards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-5px)';
    card.style.boxShadow = '0 10px 20px rgba(31,18,53,0.15)';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0)';
    card.style.boxShadow = '0 2px 0 #ede7ff';
  });
});

// --- Autenticación mock (login / register) ---
document.addEventListener('DOMContentLoaded', () => {
  const openLoginBtns = Array.from(document.querySelectorAll('.auth-login'));
  const openRegisterBtns = Array.from(document.querySelectorAll('.auth-register'));
  const authModal = document.getElementById('authModal');
  const overlay = authModal && authModal.querySelector('.auth-modal__overlay');
  const closeBtns = authModal && Array.from(authModal.querySelectorAll('[data-action="close"]'));
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const showRegister = document.getElementById('showRegister');
  const showLogin = document.getElementById('showLogin');

  function openAuth(mode = 'login') {
    if (!authModal) return;
    authModal.setAttribute('aria-hidden', 'false');
    if (mode === 'register') {
      loginForm.hidden = true; registerForm.hidden = false; authModal.querySelector('#authTitle').textContent = 'Crear cuenta';
    } else {
      loginForm.hidden = false; registerForm.hidden = true; authModal.querySelector('#authTitle').textContent = 'Iniciar sesión';
    }
    // focus first input
    setTimeout(() => {
      const first = authModal.querySelector('input:not([hidden])');
      if (first) first.focus();
    }, 80);
  }
  function closeAuth() { if (!authModal) return; authModal.setAttribute('aria-hidden', 'true'); }

  openLoginBtns.forEach(b => b.addEventListener('click', () => openAuth('login')));
  openRegisterBtns.forEach(b => b.addEventListener('click', () => openAuth('register')));
  if (overlay) overlay.addEventListener('click', closeAuth);
  if (closeBtns) closeBtns.forEach(cb => cb.addEventListener('click', closeAuth));
  if (showRegister) showRegister.addEventListener('click', (e) => { e.preventDefault(); openAuth('register'); });
  if (showLogin) showLogin.addEventListener('click', (e) => { e.preventDefault(); openAuth('login'); });

  // simple registration: store user in localStorage and redirect
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = (document.getElementById('regName')||{}).value || 'Usuario';
      const email = (document.getElementById('regEmail')||{}).value;
      const pass = (document.getElementById('regPass')||{}).value;
      if (!email || !pass) return alert('Completa los campos');
      const user = { name, email };
      localStorage.setItem('hersos_user', JSON.stringify(user));
      // redirect to app (simulated web app)
      window.location.href = 'app.html';
    });
  }

  // simple login: accept any credentials (mock)
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = (document.getElementById('loginEmail')||{}).value;
      const pass = (document.getElementById('loginPass')||{}).value;
      if (!email || !pass) return alert('Introduce email y contraseña');
      const existing = JSON.parse(localStorage.getItem('hersos_user') || 'null');
      const user = existing && existing.email === email ? existing : { name: email.split('@')[0], email };
      localStorage.setItem('hersos_user', JSON.stringify(user));
      window.location.href = 'app.html';
    });
  }

  // If user already logged in, update header to show greeting and logout
  const stored = JSON.parse(localStorage.getItem('hersos_user') || 'null');
  if (stored) {
    const authWrap = document.querySelector('.auth-actions');
    if (authWrap) {
      authWrap.innerHTML = `<span class="greet">Hola, ${stored.name}</span> <button class="btn btn-ghost auth-logout">Cerrar sesión</button>`;
      const logoutBtn = authWrap.querySelector('.auth-logout');
      if (logoutBtn) logoutBtn.addEventListener('click', () => { localStorage.removeItem('hersos_user'); location.reload(); });
      // optionally redirect directly to app
      // window.location.href = 'app.html';
    }
  }
});

// Scroll suave para la barra sticky
document.querySelectorAll('.sticky-nav a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const targetId = link.getAttribute('href').substring(1);
    document.getElementById(targetId).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

// Año dinámico en el footer
document.getElementById("y").textContent = new Date().getFullYear();

// Animaciones y revelado al hacer scroll
document.addEventListener('DOMContentLoaded', () => {
  // Añadir clase 'reveal' a elementos clave (si no están ya en el HTML)
  const revealSelectors = [
    '.hero .h1',
    '.hero .lead',
    '.hero .hero-ctas',
    '.card',
    '.member',
    '.testimonio',
    '.section .h1'
  ];
  // Añadir y escalonar delays para un efecto más natural
  revealSelectors.forEach(sel => {
    const nodes = Array.from(document.querySelectorAll(sel));
    nodes.forEach((el, i) => {
      el.classList.add('reveal');
      el.style.setProperty('--reveal-delay', `${i * 80}ms`);
    });
  });

  // IntersectionObserver para animar entrada
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Pop del logo al cargar
  const logo = document.querySelector('.brand__logo');
  if (logo) logo.classList.add('logo-entrance');

  // Floating animation para mockups
  document.querySelectorAll('.screen').forEach(s => s.classList.add('float'));

  // Rotador simple de testimonios (respetuoso y sutil)
  const tests = Array.from(document.querySelectorAll('.testimonio'));
  if (tests.length > 0) {
    let ti = 0;
    tests.forEach((t, i) => t.classList.toggle('active', i === 0));
    setInterval(() => {
      tests[ti].classList.remove('active');
      ti = (ti + 1) % tests.length;
      tests[ti].classList.add('active');
    }, 4500);
  }
});
