const API = '';
const state = {
  token: localStorage.getItem('token') || '',
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  booksPage: 1,
  booksLimit: 6,
  filters: { author: '', genre: '' }
};

const authShell = document.getElementById('authShell');
const dashboard = document.getElementById('dashboard');
const toastEl = document.getElementById('toast');
const welcomeTitle = document.getElementById('welcomeTitle');

const showToast = (message, type = 'success') => {
  toastEl.className = `${type} show`;
  toastEl.textContent = message;
  setTimeout(() => {
    toastEl.className = '';
  }, 2200);
};

const apiFetch = async (url, options = {}) => {
  const headers = options.headers || {};
  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(`${API}${url}`, { ...options, headers });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Request failed');
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response;
};

const setAuthView = () => {
  if (state.token && state.user) {
    authShell.classList.add('hidden');
    dashboard.classList.remove('hidden');
    welcomeTitle.textContent = `Welcome, ${state.user.name}`;
    loadBooks();
    loadFiles();
  } else {
    authShell.classList.remove('hidden');
    dashboard.classList.add('hidden');
  }
};

const authTabBtns = document.querySelectorAll('[data-auth-tab]');
authTabBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    authTabBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.authTab;
    document.getElementById('loginForm').classList.toggle('active', tab === 'login');
    document.getElementById('registerForm').classList.toggle('active', tab === 'register');
  });
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const payload = {
      name: document.getElementById('registerName').value.trim(),
      email: document.getElementById('registerEmail').value.trim(),
      password: document.getElementById('registerPassword').value
    };

    const data = await apiFetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('token', state.token);
    localStorage.setItem('user', JSON.stringify(state.user));
    showToast('Registration successful');
    setAuthView();
  } catch (error) {
    showToast(error.message, 'error');
  }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const payload = {
      email: document.getElementById('loginEmail').value.trim(),
      password: document.getElementById('loginPassword').value
    };

    const data = await apiFetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('token', state.token);
    localStorage.setItem('user', JSON.stringify(state.user));
    showToast('Login successful');
    setAuthView();
  } catch (error) {
    showToast(error.message, 'error');
  }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  state.token = '';
  state.user = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  setAuthView();
});

document.querySelectorAll('.nav-btn[data-panel]').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn[data-panel]').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.panel').forEach((panel) => panel.classList.remove('active'));
    document.getElementById(btn.dataset.panel).classList.add('active');
  });
});

document.getElementById('bookForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const payload = {
      title: document.getElementById('bookTitle').value.trim(),
      author: document.getElementById('bookAuthor').value.trim(),
      genre: document.getElementById('bookGenre').value.trim(),
      year: Number(document.getElementById('bookYear').value)
    };

    await apiFetch('/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    e.target.reset();
    showToast('Book added');
    loadBooks();
  } catch (error) {
    showToast(error.message, 'error');
  }
});

document.getElementById('filterForm').addEventListener('submit', (e) => {
  e.preventDefault();
  state.filters.author = document.getElementById('filterAuthor').value.trim();
  state.filters.genre = document.getElementById('filterGenre').value.trim();
  state.booksPage = 1;
  loadBooks();
});

document.getElementById('clearFilters').addEventListener('click', () => {
  state.filters.author = '';
  state.filters.genre = '';
  state.booksPage = 1;
  document.getElementById('filterAuthor').value = '';
  document.getElementById('filterGenre').value = '';
  loadBooks();
});

const loadBooks = async () => {
  try {
    const params = new URLSearchParams({
      page: String(state.booksPage),
      limit: String(state.booksLimit),
      author: state.filters.author,
      genre: state.filters.genre
    });

    const data = await apiFetch(`/books?${params.toString()}`);
    renderBooks(data.data || []);
    renderPagination(data.totalPages || 1, data.page || 1);
  } catch (error) {
    showToast(error.message, 'error');
  }
};

const renderBooks = (books) => {
  const grid = document.getElementById('booksGrid');
  if (!books.length) {
    grid.innerHTML = '<p class="muted">No books found.</p>';
    return;
  }

  grid.innerHTML = books.map((book) => `
    <div class="book-item">
      <h5>${book.title}</h5>
      <p class="book-meta">${book.author} • ${book.genre} • ${book.year}</p>
      <button class="danger small" onclick="deleteBook(${book.id})">Delete</button>
    </div>
  `).join('');
};

window.deleteBook = async (id) => {
  try {
    await apiFetch(`/books/${id}`, { method: 'DELETE' });
    showToast('Book deleted');
    loadBooks();
  } catch (error) {
    showToast(error.message, 'error');
  }
};

const renderPagination = (totalPages, currentPage) => {
  const container = document.getElementById('pagination');
  container.innerHTML = '';

  for (let i = 1; i <= totalPages; i += 1) {
    const btn = document.createElement('button');
    btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
    btn.textContent = String(i);
    btn.addEventListener('click', () => {
      state.booksPage = i;
      loadBooks();
    });
    container.appendChild(btn);
  }
};

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const fileInput = document.getElementById('fileInput');
    if (!fileInput.files.length) {
      showToast('Select a file first', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    await apiFetch('/upload', {
      method: 'POST',
      body: formData
    });

    e.target.reset();
    showToast('File uploaded');
    loadFiles();
  } catch (error) {
    showToast(error.message, 'error');
  }
});

const loadFiles = async () => {
  try {
    const data = await apiFetch('/files');
    renderFiles(data.data || []);
  } catch (error) {
    showToast(error.message, 'error');
  }
};

const renderFiles = (files) => {
  const list = document.getElementById('filesList');
  if (!files.length) {
    list.innerHTML = '<p class="muted">No files uploaded.</p>';
    return;
  }

  list.innerHTML = files.map((file) => `
    <div class="file-item">
      <div>
        <strong>${file.filename}</strong>
        <p class="book-meta">${(file.size / 1024).toFixed(1)} KB</p>
      </div>
      <div class="file-actions">
        <button class="secondary small" onclick="downloadFile(${file.id})">Download</button>
        <button class="danger small" onclick="deleteFile(${file.id})">Delete</button>
      </div>
    </div>
  `).join('');
};

window.downloadFile = async (id) => {
  try {
    const response = await fetch(`/files/${id}`, {
      headers: { Authorization: `Bearer ${state.token}` }
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'Download failed');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'download';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    showToast(error.message, 'error');
  }
};

window.deleteFile = async (id) => {
  try {
    await apiFetch(`/files/${id}`, { method: 'DELETE' });
    showToast('File deleted');
    loadFiles();
  } catch (error) {
    showToast(error.message, 'error');
  }
};

setAuthView();
