let currentUser = null;
let users = [];

async function checkAuth() {
  try {
    const response = await fetch('/api/auth/me');
    if (!response.ok) {
      window.location.href = '/public/login.html';
      return;
    }
    const data = await response.json();
    currentUser = data.user;

    if (!currentUser.isAdmin) {
      window.location.href = '/public/dashboard.html';
      return;
    }
  } catch (error) {
    window.location.href = '/public/login.html';
  }
}

async function loadUsers() {
  try {
    const response = await fetch('/api/users');
    const data = await response.json();
    users = data.users;
    renderUsers();
    updateStats();
  } catch (error) {
    showAlert('Failed to load users', 'error');
  }
}

function updateStats() {
  const totalUsers = users.length;
  const totalAdmins = users.filter(u => u.isAdmin).length;

  document.getElementById('totalUsers').textContent = totalUsers;
  document.getElementById('totalAdmins').textContent = totalAdmins;
}

function renderUsers() {
  const tbody = document.getElementById('usersBody');
  tbody.innerHTML = '';

  if (users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No users yet</td></tr>';
    return;
  }

  users.forEach(user => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${user.email}</td>
      <td>${user.name || '-'}</td>
      <td>${user.isAdmin ? '<strong>Admin</strong>' : 'User'}</td>
      <td>${user._count.urls}</td>
      <td>${new Date(user.createdAt).toLocaleDateString()}</td>
      <td class="actions">
        <button class="secondary" onclick="toggleAdmin('${user.id}')">
          ${user.isAdmin ? 'Remove Admin' : 'Make Admin'}
        </button>
        <button class="danger" onclick="deleteUser('${user.id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function showAlert(message, type) {
  const alert = document.getElementById('alert');
  alert.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  setTimeout(() => { alert.innerHTML = ''; }, 5000);
}

async function toggleAdmin(id) {
  if (!confirm('Are you sure you want to change this user\'s admin status?')) return;

  try {
    const response = await fetch(`/api/users/${id}/toggle-admin`, { method: 'POST' });
    if (response.ok) {
      showAlert('User admin status updated successfully', 'success');
      loadUsers();
    } else {
      showAlert('Failed to update user', 'error');
    }
  } catch (error) {
    showAlert('An error occurred', 'error');
  }
}

async function deleteUser(id) {
  if (!confirm('Are you sure you want to delete this user? This will also delete all their URLs.')) return;

  try {
    const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    if (response.ok) {
      showAlert('User deleted successfully', 'success');
      loadUsers();
    } else {
      showAlert('Failed to delete user', 'error');
    }
  } catch (error) {
    showAlert('An error occurred', 'error');
  }
}

document.getElementById('logoutBtn').addEventListener('click', async (e) => {
  e.preventDefault();
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/public/login.html';
});

checkAuth();
loadUsers();
