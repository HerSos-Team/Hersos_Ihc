/**
 * Sistema de Botón de Pánico - HerSOS
 * Modal fullscreen con activación por presión prolongada
 */

(function() {
  'use strict';

  // Estado del sistema de pánico
  let panicState = {
    isActive: false,
    isPressing: false,
    pressTimer: null,
    countdown: 3
  };

  // Elementos del DOM
  const panicModal = document.getElementById('panicModal');
  const panicCardBtn = document.querySelector('[data-action="panic"]');
  const panicMainButton = document.getElementById('panicMainButton');
  const panicTimer = document.getElementById('panicTimer');
  const panicStatusText = document.getElementById('panicStatusText');
  const closePanicModal = document.getElementById('closePanicModal');
  
  // Elementos de Alerta Activa
  const alertActiveModal = document.getElementById('alertActiveModal');
  const cancelAlertBtn = document.getElementById('cancelAlertBtn');
  const call911Btn = document.getElementById('call911Btn');
  const alertActiveTime = document.getElementById('alertActiveTime');
  const alertDuration = document.getElementById('alertDuration');
  const alertAddress = document.getElementById('alertAddress');

  // Variables de tiempo
  let alertStartTime = null;
  let durationInterval = null;
  let alertMap = null;
  let alertMarker = null;
  let currentAlertId = null;

  // Helpers: storage
  function loadAlerts() {
    try {
      return JSON.parse(localStorage.getItem('hersos_alert_history') || '[]');
    } catch { return []; }
  }

  function saveAlerts(list) {
    localStorage.setItem('hersos_alert_history', JSON.stringify(list));
  }

  function createAlertRecord(partial) {
    const list = loadAlerts();
    list.unshift(partial);
    saveAlerts(list);
  }

  function updateAlertRecord(id, update) {
    const list = loadAlerts();
    const idx = list.findIndex(a => a.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...update };
      saveAlerts(list);
    }
  }
  
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

  // Abrir modal
  function openPanicModal() {
    if (panicModal) {
      panicModal.classList.add('active');
      panicModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  // Cerrar modal
  function closePanicModalView() {
    if (panicModal) {
      panicModal.classList.remove('active');
      panicModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      resetPanicButton();
    }
  }

  // Resetear botón
  function resetPanicButton() {
    if (panicMainButton) {
      panicMainButton.classList.remove('pressing');
    }
    if (panicTimer) {
      panicTimer.style.display = 'none';
    }
    if (panicStatusText) {
      panicStatusText.textContent = 'Alerta: Ctrl + Shift + P';
    }
    panicState.isPressing = false;
    panicState.countdown = 3;
    panicState.isActive = false;
    clearInterval(panicState.pressTimer);
  }

  // Iniciar cuenta regresiva
  function startCountdown() {
    panicState.isPressing = true;
    panicState.countdown = 3;
    
    if (panicMainButton) {
      panicMainButton.classList.add('pressing');
    }
    if (panicTimer) {
      panicTimer.style.display = 'block';
      panicTimer.textContent = panicState.countdown;
    }
    if (panicStatusText) {
      panicStatusText.textContent = 'Manteniendo presionado...';
    }

    panicState.pressTimer = setInterval(() => {
      panicState.countdown--;
      
      if (panicTimer) {
        panicTimer.textContent = panicState.countdown;
      }
      
      if (panicState.countdown <= 0) {
        activatePanic();
      }
    }, 1000);
  }

  // Cancelar cuenta regresiva
  function cancelCountdown() {
    if (panicState.isPressing) {
      clearInterval(panicState.pressTimer);
      if (panicMainButton) {
        panicMainButton.classList.remove('pressing');
      }
      if (panicTimer) {
        panicTimer.style.display = 'none';
      }
      if (panicStatusText && !panicState.isActive) {
        panicStatusText.textContent = 'Alerta: Ctrl + Shift + P';
      }
      panicState.isPressing = false;
      panicState.countdown = 3;
    }
  }

  // Activar pánico
  function activatePanic() {
    clearInterval(panicState.pressTimer);
    panicState.isActive = true;
    panicState.isPressing = false;
    
    playAlertSound();
    
    if (panicStatusText) {
      panicStatusText.textContent = '🚨 ¡ALERTA ACTIVADA!';
    }
    if (panicTimer) {
      panicTimer.style.display = 'none';
    }

    // Registrar alerta en almacenamiento
    currentAlertId = 'alert_' + Date.now();
    const alertData = {
      id: currentAlertId,
      status: 'activa',
      timestamp: new Date().toISOString(),
      type: 'Botón de Pánico Manual',
      address: 'Obteniendo ubicación...',
      coords: null,
      notified: 3
    };
    createAlertRecord(alertData);
    
    // Mostrar confirmación temporal
    setTimeout(() => {
      if (panicStatusText) {
        panicStatusText.textContent = '✅ Contactos notificados';
      }
      
      // Transición a vista de Alerta Activa
      setTimeout(() => {
        showAlertActiveView();
      }, 1500);
    }, 1000);
  }

  // Mostrar vista de Alerta Activa
  function showAlertActiveView() {
    // Cerrar modal de pánico
    if (panicModal) {
      panicModal.classList.remove('active');
      panicModal.setAttribute('aria-hidden', 'true');
    }

    // Abrir modal de alerta activa
    if (alertActiveModal) {
      alertActiveModal.style.display = 'flex';
      alertActiveModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      // Iniciar reloj y contador de duración
      alertStartTime = new Date();
      updateAlertTime();
      
      durationInterval = setInterval(() => {
        updateAlertDuration();
        updateTimelineTimes();
      }, 1000);

      // Inicializar mapa
      setTimeout(() => {
        initAlertMap();
      }, 300);

      // Simular obtención de ubicación
      if (alertAddress) {
        setTimeout(() => {
          alertAddress.innerHTML = `
            Av. Insurgentes Sur 458<br>
            Roma Norte, Ciudad de México, 06700<br>
            <span class="location-coords">19.4326° N, 99.1332° W</span>
          `;
          updateAlertRecord(currentAlertId, { address: 'Av. Insurgentes Sur 458, Roma Norte, Ciudad de México 06700' });
        }, 800);
      }
    }
  }

  // Actualiza las horas del timeline según offset
  function updateTimelineTimes() {
    if (!alertStartTime) return;
    const items = document.querySelectorAll('#alertActiveModal .timeline-item');
    items.forEach((item) => {
      const offsetSec = parseInt(item.getAttribute('data-offset') || '0', 10);
      const timeEl = item.querySelector('.timeline-time');
      if (!timeEl) return;
      const t = new Date(alertStartTime.getTime() + offsetSec * 1000);
      timeEl.textContent = t.toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    });
  }

  // Inicializar mapa de alerta
  function initAlertMap() {
    const mapContainer = document.getElementById('alertMap');
    if (!mapContainer || typeof L === 'undefined') return;

    // Coordenadas por defecto (Ciudad de México - Roma Norte)
    const defaultLat = 19.4326;
    const defaultLng = -99.1332;

    // Crear mapa
    alertMap = L.map('alertMap', {
      zoomControl: true,
      attributionControl: false
    }).setView([defaultLat, defaultLng], 16);

    // Capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(alertMap);

    // Icono personalizado para el marcador
    const customIcon = L.divIcon({
      className: 'custom-alert-marker',
      html: '<div style="background: linear-gradient(135deg, #FF1964, #D81B60); width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; box-shadow: 0 4px 12px rgba(255,25,100,0.5); border: 4px solid white; font-size: 20px;">📍</div>',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    // Agregar marcador
    alertMarker = L.marker([defaultLat, defaultLng], { icon: customIcon })
      .addTo(alertMap)
      .bindPopup('<strong style="color: #D81B60;">📍 Tu Ubicación Actual</strong><br>Alerta activada desde aquí')
      .openPopup();

    // Círculo de precisión (48 metros)
    L.circle([defaultLat, defaultLng], {
      color: '#FF1964',
      fillColor: '#FF1964',
      fillOpacity: 0.15,
      radius: 48,
      weight: 2
    }).addTo(alertMap);

    // Intentar obtener ubicación real del usuario
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = position.coords.accuracy;

          // Actualizar mapa con ubicación real
          alertMap.setView([lat, lng], 16);
          alertMarker.setLatLng([lat, lng]);
          
          // Actualizar dirección
          if (alertAddress) {
            alertAddress.innerHTML = `
              <em>Obteniendo dirección exacta...</em><br>
              <span class="location-coords">${lat.toFixed(6)}° N, ${lng.toFixed(6)}° W</span>
            `;

            // Reverse geocoding usando Nominatim
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
              .then(res => res.json())
              .then(data => {
                if (data.address && alertAddress) {
                  const addr = data.address;
                  const street = addr.road || addr.pedestrian || '';
                  const number = addr.house_number || '';
                  const neighborhood = addr.neighbourhood || addr.suburb || '';
                  const city = addr.city || addr.town || addr.village || '';
                  const postcode = addr.postcode || '';

                  alertAddress.innerHTML = `
                    ${street} ${number}<br>
                    ${neighborhood}, ${city}${postcode ? ', ' + postcode : ''}<br>
                    <span class="location-coords">${lat.toFixed(6)}° N, ${lng.toFixed(6)}° W</span>
                  `;
                  updateAlertRecord(currentAlertId, {
                    address: `${street} ${number}, ${neighborhood}, ${city} ${postcode}`.trim(),
                    coords: { lat, lng }
                  });
                }
              })
              .catch(() => {
                // Mantener coordenadas si falla geocoding
              });
          }

          // Actualizar círculo de precisión
          L.circle([lat, lng], {
            color: '#FF1964',
            fillColor: '#FF1964',
            fillOpacity: 0.15,
            radius: accuracy,
            weight: 2
          }).addTo(alertMap);

          // Actualizar popup
          alertMarker.bindPopup(`<strong style="color: #D81B60;">📍 Tu Ubicación Actual</strong><br>Precisión: ±${Math.round(accuracy)}m`).openPopup();
        },
        (error) => {
          console.log('Error obteniendo ubicación:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }
  }

  // Actualizar hora de la alerta
  function updateAlertTime() {
    if (alertActiveTime && alertStartTime) {
      const timeStr = alertStartTime.toLocaleTimeString('es-PE', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      });
      alertActiveTime.textContent = timeStr;
    }
  }

  // Actualizar duración de la alerta
  function updateAlertDuration() {
    if (alertDuration && alertStartTime) {
      const now = new Date();
      const diffMs = now - alertStartTime;
      const minutes = Math.floor(diffMs / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);
      alertDuration.textContent = `Activa hace: ${minutes} min ${seconds} seg`;
    }
  }

  // Cerrar vista de Alerta Activa
  function closeAlertActiveView() {
    if (alertActiveModal) {
      alertActiveModal.style.display = 'none';
      alertActiveModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    
    // Destruir mapa si existe
    if (alertMap) {
      alertMap.remove();
      alertMap = null;
      alertMarker = null;
    }
    
    clearInterval(durationInterval);
    alertStartTime = null;
    panicState.isActive = false;
    resetPanicButton();
    // Marcar alerta como resuelta en historial
    if (currentAlertId) {
      updateAlertRecord(currentAlertId, {
        status: 'resuelta',
        closedAt: new Date().toISOString()
      });
      currentAlertId = null;
    }
  }

  // Mostrar toast
  function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = 'toast show ' + type;
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }

  // Event Listeners
  
  // Click en tarjeta de pánico para abrir modal
  if (panicCardBtn) {
    panicCardBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openPanicModal();
    });
  }

  // Botón principal de pánico (presión prolongada)
  if (panicMainButton) {
    // Mouse events
    panicMainButton.addEventListener('mousedown', () => {
      if (!panicState.isActive) {
        startCountdown();
      }
    });
    
    panicMainButton.addEventListener('mouseup', () => {
      cancelCountdown();
    });
    
    panicMainButton.addEventListener('mouseleave', () => {
      cancelCountdown();
    });
    
    // Touch events para móvil
    panicMainButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (!panicState.isActive) {
        startCountdown();
      }
    });
    
    panicMainButton.addEventListener('touchend', (e) => {
      e.preventDefault();
      cancelCountdown();
    });
    
    panicMainButton.addEventListener('touchcancel', () => {
      cancelCountdown();
    });
  }

  // Botón cerrar modal
  if (closePanicModal) {
    closePanicModal.addEventListener('click', closePanicModalView);
  }

  // Botón cancelar alerta activa
  if (cancelAlertBtn) {
    cancelAlertBtn.addEventListener('click', () => {
      if (confirm('¿Estás segura de cancelar la alerta activa? Tus contactos serán notificados.')) {
        closeAlertActiveView();
        showToast('Alerta cancelada. Contactos notificados.', 'info');
        // Redirigir a historial para verificar registro
        setTimeout(() => { window.location.href = 'historial.html'; }, 600);
      }
    });
  }

  // Botón llamar 911
  if (call911Btn) {
    call911Btn.addEventListener('click', () => {
      window.location.href = 'tel:911';
    });
  }

  // Cerrar con ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panicModal && panicModal.classList.contains('active')) {
      closePanicModalView();
    }
  });

  // Atajo de teclado: Ctrl + Shift + P
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'P') {
      e.preventDefault();
      if (panicModal && !panicModal.classList.contains('active')) {
        openPanicModal();
      }
    }
  });

  console.log('✓ Sistema de Pánico HerSOS inicializado');

  // Hook: abrir modal desde sidebar/nav
  const openPanicFromSidebar = document.getElementById('openPanicFromSidebar');
  if (openPanicFromSidebar) {
    openPanicFromSidebar.addEventListener('click', (e) => { e.preventDefault(); openPanicModal(); });
  }

  // Hook: bottom nav panic button
  const panicFooterBtn = document.getElementById('panicBtn');
  if (panicFooterBtn) {
    panicFooterBtn.addEventListener('click', (e) => { e.preventDefault(); openPanicModal(); });
  }

  // Open via URL hash
  if (window.location.hash === '#panic') {
    setTimeout(() => openPanicModal(), 50);
  }
})();
