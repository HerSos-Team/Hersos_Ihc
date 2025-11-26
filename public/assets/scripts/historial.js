// Historial de Alertas - Functionality
document.addEventListener('DOMContentLoaded', () => {
  initializeFilters();
  initializeDetails();
  loadAlertHistory();
});

// Filter tabs functionality
function initializeFilters() {
  const filterTabs = document.querySelectorAll('.filter-tab');
  
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      filterTabs.forEach(t => t.classList.remove('active'));
      
      // Add active class to clicked tab
      tab.classList.add('active');
      
      // Get filter type
      const filter = tab.dataset.filter;
      
      // Apply filter
      filterAlerts(filter);
    });
  });
}

// Filter alerts based on selected tab
function filterAlerts(filter) {
  const alertCards = document.querySelectorAll('.alerta-card');
  
  alertCards.forEach(card => {
    const isActive = card.classList.contains('activa');
    const isResolved = card.classList.contains('resuelta');
    const alertDate = new Date(card.dataset.date);
    const currentMonth = new Date().getMonth();
    const alertMonth = alertDate.getMonth();
    
    let shouldShow = false;
    
    switch(filter) {
      case 'todas':
        shouldShow = true;
        break;
      case 'mes':
        shouldShow = (alertMonth === currentMonth);
        break;
      case 'resueltas':
        shouldShow = isResolved;
        break;
    }
    
    if (shouldShow) {
      card.style.display = 'block';
      card.style.animation = 'slideInUp 0.4s ease-out';
    } else {
      card.style.display = 'none';
    }
  });
  
  updateFilterCounts();
}

// Update filter counts
function updateFilterCounts() {
  const allAlerts = document.querySelectorAll('.alerta-card');
  const currentMonth = new Date().getMonth();
  
  let totalCount = allAlerts.length;
  let monthCount = 0;
  let resolvedCount = 0;
  
  allAlerts.forEach(card => {
    const alertDate = new Date(card.dataset.date);
    const alertMonth = alertDate.getMonth();
    
    if (alertMonth === currentMonth) {
      monthCount++;
    }
    
    if (card.classList.contains('resuelta')) {
      resolvedCount++;
    }
  });
  
  // Update tab labels
  document.querySelector('[data-filter="todas"] .count').textContent = `(${totalCount})`;
  document.querySelector('[data-filter="mes"] .count').textContent = `(${monthCount})`;
  document.querySelector('[data-filter="resueltas"] .count').textContent = `(${resolvedCount})`;
  
  // Update stats cards
  document.querySelector('.stat-card:nth-child(1) .stat-value').textContent = totalCount;
  document.querySelector('.stat-card:nth-child(2) .stat-value').textContent = resolvedCount;
}

// Ver Detalles buttons
function initializeDetails() {
  const detailBtns = document.querySelectorAll('.ver-detalles-btn');
  
  detailBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const alertCard = e.target.closest('.alerta-card');
      showAlertDetails(alertCard);
    });
  });
}

// Show alert details modal
function showAlertDetails(alertCard) {
  const alertData = {
    id: alertCard.dataset.id,
    date: alertCard.dataset.date,
    status: alertCard.classList.contains('activa') ? 'Activa' : 'Resuelta',
    time: alertCard.querySelector('.alerta-time').textContent.trim(),
    type: alertCard.querySelector('.info-item:nth-child(1)').textContent.replace('🚨', '').trim(),
    location: alertCard.querySelector('.info-item:nth-child(2)').textContent.replace('📍', '').trim(),
    contacts: alertCard.querySelector('.info-item:nth-child(3)').textContent.replace('👥', '').trim()
  };
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'alert-detail-modal';
  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h2>Detalles de la Alerta</h2>
        <button class="close-modal-btn">✕</button>
      </div>
      <div class="modal-body">
        <div class="detail-section">
          <span class="detail-badge ${alertData.status === 'Activa' ? 'activa-badge' : 'resuelta-badge'}">
            ${alertData.status}
          </span>
        </div>
        <div class="detail-section">
          <h3>⏰ Fecha y Hora</h3>
          <p>${alertData.time}</p>
        </div>
        <div class="detail-section">
          <h3>🚨 Tipo de Alerta</h3>
          <p>${alertData.type}</p>
        </div>
        <div class="detail-section">
          <h3>📍 Ubicación</h3>
          <p>${alertData.location}</p>
          <button class="view-map-btn" data-location="${alertData.location}">
            🗺️ Ver en el Mapa
          </button>
        </div>
        <div class="detail-section">
          <h3>👥 Contactos Notificados</h3>
          <p>${alertData.contacts}</p>
        </div>
        <div class="detail-section">
          <h3>📞 Llamadas de Emergencia</h3>
          <div class="emergency-calls">
            <a href="tel:105" class="emergency-call-btn">
              <span>🚔</span> Policía (105)
            </a>
            <a href="tel:116" class="emergency-call-btn">
              <span>🚑</span> Ambulancia (116)
            </a>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        ${alertData.status === 'Activa' ? 
          '<button class="cancel-alert-btn">❌ Cancelar Alerta</button>' : 
          '<button class="close-modal-btn secondary">Cerrar</button>'
        }
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Animate modal in
  setTimeout(() => modal.classList.add('show'), 10);
  
  // Close modal handlers
  modal.querySelectorAll('.close-modal-btn').forEach(btn => {
    btn.addEventListener('click', () => closeModal(modal));
  });
  
  modal.querySelector('.modal-overlay').addEventListener('click', () => closeModal(modal));
  
  // View map button
  const viewMapBtn = modal.querySelector('.view-map-btn');
  if (viewMapBtn) {
    viewMapBtn.addEventListener('click', () => {
      closeModal(modal);
      window.location.href = 'dashboard.html#mapa';
    });
  }
  
  // Cancel alert button
  const cancelBtn = modal.querySelector('.cancel-alert-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      closeModal(modal);
      showCancelConfirmation(alertData.id);
    });
  }
}

// Close modal with animation
function closeModal(modal) {
  modal.classList.remove('show');
  setTimeout(() => modal.remove(), 300);
}

// Show cancel confirmation
function showCancelConfirmation(alertId) {
  const confirmed = confirm('¿Estás segura de que quieres cancelar esta alerta?\n\nSolo cancela si estás completamente segura y fuera de peligro.');
  
  if (confirmed) {
    // Simulate cancel alert
    const alertCard = document.querySelector(`[data-id="${alertId}"]`);
    if (alertCard) {
      alertCard.classList.remove('activa');
      alertCard.classList.add('resuelta');
      alertCard.querySelector('.alerta-badge').classList.remove('activa-badge');
      alertCard.querySelector('.alerta-badge').classList.add('resuelta-badge');
      alertCard.querySelector('.alerta-badge').textContent = 'Resuelta';
      
      // Update stats
      updateFilterCounts();
      
      // Show success message
      showSuccessMessage('Alerta cancelada exitosamente');
    }
  }
}

// Show success message
function showSuccessMessage(message) {
  const toast = document.createElement('div');
  toast.className = 'success-toast';
  toast.innerHTML = `
    <span class="toast-icon">✅</span>
    <span class="toast-message">${message}</span>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Load alert history from localStorage (if available)
function loadAlertHistory() {
  const savedAlerts = localStorage.getItem('hersos_alert_history');
  
  if (savedAlerts) {
    try {
      const alerts = JSON.parse(savedAlerts);
      // Here you could dynamically populate the page with saved alerts
      console.log('Historial cargado:', alerts);
    } catch (e) {
      console.error('Error al cargar historial:', e);
    }
  }
}

// Back button functionality
const backBtn = document.querySelector('.back-btn');
if (backBtn) {
  backBtn.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });
}

// Add CSS for modal
const modalStyles = document.createElement('style');
modalStyles.textContent = `
  .alert-detail-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .alert-detail-modal.show {
    opacity: 1;
  }

  .modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
  }

  .modal-content {
    position: relative;
    background: white;
    border-radius: 20px;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    animation: modalSlideUp 0.3s ease-out;
  }

  @keyframes modalSlideUp {
    from {
      transform: translateY(50px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    border-bottom: 2px solid #f0f0f0;
  }

  .modal-header h2 {
    font-family: 'Itim', cursive;
    font-size: 1.5rem;
    color: #450062;
    margin: 0;
  }

  .close-modal-btn {
    background: #f0f0f0;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    font-size: 1.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .close-modal-btn:hover {
    background: #e0e0e0;
    transform: scale(1.1);
  }

  .modal-body {
    padding: 24px;
  }

  .detail-section {
    margin-bottom: 24px;
  }

  .detail-section h3 {
    font-size: 1.1rem;
    font-weight: 700;
    color: #2c2c2c;
    margin-bottom: 8px;
  }

  .detail-section p {
    font-size: 1rem;
    color: #5c5c5c;
    margin: 0;
    line-height: 1.6;
  }

  .detail-badge {
    display: inline-block;
    padding: 10px 24px;
    border-radius: 20px;
    font-size: 1rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  .view-map-btn {
    margin-top: 12px;
    background: #450062;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 12px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    width: 100%;
  }

  .view-map-btn:hover {
    background: #6A0DAD;
    transform: scale(1.02);
  }

  .emergency-calls {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 12px;
  }

  .emergency-call-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    background: #f8f5ff;
    border: 2px solid #450062;
    border-radius: 12px;
    color: #450062;
    text-decoration: none;
    font-weight: 700;
    font-size: 1rem;
    transition: all 0.2s;
  }

  .emergency-call-btn:hover {
    background: #450062;
    color: white;
    transform: scale(1.02);
  }

  .emergency-call-btn span {
    font-size: 1.5rem;
  }

  .modal-footer {
    padding: 20px 24px;
    border-top: 2px solid #f0f0f0;
  }

  .cancel-alert-btn {
    width: 100%;
    background: #d32f2f;
    color: white;
    border: none;
    padding: 14px;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Itim', cursive;
  }

  .cancel-alert-btn:hover {
    background: #b71c1c;
    transform: scale(1.02);
  }

  .close-modal-btn.secondary {
    width: 100%;
    background: #6A0DAD;
    color: white;
    border: none;
    padding: 14px;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Itim', cursive;
  }

  .close-modal-btn.secondary:hover {
    background: #450062;
  }

  .success-toast {
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%) translateY(100px);
    background: #4CAF50;
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    z-index: 10001;
    opacity: 0;
    transition: all 0.3s ease;
  }

  .success-toast.show {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }

  .toast-icon {
    font-size: 1.5rem;
  }

  .toast-message {
    font-weight: 600;
    font-size: 1rem;
  }
`;

document.head.appendChild(modalStyles);
