// Simple app simulation behaviour

document.addEventListener('DOMContentLoaded', function () {
  const panicBtn = document.getElementById('panicBtn');
  const panicStatus = document.getElementById('panicStatus');
  const toast = document.getElementById('toast');
  let alertActive = false;

  function showToast(msg, time = 3000) {
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, time);
  }

  panicBtn.addEventListener('click', function () {
    alertActive = !alertActive;
    panicBtn.setAttribute('aria-pressed', String(alertActive));
    panicStatus.textContent = alertActive ? 'Estado: alerta enviada' : 'Estado: inactivo';
    showToast(alertActive ? 'Alerta enviada a contactos y servicios' : 'Alerta cancelada', 3500);
  });

  // Contact notify buttons
  document.querySelectorAll('.contact-send').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.contact');
      const name = card.querySelector('.contact-info strong').textContent;
      showToast('Notificación enviada a ' + name, 2500);
    });
  });

  // Map image fallback: if svg missing, show placeholder
  const mapImg = document.querySelector('.map-card img');
  mapImg.addEventListener('error', () => {
    mapImg.src = 'assets/images/map-fallback.png';
  });
});
