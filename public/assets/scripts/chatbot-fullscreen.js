// Chatbot Empático Hersos - Fullscreen Version
(function () {
  const chatbot = document.getElementById('hersosChatbot');
  const form = document.getElementById('chatbotForm');
  const input = document.getElementById('chatbotInput');
  const messages = document.getElementById('chatbotMessages');
  const closeBtn = document.getElementById('closeChatbot');
  
  // Botones para abrir el chat
  const chatCardBtn = document.querySelector('[data-action="chat"]');
  const chatSideBtn = document.querySelector('[data-nav="chat"]');

  if (!form || !input || !messages || !chatbot) {
    console.warn('Elementos del chatbot no encontrados');
    return;
  }

  // Abrir chatbot fullscreen
  function openChatbot() {
    chatbot.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    setTimeout(() => input.focus(), 100);
  }

  // Cerrar chatbot
  function closeChatbotView() {
    chatbot.style.display = 'none';
    document.body.style.overflow = '';
  }

  // Event listeners para abrir
  if (chatCardBtn) {
    chatCardBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openChatbot();
    });
  }

  if (chatSideBtn) {
    chatSideBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openChatbot();
    });
  }

  // Event listener para cerrar
  if (closeBtn) {
    closeBtn.addEventListener('click', closeChatbotView);
  }

  // Cerrar con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && chatbot.style.display === 'flex') {
      closeChatbotView();
    }
  });

  // Manejo del formulario
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
    
    // Respuestas empáticas basadas en palabras clave
    if (t.includes('miedo') || t.includes('nerviosa') || t.includes('asustada')) {
      return '💜 Entiendo que te sientas así. Respira profundo, estoy aquí para ayudarte. ¿Quieres que te recomiende rutas seguras o contactar a tu red de apoyo?';
    }
    
    if (t.includes('peligro') || t.includes('acoso') || t.includes('agresión') || t.includes('amenaza')) {
      return '🚨 Si te sientes en peligro inmediato, te recomiendo activar el botón de pánico. También puedo ayudarte a contactar a alguien de confianza. ¿Estás en un lugar seguro ahora?';
    }
    
    if (t.includes('seguimiento') || t.includes('me siguen') || t.includes('siguiendo')) {
      return '⚠️ Mantén la calma y dirígete a un lugar con más gente si es posible. ¿Quieres que active una alerta a tus contactos de confianza o que te muestre lugares seguros cercanos?';
    }
    
    if (t.includes('ayuda') || t.includes('auxilio') || t.includes('socorro')) {
      return '🤝 Estoy aquí para ti. Puedo ayudarte a:\n• Activar el botón de pánico\n• Contactar a tu red de apoyo\n• Mostrarte recursos de seguridad\n• Guiarte a un lugar seguro\n\n¿Qué necesitas?';
    }
    
    if (t.includes('sola') || t.includes('soledad') || t.includes('acompañ')) {
      return '💕 Recuerda que no estás sola. Tu red de apoyo está aquí para ti, y yo también. Puedes contactar a tus seres queridos en cualquier momento desde la app.';
    }
    
    if (t.includes('ansiedad') || t.includes('ansiosa') || t.includes('estrés')) {
      return '🌸 La ansiedad es válida y te comprendo. Intenta respirar: inhala por 4 segundos, sostén por 4, exhala por 4. ¿Te gustaría hablar sobre lo que te preocupa?';
    }
    
    if (t.includes('gracias') || t.includes('thank')) {
      return '😊 ¡Para eso estoy! Tu bienestar es mi prioridad. Si necesitas algo más, solo escríbeme.';
    }
    
    if (t.includes('bien') || t.includes('mejor') || t.includes('tranquil')) {
      return '💚 Me alegra mucho escuchar eso. Recuerda que siempre puedes contar conmigo cuando lo necesites.';
    }
    
    if (t.includes('pánico') || t.includes('panico') || t.includes('botón')) {
      return '🔴 El botón de pánico envía tu ubicación y una alerta a tus contactos de confianza inmediatamente. Lo puedes activar desde la pantalla principal o presionando el botón rojo. ¿Necesitas activarlo ahora?';
    }
    
    if (t.includes('contacto') || t.includes('familia') || t.includes('amig')) {
      return '👥 Puedes agregar y gestionar tus contactos de confianza desde la sección "Mis Contactos". Ellos recibirán alertas cuando actives el botón de pánico. ¿Te ayudo a configurarlos?';
    }
    
    if (t.includes('ubicación') || t.includes('donde') || t.includes('mapa')) {
      return '📍 Puedo mostrarte tu ubicación actual en el mapa y compartirla con tus contactos de confianza. También puedo ayudarte a encontrar rutas seguras. ¿Qué necesitas?';
    }
    
    if (t.includes('hola') || t.includes('hi') || t.includes('hey')) {
      return '👋 ¡Hola! Soy Luna, tu asistente de apoyo. Estoy aquí para escucharte y ayudarte en lo que necesites. ¿Cómo te sientes hoy?';
    }
    
    // Respuesta genérica empática
    return '💬 Estoy aquí para apoyarte en lo que necesites. Puedo ayudarte con:\n• Activar alertas de emergencia\n• Contactar a tu red de apoyo\n• Mostrarte recursos de seguridad\n• Simplemente escucharte\n\n¿En qué puedo ayudarte hoy?';
  }

  console.log('Chatbot Luna fullscreen inicializado ✓');
})();
