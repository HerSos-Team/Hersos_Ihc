'use strict';

// Inicialización de Leaflet para el mapa de HerSOS
document.addEventListener('DOMContentLoaded', function () {
  // check Leaflet
  if (typeof L === 'undefined') {
    console.warn('Leaflet no está disponible. Comprueba la carga del CDN.');
    return;
  }

  var mapContainerId = 'mapa-hersos';
  var el = document.getElementById(mapContainerId);
  if (!el) return;

  // create map centered in Lima, Perú
  var center = [-12.0464, -77.0428];
  var map = L.map(mapContainerId, { scrollWheelZoom: true }).setView(center, 13);

  // OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
  }).addTo(map);

  // marker with popup
  var marker = L.marker(center).addTo(map);
  marker.bindPopup('Ubicación simulada').openPopup();
});
