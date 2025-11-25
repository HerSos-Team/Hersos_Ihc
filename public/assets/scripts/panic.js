/**
 * Sistema de Botón de Pánico - HerSOS
 * Implementa el flujo completo de activación, envío, gestión offline y cancelación
 */

(function() {
  'use strict';

  // Estado del sistema de pánico
  let panicState = {
    isActive: false,
    alertQueue: [], // Cola de alertas pendientes
    userPIN: '1234', // PIN de seguridad (en producción vendría del perfil)
    primaryContact: '+51987654321' // Contacto principal
  };

  // Elementos del DOM
  const panicBtn = document.getElementById('panicBtn');
  const panicCardBtn = document.querySelector('[data-action="panic"]');
  const panicModal = document.getElementById('panicModal');
  const statusMessage = document.getElementById('panicStatusMessage');
  const progressFill = document.querySelector('.panic-progress-fill');
  const locationEl = document.getElementById('panicLocation');
  const timeEl = document.getElementById('panicTime');
  const connectionStatusEl = document.getElementById('panicConnectionStatus');
  
  // Botones de acción
  const callPoliceBtn = document.getElementById('panicCallPolice');
  const callContactBtn = document.getElementById('panicCallContact');
  const cancelBtn = document.getElementById('panicCancelBtn');
  const confirmCancelBtn = document.getElementById('panicConfirmCancel');
  const backBtn = document.getElementById('panicBackBtn');
  
  // Formulario de cancelación
  const cancelForm = document.getElementById('panicCancelForm');
  const pinInput = document.getElementById('panicPinInput');
  
  // Audio de alerta (simulado con Web Audio API)
  function playAlertSound() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.log('Audio no disponible');
    }
  }

  // Sonido de confirmación
  function playSuccessSound() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 523.25; // C5
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      console.log('Audio no disponible');
    }
  }

  // Obtener ubicación actual
  function getCurrentLocation() {
    return new Promise((resolve) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude.toFixed(6);
            const lng = position.coords.longitude.toFixed(6);
            resolve(`${lat}, ${lng}`);
          },
          () => {
            resolve('Ubicación no disponible');
          },
          { timeout: 5000 }
        );
      } else {
        resolve('GPS no soportado');
      }
    });
  }

  // Simular envío de alerta (con posibilidad de fallo)
  function sendAlert(alertData) {
    return new Promise((resolve, reject) => {
      // Simular verificación de conexión (20% de probabilidad de fallo)
      const hasConnection = Math.random() > 0.2;
      
      setTimeout(() => {
        if (hasConnection) {
          resolve({ success: true, message: 'Alerta enviada exitosamente' });
        } else {
          reject({ success: false, message: 'Sin conexión a internet' });
        }
      }, 2000); // Simular latencia de red
    });
  }

  // Guardar alerta en cola local
  function saveToQueue(alertData) {
    const queueItem = {
      ...alertData,
      status: 'pending',
      queuedAt: new Date().toISOString()
    };
    
    panicState.alertQueue.push(queueItem);
    localStorage.setItem('hersosAlertQueue', JSON.stringify(panicState.alertQueue));
    
    console.log('Alerta guardada en cola:', queueItem);
  }

  // Reenviar alertas pendientes
  function retryQueuedAlerts() {
    const queue = panicState.alertQueue.filter(item => item.status === 'pending');
    
    if (queue.length === 0) return;
    
    console.log(`Reenviando ${queue.length} alertas pendientes...`);
    
    queue.forEach(async (alert, index) => {
      try {
        const result = await sendAlert(alert);
        if (result.success) {
          panicState.alertQueue[index].status = 'sent';
          panicState.alertQueue[index].sentAt = new Date().toISOString();
          localStorage.setItem('hersosAlertQueue', JSON.stringify(panicState.alertQueue));
          playSuccessSound();
          showToast('✅ Alerta pendiente enviada', 'success');
        }
      } catch (error) {
        console.log('Aún sin conexión para reenvío');
      }
    });
  }

  // Mostrar modal de pánico
  function openPanicModal() {
    panicModal.classList.add('active');
    panicModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  // Cerrar modal de pánico
  function closePanicModal() {
    panicModal.classList.remove('active');
    panicModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    // Resetear estado
    cancelForm.style.display = 'none';
    pinInput.value = '';
    progressFill.className = 'panic-progress-fill';
  }

  // Actualizar UI del modal
  function updateModalUI(status, message) {
    statusMessage.textContent = message;
    
    progressFill.className = 'panic-progress-fill';
    
    switch(status) {
      case 'sending':
        progressFill.classList.add('sending');
        connectionStatusEl.textContent = 'Enviando...';
        connectionStatusEl.style.color = '#FFA726';
        break;
      case 'sent':
        progressFill.classList.add('sent');
        connectionStatusEl.textContent = '✓ Enviado';
        connectionStatusEl.style.color = '#4CAF50';
        break;
      case 'offline':
        progressFill.classList.add('offline');
        connectionStatusEl.textContent = '⚠ Sin conexión';
        connectionStatusEl.style.color = '#FF6B6B';
        break;
      default:
        connectionStatusEl.textContent = 'Conectado';
    }
  }

  // Mostrar toast de notificación
  function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = 'toast show ' + type;
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }

  // Activar botón de pánico
  async function activatePanic() {
    if (panicState.isActive) return;
    
    panicState.isActive = true;
    playAlertSound();
    openPanicModal();
    
    // Actualizar hora
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    
    // Obtener ubicación
    updateModalUI('sending', 'Obteniendo tu ubicación...');
    const location = await getCurrentLocation();
    locationEl.textContent = location;
    
    // Crear datos de alerta
    const alertData = {
      timestamp: now.toISOString(),
      location: location,
      message: '🚨 ALERTA DE EMERGENCIA: Necesito ayuda urgente',
      userId: sessionStorage.getItem('hersosUser') || 'Usuario',
      type: 'panic'
    };
    
    // Intentar enviar
    updateModalUI('sending', 'Enviando alerta a tus contactos de confianza...');
    
    try {
      const result = await sendAlert(alertData);
      
      if (result.success) {
        updateModalUI('sent', '✅ Alerta enviada exitosamente a tus contactos');
        playSuccessSound();
        showToast('Alerta enviada. Tus contactos han sido notificados.', 'success');
      }
    } catch (error) {
      // Sin conexión - guardar en cola
      updateModalUI('offline', '⚠️ Sin conexión. Alerta guardada para reenviar.');
      saveToQueue(alertData);
      showToast('Sin conexión. La alerta se enviará cuando regrese la señal.', 'warning');
      
      // Intentar reenvío periódico
      const retryInterval = setInterval(() => {
        if (navigator.onLine) {
          retryQueuedAlerts();
          clearInterval(retryInterval);
        }
      }, 5000);
    }
  }

  // Cancelar alerta
  function showCancelForm() {
    cancelForm.style.display = 'block';
    pinInput.focus();
  }

  function hideCancelForm() {
    cancelForm.style.display = 'none';
    pinInput.value = '';
  }

  function confirmCancellation() {
    const enteredPIN = pinInput.value.trim();
    
    if (enteredPIN === panicState.userPIN) {
      panicState.isActive = false;
      showToast('Alerta cancelada exitosamente', 'info');
      closePanicModal();
    } else {
      showToast('❌ PIN incorrecto. Intenta nuevamente.', 'error');
      pinInput.value = '';
      pinInput.focus();
    }
  }

  // Event Listeners
  if (panicBtn) {
    let holdTimer;
    
    panicBtn.addEventListener('mousedown', () => {
      holdTimer = setTimeout(() => {
        activatePanic();
      }, 3000); // 3 segundos de mantener presionado
    });
    
    panicBtn.addEventListener('mouseup', () => {
      clearTimeout(holdTimer);
    });
    
    panicBtn.addEventListener('mouseleave', () => {
      clearTimeout(holdTimer);
    });
    
    // Para móvil
    panicBtn.addEventListener('touchstart', () => {
      holdTimer = setTimeout(() => {
        activatePanic();
      }, 3000);
    });
    
    panicBtn.addEventListener('touchend', () => {
      clearTimeout(holdTimer);
    });
  }

  // Botón de pánico en el grid principal
  if (panicCardBtn) {
    let holdTimer;
    
    panicCardBtn.addEventListener('mousedown', () => {
      holdTimer = setTimeout(() => {
        activatePanic();
      }, 3000);
    });
    
    panicCardBtn.addEventListener('mouseup', () => {
      clearTimeout(holdTimer);
    });
    
    panicCardBtn.addEventListener('mouseleave', () => {
      clearTimeout(holdTimer);
    });
    
    // Para móvil
    panicCardBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      holdTimer = setTimeout(() => {
        activatePanic();
      }, 3000);
    });
    
    panicCardBtn.addEventListener('touchend', () => {
      clearTimeout(holdTimer);
    });
  }

  // Llamar a la policía
  if (callPoliceBtn) {
    callPoliceBtn.addEventListener('click', () => {
      window.location.href = 'tel:105';
    });
  }

  // Llamar a contacto de confianza
  if (callContactBtn) {
    callContactBtn.addEventListener('click', () => {
      window.location.href = `tel:${panicState.primaryContact}`;
    });
  }

  // Mostrar formulario de cancelación
  if (cancelBtn) {
    cancelBtn.addEventListener('click', showCancelForm);
  }

  // Confirmar cancelación
  if (confirmCancelBtn) {
    confirmCancelBtn.addEventListener('click', confirmCancellation);
  }

  // Volver desde formulario de cancelación
  if (backBtn) {
    backBtn.addEventListener('click', hideCancelForm);
  }

  // Enter en input de PIN
  if (pinInput) {
    pinInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        confirmCancellation();
      }
    });
  }

  // Cargar cola de alertas pendientes al iniciar
  window.addEventListener('load', () => {
    const savedQueue = localStorage.getItem('hersosAlertQueue');
    if (savedQueue) {
      panicState.alertQueue = JSON.parse(savedQueue);
      
      // Intentar reenviar si hay conexión
      if (navigator.onLine) {
        retryQueuedAlerts();
      }
    }
  });

  // Listener de reconexión
  window.addEventListener('online', () => {
    console.log('Conexión restaurada. Reenviando alertas pendientes...');
    retryQueuedAlerts();
  });

  window.addEventListener('offline', () => {
    console.log('Conexión perdida. Las alertas se guardarán localmente.');
  });

  // Cerrar modal al hacer clic fuera
  panicModal.addEventListener('click', (e) => {
    if (e.target === panicModal) {
      // Solo permitir cerrar si la alerta ya fue enviada
      if (progressFill.classList.contains('sent')) {
        closePanicModal();
        panicState.isActive = false;
      }
    }
  });

  console.log('Sistema de Pánico HerSOS inicializado ✓');
})();
