// Chatbot Empático Hersos - Fullscreen Version
(function () {
  const chatbot = document.getElementById('hersosChatbot');
  const form = document.getElementById('chatbotForm');
  const input = document.getElementById('chatbotInput');
  const messages = document.getElementById('chatbotMessages');
  const closeBtn = document.getElementById('closeChatbot');
  const toggleHistoryBtn = document.getElementById('toggleChatHistory');
  const chatHistory = document.getElementById('chatHistory');
  const newChatBtn = document.getElementById('newChatBtn');
  const chatHistoryList = document.getElementById('chatHistoryList');
  
  // Botones para abrir el chat
  const chatCardBtn = document.querySelector('[data-action="chat"]');
  const chatSideBtn = document.querySelector('[data-nav="chat"]');

  if (!form || !input || !messages || !chatbot) {
    console.warn('Elementos del chatbot no encontrados');
    return;
  }

  // Estado del chat
  let currentChatId = null;
  let chatSessions = loadChatSessions();

  // Cargar sesiones de chat desde localStorage
  function loadChatSessions() {
    try {
      const saved = localStorage.getItem('hersos_chat_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  // Guardar sesiones de chat
  function saveChatSessions() {
    try {
      localStorage.setItem('hersos_chat_sessions', JSON.stringify(chatSessions));
    } catch (e) {
      console.error('Error guardando chats:', e);
    }
  }

  // Crear nueva sesión de chat
  function createNewChat() {
    const chatId = Date.now();
    const newChat = {
      id: chatId,
      title: 'Nueva conversación',
      messages: [{
        text: '¡Hola! Soy Luna, tu asistente de apoyo empático. Estoy aquí para escucharte y ayudarte. ¿Cómo te sientes hoy?',
        type: 'bot',
        timestamp: new Date().toISOString()
      }],
      createdAt: new Date().toISOString(),
      lastMessage: new Date().toISOString()
    };
    chatSessions.unshift(newChat);
    saveChatSessions();
    loadChat(chatId);
    renderChatHistory();
  }

  // Cargar un chat específico
  function loadChat(chatId) {
    currentChatId = chatId;
    const chat = chatSessions.find(c => c.id === chatId);
    if (!chat) return;

    messages.innerHTML = '';
    chat.messages.forEach(msg => {
      addMessage(msg.text, msg.type, false);
    });
    messages.scrollTop = messages.scrollHeight;
    renderChatHistory();
  }

  // Renderizar historial de chats
  function renderChatHistory() {
    chatHistoryList.innerHTML = '';
    chatSessions.forEach(chat => {
      const item = document.createElement('div');
      item.className = 'history-item' + (chat.id === currentChatId ? ' active' : '');
      const lastMsg = chat.messages[chat.messages.length - 1];
      const preview = lastMsg ? lastMsg.text.substring(0, 50) : 'Sin mensajes';
      const date = new Date(chat.lastMessage).toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short' 
      });
      
      item.innerHTML = `
        <div class="history-item-content">
          <div class="history-item-title">${chat.title}</div>
          <div class="history-item-preview">${preview}${preview.length >= 50 ? '...' : ''}</div>
          <div class="history-item-date">${date}</div>
        </div>
        <button class="delete-chat-btn" data-chat-id="${chat.id}" title="Eliminar conversación">
          <span class="material-symbols-rounded">delete</span>
        </button>
      `;
      
      const content = item.querySelector('.history-item-content');
      const deleteBtn = item.querySelector('.delete-chat-btn');
      
      content.addEventListener('click', () => loadChat(chat.id));
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteChat(chat.id);
      });
      
      chatHistoryList.appendChild(item);
    });
  }

  // Eliminar chat
  function deleteChat(chatId) {
    if (chatSessions.length <= 1) {
      alert('No puedes eliminar tu última conversación');
      return;
    }
    
    if (confirm('¿Estás segura de eliminar esta conversación?')) {
      chatSessions = chatSessions.filter(c => c.id !== chatId);
      saveChatSessions();
      
      if (currentChatId === chatId) {
        loadChat(chatSessions[0].id);
      } else {
        renderChatHistory();
      }
    }
  }

  // Toggle panel de historial
  if (toggleHistoryBtn) {
    const toggleIcon = toggleHistoryBtn.querySelector('.toggle-icon');
    toggleHistoryBtn.addEventListener('click', () => {
      const isHidden = chatHistory.classList.toggle('hidden');
      toggleIcon.textContent = isHidden ? 'menu' : 'close';
      toggleHistoryBtn.title = isHidden ? 'Abrir historial' : 'Cerrar historial';
    });
  }

  // Nuevo chat
  if (newChatBtn) {
    newChatBtn.addEventListener('click', createNewChat);
  }

  // Abrir chatbot fullscreen
  function openChatbot() {
    if (chatSessions.length === 0) {
      createNewChat();
    } else if (!currentChatId) {
      loadChat(chatSessions[0].id);
    }
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
    addMessage(userText, 'user', true);
    input.value = '';

    // Animación de escribiendo…
    const typingMsg = addMessage('Luna está escribiendo…', 'typing', false);

    setTimeout(() => {
      typingMsg.remove();
      // Respuesta empática según contexto
      const reply = getBotReply(userText);
      addMessage(reply, 'bot', true);
      messages.scrollTop = messages.scrollHeight;
      
      // Actualizar título del chat si es el primer mensaje del usuario
      if (currentChatId) {
        const chat = chatSessions.find(c => c.id === currentChatId);
        if (chat && chat.messages.filter(m => m.type === 'user').length === 1) {
          chat.title = userText.substring(0, 30) + (userText.length > 30 ? '...' : '');
          renderChatHistory();
        }
      }
    }, 1200);
  });

  function addMessage(text, type, save = true) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chatbot-msg ' + type;
    msgDiv.textContent = text;
    messages.appendChild(msgDiv);
    messages.scrollTop = messages.scrollHeight;
    
    // Guardar mensaje en la sesión actual
    if (save && currentChatId) {
      const chat = chatSessions.find(c => c.id === currentChatId);
      if (chat) {
        chat.messages.push({
          text,
          type,
          timestamp: new Date().toISOString()
        });
        chat.lastMessage = new Date().toISOString();
        saveChatSessions();
      }
    }
    
    return msgDiv;
  }

  function getBotReply(text) {
    const t = text.toLowerCase();
    
    // Análisis de riesgo y estrés emocional
    const riskAnalysis = analyzeRisk(t);
    const emotionalSupport = getEmotionalSupport(riskAnalysis.stressLevel);
    
    // Situaciones de alto riesgo inmediato
    if (riskAnalysis.level === 'critical') {
      return buildResponse({
        actions: [
          '🚨 ACTIVA EL BOTÓN DE PÁNICO AHORA',
          'Si estás en peligro físico inmediato, llama al 911',
          'Dirígete a un lugar con gente si es posible',
          'Mantén tu teléfono contigo y con batería'
        ],
        emotional: 'Estoy contigo. Respira, estás haciendo lo correcto al pedir ayuda. Tu seguridad es lo primero.',
        priority: true
      });
    }
    
    // Situaciones de riesgo medio
    if (riskAnalysis.level === 'high') {
      return buildResponse({
        actions: [
          'Considera activar el botón de pánico si la situación empeora',
          'Contacta a tu red de apoyo de inmediato',
          'Busca un lugar seguro con más gente alrededor',
          'Mantente alerta y confía en tu instinto'
        ],
        emotional: 'Estoy aquí para ti. Tu intuición es valiosa, confía en ella. No estás sola en esto.',
        priority: false
      });
    }
    
    // Detección de ansiedad o estrés emocional
    if (riskAnalysis.stressLevel === 'high') {
      return buildResponse({
        actions: [
          'Respira: inhala por 4 segundos, sostén por 4, exhala por 4',
          'Contacta a alguien de confianza si necesitas compañía',
          'Usa el modo discreto si prefieres alertas silenciosas',
          'Revisa tus contactos de emergencia actualizados'
        ],
        emotional: 'La ansiedad que sientes es válida. Estás siendo valiente al expresarlo. Respira, estás haciendo lo correcto.',
        priority: false
      });
    }
    
    // Seguimiento o acoso
    if (t.includes('siguen') || t.includes('siguiendo') || t.includes('seguimiento')) {
      return buildResponse({
        actions: [
          'Dirígete a un lugar concurrido de inmediato',
          'Activa el modo discreto para alertar sin que se note',
          'Contacta a tu red de apoyo con tu ubicación',
          'Si persiste, considera activar el botón de pánico'
        ],
        emotional: 'Mantén la calma. Confía en tu instinto y actúa. Estás haciendo lo correcto al buscar ayuda.',
        priority: false
      });
    }
    
    // Consultas sobre funcionalidad del botón de pánico
    if (t.includes('pánico') || t.includes('panico') || t.includes('botón') || t.includes('emergencia')) {
      return buildResponse({
        actions: [
          'El botón de pánico envía tu ubicación exacta a tus contactos',
          'Se activa manteniendo presionado por 3 segundos',
          'Notifica automáticamente a tu red de apoyo',
          'Puedes activarlo desde el dashboard o menú principal'
        ],
        emotional: 'El botón de pánico está diseñado para protegerte. Úsalo sin dudar si te sientes en riesgo.',
        priority: false
      });
    }
    
    // Consultas sobre contactos
    if (t.includes('contacto') || t.includes('familia') || t.includes('amig') || t.includes('red de apoyo')) {
      return buildResponse({
        actions: [
          'Ve a "Mis Contactos" para gestionar tu red de apoyo',
          'Agrega al menos 3 contactos de confianza',
          'Verifica que sus números estén actualizados',
          'Ellos recibirán alertas cuando actives el pánico'
        ],
        emotional: 'Tu red de apoyo es tu fortaleza. Mantener contactos actualizados te da seguridad.',
        priority: false
      });
    }
    
    // Consultas sobre ubicación
    if (t.includes('ubicación') || t.includes('donde') || t.includes('mapa') || t.includes('gps')) {
      return buildResponse({
        actions: [
          'Revisa el mapa en el dashboard para ver tu ubicación',
          'Tu GPS debe estar activo para alertas precisas',
          'Puedes compartir tu ubicación con contactos de confianza',
          'El sistema guarda tu ubicación al activar alertas'
        ],
        emotional: 'Compartir tu ubicación con personas de confianza es un paso inteligente para tu seguridad.',
        priority: false
      });
    }
    
    // Bienestar y gratitud
    if (t.includes('gracias') || t.includes('thank')) {
      return 'Para eso estoy. Tu bienestar es mi prioridad. Si necesitas algo más, solo escríbeme.';
    }
    
    if (t.includes('bien') || t.includes('mejor') || t.includes('tranquil')) {
      return 'Me alegra mucho escuchar eso. Recuerda que siempre puedes contar conmigo cuando lo necesites.';
    }
    
    // Saludo inicial
    if (t.includes('hola') || t.includes('hi') || t.includes('hey')) {
      return '¡Hola! Soy Luna, tu asistente de apoyo. Estoy aquí para escucharte y ayudarte en lo que necesites. ¿Cómo te sientes hoy?';
    }
    
    // Situación no contemplada - Criterio de aceptación 2
    return buildResponse({
      actions: [
        'Contacta a un especialista o autoridad cercana',
        'Llama a líneas de ayuda profesional si necesitas orientación',
        'Puedo ayudarte con alertas de emergencia si te sientes en riesgo',
        'Mantén tu red de apoyo informada sobre tu situación'
      ],
      emotional: 'Estoy aquí para escucharte. Si tu situación requiere atención especializada, te recomiendo buscar ayuda profesional.',
      priority: false,
      professional: true
    });
  }
  
  // Analiza el nivel de riesgo basado en palabras clave
  function analyzeRisk(text) {
    const criticalKeywords = ['peligro', 'ayuda', 'auxilio', 'socorro', 'agresión', 'violencia', 'golpes', 'amenaza'];
    const highKeywords = ['acoso', 'miedo', 'asustada', 'nerviosa', 'insegura', 'persigue', 'sigue', 'siguen', 'siguiendo', 'seguimiento'];
    const stressKeywords = ['ansiedad', 'ansiosa', 'estrés', 'pánico', 'preocupada', 'sola', 'soledad'];
    
    let level = 'low';
    let stressLevel = 'low';
    
    // Detectar riesgo crítico
    if (criticalKeywords.some(keyword => text.includes(keyword))) {
      level = 'critical';
    }
    // Detectar riesgo alto
    else if (highKeywords.some(keyword => text.includes(keyword))) {
      level = 'high';
    }
    
    // Detectar nivel de estrés
    if (stressKeywords.some(keyword => text.includes(keyword))) {
      stressLevel = 'high';
    }
    
    return { level, stressLevel };
  }
  
  // Construye respuesta estructurada con acciones, apoyo emocional y contacto profesional
  function buildResponse({ actions, emotional, priority, professional = false }) {
    let response = '';
    
    // Bloque de acciones
    if (priority) {
      response += '⚠️ ACCIONES INMEDIATAS:\n\n';
    } else {
      response += '📋 ACCIONES RECOMENDADAS:\n\n';
    }
    
    actions.forEach((action, index) => {
      response += `${index + 1}. ${action}\n`;
    });
    
    response += '\n';
    
    // Bloque de apoyo emocional
    response += `💜 APOYO:\n${emotional}\n`;
    
    // Bloque de contacto profesional si aplica
    if (professional) {
      response += '\n🏥 Si tu situación requiere atención especializada, contacta:\n';
      response += '• Línea Nacional: 911\n';
      response += '• Centro de Atención a Víctimas: 089\n';
      response += '• O busca ayuda de un profesional cercano';
    }
    
    return response;
  }
  
  // Obtiene mensaje de apoyo emocional según nivel de estrés
  function getEmotionalSupport(stressLevel) {
    if (stressLevel === 'high') {
      return 'Estoy contigo. Respira, estás haciendo lo correcto al pedir ayuda.';
    }
    return 'Estoy aquí para apoyarte en lo que necesites.';
  }

  console.log('Chatbot Luna fullscreen inicializado ✓');
})();
