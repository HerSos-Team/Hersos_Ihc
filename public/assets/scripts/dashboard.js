// Dashboard interactions: panic button hold, quick actions and toast
(function () {
  // require authentication: redirect to login if not present
  const stored = JSON.parse(localStorage.getItem('hersos_user') || 'null');
  if (!stored) {
    // not logged in -> redirect to login page
    window.location.href = 'login.html';
    return;
  }
  // show greeting
  const greetingEl = document.getElementById('userGreeting');
  if (greetingEl) greetingEl.textContent = `Hola, ${stored.name}`;
  // logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', () => { localStorage.removeItem('hersos_user'); window.location.href = 'login.html'; });
  const panicBtn = document.getElementById('panicBtn');
  const toast = document.getElementById('toast');
  let holdTimer = null;

  function showToast(msg, time = 2500) {
    toast.textContent = msg;
    toast.style.display = 'block';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.style.display = 'none'; }, time);
  }

  // long-press: 3 seconds to trigger
  if (panicBtn) {
    let pressed = false;
    const startHold = () => {
      if (pressed) return;
      pressed = true; panicBtn.setAttribute('aria-pressed', 'true');
      let t = 0; showToast('Mantén presionado 3s para enviar alerta', 1000);
      holdTimer = setTimeout(() => {
        showToast('¡Alerta enviada a tu red de apoyo!');
        // visual feedback
        panicBtn.classList.add('sent');
        setTimeout(() => panicBtn.classList.remove('sent'), 1400);
        pressed = false; panicBtn.setAttribute('aria-pressed','false');
      }, 3000);
    };
    const cancelHold = () => { clearTimeout(holdTimer); panicBtn.setAttribute('aria-pressed','false'); };

    panicBtn.addEventListener('pointerdown', startHold);
    panicBtn.addEventListener('pointerup', cancelHold);
    panicBtn.addEventListener('pointerleave', cancelHold);
  }

  // quick action buttons
  document.querySelectorAll('.quick').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      if (action === 'chat') {
        // Mostrar chatbot
        document.getElementById('chatbotModal').style.display = 'flex';
      } else {
        showToast('Accediendo: ' + action, 1600);
      }
    });
  });

  // Chatbot modal logic
  const chatbotModal = document.getElementById('chatbotModal');
  const closeChatbot = document.getElementById('closeChatbot');
  if (closeChatbot) {
    closeChatbot.addEventListener('click', () => {
      chatbotModal.style.display = 'none';
    });
  }
  // Enviar mensaje
  const chatbotForm = document.getElementById('chatbotForm');
  const chatbotInput = document.getElementById('chatbotInput');
  const chatbotMessages = document.getElementById('chatbotMessages');
  if (chatbotForm && chatbotInput && chatbotMessages) {
    chatbotForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const msg = chatbotInput.value.trim();
      if (!msg) return;
      // Mostrar mensaje del usuario
      const userMsg = document.createElement('div');
      userMsg.className = 'chatbot-msg user';
      userMsg.textContent = msg;
      chatbotMessages.appendChild(userMsg);
      chatbotInput.value = '';
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
      // Simular respuesta de Luna
      setTimeout(() => {
        const botMsg = document.createElement('div');
        botMsg.className = 'chatbot-msg bot';
        botMsg.textContent = getBotReply(msg);
        chatbotMessages.appendChild(botMsg);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
      }, 900);
    });
  }

  // Respuestas simples del bot
  function getBotReply(msg) {
    msg = msg.toLowerCase();
    if (msg.includes('hola') || msg.includes('buenas')) return '¡Hola! ¿Cómo te sientes hoy?';
    if (msg.includes('ayuda')) return '¿Quieres contactar a tu red de apoyo o necesitas información?';
    if (msg.includes('pánico')) return 'Recuerda que puedes usar el botón de pánico en cualquier momento.';
    if (msg.includes('contacto')) return 'Puedes ver tus contactos en la sección "Mis contactos".';
    if (msg.includes('gracias')) return '¡Para eso estoy! ¿Hay algo más en lo que te pueda ayudar?';
    return 'Luna está aquí para ayudarte. ¿Quieres hablar con tu red de apoyo, ver recursos o necesitas otra cosa?';
  }

  // contact notify buttons (in contacts section)
  document.querySelectorAll('.contact-send').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.contact');
      const name = card ? (card.querySelector('.contact-info strong')||{}).textContent : 'Contacto';
      showToast('Notificación enviada a ' + name, 2000);
    });
  });

  // panic button in the web section
  const panicSectionBtn = document.getElementById('panicSectionBtn');
  if (panicSectionBtn) {
    let tId = null;
    panicSectionBtn.addEventListener('pointerdown', () => {
      showToast('Mantén presionado 3s para enviar alerta', 1200);
      tId = setTimeout(() => {
        showToast('¡Alerta enviada a tu red de apoyo!');
        panicSectionBtn.classList.add('sent');
        setTimeout(() => panicSectionBtn.classList.remove('sent'), 1400);
      }, 3000);
    });
    const clear = () => { clearTimeout(tId); };
    panicSectionBtn.addEventListener('pointerup', clear);
    panicSectionBtn.addEventListener('pointerleave', clear);
  }

  // bottom nav
  document.querySelectorAll('.nav-btn').forEach(n => {
    n.addEventListener('click', () => {
      const what = n.getAttribute('data-nav') || 'alerta';
      if (what === 'alerta') return; // panic handled separately
      if (what === 'profile') { window.location.href = 'profile.html'; return; }
      showToast(what, 900);
    });
  });
})();
