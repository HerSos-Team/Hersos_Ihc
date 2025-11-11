// Botón "Empezar"
const btnEmpezar = document.querySelector('.header .btn');
btnEmpezar.addEventListener('click', () => {
  alert("¡Bienvenida a HerSOS! Tu seguridad es prioridad.");
});

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
