let currentUser = null;
let urls = [];

async function checkAuth() {
  try {
    const response = await fetch('/api/auth/me');
    if (!response.ok) {
      window.location.href = '/public/login.html';
      return;
    }
    const data = await response.json();
    currentUser = data.user;

    if (currentUser.isAdmin) {
      document.getElementById('usersLink').style.display = 'block';
    }
  } catch (error) {
    window.location.href = '/public/login.html';
  }
}

async function loadUrls() {
  try {
    const response = await fetch('/api/urls');
    const data = await response.json();
    urls = data.urls;
    renderUrls();
    updateStats();
  } catch (error) {
    showAlert('Failed to load URLs', 'error');
  }
}

function updateStats() {
  const totalUrls = urls.length;
  const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);
  const totalVariants = urls.reduce((sum, url) => sum + url.variants.length, 0);

  document.getElementById('totalUrls').textContent = totalUrls;
  document.getElementById('totalClicks').textContent = totalClicks;
  document.getElementById('totalVariants').textContent = totalVariants;
}

function renderUrls() {
  const tbody = document.getElementById('urlsBody');
  tbody.innerHTML = '';

  if (urls.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No URLs yet</td></tr>';
    return;
  }

  urls.forEach(url => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><span class="short-url">${url.shortCode}</span></td>
      <td><a href="${url.longUrl}" target="_blank">${url.longUrl}</a></td>
      <td>${url.clicks}</td>
      <td>${url.variants.length}</td>
      <td>${new Date(url.createdAt).toLocaleDateString()}</td>
      <td class="actions">
        <button class="secondary" onclick="showVariantModal('${url.id}', '${url.shortCode}')">Add Variant</button>
        <button class="danger" onclick="deleteUrl('${url.id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(row);

    // Render variants
    url.variants.forEach(variant => {
      const variantRow = document.createElement('tr');
      variantRow.style.background = '#f9fafb';
      const utmParams = [];
      if (variant.utmSource) utmParams.push(`source=${variant.utmSource}`);
      if (variant.utmMedium) utmParams.push(`medium=${variant.utmMedium}`);
      if (variant.utmCampaign) utmParams.push(`campaign=${variant.utmCampaign}`);

      variantRow.innerHTML = `
        <td style="padding-left: 2rem;"><span class="short-url">${variant.shortCode}</span></td>
        <td><small>UTM: ${utmParams.join(', ')}</small></td>
        <td>${variant.clicks}</td>
        <td>-</td>
        <td>${new Date(variant.createdAt).toLocaleDateString()}</td>
        <td class="actions">
          <button class="danger" onclick="deleteVariant('${variant.id}')">Delete</button>
        </td>
      `;
      tbody.appendChild(variantRow);
    });
  });
}

function showAlert(message, type) {
  const alert = document.getElementById('alert');
  alert.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  setTimeout(() => { alert.innerHTML = ''; }, 5000);
}

function showVariantModal(urlId, shortCode) {
  document.getElementById('variantUrlId').value = urlId;
  document.getElementById('variantBaseUrl').textContent = shortCode;
  document.getElementById('variantModal').style.display = 'block';
}

function hideVariantModal() {
  document.getElementById('variantModal').style.display = 'none';
  document.getElementById('createVariantForm').reset();
}

async function deleteUrl(id) {
  if (!confirm('Are you sure you want to delete this URL?')) return;

  try {
    const response = await fetch(`/api/urls/${id}`, { method: 'DELETE' });
    if (response.ok) {
      showAlert('URL deleted successfully', 'success');
      loadUrls();
    } else {
      showAlert('Failed to delete URL', 'error');
    }
  } catch (error) {
    showAlert('An error occurred', 'error');
  }
}

async function deleteVariant(id) {
  if (!confirm('Are you sure you want to delete this variant?')) return;

  try {
    const response = await fetch(`/api/urls/variants/${id}`, { method: 'DELETE' });
    if (response.ok) {
      showAlert('Variant deleted successfully', 'success');
      loadUrls();
    } else {
      showAlert('Failed to delete variant', 'error');
    }
  } catch (error) {
    showAlert('An error occurred', 'error');
  }
}

document.getElementById('createUrlForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const longUrl = document.getElementById('longUrl').value;
  const customShortCode = document.getElementById('customShortCode').value;

  try {
    const response = await fetch('/api/urls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ longUrl, customShortCode: customShortCode || undefined }),
    });

    const data = await response.json();

    if (response.ok) {
      showAlert('URL created successfully!', 'success');
      document.getElementById('createUrlForm').reset();
      loadUrls();
    } else {
      showAlert(data.error, 'error');
    }
  } catch (error) {
    showAlert('An error occurred', 'error');
  }
});

document.getElementById('createVariantForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const urlId = document.getElementById('variantUrlId').value;
  const utmSource = document.getElementById('utmSource').value;
  const utmMedium = document.getElementById('utmMedium').value;
  const utmCampaign = document.getElementById('utmCampaign').value;
  const utmTerm = document.getElementById('utmTerm').value;
  const utmContent = document.getElementById('utmContent').value;

  try {
    const response = await fetch('/api/urls/variants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        urlId,
        utmSource: utmSource || undefined,
        utmMedium: utmMedium || undefined,
        utmCampaign: utmCampaign || undefined,
        utmTerm: utmTerm || undefined,
        utmContent: utmContent || undefined,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      showAlert('Variant created successfully!', 'success');
      hideVariantModal();
      loadUrls();
    } else {
      showAlert(data.error, 'error');
    }
  } catch (error) {
    showAlert('An error occurred', 'error');
  }
});

document.getElementById('logoutBtn').addEventListener('click', async (e) => {
  e.preventDefault();
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/public/login.html';
});

checkAuth();
loadUrls();
