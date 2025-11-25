// Chatbot Empático Hersos
(function () {
  const form = document.getElementById('chatbotForm');
  const input = document.getElementById('chatbotInput');
  const messages = document.getElementById('chatbotMessages');

  if (!form || !input || !messages) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const userText = input.value.trim();
    if (!userText) return;

    // Mostrar mensaje de la usuaria
    addMessage(userText, 'user');
    input.value = '';

    // Animación de escribiendo…
    const typingMsg = addMessage('Luna está escribiendo…', 'typing');

    setTimeout(() => {
      typingMsg.remove();
      // Respuesta empática según contexto
      addMessage(getBotReply(userText), 'bot');
      messages.scrollTop = messages.scrollHeight;
    }, 1200);
  });

  function addMessage(text, type) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chatbot-msg ' + type;
    msgDiv.textContent = text;
    messages.appendChild(msgDiv);
    messages.scrollTop = messages.scrollHeight;
    return msgDiv;
  }

  function getBotReply(text) {
    const t = text.toLowerCase();
    if (t.includes('miedo') || t.includes('nerviosa')) {
      return 'Entiendo que te sientas así. Respira, estoy aquí para ayudarte. ¿Quieres que te recomiende rutas seguras o contactar a tu red de apoyo?';
    }
    if (t.includes('peligro') || t.includes('acoso') || t.includes('agresión')) {
      return 'Si te sientes en peligro, te recomiendo activar el botón de pánico y buscar un lugar seguro. ¿Te ayudo a contactar a alguien de confianza?';
    }
    if (t.includes('seguimiento') || t.includes('me siguen')) {
      return 'Mantén la calma. ¿Quieres que te muestre rutas seguras o avisar a tu red de apoyo? Estoy aquí contigo.';
    }
    if (t.includes('ayuda')) {
      return '¿Quieres que te guíe para usar el botón de pánico, contactar a tu red de apoyo o ver recursos de seguridad?';
    }
    if (t.includes('sola')) {
      return 'Recuerda que no estás sola. Puedes contactar a tu red de apoyo en cualquier momento desde la app.';
    }
    if (t.includes('gracias')) {
      return '¡Para eso estoy! Si necesitas algo más, solo dime.';
    }
    // Respuesta genérica empática
    return 'Estoy aquí para apoyarte. Cuéntame cómo te puedo ayudar o si quieres que te recomiende recursos de seguridad.';
  }
})();
