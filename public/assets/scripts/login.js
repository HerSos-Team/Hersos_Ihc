// Simple login/register script (frontend mock)
(function () {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const toRegister = document.getElementById('toRegister');
  const toLogin = document.getElementById('toLogin');
  const backWrap = document.getElementById('backToLoginWrap');
  const title = document.getElementById('title');

  function showRegister() {
    loginForm.style.display = 'none';
    registerForm.style.display = 'flex';
    toRegister.style.display = 'none';
    backWrap.style.display = 'block';
    title.textContent = 'Crear cuenta';
  }
  function showLogin() {
    loginForm.style.display = 'flex';
    registerForm.style.display = 'none';
    toRegister.style.display = 'inline-block';
    backWrap.style.display = 'none';
    title.textContent = 'Iniciar sesión';
  }

  toRegister && toRegister.addEventListener('click', showRegister);
  toLogin && toLogin.addEventListener('click', showLogin);

  registerForm && registerForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = (document.getElementById('rname')||{}).value || 'Usuario';
    const email = (document.getElementById('remail')||{}).value;
    const pass = (document.getElementById('rpass')||{}).value;
    if (!email || !pass) return alert('Completa los campos');
    const user = { name: name, email: email };
    localStorage.setItem('hersos_user', JSON.stringify(user));
    // redirect to dashboard
    window.location.href = 'dashboard.html';
  });

  loginForm && loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = (document.getElementById('email')||{}).value;
    const pass = (document.getElementById('password')||{}).value;
    if (!email || !pass) return alert('Introduce email y contraseña');
    const existing = JSON.parse(localStorage.getItem('hersos_user') || 'null');
    const user = existing && existing.email === email ? existing : { name: email.split('@')[0], email };
    localStorage.setItem('hersos_user', JSON.stringify(user));
    window.location.href = 'dashboard.html';
  });
})();
