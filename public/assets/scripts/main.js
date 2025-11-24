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
