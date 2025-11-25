(function () {
  // profile management (stored in localStorage)
  const nameEl = document.getElementById('p_name');
  const emailEl = document.getElementById('p_email');
  const phoneEl = document.getElementById('p_phone');
  const aboutEl = document.getElementById('p_about');
  const tagsContainer = document.getElementById('tagsContainer');
  const tagInput = document.getElementById('tagInput');
  const addTagBtn = document.getElementById('addTagBtn');
  const saveBtn = document.getElementById('saveProfile');
  const cancelBtn = document.getElementById('cancelProfile');

  function loadProfile() {
    const user = JSON.parse(localStorage.getItem('hersos_user') || 'null');
    const profile = JSON.parse(localStorage.getItem('hersos_profile') || 'null');
    if (user) {
      nameEl.value = user.name || '';
      emailEl.value = user.email || '';
    }
    if (profile) {
      phoneEl.value = profile.phone || '';
      aboutEl.value = profile.about || '';
      renderTags(profile.tags || []);
    } else {
      renderTags([]);
    }
  }

  function renderTags(tags) {
    tagsContainer.innerHTML = '';
    tags.forEach((t, i) => {
      const chip = document.createElement('div');
      chip.className = 'tag-chip';
      chip.innerHTML = `<span>${t}</span><button data-i="${i}" aria-label="Eliminar etiqueta">×</button>`;
      chip.querySelector('button').addEventListener('click', (e) => {
        e.preventDefault();
        tags.splice(i,1);
        renderTags(tags);
      });
      tagsContainer.appendChild(chip);
    });
    // store current tags on container for convenience
    tagsContainer._tags = tags;
  }

  addTagBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const v = (tagInput.value||'').trim();
    if (!v) return;
    const tags = tagsContainer._tags || [];
    tags.push(v);
    renderTags(tags);
    tagInput.value = '';
  });

  saveBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('hersos_user') || 'null') || {};
    user.name = nameEl.value || user.name || '';
    user.email = emailEl.value || user.email || '';
    localStorage.setItem('hersos_user', JSON.stringify(user));

    const profile = {
      phone: phoneEl.value || '',
      about: aboutEl.value || '',
      tags: tagsContainer._tags || []
    };
    localStorage.setItem('hersos_profile', JSON.stringify(profile));
    // feedback and go back
    alert('Perfil guardado');
    window.location.href = 'dashboard.html';
  });

  cancelBtn.addEventListener('click', (e) => { e.preventDefault(); window.location.href = 'dashboard.html'; });

  // init
  loadProfile();
})();
