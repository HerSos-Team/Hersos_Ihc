/**
 * Sistema de Botón de Pánico - HerSOS (Versión Simplificada)
 * Click simple para abrir el modal
 */

(function() {
  'use strict';

  // Estado del sistema de pánico
  let panicState = {
    isActive: false,
    alertQueue: [],
    userPIN: '1234',
    primaryContact: '+51987654321'
  };

  // Elementos del DOM
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
  
  // Audio de alerta
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
      
      oscillator.frequency.value = 523.25;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      console.log('Audio no disponible');
    }
  }

  // Obtener ubicación
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

  // Simular envío
  function sendAlert(alertData) {
    return new Promise((resolve, reject) => {
      const hasConnection = Math.random() > 0.2;
      
      setTimeout(() => {
        if (hasConnection) {
          resolve({ success: true, message: 'Alerta enviada exitosamente' });
        } else {
          reject({ success: false, message: 'Sin conexión a internet' });
        }
      }, 2000);
    });
  }

  // Guardar en cola
  function saveToQueue(alertData) {
    const queueItem = {
      ...alertData,
      status: 'pending',
      queuedAt: new Date().toISOString()
    };
    
    panicState.alertQueue.push(queueItem);
    localStorage.setItem('hersosAlertQueue', JSON.stringify(panicState.alertQueue));
  }

  // Reenviar alertas
  function retryQueuedAlerts() {
    const queue = panicState.alertQueue.filter(item => item.status === 'pending');
    
    if (queue.length === 0) return;
    
    queue.forEach(async (alert, index) => {
      try {
        const result = await sendAlert(alert);
        if (result.success) {
          panicState.alertQueue[index].status = 'sent';
          panicState.alertQueue[index].sentAt = new Date().toISOString();
          localStorage.setItem('hersosAlertQueue', JSON.stringify(panicState.alertQueue));
          playSuccessSound();
          if (window.showToast) window.showToast('✅ Alerta pendiente enviada', 'success');
        }
      } catch (error) {
        console.log('Aún sin conexión');
      }
    });
  }

  // Mostrar modal
  function openPanicModal() {
    if (!panicModal) {
      console.error('Modal de pánico no encontrado');
      return;
    }
    panicModal.classList.add('active');
    panicModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  // Cerrar modal
  function closePanicModal() {
    if (!panicModal) return;
    panicModal.classList.remove('active');
    panicModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    cancelForm.style.display = 'none';
    pinInput.value = '';
    progressFill.className = 'panic-progress-fill';
  }

  // Actualizar UI
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

  // Activar pánico
  async function activatePanic() {
    if (panicState.isActive) return;
    
    panicState.isActive = true;
    playAlertSound();
    openPanicModal();
    
    // Hora
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    
    // Ubicación
    updateModalUI('sending', 'Obteniendo tu ubicación...');
    const location = await getCurrentLocation();
    locationEl.textContent = location;
    
    // Datos
    const alertData = {
      timestamp: now.toISOString(),
      location: location,
      message: '🚨 ALERTA DE EMERGENCIA: Necesito ayuda urgente',
      userId: sessionStorage.getItem('hersosUser') || 'Usuario',
      type: 'panic'
    };
    
    // Enviar
    updateModalUI('sending', 'Enviando alerta a tus contactos de confianza...');
    
    try {
      const result = await sendAlert(alertData);
      
      if (result.success) {
        updateModalUI('sent', '✅ Alerta enviada exitosamente a tus contactos');
        playSuccessSound();
        if (window.showToast) window.showToast('Alerta enviada. Tus contactos han sido notificados.', 'success');
      }
    } catch (error) {
      updateModalUI('offline', '⚠️ Sin conexión. Alerta guardada para reenviar.');
      saveToQueue(alertData);
      if (window.showToast) window.showToast('Sin conexión. La alerta se enviará cuando regrese la señal.', 'warning');
      
      const retryInterval = setInterval(() => {
        if (navigator.onLine) {
          retryQueuedAlerts();
          clearInterval(retryInterval);
        }
      }, 5000);
    }
  }

  // Cancelación
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
      if (window.showToast) window.showToast('Alerta cancelada exitosamente', 'info');
      closePanicModal();
    } else {
      if (window.showToast) window.showToast('❌ PIN incorrecto. Intenta nuevamente.', 'error');
      pinInput.value = '';
      pinInput.focus();
    }
  }

  // Event Listeners - CLICK SIMPLE (sin mantener presionado)
  
  // Botón de pánico en el grid principal
  const panicCardBtn = document.querySelector('[data-action="panic"]');
  if (panicCardBtn) {
    panicCardBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Botón de pánico clickeado');
      activatePanic();
    });
  }

  // Botón en navegación inferior
  const panicBtn = document.getElementById('panicBtn');
  if (panicBtn) {
    panicBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Botón de pánico (nav) clickeado');
      activatePanic();
    });
  }

  // Llamar a policía
  if (callPoliceBtn) {
    callPoliceBtn.addEventListener('click', () => {
      window.location.href = 'tel:105';
    });
  }

  // Llamar a contacto
  if (callContactBtn) {
    callContactBtn.addEventListener('click', () => {
      window.location.href = `tel:${panicState.primaryContact}`;
    });
  }

  // Cancelar
  if (cancelBtn) {
    cancelBtn.addEventListener('click', showCancelForm);
  }

  if (confirmCancelBtn) {
    confirmCancelBtn.addEventListener('click', confirmCancellation);
  }

  if (backBtn) {
    backBtn.addEventListener('click', hideCancelForm);
  }

  if (pinInput) {
    pinInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        confirmCancellation();
      }
    });
  }

  // Cerrar modal al hacer clic fuera (solo si ya fue enviado)
  if (panicModal) {
    panicModal.addEventListener('click', (e) => {
      if (e.target === panicModal && progressFill.classList.contains('sent')) {
        closePanicModal();
        panicState.isActive = false;
      }
    });
  }

  // Cargar cola pendiente
  window.addEventListener('load', () => {
    const savedQueue = localStorage.getItem('hersosAlertQueue');
    if (savedQueue) {
      panicState.alertQueue = JSON.parse(savedQueue);
      if (navigator.onLine) {
        retryQueuedAlerts();
      }
    }
  });

  // Listeners de conexión
  window.addEventListener('online', () => {
    console.log('Conexión restaurada');
    retryQueuedAlerts();
  });

  window.addEventListener('offline', () => {
    console.log('Conexión perdida');
  });

  console.log('✓ Sistema de Pánico HerSOS inicializado');
  console.log('✓ Modal de pánico:', panicModal ? 'encontrado' : 'NO ENCONTRADO');
  console.log('✓ Botón grid:', panicCardBtn ? 'encontrado' : 'NO ENCONTRADO');
  console.log('✓ Botón nav:', panicBtn ? 'encontrado' : 'NO ENCONTRADO');
})();
