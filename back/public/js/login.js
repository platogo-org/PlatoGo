// Minimal login handler: submits form and redirects based on server-provided redirectUrl
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form#loginForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const body = {
      email: formData.get('email'),
      password: formData.get('password')
    };
    const res = await fetch('/api/v1/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'text/html' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data.redirectUrl) {
      window.location.assign(data.redirectUrl);
    } else if (data.token) {
      // fallback: go to home
      window.location.assign('/');
    } else {
      alert('Login failed');
    }
  });
});
