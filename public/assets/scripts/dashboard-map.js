/**
 * Mapa Interactivo del Dashboard - HerSOS
 * Muestra la ubicación de la usuaria en tiempo real
 * Se actualiza cuando se activa el botón de pánico
 */

(function() {
  'use strict';

  // Verificar que Leaflet esté disponible
  if (typeof L === 'undefined') {
    console.warn('Leaflet no está disponible. Verifica la carga del CDN.');
    return;
  }

  const mapContainerId = 'dashboard-map';
  const mapEl = document.getElementById(mapContainerId);
  
  if (!mapEl) {
    console.warn('Contenedor del mapa no encontrado');
    return;
  }

  // Estado del mapa
  let map = null;
  let userMarker = null;
  let panicCircle = null;
  let currentLocation = null;

  // Icono personalizado para la usuaria
  const userIcon = L.divIcon({
    html: '<div style="background: #450062; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 12px;">📍</div>',
    className: 'user-location-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  // Icono de pánico (rojo pulsante)
  const panicIcon = L.divIcon({
    html: '<div style="background: #FF6B6B; width: 32px; height: 32px; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 12px rgba(255,107,107,0.5); display: flex; align-items: center; justify-content: center; font-size: 16px; animation: pulse 1.5s ease-in-out infinite;">⚠️</div>',
    className: 'panic-location-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  // Inicializar mapa centrado en Lima, Perú por defecto
  function initMap() {
    const defaultCenter = [-12.0464, -77.0428]; // Lima, Perú
    
    map = L.map(mapContainerId, {
      center: defaultCenter,
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: true
    });

    // Agregar tiles de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
    }).addTo(map);

    // Marcador inicial de la usuaria
    userMarker = L.marker(defaultCenter, { 
      icon: userIcon,
      title: 'Tu ubicación'
    }).addTo(map);
    
    userMarker.bindPopup('<strong>Tu ubicación actual</strong><br>Esperando GPS...').openPopup();

    // Intentar obtener ubicación real
    getUserLocation();
  }

  // Obtener ubicación actual del usuario
  function getUserLocation() {
    if (!('geolocation' in navigator)) {
      console.warn('Geolocalización no soportada');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        currentLocation = [lat, lng];

        // Actualizar mapa y marcador
        updateUserLocation(lat, lng);
        
        console.log('Ubicación obtenida:', lat, lng);
      },
      (error) => {
        console.warn('Error obteniendo ubicación:', error.message);
        // Mantener ubicación por defecto (Lima)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  // Actualizar ubicación de la usuaria en el mapa
  function updateUserLocation(lat, lng) {
    if (!map || !userMarker) return;

    const newLocation = [lat, lng];
    currentLocation = newLocation;

    // Mover marcador
    userMarker.setLatLng(newLocation);
    
    // Centrar mapa
    map.setView(newLocation, 16);

    // Actualizar popup
    userMarker.bindPopup(`
      <strong>Tu ubicación actual</strong><br>
      📍 ${lat.toFixed(6)}, ${lng.toFixed(6)}<br>
      <small>Actualizado: ${new Date().toLocaleTimeString('es-PE')}</small>
    `).openPopup();
  }

  // Activar modo pánico en el mapa
  function activatePanicMode(lat, lng) {
    if (!map) return;

    const panicLocation = lat && lng ? [lat, lng] : currentLocation;
    if (!panicLocation) return;

    // Cambiar icono a modo pánico
    userMarker.setIcon(panicIcon);

    // Agregar círculo de alerta
    if (panicCircle) {
      map.removeLayer(panicCircle);
    }

    panicCircle = L.circle(panicLocation, {
      color: '#FF6B6B',
      fillColor: '#FF6B6B',
      fillOpacity: 0.2,
      radius: 500, // 500 metros de radio
      weight: 2,
      dashArray: '5, 10'
    }).addTo(map);

    // Centrar en la ubicación de pánico
    map.setView(panicLocation, 17);

    // Actualizar popup con información de emergencia
    userMarker.bindPopup(`
      <div style="text-align: center;">
        <strong style="color: #FF6B6B; font-size: 1.1rem;">🚨 ALERTA ACTIVA</strong><br>
        <strong>Ubicación de emergencia</strong><br>
        📍 ${panicLocation[0].toFixed(6)}, ${panicLocation[1].toFixed(6)}<br>
        🕒 ${new Date().toLocaleTimeString('es-PE')}<br>
        <small style="color: #D81B60;">Contactos notificados</small>
      </div>
    `).openPopup();

    console.log('Modo pánico activado en el mapa');
  }

  // Desactivar modo pánico
  function deactivatePanicMode() {
    if (!map || !userMarker) return;

    // Restaurar icono normal
    userMarker.setIcon(userIcon);

    // Remover círculo de alerta
    if (panicCircle) {
      map.removeLayer(panicCircle);
      panicCircle = null;
    }

    // Restaurar popup normal
    if (currentLocation) {
      userMarker.bindPopup(`
        <strong>Tu ubicación actual</strong><br>
        📍 ${currentLocation[0].toFixed(6)}, ${currentLocation[1].toFixed(6)}<br>
        <small>Actualizado: ${new Date().toLocaleTimeString('es-PE')}</small>
      `);
    }

    console.log('Modo pánico desactivado en el mapa');
  }

  // Escuchar eventos de pánico
  window.addEventListener('panicActivated', (event) => {
    const { latitude, longitude } = event.detail || {};
    activatePanicMode(latitude, longitude);
  });

  window.addEventListener('panicDeactivated', () => {
    deactivatePanicMode();
  });

  window.addEventListener('panicLocationUpdate', (event) => {
    const { latitude, longitude } = event.detail || {};
    if (latitude && longitude) {
      updateUserLocation(latitude, longitude);
    }
  });

  // Inicializar mapa cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMap);
  } else {
    initMap();
  }

  // Exponer funciones globales para ser usadas por panic.js
  window.HerSOSMap = {
    updateLocation: updateUserLocation,
    activatePanic: activatePanicMode,
    deactivatePanic: deactivatePanicMode,
    getCurrentLocation: () => currentLocation
  };

  console.log('Mapa del dashboard HerSOS inicializado ✓');
})();
