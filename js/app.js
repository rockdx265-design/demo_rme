/**
 * SISTEM REKAM MEDIS ELEKTRONIK (RME) - MASTER APPLICATION CONTROLLER
 * Coordinates routing, role-based UI rendering, modals, toasts, SVG charts, and views.
 * 
 * UPDATE:
 * - Menghapus seluruh field NIK.
 * - Manajemen User (Dokter & Resepsionis) lengkap dengan fitur Tambah, Edit, Hapus untuk role Owner.
 * - SEMUA aksi Create, Update, dan Delete ditampilkan dalam bentuk MODAL SHOW (bukan halaman utuh terpisah).
 */

const App = {
  currentView: 'dashboard',

  init() {
    this.bindEvents();
    this.handleRoute();
  },

  bindEvents() {
    window.addEventListener('hashchange', () => this.handleRoute());
    
    // Global ESC key listener untuk menutup modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });

    // Backdrop mobile sidebar
    document.addEventListener('click', (e) => {
      const backdrop = document.getElementById('sidebar-backdrop');
      if (backdrop && backdrop.classList.contains('active') && e.target === backdrop) {
        this.toggleMobileSidebar(false);
      }
    });
  },

  handleRoute() {
    const user = Auth.getCurrentUser();
    const hash = window.location.hash.replace('#', '') || '';
    const parts = hash.split('?');
    const route = parts[0] || 'dashboard';
    const params = new URLSearchParams(parts[1] || '');

    if (!user) {
      this.renderLoginView();
      return;
    }

    this.currentView = route;
    this.renderAppShell(user);
    this.renderCurrentView(route, params, user);
  },

  navigate(route) {
    window.location.hash = '#' + route;
  },

  // =========================================================================
  // TOAST NOTIFICATIONS
  // =========================================================================
  showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>`;
    } else if (type === 'danger') {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    } else if (type === 'warning') {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    } else {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toast.innerHTML = `
      ${iconSvg}
      <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  // =========================================================================
  // MODAL CONTROLLER
  // =========================================================================
  closeAllModals() {
    const modalOutlet = document.getElementById('global-modal-outlet');
    if (modalOutlet) {
      modalOutlet.innerHTML = '';
    }
    document.querySelectorAll('.modal-overlay.active').forEach(m => {
      m.classList.remove('active');
    });
    document.body.style.overflow = '';
  },

  toggleMobileSidebar(open) {
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (!sidebar) return;
    
    if (open === undefined) {
      sidebar.classList.toggle('mobile-open');
      if (backdrop) backdrop.classList.toggle('active');
    } else if (open) {
      sidebar.classList.add('mobile-open');
      if (backdrop) backdrop.classList.add('active');
    } else {
      sidebar.classList.remove('mobile-open');
      if (backdrop) backdrop.classList.remove('active');
    }
  },

  // =========================================================================
  // VIEW: LOGIN SCREEN (Section 6)
  // =========================================================================
  renderLoginView() {
    const root = document.getElementById('app-root');
    root.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f0fdf4 0%, #e2e8f0 100%); padding: 1.5rem;">
        <div class="card" style="max-width: 440px; width: 100%; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0; overflow: hidden; background: #ffffff;">
          
          <div style="padding: 2.5rem 2rem 1.5rem; text-align: center; border-bottom: 1px solid #f1f5f9;">
            <img src="assets/logo.svg" alt="RME Logo" style="width: 64px; height: 64px; margin-bottom: 1rem; filter: drop-shadow(0 4px 6px rgba(5,150,105,0.25));" />
            <h1 style="font-size: 1.5rem; font-weight: 800; color: #065f46; letter-spacing: -0.02em;">Sistem Rekam Medis Elektronik</h1>
            <p style="font-size: 0.85rem; color: #64748b; margin-top: 0.35rem;">Platform Terpadu Pelayanan, Antrean, dan Kasir Offline</p>
          </div>

          <div style="padding: 2rem;">
            <form id="login-form" onsubmit="App.handleLoginSubmit(event)">
              <div class="form-group" style="margin-bottom: 1.25rem;">
                <label class="form-label">Username</label>
                <input type="text" id="login-username" class="form-control" placeholder="Masukkan username" required autofocus />
              </div>

              <div class="form-group" style="margin-bottom: 1.5rem;">
                <label class="form-label">Password</label>
                <input type="password" id="login-password" class="form-control" placeholder="Masukkan password" required />
              </div>

              <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; font-size: 0.95rem;">
                Masuk ke Sistem
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px;"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </form>

            <!-- Quick Demo Account Presets -->
            <div style="margin-top: 1.75rem; padding: 1.25rem; background: #f8fafc; border-radius: var(--radius-md); border: 1px solid #e2e8f0;">
              <div style="font-size: 0.75rem; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 0.75rem; text-align: center; letter-spacing: 0.05em;">
                Pilih Akun Demo (1-Klik Isi)
              </div>
              
              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                <button type="button" class="btn btn-outline btn-sm" onclick="App.fillDemoAccount('owner', 'owner123')" style="justify-content: space-between; text-align: left; padding: 0.6rem 0.85rem;">
                  <span><strong>Owner</strong> (owner / owner123)</span>
                  <span class="badge badge-success">Monitoring & User Mgmt</span>
                </button>
                
                <button type="button" class="btn btn-outline btn-sm" onclick="App.fillDemoAccount('resepsionis', 'resepsionis123')" style="justify-content: space-between; text-align: left; padding: 0.6rem 0.85rem;">
                  <span><strong>Resepsionis</strong> (resepsionis / resepsionis123)</span>
                  <span class="badge badge-called">Pendaftaran & Kasir</span>
                </button>

                <button type="button" class="btn btn-outline btn-sm" onclick="App.fillDemoAccount('dokter', 'dokter123')" style="justify-content: space-between; text-align: left; padding: 0.6rem 0.85rem;">
                  <span><strong>Dokter</strong> (dokter / dokter123)</span>
                  <span class="badge badge-exam">Pemeriksaan SOAP</span>
                </button>
              </div>
            </div>

            <div style="text-align: center; margin-top: 1.25rem; font-size: 0.75rem; color: #94a3b8;">
              Demo Prototype Frontend • Penyimpanan Data LocalStorage
            </div>
          </div>
        </div>
      </div>
    `;
  },

  fillDemoAccount(user, pass) {
    const userInput = document.getElementById('login-username');
    const passInput = document.getElementById('login-password');
    if (userInput && passInput) {
      userInput.value = user;
      passInput.value = pass;
      this.showToast(`Akun ${user.toUpperCase()} terpilih, silakan klik "Masuk ke Sistem"`, 'info');
    }
  },

  handleLoginSubmit(e) {
    e.preventDefault();
    const userVal = document.getElementById('login-username').value;
    const passVal = document.getElementById('login-password').value;

    const res = Auth.login(userVal, passVal);
    if (res.success) {
      this.showToast(`Selamat datang, ${res.user.name} (${res.user.role.toUpperCase()})!`, 'success');
      this.navigate('dashboard');
    } else {
      this.showToast(res.message, 'danger');
    }
  },

  handleLogout() {
    Auth.logout();
    this.showToast('Anda telah keluar dari aplikasi', 'info');
    this.navigate('');
  },

  // =========================================================================
  // APPLICATION SHELL (Sidebar, Topbar)
  // =========================================================================
  renderAppShell(user) {
    const root = document.getElementById('app-root');
    if (document.getElementById('main-content-area')) {
      this.updateSidebarNav(user);
      return;
    }

    root.innerHTML = `
      <div class="app-wrapper">
        <div id="sidebar-backdrop" class="sidebar-backdrop"></div>
        
        <!-- SIDEBAR -->
        <aside class="sidebar">
          <div class="sidebar-header">
            <img src="assets/logo.svg" alt="RME Logo" class="sidebar-logo" />
            <div class="sidebar-brand">
              <span class="brand-name">
                Medika RME
                <span class="brand-badge">Demo</span>
              </span>
              <span class="brand-sub">Rekam Medis Elektronik</span>
            </div>
          </div>

          <div class="sidebar-user-preview">
            <div class="user-avatar-sm">${user.name.charAt(0)}</div>
            <div class="user-info-text">
              <div class="user-info-name" title="${user.fullName || user.name}">${user.name}</div>
              <div class="user-info-role">${user.role}</div>
            </div>
          </div>

          <nav class="sidebar-nav" id="sidebar-nav-container">
            ${this.getNavItemsHtml(user.role)}
          </nav>

          <div class="sidebar-footer">
            <button class="btn-logout" onclick="App.handleLogout()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
              Keluar (Logout)
            </button>
          </div>
        </aside>

        <!-- MAIN WRAPPER -->
        <div class="main-wrapper">
          <header class="top-navbar">
            <div class="navbar-left">
              <button class="btn-sidebar-toggle" onclick="App.toggleMobileSidebar()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 22px; height: 22px;"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
              <div class="page-title-box">
                <h1 id="navbar-view-title">Dashboard</h1>
                <p id="navbar-view-subtitle">Sistem Rekam Medis Elektronik</p>
              </div>
            </div>

            <div class="navbar-right">
              <!-- Quick Demo Role Switcher -->
              <div class="demo-role-switcher" title="Beralih peran secara instan untuk demonstrasi">
                <label>Demo Role:</label>
                <select id="quick-role-select" onchange="App.handleQuickRoleSwitch(this.value)">
                  <option value="owner" ${user.role === 'owner' ? 'selected' : ''}>Owner</option>
                  <option value="resepsionis" ${user.role === 'resepsionis' ? 'selected' : ''}>Resepsionis</option>
                  <option value="dokter" ${user.role === 'dokter' ? 'selected' : ''}>Dokter</option>
                </select>
              </div>

              <div class="system-date-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 15px; height: 15px;"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span>05 Okt 2026</span>
              </div>
            </div>
          </header>

          <main class="content-body" id="main-content-area">
            <!-- Konten dinamis dirender di sini -->
          </main>
        </div>
      </div>

      <!-- OUTLET MODAL GLOBAL (SEMUA CREATE, UPDATE, DELETE MASUK KE SINI) -->
      <div id="global-modal-outlet"></div>
    `;
  },

  handleQuickRoleSwitch(role) {
    const switched = Auth.switchRole(role);
    if (switched) {
      this.showToast(`Beralih peran ke: ${switched.role.toUpperCase()}`, 'info');
      this.navigate('dashboard');
      this.renderAppShell(switched);
    }
  },

  getNavItemsHtml(role) {
    let links = [];

    if (role === 'owner') {
      links = [
        { route: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
        { route: 'pasien', label: 'Data Pasien', icon: 'users' },
        { route: 'dokter', label: 'Manajemen Dokter', icon: 'stethoscope' },
        { route: 'resepsionis', label: 'Manajemen Resepsionis', icon: 'user-check' },
        { route: 'antrean', label: 'Antrean Pelayanan', icon: 'clock' },
        { route: 'pemeriksaan', label: 'Pemeriksaan Klinis', icon: 'activity' },
        { route: 'transaksi', label: 'Monitoring Transaksi', icon: 'credit-card' },
        { route: 'laporan', label: 'Laporan Pendapatan', icon: 'file-text' },
        { route: 'profil', label: 'Profil Saya', icon: 'user' }
      ];
    } else if (role === 'resepsionis') {
      links = [
        { route: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
        { route: 'pasien', label: 'Data Pasien', icon: 'users' },
        { route: 'antrean', label: 'Antrean Pasien', icon: 'clock' },
        { route: 'transaksi', label: 'Transaksi (Kasir)', icon: 'credit-card' },
        { route: 'riwayat-transaksi', label: 'Riwayat Transaksi', icon: 'file-text' },
        { route: 'profil', label: 'Profil Saya', icon: 'user' }
      ];
    } else if (role === 'dokter') {
      links = [
        { route: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
        { route: 'antrean', label: 'Antrean Pasien', icon: 'clock' },
        { route: 'pemeriksaan', label: 'Pemeriksaan Klinis', icon: 'stethoscope' },
        { route: 'riwayat-pemeriksaan', label: 'Riwayat Pemeriksaan', icon: 'file-text' },
        { route: 'profil', label: 'Profil Saya', icon: 'user' }
      ];
    }

    return links.map(item => `
      <button class="nav-link ${this.currentView === item.route ? 'active' : ''}" onclick="App.navigate('${item.route}')">
        ${this.getIconSvg(item.icon)}
        <span>${item.label}</span>
      </button>
    `).join('');
  },

  updateSidebarNav(user) {
    const container = document.getElementById('sidebar-nav-container');
    if (container) {
      container.innerHTML = this.getNavItemsHtml(user.role);
    }
    const select = document.getElementById('quick-role-select');
    if (select) {
      select.value = user.role;
    }
  },

  getIconSvg(name) {
    switch (name) {
      case 'dashboard':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`;
      case 'users':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
      case 'stethoscope':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>`;
      case 'user-check':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>`;
      case 'clock':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
      case 'credit-card':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>`;
      case 'file-text':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>`;
      case 'activity':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`;
      case 'plus':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`;
      case 'user':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>`;
      case 'edit':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>`;
      case 'trash':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;
      default:
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`;
    }
  },

  // =========================================================================
  // VIEW ROUTER DISPATCHER
  // =========================================================================
  renderCurrentView(route, params, user) {
    this.closeAllModals();
    this.toggleMobileSidebar(false);
    const content = document.getElementById('main-content-area');
    const titleEl = document.getElementById('navbar-view-title');
    const subEl = document.getElementById('navbar-view-subtitle');

    switch (route) {
      case 'dashboard':
        titleEl.textContent = `Dashboard ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`;
        subEl.textContent = 'Ringkasan operasional dan metrik klinik';
        if (user.role === 'owner') this.renderOwnerDashboard(content);
        else if (user.role === 'resepsionis') this.renderResepsionisDashboard(content);
        else if (user.role === 'dokter') this.renderDokterDashboard(content);
        break;

      case 'pasien':
        titleEl.textContent = 'Data Pasien';
        subEl.textContent = 'Daftar rekam medis pasien terdaftar di klinik';
        this.renderPasienView(content, user);
        break;

      case 'antrean':
        titleEl.textContent = 'Antrean Pelayanan';
        subEl.textContent = 'Monitoring status antrean dan pemanggilan pasien';
        this.renderAntreanView(content, user);
        break;

      case 'pemeriksaan':
        titleEl.textContent = 'Pemeriksaan Klinis Pasien';
        subEl.textContent = 'Daftar antrean pemeriksaan dan pencatatan SOAP dokter';
        this.renderPemeriksaanListView(content, user);
        break;

      case 'riwayat-pemeriksaan':
        titleEl.textContent = 'Riwayat Pemeriksaan Dokter';
        subEl.textContent = 'Arsip rekam riwayat pemeriksaan medis sebelumnya';
        this.renderRiwayatPemeriksaanView(content);
        break;

      case 'transaksi':
        titleEl.textContent = user.role === 'owner' ? 'Monitoring Transaksi' : 'Transaksi Pembayaran Kasir (Offline/Tunai)';
        subEl.textContent = user.role === 'owner' ? 'Daftar transaksi dan status pelunasan' : 'Pencatatan pembayaran biaya pemeriksaan dan tindakan';
        this.renderTransaksiView(content, user);
        break;

      case 'riwayat-transaksi':
        titleEl.textContent = 'Riwayat Transaksi';
        subEl.textContent = 'Arsip transaksi pembayaran offline pasien';
        this.renderRiwayatTransaksiView(content);
        break;

      case 'dokter':
        titleEl.textContent = 'Manajemen Dokter';
        subEl.textContent = 'Kelola data tenaga medis dokter, spesialisasi, dan hak akses';
        this.renderDataDokterView(content, user);
        break;

      case 'resepsionis':
        titleEl.textContent = 'Manajemen Resepsionis';
        subEl.textContent = 'Kelola staf administrasi pendaftaran dan kasir';
        this.renderDataResepsionisView(content, user);
        break;

      case 'laporan':
        titleEl.textContent = 'Rekapitulasi & Laporan Pendapatan';
        subEl.textContent = 'Statistik pendapatan offline dan performa klinik';
        this.renderLaporanView(content);
        break;

      case 'profil':
        titleEl.textContent = 'Profil Pengguna';
        subEl.textContent = 'Informasi akun dan hak akses pengguna aktif';
        this.renderProfilView(content, user);
        break;

      default:
        this.navigate('dashboard');
        break;
    }
  },

  // =========================================================================
  // VIEW: OWNER DASHBOARD
  // =========================================================================
  renderOwnerDashboard(container) {
    const finSummary = TransaksiModule.getFinancialSummary();
    const queues = AntreanModule.getAllQueues();
    const activeQueuesCount = queues.filter(q => q.status !== 'Selesai').length;
    const patients = PasienModule.getAllPatients();
    const logs = getStorage(STORAGE_KEYS.AUDIT_LOGS, []);
    const recentTrxs = TransaksiModule.getAllTransactions().slice(0, 5);

    container.innerHTML = `
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Total Pasien</span>
            <div class="kpi-icon-bubble kpi-icon-emerald">
              ${this.getIconSvg('users')}
            </div>
          </div>
          <div class="kpi-value">${Math.max(patients.length, 125)}</div>
          <div class="kpi-meta"><span class="kpi-trend positive">↑ 12%</span> vs bulan lalu</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Pasien Hari Ini</span>
            <div class="kpi-icon-bubble kpi-icon-blue">
              ${this.getIconSvg('activity')}
            </div>
          </div>
          <div class="kpi-value">18</div>
          <div class="kpi-meta">Rata-rata 15 pasien/hari</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Pemeriksaan Hari Ini</span>
            <div class="kpi-icon-bubble kpi-icon-purple">
              ${this.getIconSvg('stethoscope')}
            </div>
          </div>
          <div class="kpi-value">15</div>
          <div class="kpi-meta">12 Umum, 3 Spesialis</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Antrean Aktif</span>
            <div class="kpi-icon-bubble kpi-icon-amber">
              ${this.getIconSvg('clock')}
            </div>
          </div>
          <div class="kpi-value">${activeQueuesCount}</div>
          <div class="kpi-meta">Menunggu / Sedang diperiksa</div>
        </div>

        <div class="kpi-card col-span-2">
          <div class="kpi-header">
            <span class="kpi-title">Pendapatan Hari Ini (Lunas)</span>
            <div class="kpi-icon-bubble kpi-icon-emerald">
              ${this.getIconSvg('credit-card')}
            </div>
          </div>
          <div class="kpi-value text-currency">${formatRupiah(finSummary.revenueToday)}</div>
          <div class="kpi-meta">
            <span class="badge badge-success">${finSummary.todayPaidCount} Transaksi Lunas</span>
            <span class="badge badge-danger" style="margin-left: 0.5rem;">${finSummary.todayUnpaidCount} Belum Lunas</span>
          </div>
        </div>
      </div>

      <!-- Quick Action Toolbar for Owner -->
      <div style="display: flex; gap: 0.75rem; margin-bottom: 2rem; flex-wrap: wrap;">
        <button class="btn btn-outline-primary" onclick="App.showCreateDoctorModal()">
          ${this.getIconSvg('plus')} + Tambah Dokter Baru (Modal)
        </button>
        <button class="btn btn-outline-primary" onclick="App.showCreateReceptionistModal()">
          ${this.getIconSvg('plus')} + Tambah Resepsionis Baru (Modal)
        </button>
        <button class="btn btn-outline" onclick="App.showCreatePatientModal()">
          ${this.getIconSvg('plus')} + Daftarkan Pasien (Modal)
        </button>
      </div>

      <!-- Charts Section -->
      <div class="dashboard-grid-1-1">
        <div class="card chart-card">
          <div class="card-header">
            <div>
              <h3 class="chart-title">Tren Pendapatan 7 Hari Terakhir</h3>
              <p class="chart-subtitle">Akumulasi transaksi offline status Lunas</p>
            </div>
            <span class="badge badge-success">Tunai</span>
          </div>
          <div class="card-body">
            <div class="chart-container" id="revenue-chart-container"></div>
          </div>
        </div>

        <div class="card chart-card">
          <div class="card-header">
            <div>
              <h3 class="chart-title">Jumlah Pasien per Hari</h3>
              <p class="chart-subtitle">Kunjungan pasien 7 hari terakhir</p>
            </div>
            <span class="badge badge-secondary">Klinik Terpadu</span>
          </div>
          <div class="card-body">
            <div class="chart-container" id="patient-chart-container"></div>
          </div>
        </div>
      </div>

      <!-- Transaksi Terbaru & Log -->
      <div class="dashboard-grid-2-1">
        <div class="card">
          <div class="card-header">
            <h3>Transaksi Terbaru (Monitoring Owner)</h3>
            <button class="btn btn-outline btn-sm" onclick="App.navigate('transaksi')">Lihat Semua</button>
          </div>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Pasien</th>
                  <th>Layanan</th>
                  <th class="text-right">Total</th>
                  <th class="text-center">Status</th>
                  <th>Tanggal</th>
                  <th class="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${recentTrxs.map(t => `
                  <tr>
                    <td><strong>${t.id}</strong></td>
                    <td>${t.patientName}</td>
                    <td>${t.service}</td>
                    <td class="text-right"><strong>${formatRupiah(t.total)}</strong></td>
                    <td class="text-center">
                      <span class="badge ${t.status === 'Lunas' ? 'badge-success' : 'badge-danger'}">
                        ${t.status}
                      </span>
                    </td>
                    <td>${t.date}</td>
                    <td class="text-center">
                      <button class="btn btn-outline btn-sm" onclick="App.showTransactionDetailModal('${t.id}')">
                        Detail
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>Aktivitas Sistem Terbaru</h3>
            <span class="badge badge-secondary">Real-time</span>
          </div>
          <div class="card-body">
            <div class="activity-feed">
              ${logs.slice(0, 6).map(log => `
                <div class="activity-item">
                  <div class="activity-icon ${log.type || 'emerald'}">
                    ${this.getIconSvg(log.role === 'Dokter' ? 'stethoscope' : log.role === 'Resepsionis' ? 'user-check' : 'activity')}
                  </div>
                  <div class="activity-details">
                    <div class="activity-text">${log.text}</div>
                    <div class="activity-time">${log.time} • ${log.role}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      this.renderRevenueLineChart();
      this.renderPatientsBarChart();
    }, 50);
  },

  // =========================================================================
  // VIEW: RESEPSIONIS DASHBOARD
  // =========================================================================
  renderResepsionisDashboard(container) {
    const queues = AntreanModule.getAllQueues();
    const waitingQueues = queues.filter(q => q.status === 'Menunggu' || q.status === 'Dipanggil');
    const unbilledExams = TransaksiModule.getUnbilledExaminations();

    container.innerHTML = `
      <div class="kpi-grid">
        <div class="kpi-card" style="cursor: pointer;" onclick="App.showCreatePatientModal()">
          <div class="kpi-header">
            <span class="kpi-title">Pendaftaran Pasien</span>
            <div class="kpi-icon-bubble kpi-icon-emerald">
              ${this.getIconSvg('plus')}
            </div>
          </div>
          <div class="kpi-value">+ Tambah Pasien</div>
          <div class="kpi-meta"><span class="kpi-trend positive">Buka Modal Form</span> Pendaftaran</div>
        </div>

        <div class="kpi-card" style="cursor: pointer;" onclick="App.navigate('antrean')">
          <div class="kpi-header">
            <span class="kpi-title">Antrean Aktif</span>
            <div class="kpi-icon-bubble kpi-icon-amber">
              ${this.getIconSvg('clock')}
            </div>
          </div>
          <div class="kpi-value">${waitingQueues.length} Pasien</div>
          <div class="kpi-meta">Menunggu / Dipanggil</div>
        </div>

        <div class="kpi-card" style="cursor: pointer;" onclick="App.navigate('transaksi')">
          <div class="kpi-header">
            <span class="kpi-title">Menunggu Pembayaran</span>
            <div class="kpi-icon-bubble kpi-icon-purple">
              ${this.getIconSvg('credit-card')}
            </div>
          </div>
          <div class="kpi-value">${unbilledExams.length} Pasien</div>
          <div class="kpi-meta">Pemeriksaan dokter telah selesai</div>
        </div>
      </div>

      <div class="dashboard-grid-1-1">
        <div class="card">
          <div class="card-header">
            <h3>Antrean Pasien Menunggu</h3>
            <button class="btn btn-outline btn-sm" onclick="App.navigate('antrean')">Buka Antrean</button>
          </div>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>No. Antrean</th>
                  <th>Nama Pasien</th>
                  <th>Dokter</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${waitingQueues.length === 0 ? `
                  <tr><td colspan="5" class="text-center" style="padding: 2rem; color: #94a3b8;">Tidak ada antrean menunggu</td></tr>
                ` : waitingQueues.map(q => `
                  <tr>
                    <td><strong>${q.queueNumber}</strong></td>
                    <td>${q.patientName}</td>
                    <td>${q.doctor}</td>
                    <td><span class="badge ${q.status === 'Dipanggil' ? 'badge-called' : 'badge-waiting'}">${q.status}</span></td>
                    <td>
                      <button class="btn btn-sm btn-outline-primary" onclick="App.callPatientAction('${q.queueNumber}')">
                        Panggil
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>Pemeriksaan Selesai (Siap Bayar)</h3>
            <button class="btn btn-outline btn-sm" onclick="App.navigate('transaksi')">Buka Kasir</button>
          </div>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>No. RM</th>
                  <th>Pasien</th>
                  <th>Dokter</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${unbilledExams.length === 0 ? `
                  <tr><td colspan="4" class="text-center" style="padding: 2rem; color: #94a3b8;">Semua pemeriksaan telah dibayar</td></tr>
                ` : unbilledExams.map(ex => `
                  <tr>
                    <td><strong>${ex.patientRM}</strong></td>
                    <td>${ex.patientName}</td>
                    <td>${ex.doctor}</td>
                    <td>
                      <button class="btn btn-sm btn-primary" onclick="App.showCreateTransactionModal('${ex.patientRM}')">
                        Bayar Sekarang (Modal)
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // VIEW: DOKTER DASHBOARD
  // =========================================================================
  renderDokterDashboard(container) {
    const user = Auth.getCurrentUser();
    const activePatient = AntreanModule.getActiveDoctorQueue(user.name);
    const queues = AntreanModule.getAllQueues();
    const waitingList = queues.filter(q => q.status === 'Menunggu' || q.status === 'Dipanggil');
    const finishedToday = PemeriksaanModule.getAllExaminations();

    container.innerHTML = `
      ${activePatient ? `
        <div class="active-patient-hero">
          <div class="active-patient-badge">
            <span class="badge-dot" style="background: #34d399;"></span>
            Antrean Saat Ini
          </div>
          <div class="hero-queue-no">${activePatient.queueNumber}</div>
          <div class="hero-patient-name">${activePatient.patientName}</div>
          <div class="hero-patient-meta">
            <span><strong>No. RM:</strong> ${activePatient.patientRM}</span>
            <span>•</span>
            <span><strong>Layanan:</strong> ${activePatient.service}</span>
            <span>•</span>
            <span><strong>Waktu Kedatangan:</strong> ${activePatient.time}</span>
          </div>

          <div class="hero-complaint-box">
            <strong>Keluhan Pasien:</strong> ${activePatient.complaint || 'Tidak ada catatan keluhan'}
          </div>

          <div class="hero-actions">
            <button class="btn-hero-action" onclick="App.showDoctorExamModal('${activePatient.queueNumber}')">
              ${this.getIconSvg('stethoscope')}
              [Mulai Pemeriksaan (Modal)]
            </button>
            <button class="btn btn-outline" style="color: white; border-color: rgba(255,255,255,0.4);" onclick="App.callPatientAction('${activePatient.queueNumber}')">
              Panggil Ulang Pasien
            </button>
          </div>
        </div>
      ` : `
        <div class="card" style="padding: 2.5rem; text-align: center; margin-bottom: 2rem; background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);">
          <div class="kpi-icon-bubble kpi-icon-emerald" style="margin: 0 auto 1rem; width: 56px; height: 56px;">
            ${this.getIconSvg('check')}
          </div>
          <h2 style="font-size: 1.3rem; color: #065f46;">Tidak Ada Antrean Menunggu</h2>
          <p style="margin-top: 0.35rem; color: #64748b;">Semua pasien poli telah selesai diperiksa.</p>
        </div>
      `}

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Pasien Menunggu</span>
            <div class="kpi-icon-bubble kpi-icon-amber">
              ${this.getIconSvg('clock')}
            </div>
          </div>
          <div class="kpi-value">${waitingList.length}</div>
          <div class="kpi-meta">Dalam antrean poli</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Pemeriksaan Selesai</span>
            <div class="kpi-icon-bubble kpi-icon-emerald">
              ${this.getIconSvg('activity')}
            </div>
          </div>
          <div class="kpi-value">${finishedToday.length}</div>
          <div class="kpi-meta">Selesai diperiksa hari ini</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Daftar Antrean Pasien Poli</h3>
          <button class="btn btn-outline btn-sm" onclick="App.navigate('antrean')">Kelola Antrean</button>
        </div>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>No. Antrean</th>
                <th>No. RM</th>
                <th>Nama Pasien</th>
                <th>Keluhan</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${waitingList.length === 0 ? `
                <tr><td colspan="6" class="text-center" style="padding: 2rem; color: #94a3b8;">Antrean kosong</td></tr>
              ` : waitingList.map(q => `
                <tr>
                  <td><strong>${q.queueNumber}</strong></td>
                  <td>${q.patientRM}</td>
                  <td><strong>${q.patientName}</strong></td>
                  <td>${q.complaint}</td>
                  <td>
                    <span class="badge ${q.status === 'Dipanggil' ? 'badge-called' : 'badge-waiting'}">
                      ${q.status}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-sm btn-primary" onclick="App.showDoctorExamModal('${q.queueNumber}')">
                      Periksa (Modal)
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // VIEW: DATA PASIEN (TANPA NIK)
  // =========================================================================
  renderPasienView(container, user) {
    const patients = PasienModule.getAllPatients();

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div style="display: flex; gap: 1rem; align-items: center; flex: 1; max-width: 600px;">
            <input type="text" id="patient-search-input" class="form-control" placeholder="Cari Nama Pasien atau No. RM..." oninput="App.handlePatientSearch()" />
            <select id="patient-gender-filter" class="form-control" style="max-width: 160px;" onchange="App.handlePatientSearch()">
              <option value="all">Semua Gender</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>
          <button class="btn btn-primary" onclick="App.showCreatePatientModal()">
            ${this.getIconSvg('plus')}
            + Tambah Pasien Baru (Modal)
          </button>
        </div>
        <div class="table-responsive">
          <table class="table" id="patients-data-table">
            <thead>
              <tr>
                <th>No. RM</th>
                <th>Nama Lengkap</th>
                <th>Gender</th>
                <th>Usia</th>
                <th>No. HP</th>
                <th>Alamat</th>
                <th class="text-center">Status</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody id="patients-tbody">
              ${this.renderPatientsRows(patients, user)}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderPatientsRows(patients, user) {
    if (patients.length === 0) {
      return `<tr><td colspan="8" class="text-center" style="padding: 2.5rem; color: #94a3b8;">Data pasien tidak ditemukan</td></tr>`;
    }

    return patients.map(p => `
      <tr>
        <td><strong>${p.rm}</strong></td>
        <td><strong>${p.name}</strong></td>
        <td>${p.gender}</td>
        <td>${p.age} Thn</td>
        <td>${p.phone || '-'}</td>
        <td style="max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.address || '-'}</td>
        <td class="text-center">
          <span class="badge badge-success">${p.status}</span>
        </td>
        <td class="text-center">
          <div style="display: inline-flex; gap: 0.35rem;">
            <button class="btn btn-outline btn-sm" title="Lihat Rekam Medis" onclick="App.showPatientDetailModal('${p.rm}')">
              Detail
            </button>
            <button class="btn btn-outline btn-sm" title="Edit Data Pasien" onclick="App.showEditPatientModal('${p.rm}')">
              Edit
            </button>
            <button class="btn btn-outline btn-sm" style="color: #dc2626;" title="Hapus Pasien" onclick="App.showDeletePatientConfirmModal('${p.rm}')">
              Hapus
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  handlePatientSearch() {
    const query = document.getElementById('patient-search-input').value;
    const gender = document.getElementById('patient-gender-filter').value;
    const filtered = PasienModule.filterPatients(query, gender);
    const user = Auth.getCurrentUser();
    const tbody = document.getElementById('patients-tbody');
    if (tbody) {
      tbody.innerHTML = this.renderPatientsRows(filtered, user);
    }
  },

  // =========================================================================
  // MODAL: CREATE PASIEN (PENDAFTARAN PASIEN BARU) - MODAL SHOW
  // =========================================================================
  showCreatePatientModal() {
    const nextRM = getNextPatientRM();
    const doctors = UserManagement.getDoctors().filter(d => d.status === 'Aktif');

    const modalOutlet = document.getElementById('global-modal-outlet');
    modalOutlet.innerHTML = `
      <div id="modal-create-patient" class="modal-overlay active">
        <div class="modal-container modal-lg">
          <div class="modal-header">
            <div>
              <h3>Pendaftaran Pasien Baru</h3>
              <p style="font-size: 0.78rem; color: #64748b;">Nomor RM dan Tiket Antrean dibuat otomatis ke sistem</p>
            </div>
            <button class="modal-close-btn" onclick="App.closeAllModals()">&times;</button>
          </div>
          <div class="modal-content">
            <form id="form-create-patient" onsubmit="App.handleSaveNewPatient(event)">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Nomor Rekam Medis (RM)</label>
                  <input type="text" id="reg-rm" class="form-control" value="${nextRM}" readonly />
                </div>

                <div class="form-group">
                  <label class="form-label">Nama Lengkap Pasien <span class="required">*</span></label>
                  <input type="text" id="reg-name" class="form-control" placeholder="Nama lengkap pasien" required autofocus />
                </div>

                <div class="form-group">
                  <label class="form-label">Jenis Kelamin <span class="required">*</span></label>
                  <div class="radio-options-row">
                    <label class="radio-pill">
                      <input type="radio" name="gender" value="Laki-laki" checked /> Laki-laki
                    </label>
                    <label class="radio-pill">
                      <input type="radio" name="gender" value="Perempuan" /> Perempuan
                    </label>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Tanggal Lahir <span class="required">*</span></label>
                  <input type="date" id="reg-dob" class="form-control" required onchange="App.handleDobChange(this.value)" />
                  <span class="form-hint" id="reg-age-hint">Umur akan dihitung otomatis</span>
                </div>

                <div class="form-group">
                  <label class="form-label">Nomor HP / WhatsApp <span class="required">*</span></label>
                  <input type="tel" id="reg-phone" class="form-control" placeholder="08xxxxxxxxxx" required />
                </div>

                <div class="form-group">
                  <label class="form-label">Jenis Layanan <span class="required">*</span></label>
                  <select id="reg-service" class="form-control" required>
                    <option value="Pemeriksaan Umum">Pemeriksaan Umum</option>
                    <option value="Pemeriksaan Gigi">Pemeriksaan Gigi</option>
                    <option value="KIA & Tumbuh Kembang">KIA & Tumbuh Kembang</option>
                  </select>
                </div>

                <div class="form-group col-span-2">
                  <label class="form-label">Dokter Tujuan <span class="required">*</span></label>
                  <select id="reg-doctor" class="form-control" required>
                    ${doctors.map(d => `
                      <option value="${d.fullName}">${d.fullName} (${d.specialty})</option>
                    `).join('')}
                  </select>
                </div>

                <div class="form-group col-span-2">
                  <label class="form-label">Alamat Lengkap</label>
                  <textarea id="reg-address" class="form-control" placeholder="Alamat domisili pasien" rows="2"></textarea>
                </div>

                <div class="form-group col-span-2">
                  <label class="form-label">Keluhan Utama <span class="required">*</span></label>
                  <textarea id="reg-complaint" class="form-control" placeholder="Keluhan utama yang dirasakan pasien" rows="2" required></textarea>
                </div>
              </div>

              <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem;">
                <button type="button" class="btn btn-secondary" onclick="App.closeAllModals()">Batal</button>
                <button type="submit" class="btn btn-primary">
                  ${this.getIconSvg('plus')} Simpan & Masukkan Antrean
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  },

  handleDobChange(val) {
    const age = calculateAge(val);
    const hint = document.getElementById('reg-age-hint');
    if (hint) {
      hint.textContent = `Usia terhitung: ${age} Tahun`;
      hint.style.color = '#059669';
      hint.style.fontWeight = '600';
    }
  },

  handleSaveNewPatient(e) {
    e.preventDefault();
    const genderEl = document.querySelector('input[name="gender"]:checked');

    const data = {
      rm: document.getElementById('reg-rm').value,
      name: document.getElementById('reg-name').value,
      gender: genderEl ? genderEl.value : 'Laki-laki',
      dob: document.getElementById('reg-dob').value,
      phone: document.getElementById('reg-phone').value,
      service: document.getElementById('reg-service').value,
      doctor: document.getElementById('reg-doctor').value,
      address: document.getElementById('reg-address').value,
      complaint: document.getElementById('reg-complaint').value
    };

    const res = PasienModule.registerPatient(data);
    this.closeAllModals();
    this.showToast(`Pendaftaran berhasil! Pasien ${res.patient.name} masuk antrean ${res.queue.queueNumber}`, 'success');

    // Tampilkan modal sukses pendaftaran
    this.showRegistrationSuccessModal(res.patient, res.queue);

    // Refresh view jika sedang di pasien atau antrean atau dashboard
    if (this.currentView === 'pasien') {
      this.renderPasienView(document.getElementById('main-content-area'), Auth.getCurrentUser());
    } else if (this.currentView === 'antrean') {
      this.renderAntreanView(document.getElementById('main-content-area'), Auth.getCurrentUser());
    } else if (this.currentView === 'dashboard') {
      this.renderCurrentView('dashboard', new URLSearchParams(), Auth.getCurrentUser());
    }
  },

  showRegistrationSuccessModal(patient, queue) {
    const modalOutlet = document.getElementById('global-modal-outlet');
    modalOutlet.innerHTML = `
      <div id="modal-reg-success" class="modal-overlay active">
        <div class="modal-container modal-sm" style="text-align: center;">
          <div class="modal-content" style="padding: 2.25rem 2rem 1.5rem;">
            <div class="kpi-icon-bubble kpi-icon-emerald" style="width: 60px; height: 60px; margin: 0 auto 1rem;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 30px; height: 30px;"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            
            <h3 style="font-size: 1.3rem; color: #065f46; font-weight: 800;">Pendaftaran Sukses!</h3>
            <p style="font-size: 0.82rem; color: #64748b; margin-top: 0.2rem;">Data pasien tersimpan & tiket antrean poli terbit.</p>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-md); padding: 1.25rem; margin: 1.25rem 0; text-align: left;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.85rem;">
                <span style="color: #64748b;">Nama Pasien:</span>
                <strong style="color: #0f172a;">${patient.name}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.85rem;">
                <span style="color: #64748b;">Nomor RM:</span>
                <strong style="color: #0f172a;">${patient.rm}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #cbd5e1; padding-top: 0.6rem; margin-top: 0.6rem;">
                <span style="color: #64748b; font-size: 0.85rem;">Nomor Antrean:</span>
                <span style="font-size: 1.6rem; font-weight: 900; color: #059669;">${queue.queueNumber}</span>
              </div>
            </div>

            <div style="display: flex; gap: 0.5rem; justify-content: center;">
              <button class="btn btn-outline btn-sm" onclick="App.closeAllModals()">Tutup</button>
              <button class="btn btn-primary btn-sm" onclick="App.closeAllModals(); App.navigate('antrean');">Lihat Antrean</button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // MODAL: UPDATE PASIEN (EDIT PASIEN) - MODAL SHOW
  // =========================================================================
  showEditPatientModal(rm) {
    const patient = PasienModule.getPatientByRM(rm);
    if (!patient) return;

    const modalOutlet = document.getElementById('global-modal-outlet');
    modalOutlet.innerHTML = `
      <div id="modal-patient-edit" class="modal-overlay active">
        <div class="modal-container modal-md">
          <div class="modal-header">
            <h3>Edit Data Pasien: ${patient.rm}</h3>
            <button class="modal-close-btn" onclick="App.closeAllModals()">&times;</button>
          </div>
          <div class="modal-content">
            <form id="edit-patient-form" onsubmit="App.handleSavePatientEdit(event, '${patient.rm}')">
              <div class="form-grid">
                <div class="form-group col-span-2">
                  <label class="form-label">Nama Lengkap Pasien <span class="required">*</span></label>
                  <input type="text" id="edit-name" class="form-control" value="${patient.name}" required />
                </div>
                
                <div class="form-group">
                  <label class="form-label">Tanggal Lahir <span class="required">*</span></label>
                  <input type="date" id="edit-dob" class="form-control" value="${patient.dob || ''}" required />
                </div>

                <div class="form-group">
                  <label class="form-label">Jenis Kelamin</label>
                  <select id="edit-gender" class="form-control">
                    <option value="Laki-laki" ${patient.gender === 'Laki-laki' ? 'selected' : ''}>Laki-laki</option>
                    <option value="Perempuan" ${patient.gender === 'Perempuan' ? 'selected' : ''}>Perempuan</option>
                  </select>
                </div>

                <div class="form-group col-span-2">
                  <label class="form-label">Nomor Telepon / HP <span class="required">*</span></label>
                  <input type="tel" id="edit-phone" class="form-control" value="${patient.phone || ''}" required />
                </div>

                <div class="form-group col-span-2">
                  <label class="form-label">Alamat Lengkap</label>
                  <textarea id="edit-address" class="form-control" rows="2">${patient.address || ''}</textarea>
                </div>

                <div class="form-group col-span-2">
                  <label class="form-label">Status Pasien</label>
                  <select id="edit-status" class="form-control">
                    <option value="Aktif" ${patient.status === 'Aktif' ? 'selected' : ''}>Aktif</option>
                    <option value="Nonaktif" ${patient.status === 'Nonaktif' ? 'selected' : ''}>Nonaktif</option>
                  </select>
                </div>
              </div>

              <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem;">
                <button type="button" class="btn btn-secondary" onclick="App.closeAllModals()">Batal</button>
                <button type="submit" class="btn btn-primary">Simpan Perubahan Pasien</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  },

  handleSavePatientEdit(e, rm) {
    e.preventDefault();
    const updated = {
      name: document.getElementById('edit-name').value,
      dob: document.getElementById('edit-dob').value,
      gender: document.getElementById('edit-gender').value,
      phone: document.getElementById('edit-phone').value,
      address: document.getElementById('edit-address').value,
      status: document.getElementById('edit-status').value
    };

    PasienModule.updatePatient(rm, updated);
    this.closeAllModals();
    this.showToast(`Data pasien ${updated.name} berhasil diperbarui!`, 'success');
    this.renderPasienView(document.getElementById('main-content-area'), Auth.getCurrentUser());
  },

  // =========================================================================
  // MODAL: DELETE PASIEN - MODAL SHOW CONFIRMATION
  // =========================================================================
  showDeletePatientConfirmModal(rm) {
    const patient = PasienModule.getPatientByRM(rm);
    if (!patient) return;

    const modalOutlet = document.getElementById('global-modal-outlet');
    modalOutlet.innerHTML = `
      <div id="modal-delete-patient" class="modal-overlay active">
        <div class="modal-container modal-sm">
          <div class="modal-content confirm-box" style="padding: 2rem 1.5rem 1.5rem;">
            <div class="confirm-icon-danger">
              ${this.getIconSvg('trash')}
            </div>
            <h3 class="confirm-title">Hapus Pasien?</h3>
            <p class="confirm-desc">
              Apakah Anda yakin ingin menghapus data pasien <strong>${patient.name}</strong> (${patient.rm})? Data yang dihapus tidak dapat dikembalikan.
            </p>
            <div style="display: flex; gap: 0.75rem; justify-content: center;">
              <button class="btn btn-secondary" onclick="App.closeAllModals()">Batal</button>
              <button class="btn btn-danger" onclick="App.handleConfirmDeletePatient('${patient.rm}')">
                Ya, Hapus Pasien
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  handleConfirmDeletePatient(rm) {
    PasienModule.deletePatient(rm);
    this.closeAllModals();
    this.showToast(`Data pasien (${rm}) telah berhasil dihapus`, 'info');
    this.renderPasienView(document.getElementById('main-content-area'), Auth.getCurrentUser());
  },

  // =========================================================================
  // MODAL: DETAIL PASIEN (REKAM MEDIS) - TANPA NIK
  // =========================================================================
  showPatientDetailModal(rm) {
    const patient = PasienModule.getPatientByRM(rm);
    if (!patient) return;

    const exams = PemeriksaanModule.getExaminationsByPatientRM(rm);
    const trxs = TransaksiModule.getAllTransactions().filter(t => t.patientRM === rm);

    const modalOutlet = document.getElementById('global-modal-outlet');
    modalOutlet.innerHTML = `
      <div id="modal-patient-detail" class="modal-overlay active">
        <div class="modal-container modal-lg">
          <div class="modal-header">
            <h3>Rekam Medis Pasien: ${patient.name} (${patient.rm})</h3>
            <button class="modal-close-btn" onclick="App.closeAllModals()">&times;</button>
          </div>
          <div class="modal-content">
            <div class="patient-info-strip">
              <div class="patient-info-item">
                <span class="patient-info-label">No. Rekam Medis</span>
                <span class="patient-info-val">${patient.rm}</span>
              </div>
              <div class="patient-info-item">
                <span class="patient-info-label">Gender & Usia</span>
                <span class="patient-info-val">${patient.gender}, ${patient.age} Thn</span>
              </div>
              <div class="patient-info-item">
                <span class="patient-info-label">No. Telepon / HP</span>
                <span class="patient-info-val">${patient.phone || '-'}</span>
              </div>
              <div class="patient-info-item">
                <span class="patient-info-label">Alamat</span>
                <span class="patient-info-val" style="font-size: 0.85rem;">${patient.address || '-'}</span>
              </div>
            </div>

            <div style="margin-bottom: 1.5rem;">
              <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem; color: #1e293b;">Riwayat Pemeriksaan Medis</h4>
              ${exams.length === 0 ? `
                <p style="font-size: 0.85rem; color: #94a3b8;">Belum ada catatan riwayat pemeriksaan klinis.</p>
              ` : `
                <div class="table-responsive">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>Tanggal</th>
                        <th>Dokter</th>
                        <th>Tanda Vital</th>
                        <th>Diagnosis</th>
                        <th>Tindakan / Resep</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${exams.map(e => `
                        <tr>
                          <td>${e.date}</td>
                          <td><strong>${e.doctor}</strong></td>
                          <td><small>TD: ${e.bp} | S: ${e.temp}°C | BB: ${e.weight}kg</small></td>
                          <td><span class="badge badge-exam">${e.diagnosis}</span></td>
                          <td>
                            <div style="font-size: 0.8rem;">${e.treatment || '-'}</div>
                            <div style="font-size: 0.75rem; color: #64748b;">${(e.prescription || '').replace(/\n/g, ', ')}</div>
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              `}
            </div>

            <div>
              <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem; color: #1e293b;">Riwayat Transaksi Pasien</h4>
              ${trxs.length === 0 ? `
                <p style="font-size: 0.85rem; color: #94a3b8;">Belum ada riwayat transaksi pembayaran.</p>
              ` : `
                <div class="table-responsive">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>ID Transaksi</th>
                        <th>Tanggal</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${trxs.map(t => `
                        <tr>
                          <td><strong>${t.id}</strong></td>
                          <td>${t.date}</td>
                          <td>${formatRupiah(t.total)}</td>
                          <td><span class="badge ${t.status === 'Lunas' ? 'badge-success' : 'badge-danger'}">${t.status}</span></td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              `}
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="App.closeAllModals()">Tutup</button>
          </div>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // VIEW: MANAJEMEN DOKTER (ROLE OWNER)
  // =========================================================================
  renderDataDokterView(container, user) {
    const doctors = UserManagement.getDoctors();

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div>
            <h3>Manajemen Data Dokter Praktik</h3>
            <p style="font-size: 0.8rem; color: #64748b;">Kelola daftar tenaga medis dokter, jadwal poli, dan akun login</p>
          </div>
          <button class="btn btn-primary" onclick="App.showCreateDoctorModal()">
            ${this.getIconSvg('plus')}
            + Tambah Dokter Baru (Modal)
          </button>
        </div>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>ID Dokter</th>
                <th>Nama Lengkap & Gelar</th>
                <th>Spesialisasi / Poli</th>
                <th>Nomor SIP</th>
                <th>Kontak / HP</th>
                <th>Akun Login</th>
                <th class="text-center">Status</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${doctors.length === 0 ? `
                <tr><td colspan="8" class="text-center" style="padding: 2.5rem; color: #94a3b8;">Belum ada data dokter</td></tr>
              ` : doctors.map(d => `
                <tr>
                  <td><strong>${d.id}</strong></td>
                  <td><strong>${d.fullName}</strong></td>
                  <td>${d.specialty}</td>
                  <td><code>${d.sip}</code></td>
                  <td>${d.phone || '-'}</td>
                  <td><code>@${d.username}</code></td>
                  <td class="text-center">
                    <span class="badge ${d.status === 'Aktif' ? 'badge-success' : 'badge-secondary'}">
                      <span class="badge-dot"></span>
                      ${d.status}
                    </span>
                  </td>
                  <td class="text-center">
                    <div style="display: inline-flex; gap: 0.35rem;">
                      <button class="btn btn-outline btn-sm" onclick="App.showEditDoctorModal('${d.id}')">
                        ${this.getIconSvg('edit')} Edit
                      </button>
                      <button class="btn btn-outline btn-sm" style="color: #dc2626;" onclick="App.showDeleteDoctorConfirmModal('${d.id}')">
                        ${this.getIconSvg('trash')} Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // MODAL: CREATE DOKTER (MODAL SHOW)
  // =========================================================================
  showCreateDoctorModal() {
    const nextId = getNextDoctorID();
    const modalOutlet = document.getElementById('global-modal-outlet');
    modalOutlet.innerHTML = `
      <div id="modal-create-doctor" class="modal-overlay active">
        <div class="modal-container modal-md">
          <div class="modal-header">
            <h3>Tambah Dokter Baru</h3>
            <button class="modal-close-btn" onclick="App.closeAllModals()">&times;</button>
          </div>
          <div class="modal-content">
            <form id="form-create-doctor" onsubmit="App.handleSaveNewDoctor(event)">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">ID Dokter</label>
                  <input type="text" id="doc-id" class="form-control" value="${nextId}" readonly />
                </div>

                <div class="form-group">
                  <label class="form-label">Nama Panggilan / Singkat <span class="required">*</span></label>
                  <input type="text" id="doc-name" class="form-control" placeholder="e.g. dr. Sarah" required autofocus />
                </div>

                <div class="form-group col-span-2">
                  <label class="form-label">Nama Lengkap & Gelar <span class="required">*</span></label>
                  <input type="text" id="doc-fullname" class="form-control" placeholder="e.g. dr. Sarah Amelia, Sp.KK" required />
                </div>

                <div class="form-group">
                  <label class="form-label">Spesialisasi / Poli <span class="required">*</span></label>
                  <input type="text" id="doc-specialty" class="form-control" placeholder="e.g. Poli Kulit & Kelamin / Umum" required />
                </div>

                <div class="form-group">
                  <label class="form-label">Nomor SIP <span class="required">*</span></label>
                  <input type="text" id="doc-sip" class="form-control" placeholder="448/SIP/2026" required />
                </div>

                <div class="form-group">
                  <label class="form-label">No. Telepon / HP</label>
                  <input type="tel" id="doc-phone" class="form-control" placeholder="0812xxxxxxxx" />
                </div>

                <div class="form-group">
                  <label class="form-label">Status Praktik</label>
                  <select id="doc-status" class="form-control">
                    <option value="Aktif" selected>Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Username Akun</label>
                  <input type="text" id="doc-username" class="form-control" placeholder="e.g. dr_sarah" />
                </div>

                <div class="form-group">
                  <label class="form-label">Password Login</label>
                  <input type="password" id="doc-password" class="form-control" value="dokter123" />
                  <span class="form-hint">Default: dokter123</span>
                </div>
              </div>

              <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem;">
                <button type="button" class="btn btn-secondary" onclick="App.closeAllModals()">Batal</button>
                <button type="submit" class="btn btn-primary">
                  ${this.getIconSvg('plus')} Simpan & Buat Akun Dokter
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  },

  handleSaveNewDoctor(e) {
    e.preventDefault();
    const data = {
      id: document.getElementById('doc-id').value,
      name: document.getElementById('doc-name').value,
      fullName: document.getElementById('doc-fullname').value,
      specialty: document.getElementById('doc-specialty').value,
      sip: document.getElementById('doc-sip').value,
      phone: document.getElementById('doc-phone').value,
      status: document.getElementById('doc-status').value,
      username: document.getElementById('doc-username').value,
      password: document.getElementById('doc-password').value
    };

    const newDoc = UserManagement.createDoctor(data);
    this.closeAllModals();
    this.showToast(`Dokter ${newDoc.fullName} (${newDoc.id}) berhasil ditambahkan!`, 'success');
    this.renderDataDokterView(document.getElementById('main-content-area'), Auth.getCurrentUser());
  },

  // =========================================================================
  // MODAL: UPDATE DOKTER (MODAL SHOW)
  // =========================================================================
  showEditDoctorModal(id) {
    const doc = UserManagement.getDoctorById(id);
    if (!doc) return;

    const modalOutlet = document.getElementById('global-modal-outlet');
    modalOutlet.innerHTML = `
      <div id="modal-edit-doctor" class="modal-overlay active">
        <div class="modal-container modal-md">
          <div class="modal-header">
            <h3>Edit Dokter: ${doc.id}</h3>
            <button class="modal-close-btn" onclick="App.closeAllModals()">&times;</button>
          </div>
          <div class="modal-content">
            <form id="form-edit-doctor" onsubmit="App.handleSaveEditDoctor(event, '${doc.id}')">
              <div class="form-grid">
                <div class="form-group col-span-2">
                  <label class="form-label">Nama Lengkap & Gelar <span class="required">*</span></label>
                  <input type="text" id="edit-doc-fullname" class="form-control" value="${doc.fullName}" required />
                </div>

                <div class="form-group">
                  <label class="form-label">Nama Panggilan</label>
                  <input type="text" id="edit-doc-name" class="form-control" value="${doc.name}" required />
                </div>

                <div class="form-group">
                  <label class="form-label">Spesialisasi / Poli <span class="required">*</span></label>
                  <input type="text" id="edit-doc-specialty" class="form-control" value="${doc.specialty}" required />
                </div>

                <div class="form-group">
                  <label class="form-label">Nomor SIP <span class="required">*</span></label>
                  <input type="text" id="edit-doc-sip" class="form-control" value="${doc.sip}" required />
                </div>

                <div class="form-group">
                  <label class="form-label">No. Telepon / HP</label>
                  <input type="tel" id="edit-doc-phone" class="form-control" value="${doc.phone || ''}" />
                </div>

                <div class="form-group">
                  <label class="form-label">Status Praktik</label>
                  <select id="edit-doc-status" class="form-control">
                    <option value="Aktif" ${doc.status === 'Aktif' ? 'selected' : ''}>Aktif</option>
                    <option value="Nonaktif" ${doc.status === 'Nonaktif' ? 'selected' : ''}>Nonaktif</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Ganti Password (Opsional)</label>
                  <input type="password" id="edit-doc-password" class="form-control" placeholder="Kosongkan jika tidak diubah" />
                </div>
              </div>

              <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem;">
                <button type="button" class="btn btn-secondary" onclick="App.closeAllModals()">Batal</button>
                <button type="submit" class="btn btn-primary">Simpan Perubahan Dokter</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  },

  handleSaveEditDoctor(e, id) {
    e.preventDefault();
    const updated = {
      fullName: document.getElementById('edit-doc-fullname').value,
      name: document.getElementById('edit-doc-name').value,
      specialty: document.getElementById('edit-doc-specialty').value,
      sip: document.getElementById('edit-doc-sip').value,
      phone: document.getElementById('edit-doc-phone').value,
      status: document.getElementById('edit-doc-status').value,
      password: document.getElementById('edit-doc-password').value || undefined
    };

    UserManagement.updateDoctor(id, updated);
    this.closeAllModals();
    this.showToast(`Data dokter ${updated.fullName} berhasil diperbarui!`, 'success');
    this.renderDataDokterView(document.getElementById('main-content-area'), Auth.getCurrentUser());
  },

  // =========================================================================
  // MODAL: DELETE DOKTER (MODAL SHOW CONFIRMATION)
  // =========================================================================
  showDeleteDoctorConfirmModal(id) {
    const doc = UserManagement.getDoctorById(id);
    if (!doc) return;

    const modalOutlet = document.getElementById('global-modal-outlet');
    modalOutlet.innerHTML = `
      <div id="modal-delete-doctor" class="modal-overlay active">
        <div class="modal-container modal-sm">
          <div class="modal-content confirm-box" style="padding: 2rem 1.5rem 1.5rem;">
            <div class="confirm-icon-danger">
              ${this.getIconSvg('trash')}
            </div>
            <h3 class="confirm-title">Hapus Dokter?</h3>
            <p class="confirm-desc">
              Apakah Anda yakin ingin menghapus data dokter <strong>${doc.fullName}</strong> (${doc.id})? Akun login terkait juga akan dinonaktifkan.
            </p>
            <div style="display: flex; gap: 0.75rem; justify-content: center;">
              <button class="btn btn-secondary" onclick="App.closeAllModals()">Batal</button>
              <button class="btn btn-danger" onclick="App.handleConfirmDeleteDoctor('${doc.id}')">
                Ya, Hapus Dokter
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  handleConfirmDeleteDoctor(id) {
    UserManagement.deleteDoctor(id);
    this.closeAllModals();
    this.showToast(`Dokter (${id}) berhasil dihapus`, 'info');
    this.renderDataDokterView(document.getElementById('main-content-area'), Auth.getCurrentUser());
  },

  // =========================================================================
  // VIEW: MANAJEMEN RESEPSIONIS (ROLE OWNER)
  // =========================================================================
  renderDataResepsionisView(container, user) {
    const recs = UserManagement.getReceptionists();

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div>
            <h3>Manajemen Staf Resepsionis & Front Desk</h3>
            <p style="font-size: 0.8rem; color: #64748b;">Kelola akun petugas administrasi pendaftaran dan kasir klinik</p>
          </div>
          <button class="btn btn-primary" onclick="App.showCreateReceptionistModal()">
            ${this.getIconSvg('plus')}
            + Tambah Resepsionis Baru (Modal)
          </button>
        </div>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>ID Staf</th>
                <th>Nama Lengkap</th>
                <th>Username Sistem</th>
                <th>Shift Kerja</th>
                <th>No. HP</th>
                <th class="text-center">Status</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${recs.length === 0 ? `
                <tr><td colspan="7" class="text-center" style="padding: 2.5rem; color: #94a3b8;">Belum ada data resepsionis</td></tr>
              ` : recs.map(r => `
                <tr>
                  <td><strong>${r.id}</strong></td>
                  <td><strong>${r.name}</strong></td>
                  <td><code>@${r.username}</code></td>
                  <td>${r.shift || '-'}</td>
                  <td>${r.phone || '-'}</td>
                  <td class="text-center">
                    <span class="badge ${r.status === 'Aktif' ? 'badge-success' : 'badge-secondary'}">
                      <span class="badge-dot"></span>
                      ${r.status}
                    </span>
                  </td>
                  <td class="text-center">
                    <div style="display: inline-flex; gap: 0.35rem;">
                      <button class="btn btn-outline btn-sm" onclick="App.showEditReceptionistModal('${r.id}')">
                        ${this.getIconSvg('edit')} Edit
                      </button>
                      <button class="btn btn-outline btn-sm" style="color: #dc2626;" onclick="App.showDeleteReceptionistConfirmModal('${r.id}')">
                        ${this.getIconSvg('trash')} Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // MODAL: CREATE RESEPSIONIS (MODAL SHOW)
  // =========================================================================
  showCreateReceptionistModal() {
    const nextId = getNextReceptionistID();
    const modalOutlet = document.getElementById('global-modal-outlet');
    modalOutlet.innerHTML = `
      <div id="modal-create-receptionist" class="modal-overlay active">
        <div class="modal-container modal-md">
          <div class="modal-header">
            <h3>Tambah Resepsionis Baru</h3>
            <button class="modal-close-btn" onclick="App.closeAllModals()">&times;</button>
          </div>
          <div class="modal-content">
            <form id="form-create-receptionist" onsubmit="App.handleSaveNewReceptionist(event)">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">ID Staf</label>
                  <input type="text" id="rec-id" class="form-control" value="${nextId}" readonly />
                </div>

                <div class="form-group">
                  <label class="form-label">Nama Lengkap <span class="required">*</span></label>
                  <input type="text" id="rec-name" class="form-control" placeholder="Nama staf resepsionis" required autofocus />
                </div>

                <div class="form-group">
                  <label class="form-label">Shift Kerja <span class="required">*</span></label>
                  <select id="rec-shift" class="form-control" required>
                    <option value="Pagi (08:00 - 15:00)">Pagi (08:00 - 15:00)</option>
                    <option value="Sore (15:00 - 21:00)">Sore (15:00 - 21:00)</option>
                    <option value="Penuh / Full-time">Penuh / Full-time</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">No. Telepon / HP</label>
                  <input type="tel" id="rec-phone" class="form-control" placeholder="08xxxxxxxxxx" />
                </div>

                <div class="form-group">
                  <label class="form-label">Username Login <span class="required">*</span></label>
                  <input type="text" id="rec-username" class="form-control" placeholder="e.g. staf_ani" required />
                </div>

                <div class="form-group">
                  <label class="form-label">Password Login</label>
                  <input type="password" id="rec-password" class="form-control" value="resepsionis123" />
                  <span class="form-hint">Default: resepsionis123</span>
                </div>

                <div class="form-group col-span-2">
                  <label class="form-label">Status Akun</label>
                  <select id="rec-status" class="form-control">
                    <option value="Aktif" selected>Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem;">
                <button type="button" class="btn btn-secondary" onclick="App.closeAllModals()">Batal</button>
                <button type="submit" class="btn btn-primary">
                  ${this.getIconSvg('plus')} Simpan & Buat Akun Resepsionis
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  },

  handleSaveNewReceptionist(e) {
    e.preventDefault();
    const data = {
      id: document.getElementById('rec-id').value,
      name: document.getElementById('rec-name').value,
      shift: document.getElementById('rec-shift').value,
      phone: document.getElementById('rec-phone').value,
      username: document.getElementById('rec-username').value,
      password: document.getElementById('rec-password').value,
      status: document.getElementById('rec-status').value
    };

    const newRec = UserManagement.createReceptionist(data);
    this.closeAllModals();
    this.showToast(`Staf Resepsionis ${newRec.name} (${newRec.id}) berhasil ditambahkan!`, 'success');
    this.renderDataResepsionisView(document.getElementById('main-content-area'), Auth.getCurrentUser());
  },

  // =========================================================================
  // MODAL: UPDATE RESEPSIONIS (MODAL SHOW)
  // =========================================================================
  showEditReceptionistModal(id) {
    const rec = UserManagement.getReceptionistById(id);
    if (!rec) return;

    const modalOutlet = document.getElementById('global-modal-outlet');
    modalOutlet.innerHTML = `
      <div id="modal-edit-receptionist" class="modal-overlay active">
        <div class="modal-container modal-md">
          <div class="modal-header">
            <h3>Edit Resepsionis: ${rec.id}</h3>
            <button class="modal-close-btn" onclick="App.closeAllModals()">&times;</button>
          </div>
          <div class="modal-content">
            <form id="form-edit-receptionist" onsubmit="App.handleSaveEditReceptionist(event, '${rec.id}')">
              <div class="form-grid">
                <div class="form-group col-span-2">
                  <label class="form-label">Nama Lengkap <span class="required">*</span></label>
                  <input type="text" id="edit-rec-name" class="form-control" value="${rec.name}" required />
                </div>

                <div class="form-group">
                  <label class="form-label">Shift Kerja</label>
                  <select id="edit-rec-shift" class="form-control">
                    <option value="Pagi (08:00 - 15:00)" ${rec.shift && rec.shift.includes('Pagi') ? 'selected' : ''}>Pagi (08:00 - 15:00)</option>
                    <option value="Sore (15:00 - 21:00)" ${rec.shift && rec.shift.includes('Sore') ? 'selected' : ''}>Sore (15:00 - 21:00)</option>
                    <option value="Penuh / Full-time" ${rec.shift && rec.shift.includes('Penuh') ? 'selected' : ''}>Penuh / Full-time</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">No. Telepon / HP</label>
                  <input type="tel" id="edit-rec-phone" class="form-control" value="${rec.phone || ''}" />
                </div>

                <div class="form-group">
                  <label class="form-label">Status Akun</label>
                  <select id="edit-rec-status" class="form-control">
                    <option value="Aktif" ${rec.status === 'Aktif' ? 'selected' : ''}>Aktif</option>
                    <option value="Nonaktif" ${rec.status === 'Nonaktif' ? 'selected' : ''}>Nonaktif</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Ganti Password (Opsional)</label>
                  <input type="password" id="edit-rec-password" class="form-control" placeholder="Kosongkan jika tidak diubah" />
                </div>
              </div>

              <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem;">
                <button type="button" class="btn btn-secondary" onclick="App.closeAllModals()">Batal</button>
                <button type="submit" class="btn btn-primary">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  },

  handleSaveEditReceptionist(e, id) {
    e.preventDefault();
    const updated = {
      name: document.getElementById('edit-rec-name').value,
      shift: document.getElementById('edit-rec-shift').value,
      phone: document.getElementById('edit-rec-phone').value,
      status: document.getElementById('edit-rec-status').value,
      password: document.getElementById('edit-rec-password').value || undefined
    };

    UserManagement.updateReceptionist(id, updated);
    this.closeAllModals();
    this.showToast(`Data resepsionis ${updated.name} berhasil diperbarui!`, 'success');
    this.renderDataResepsionisView(document.getElementById('main-content-area'), Auth.getCurrentUser());
  },

  // =========================================================================
  // MODAL: DELETE RESEPSIONIS (MODAL SHOW CONFIRMATION)
  // =========================================================================
  showDeleteReceptionistConfirmModal(id) {
    const rec = UserManagement.getReceptionistById(id);
    if (!rec) return;

    const modalOutlet = document.getElementById('global-modal-outlet');
    modalOutlet.innerHTML = `
      <div id="modal-delete-receptionist" class="modal-overlay active">
        <div class="modal-container modal-sm">
          <div class="modal-content confirm-box" style="padding: 2rem 1.5rem 1.5rem;">
            <div class="confirm-icon-danger">
              ${this.getIconSvg('trash')}
            </div>
            <h3 class="confirm-title">Hapus Resepsionis?</h3>
            <p class="confirm-desc">
              Apakah Anda yakin ingin menghapus data resepsionis <strong>${rec.name}</strong> (${rec.id})? Akun login terkait juga akan dinonaktifkan.
            </p>
            <div style="display: flex; gap: 0.75rem; justify-content: center;">
              <button class="btn btn-secondary" onclick="App.closeAllModals()">Batal</button>
              <button class="btn btn-danger" onclick="App.handleConfirmDeleteReceptionist('${rec.id}')">
                Ya, Hapus Resepsionis
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  handleConfirmDeleteReceptionist(id) {
    UserManagement.deleteReceptionist(id);
    this.closeAllModals();
    this.showToast(`Resepsionis (${id}) berhasil dihapus`, 'info');
    this.renderDataResepsionisView(document.getElementById('main-content-area'), Auth.getCurrentUser());
  },

  // =========================================================================
  // VIEW: ANTREAN PELAYANAN
  // =========================================================================
  renderAntreanView(container, user) {
    const queues = AntreanModule.getAllQueues();

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div>
            <h3>Daftar Antrean Pelayanan Pasien</h3>
            <p style="font-size: 0.8rem; color: #64748b;">Monitoring siklus antrean dari Menunggu, Dipanggil, Sedang Diperiksa, hingga Selesai</p>
          </div>
          <button class="btn btn-primary" onclick="App.showCreatePatientModal()">
            ${this.getIconSvg('plus')}
            + Tambah Antrean Pasien (Modal)
          </button>
        </div>
        
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th style="width: 50px;">No</th>
                <th>Nomor Antrean</th>
                <th>Nama Pasien</th>
                <th>Layanan</th>
                <th>Dokter</th>
                <th>Waktu</th>
                <th class="text-center">Status</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${queues.length === 0 ? `
                <tr><td colspan="8" class="text-center" style="padding: 2.5rem; color: #94a3b8;">Belum ada antrean terdaftar</td></tr>
              ` : queues.map((q, idx) => `
                <tr style="${q.status === 'Dipanggil' ? 'background: #eff6ff;' : ''}">
                  <td>${idx + 1}</td>
                  <td><strong style="font-size: 1.1rem; color: #047857;">${q.queueNumber}</strong></td>
                  <td>
                    <div style="font-weight: 700; color: #0f172a;">${q.patientName}</div>
                    <small style="color: #64748b;">${q.patientRM}</small>
                  </td>
                  <td>${q.service}</td>
                  <td>${q.doctor}</td>
                  <td>${q.time}</td>
                  <td class="text-center">
                    <span class="badge ${
                      q.status === 'Selesai' ? 'badge-success' :
                      q.status === 'Dipanggil' ? 'badge-called' :
                      q.status === 'Sedang Diperiksa' ? 'badge-exam' :
                      'badge-waiting'
                    }">
                      <span class="badge-dot"></span>
                      ${q.status}
                    </span>
                  </td>
                  <td class="text-center">
                    <div style="display: inline-flex; gap: 0.35rem;">
                      <button class="btn btn-outline-primary btn-sm" onclick="App.callPatientAction('${q.queueNumber}')">
                        Panggil
                      </button>
                      ${user.role === 'dokter' ? `
                        <button class="btn btn-primary btn-sm" onclick="App.showDoctorExamModal('${q.queueNumber}')">
                          Periksa (Modal)
                        </button>
                      ` : ''}
                      ${q.status !== 'Selesai' && user.role !== 'dokter' ? `
                        <button class="btn btn-outline btn-sm" style="color: #dc2626;" onclick="App.showCancelQueueConfirmModal('${q.queueNumber}')">
                          Batalkan
                        </button>
                      ` : ''}
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  callPatientAction(queueNo) {
    const q = AntreanModule.callPatient(queueNo);
    if (q) {
      this.showToast(`Memanggil antrean ${q.queueNumber}: ${q.patientName}!`, 'info');
      this.renderCurrentView(this.currentView, new URLSearchParams(), Auth.getCurrentUser());
    }
  },

  // =========================================================================
  // MODAL: BATALKAN ANTREAN (MODAL SHOW CONFIRMATION)
  // =========================================================================
  showCancelQueueConfirmModal(queueNo) {
    const queue = AntreanModule.getQueueById(queueNo);
    if (!queue) return;

    const modalOutlet = document.getElementById('global-modal-outlet');
    modalOutlet.innerHTML = `
      <div id="modal-cancel-queue" class="modal-overlay active">
        <div class="modal-container modal-sm">
          <div class="modal-content confirm-box" style="padding: 2rem 1.5rem 1.5rem;">
            <div class="confirm-icon-warning">
              ${this.getIconSvg('clock')}
            </div>
            <h3 class="confirm-title">Batalkan Antrean?</h3>
            <p class="confirm-desc">
              Batalkan nomor antrean <strong>${queue.queueNumber}</strong> untuk pasien <strong>${queue.patientName}</strong>?
            </p>
            <div style="display: flex; gap: 0.75rem; justify-content: center;">
              <button class="btn btn-secondary" onclick="App.closeAllModals()">Batal</button>
              <button class="btn btn-danger" onclick="App.handleConfirmCancelQueue('${queue.queueNumber}')">
                Ya, Batalkan Antrean
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  handleConfirmCancelQueue(queueNo) {
    AntreanModule.cancelQueue(queueNo);
    this.closeAllModals();
    this.showToast(`Antrean ${queueNo} berhasil dibatalkan`, 'info');
    this.renderCurrentView(this.currentView, new URLSearchParams(), Auth.getCurrentUser());
  },

  // =========================================================================
  // VIEW: PEMERIKSAAN LIST
  // =========================================================================
  renderPemeriksaanListView(container, user) {
    const queues = AntreanModule.getAllQueues();

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div>
            <h3>Daftar Pasien Menunggu Pemeriksaan</h3>
            <p style="font-size: 0.8rem; color: #64748b;">Klik "Periksa Pasien" untuk membuka Formulir Klinis SOAP dalam bentuk modal</p>
          </div>
        </div>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>No. Antrean</th>
                <th>No. RM</th>
                <th>Nama Pasien</th>
                <th>Layanan</th>
                <th>Dokter Tujuan</th>
                <th>Keluhan Utama</th>
                <th class="text-center">Status</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${queues.map(q => `
                <tr>
                  <td><strong style="color: #059669;">${q.queueNumber}</strong></td>
                  <td>${q.patientRM}</td>
                  <td><strong>${q.patientName}</strong></td>
                  <td>${q.service}</td>
                  <td>${q.doctor}</td>
                  <td>${q.complaint}</td>
                  <td class="text-center">
                    <span class="badge ${
                      q.status === 'Selesai' ? 'badge-success' :
                      q.status === 'Dipanggil' ? 'badge-called' :
                      q.status === 'Sedang Diperiksa' ? 'badge-exam' :
                      'badge-waiting'
                    }">
                      ${q.status}
                    </span>
                  </td>
                  <td class="text-center">
                    <button class="btn btn-primary btn-sm" onclick="App.showDoctorExamModal('${q.queueNumber}')">
                      ${q.status === 'Selesai' ? 'Lihat / Edit (Modal)' : 'Periksa Pasien (Modal)'}
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // MODAL: FORM PEMERIKSAAN DOKTER (SOAP) - MODAL SHOW
  // =========================================================================
  showDoctorExamModal(queueNo) {
    const targetQueue = AntreanModule.getQueueById(queueNo);
    if (!targetQueue) return;

    AntreanModule.startExamination(queueNo);
    const patient = PasienModule.getPatientByRM(targetQueue.patientRM) || {
      name: targetQueue.patientName,
      rm: targetQueue.patientRM,
      gender: 'Laki-laki',
      age: 25,
      complaint: targetQueue.complaint
    };

    const existingExam = PemeriksaanModule.getExaminationByQueue(targetQueue.queueNumber) || {};

    const modalOutlet = document.getElementById('global-modal-outlet');
    modalOutlet.innerHTML = `
      <div id="modal-doctor-exam" class="modal-overlay active">
        <div class="modal-container modal-xl">
          <div class="modal-header">
            <div>
              <h3>Pemeriksaan Medis: ${patient.name} (${targetQueue.queueNumber})</h3>
              <p style="font-size: 0.78rem; color: #64748b;">No. RM: ${patient.rm} • Gender: ${patient.gender} • Usia: ${patient.age} Thn • Dokter: ${targetQueue.doctor}</p>
            </div>
            <button class="modal-close-btn" onclick="App.closeAllModals()">&times;</button>
          </div>
          <div class="modal-content">
            <form id="modal-form-exam" onsubmit="App.handleSaveExamFromModal(event, '${targetQueue.queueNumber}', true)">
              
              <!-- Tanda-tanda Vital -->
              <div style="margin-bottom: 1.5rem;">
                <h4 style="font-size: 0.9rem; font-weight: 700; color: #334155; margin-bottom: 0.75rem;">1. Tanda Vital Pasien</h4>
                <div class="vitals-grid">
                  <div class="vital-card">
                    <div class="vital-label">
                      <span>Tekanan Darah</span>
                      <span class="vital-unit">mmHg</span>
                    </div>
                    <input type="text" id="m-exam-bp" class="vital-input" placeholder="120/80" value="${existingExam.bp || '120/80'}" required />
                  </div>

                  <div class="vital-card">
                    <div class="vital-label">
                      <span>Suhu Tubuh</span>
                      <span class="vital-unit">°C</span>
                    </div>
                    <input type="text" id="m-exam-temp" class="vital-input" placeholder="36.5" value="${existingExam.temp || '37.0'}" required />
                  </div>

                  <div class="vital-card">
                    <div class="vital-label">
                      <span>Berat Badan</span>
                      <span class="vital-unit">kg</span>
                    </div>
                    <input type="text" id="m-exam-weight" class="vital-input" placeholder="60" value="${existingExam.weight || '65'}" required />
                  </div>

                  <div class="vital-card">
                    <div class="vital-label">
                      <span>Tinggi Badan</span>
                      <span class="vital-unit">cm</span>
                    </div>
                    <input type="text" id="m-exam-height" class="vital-input" placeholder="165" value="${existingExam.height || '170'}" required />
                  </div>
                </div>
              </div>

              <!-- Anamnesis, Diagnosis, Tindakan, Resep -->
              <div class="form-grid">
                <div class="form-group col-span-2">
                  <label class="form-label">Keluhan Utama & Anamnesis Pasien <span class="required">*</span></label>
                  <textarea id="m-exam-complaint" class="form-control" rows="2" required>${existingExam.complaint || targetQueue.complaint || patient.complaint || ''}</textarea>
                </div>

                <div class="form-group col-span-2">
                  <label class="form-label">Diagnosis Medis <span class="required">*</span></label>
                  <input type="text" id="m-exam-diagnosis" class="form-control" placeholder="Diagnosis penyakit" value="${existingExam.diagnosis || ''}" required />
                  <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.4rem;">
                    <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('m-exam-diagnosis').value='Febris Pro Evaluasi e.c Viral Infection (A08.4)'">Demam / Febris</button>
                    <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('m-exam-diagnosis').value='Infeksi Saluran Pernapasan Akut / ISPA (J06.9)'">ISPA / Flu</button>
                    <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('m-exam-diagnosis').value='Dispepsia / Gastritis Akut (K29.7)'">Maag / Dispepsia</button>
                    <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('m-exam-diagnosis').value='Cephalgia / Sakit Kepala Tension (G44.2)'">Sakit Kepala</button>
                  </div>
                </div>

                <div class="form-group col-span-2">
                  <label class="form-label">Tindakan Medis</label>
                  <input type="text" id="m-exam-treatment" class="form-control" placeholder="Tindakan medis yang diberikan" value="${existingExam.treatment || 'Edukasi dan Terapi Simptomatis'}" />
                </div>

                <div class="form-group col-span-2">
                  <label class="form-label">Resep Obat</label>
                  <textarea id="m-exam-prescription" class="form-control" rows="2" placeholder="Nama obat, dosis, dan aturan minum">${existingExam.prescription || 'Paracetamol 500mg (3x1 sesudah makan)\nVitamin C 500mg (1x1)'}</textarea>
                </div>

                <div class="form-group col-span-2">
                  <label class="form-label">Catatan Dokter</label>
                  <textarea id="m-exam-notes" class="form-control" rows="2" placeholder="Saran istirahat atau pantangan makanan">${existingExam.doctorNotes || 'Banyak minum air hangat dan istirahat cukup.'}</textarea>
                </div>
              </div>

              <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem; border-top: 1px solid #e2e8f0; padding-top: 1.25rem;">
                <button type="button" class="btn btn-secondary" onclick="App.handleSaveExamFromModal(event, '${targetQueue.queueNumber}', false)">
                  Simpan Draft
                </button>
                <button type="submit" class="btn btn-success">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px;"><polyline points="20 6 9 17 4 12"/></svg>
                  Selesaikan Pemeriksaan (Siap Kasir)
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  },

  handleSaveExamFromModal(e, queueNo, isComplete) {
    if (e && e.preventDefault) e.preventDefault();
    const queue = AntreanModule.getQueueById(queueNo);
    if (!queue) return;

    const patient = PasienModule.getPatientByRM(queue.patientRM) || {};

    const examData = {
      queueNumber: queue.queueNumber,
      patientRM: queue.patientRM,
      patientName: queue.patientName,
      age: patient.age || 25,
      gender: patient.gender || 'Laki-laki',
      doctor: queue.doctor,
      bp: document.getElementById('m-exam-bp').value,
      temp: document.getElementById('m-exam-temp').value,
      weight: document.getElementById('m-exam-weight').value,
      height: document.getElementById('m-exam-height').value,
      complaint: document.getElementById('m-exam-complaint').value,
      diagnosis: document.getElementById('m-exam-diagnosis').value,
      treatment: document.getElementById('m-exam-treatment').value,
      prescription: document.getElementById('m-exam-prescription').value,
      doctorNotes: document.getElementById('m-exam-notes').value
    };

    PemeriksaanModule.saveExamination(examData, isComplete);
    this.closeAllModals();

    if (isComplete) {
      this.showToast(`Pemeriksaan ${queue.patientName} (${queue.queueNumber}) selesai! Status antrean: Selesai. Pasien siap ditransaksikan di kasir.`, 'success');
    } else {
      this.showToast('Draft hasil pemeriksaan berhasil disimpan', 'info');
    }

    this.renderCurrentView(this.currentView, new URLSearchParams(), Auth.getCurrentUser());
  },

  renderRiwayatPemeriksaanView(container) {
    const exams = PemeriksaanModule.getAllExaminations();

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3>Arsip Rekam Pemeriksaan Pasien</h3>
          <span class="badge badge-secondary">Total: ${exams.length} Catatan</span>
        </div>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>No. Antrean</th>
                <th>Tanggal</th>
                <th>No. RM</th>
                <th>Pasien</th>
                <th>Dokter</th>
                <th>Diagnosis</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${exams.map(e => `
                <tr>
                  <td><strong>${e.queueNumber || '-'}</strong></td>
                  <td>${e.date}</td>
                  <td>${e.patientRM}</td>
                  <td><strong>${e.patientName}</strong></td>
                  <td>${e.doctor}</td>
                  <td><span class="badge badge-exam">${e.diagnosis}</span></td>
                  <td><span class="badge badge-success">${e.status}</span></td>
                  <td>
                    <button class="btn btn-outline btn-sm" onclick="App.showPatientDetailModal('${e.patientRM}')">
                      Lihat Rekam Medis
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // VIEW: TRANSAKSI PEMBAYARAN KASIR (OFFLINE/TUNAI)
  // =========================================================================
  renderTransaksiView(container, user) {
    const unbilledExams = TransaksiModule.getUnbilledExaminations();
    const transactions = TransaksiModule.getAllTransactions();

    if (user.role === 'owner') {
      container.innerHTML = `
        <div class="card" style="margin-bottom: 1.5rem; background: #f0fdf4; border: 1px solid #bbf7d0;">
          <div class="card-body" style="padding: 1.25rem 1.5rem; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <strong style="color: #065f46; font-size: 1rem;">Monitoring Transaksi Pembayaran Offline (Owner)</strong>
              <p style="font-size: 0.8rem; color: #047857; margin-top: 0.2rem;">Hak akses Owner bersifat read-only untuk memantau data pendapatan dan transaksi kasir.</p>
            </div>
            <button class="btn btn-outline btn-sm" onclick="App.navigate('laporan')">Buka Laporan</button>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>Daftar Transaksi Pasien</h3>
            <button class="btn btn-outline btn-sm" onclick="App.navigate('riwayat-transaksi')">Lihat Riwayat Lengkap</button>
          </div>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>ID Transaksi</th>
                  <th>Pasien</th>
                  <th>No. RM</th>
                  <th>Dokter</th>
                  <th class="text-right">Total Biaya</th>
                  <th class="text-center">Metode</th>
                  <th class="text-center">Status</th>
                  <th>Tanggal</th>
                  <th class="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${transactions.map(t => `
                  <tr>
                    <td><strong>${t.id}</strong></td>
                    <td><strong>${t.patientName}</strong></td>
                    <td>${t.patientRM}</td>
                    <td>${t.doctor}</td>
                    <td class="text-right"><strong>${formatRupiah(t.total)}</strong></td>
                    <td class="text-center"><span class="badge badge-secondary">${t.paymentMethod}</span></td>
                    <td class="text-center">
                      <span class="badge ${t.status === 'Lunas' ? 'badge-success' : 'badge-danger'}">
                        ${t.status}
                      </span>
                    </td>
                    <td>${t.date}</td>
                    <td class="text-center">
                      <button class="btn btn-outline btn-sm" onclick="App.showTransactionDetailModal('${t.id}')">
                        Detail Transaksi
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
      return;
    }

    // Tampilan Kasir Resepsionis
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <div>
          <h2 style="font-size: 1.25rem; font-weight: 700; color: #0f172a;">Kasir Pembayaran Tunai (Offline)</h2>
          <p style="font-size: 0.8rem; color: #64748b;">Catat pembayaran pasien setelah pemeriksaan dokter selesai</p>
        </div>
        <button class="btn btn-primary" onclick="App.showCreateTransactionModal()">
          ${this.getIconSvg('plus')} + Catat Transaksi Baru (Modal)
        </button>
      </div>

      <!-- Antrean Siap Bayar & Transaksi Terkini -->
      <div class="dashboard-grid-1-1">
        <div class="card">
          <div class="card-header">
            <h3>Antrean Pemeriksaan Selesai (Siap Bayar)</h3>
            <span class="badge badge-waiting">${unbilledExams.length} Pasien</span>
          </div>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>No. RM</th>
                  <th>Pasien</th>
                  <th>Dokter</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${unbilledExams.length === 0 ? `
                  <tr><td colspan="4" class="text-center" style="padding: 2.5rem; color: #94a3b8;">Semua pemeriksaan telah dibayar lunas</td></tr>
                ` : unbilledExams.map(ex => `
                  <tr>
                    <td><strong>${ex.patientRM}</strong></td>
                    <td>
                      <div><strong>${ex.patientName}</strong></div>
                      <small style="color: #64748b;">${ex.diagnosis || 'Pemeriksaan Selesai'}</small>
                    </td>
                    <td>${ex.doctor}</td>
                    <td>
                      <button class="btn btn-sm btn-primary" onclick="App.showCreateTransactionModal('${ex.patientRM}')">
                        Bayar (Modal)
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>Transaksi Kasir Hari Ini</h3>
            <button class="btn btn-outline btn-sm" onclick="App.navigate('riwayat-transaksi')">Lihat Riwayat</button>
          </div>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Pasien</th>
                  <th class="text-right">Total</th>
                  <th class="text-center">Status</th>
                  <th class="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${transactions.slice(0, 5).map(t => `
                  <tr>
                    <td><strong>${t.id}</strong></td>
                    <td>${t.patientName}</td>
                    <td class="text-right"><strong>${formatRupiah(t.total)}</strong></td>
                    <td class="text-center">
                      <span class="badge ${t.status === 'Lunas' ? 'badge-success' : 'badge-danger'}">
                        ${t.status}
                      </span>
                    </td>
                    <td class="text-center">
                      <button class="btn btn-outline btn-sm" onclick="App.showTransactionDetailModal('${t.id}')">
                        Struk
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // MODAL: CREATE TRANSAKSI / PEMBAYARAN KASIR (MODAL SHOW)
  // =========================================================================
  showCreateTransactionModal(preselectedRM = '') {
    const unbilledExams = TransaksiModule.getUnbilledExaminations();
    const nextTxId = getNextTransactionID();

    let defaultPatient = null;
    if (preselectedRM) {
      defaultPatient = unbilledExams.find(ex => ex.patientRM === preselectedRM);
    }
    if (!defaultPatient && unbilledExams.length > 0) {
      defaultPatient = unbilledExams[0];
    }

    const modalOutlet = document.getElementById('global-modal-outlet');
    modalOutlet.innerHTML = `
      <div id="modal-create-transaction" class="modal-overlay active">
        <div class="modal-container modal-md">
          <div class="modal-header">
            <div>
              <h3>Pencatatan Pembayaran Offline (Tunai)</h3>
              <p style="font-size: 0.78rem; color: #64748b;">ID Transaksi: <strong>${nextTxId}</strong> • Metode: Tunai</p>
            </div>
            <button class="modal-close-btn" onclick="App.closeAllModals()">&times;</button>
          </div>
          <div class="modal-content">
            <form id="form-create-transaction" onsubmit="App.handleSaveTransactionFromModal(event)">
              <input type="hidden" id="m-tx-id" value="${nextTxId}" />
              
              <div class="form-grid">
                <div class="form-group col-span-2">
                  <label class="form-label">Pilih Pasien Selesai Periksa <span class="required">*</span></label>
                  <select id="m-tx-patient-select" class="form-control" required onchange="App.handleModalBillingPatientSelect(this.value)">
                    <option value="">-- Pilih Pasien Siap Bayar --</option>
                    ${unbilledExams.map(ex => `
                      <option value="${ex.patientRM}" data-name="${ex.patientName}" data-doctor="${ex.doctor}" data-service="${ex.service || 'Pemeriksaan Umum'}" ${defaultPatient && defaultPatient.patientRM === ex.patientRM ? 'selected' : ''}>
                        ${ex.patientRM} - ${ex.patientName} (${ex.doctor})
                      </option>
                    `).join('')}
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Nama Pasien</label>
                  <input type="text" id="m-tx-patient-name" class="form-control" value="${defaultPatient ? defaultPatient.patientName : ''}" readonly />
                </div>

                <div class="form-group">
                  <label class="form-label">Dokter Pemeriksa</label>
                  <input type="text" id="m-tx-doctor" class="form-control" value="${defaultPatient ? defaultPatient.doctor : ''}" readonly />
                </div>

                <!-- Rincian Biaya -->
                <div class="form-group">
                  <label class="form-label">Biaya Pemeriksaan (Rp) <span class="required">*</span></label>
                  <input type="number" id="m-tx-fee-exam" class="form-control" value="100000" min="0" step="5000" oninput="App.calculateLiveModalBillingTotal()" required />
                </div>

                <div class="form-group">
                  <label class="form-label">Biaya Tindakan (Rp)</label>
                  <input type="number" id="m-tx-fee-action" class="form-control" value="0" min="0" step="5000" oninput="App.calculateLiveModalBillingTotal()" />
                </div>

                <div class="form-group col-span-2">
                  <label class="form-label">Biaya Obat / Lainnya (Rp)</label>
                  <input type="number" id="m-tx-fee-other" class="form-control" value="0" min="0" step="5000" oninput="App.calculateLiveModalBillingTotal()" />
                </div>

                <div class="form-group col-span-2">
                  <div class="transaction-summary-box" style="margin-top: 0.5rem;">
                    <div class="calc-row">
                      <span>Pemeriksaan:</span>
                      <strong id="m-summary-exam">Rp100.000</strong>
                    </div>
                    <div class="calc-row">
                      <span>Tindakan:</span>
                      <strong id="m-summary-action">Rp0</strong>
                    </div>
                    <div class="calc-row">
                      <span>Lainnya / Obat:</span>
                      <strong id="m-summary-other">Rp0</strong>
                    </div>
                    <div class="calc-row total-row">
                      <span>TOTAL PEMBAYARAN:</span>
                      <span id="m-summary-grand-total">Rp100.000</span>
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Metode Pembayaran</label>
                  <input type="text" class="form-control" value="Tunai" readonly style="font-weight: 700; color: #047857;" />
                </div>

                <div class="form-group">
                  <label class="form-label">Status Pembayaran <span class="required">*</span></label>
                  <select id="m-tx-status" class="form-control" style="font-weight: 700;">
                    <option value="Lunas" selected>Lunas (Sudah Dibayar)</option>
                    <option value="Belum Lunas">Belum Lunas (Tertunda)</option>
                  </select>
                </div>
              </div>

              <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem;">
                <button type="button" class="btn btn-secondary" onclick="App.closeAllModals()">Batal</button>
                <button type="submit" class="btn btn-primary">
                  Catat Transaksi & Cetak Struk
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    this.calculateLiveModalBillingTotal();
  },

  handleModalBillingPatientSelect(rm) {
    const select = document.getElementById('m-tx-patient-select');
    if (!select || !rm) {
      document.getElementById('m-tx-patient-name').value = '';
      document.getElementById('m-tx-doctor').value = '';
      return;
    }

    const opt = select.options[select.selectedIndex];
    document.getElementById('m-tx-patient-name').value = opt.getAttribute('data-name') || '';
    document.getElementById('m-tx-doctor').value = opt.getAttribute('data-doctor') || '';
  },

  calculateLiveModalBillingTotal() {
    const examEl = document.getElementById('m-tx-fee-exam');
    if (!examEl) return;
    const exam = parseRupiah(examEl.value || 0);
    const action = parseRupiah(document.getElementById('m-tx-fee-action').value || 0);
    const other = parseRupiah(document.getElementById('m-tx-fee-other').value || 0);
    const total = exam + action + other;

    document.getElementById('m-summary-exam').textContent = formatRupiah(exam);
    document.getElementById('m-summary-action').textContent = formatRupiah(action);
    document.getElementById('m-summary-other').textContent = formatRupiah(other);
    document.getElementById('m-summary-grand-total').textContent = formatRupiah(total);
  },

  handleSaveTransactionFromModal(e) {
    e.preventDefault();
    const rm = document.getElementById('m-tx-patient-select').value;
    const name = document.getElementById('m-tx-patient-name').value;
    const doctor = document.getElementById('m-tx-doctor').value;

    if (!rm || !name) {
      this.showToast('Silakan pilih pasien yang akan ditransaksikan!', 'danger');
      return;
    }

    const txData = {
      id: document.getElementById('m-tx-id').value,
      patientRM: rm,
      patientName: name,
      doctor: doctor || 'dr. Budi',
      service: 'Pemeriksaan Umum',
      examFee: document.getElementById('m-tx-fee-exam').value,
      actionFee: document.getElementById('m-tx-fee-action').value,
      otherFee: document.getElementById('m-tx-fee-other').value,
      status: document.getElementById('m-tx-status').value
    };

    const saved = TransaksiModule.saveTransaction(txData);
    this.closeAllModals();
    this.showToast(`Transaksi ${saved.id} berhasil dicatat (${saved.status})!`, 'success');

    // Tampilkan modal struk bukti pembayaran
    this.showTransactionDetailModal(saved.id);

    // Refresh view
    if (this.currentView === 'transaksi' || this.currentView === 'dashboard') {
      this.renderCurrentView(this.currentView, new URLSearchParams(), Auth.getCurrentUser());
    }
  },

  // =========================================================================
  // VIEW: RIWAYAT TRANSAKSI
  // =========================================================================
  renderRiwayatTransaksiView(container) {
    const transactions = TransaksiModule.getAllTransactions();

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div style="display: flex; gap: 1rem; align-items: center; flex: 1; max-width: 600px;">
            <input type="text" id="tx-search-input" class="form-control" placeholder="Cari ID Transaksi, Pasien, atau Dokter..." oninput="App.handleTransactionFilter()" />
            <select id="tx-status-filter" class="form-control" style="max-width: 160px;" onchange="App.handleTransactionFilter()">
              <option value="all">Semua Status</option>
              <option value="Lunas">Lunas</option>
              <option value="Belum Lunas">Belum Lunas</option>
            </select>
          </div>
          <button class="btn btn-primary" onclick="App.showCreateTransactionModal()">
            ${this.getIconSvg('plus')}
            + Transaksi Baru (Modal)
          </button>
        </div>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>ID Transaksi</th>
                <th>Pasien</th>
                <th>No. RM</th>
                <th>Dokter</th>
                <th class="text-right">Total</th>
                <th class="text-center">Metode</th>
                <th class="text-center">Status</th>
                <th>Tanggal</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody id="tx-tbody">
              ${this.renderTransactionRows(transactions)}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderTransactionRows(transactions) {
    if (transactions.length === 0) {
      return `<tr><td colspan="9" class="text-center" style="padding: 2.5rem; color: #94a3b8;">Tidak ada data transaksi yang sesuai</td></tr>`;
    }

    return transactions.map(t => `
      <tr>
        <td><strong>${t.id}</strong></td>
        <td><strong>${t.patientName}</strong></td>
        <td>${t.patientRM}</td>
        <td>${t.doctor}</td>
        <td class="text-right"><strong>${formatRupiah(t.total)}</strong></td>
        <td class="text-center"><span class="badge badge-secondary">${t.paymentMethod}</span></td>
        <td class="text-center">
          <span class="badge ${t.status === 'Lunas' ? 'badge-success' : 'badge-danger'}">
            ${t.status}
          </span>
        </td>
        <td>${t.date}</td>
        <td class="text-center">
          <button class="btn btn-outline btn-sm" onclick="App.showTransactionDetailModal('${t.id}')">
            ${this.getIconSvg('file-text')} Struk / Bukti
          </button>
        </td>
      </tr>
    `).join('');
  },

  handleTransactionFilter() {
    const query = document.getElementById('tx-search-input').value;
    const status = document.getElementById('tx-status-filter').value;
    const filtered = TransaksiModule.filterTransactions(query, status);
    const tbody = document.getElementById('tx-tbody');
    if (tbody) {
      tbody.innerHTML = this.renderTransactionRows(filtered);
    }
  },

  // =========================================================================
  // MODAL: DETAIL & CETAK BUKTI TRANSAKSI (STRUK THERMAL)
  // =========================================================================
  showTransactionDetailModal(txId) {
    const tx = TransaksiModule.getTransactionById(txId);
    if (!tx) return;

    const modalOutlet = document.getElementById('global-modal-outlet');
    modalOutlet.innerHTML = `
      <div id="modal-tx-detail" class="modal-overlay active">
        <div class="modal-container" style="max-width: 520px;">
          <div class="modal-header">
            <h3>Bukti Pembayaran Transaksi</h3>
            <button class="modal-close-btn" onclick="App.closeAllModals()">&times;</button>
          </div>
          <div class="modal-content" style="background: #f8fafc; padding: 1.5rem;">
            
            <div class="receipt-paper print-receipt-paper">
              <div class="receipt-header">
                <div class="receipt-title">KLINIK MEDIKA RME</div>
                <div class="receipt-subtitle">Pelayanan Rekam Medis & Kesehatan Masyarakat</div>
                <div class="receipt-subtitle">Jl. Sehat Sentosa No. 12 • Telp: (021) 555-8989</div>
              </div>

              <div class="receipt-meta-grid">
                <div><span class="receipt-meta-label">No. Transaksi:</span> <strong>${tx.id}</strong></div>
                <div><span class="receipt-meta-label">Tanggal:</span> ${tx.date}</div>
                <div><span class="receipt-meta-label">No. RM:</span> <strong>${tx.patientRM}</strong></div>
                <div><span class="receipt-meta-label">Dokter:</span> ${tx.doctor}</div>
                <div><span class="receipt-meta-label">Pasien:</span> <strong>${tx.patientName}</strong></div>
                <div><span class="receipt-meta-label">Kasir:</span> ${tx.receptionist || 'Resepsionis'}</div>
              </div>

              <div class="receipt-divider"></div>

              <table class="receipt-items">
                <tbody>
                  <tr>
                    <td>Biaya Pemeriksaan (${tx.service || 'Umum'})</td>
                    <td>${formatRupiah(tx.examFee || 100000)}</td>
                  </tr>
                  ${tx.actionFee > 0 ? `
                    <tr>
                      <td>Biaya Tindakan Medis</td>
                      <td>${formatRupiah(tx.actionFee)}</td>
                    </tr>
                  ` : ''}
                  ${tx.otherFee > 0 ? `
                    <tr>
                      <td>Biaya Lainnya / Resep</td>
                      <td>${formatRupiah(tx.otherFee)}</td>
                    </tr>
                  ` : ''}
                </tbody>
              </table>

              <div class="receipt-grand-total">
                <span>TOTAL AKHIR:</span>
                <span>${formatRupiah(tx.total)}</span>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
                <span>Metode Pembayaran: <strong>${tx.paymentMethod} (Tunai)</strong></span>
                <span class="receipt-stamp ${tx.status === 'Lunas' ? '' : 'unpaid'}">
                  ${tx.status.toUpperCase()}
                </span>
              </div>

              <div class="receipt-footer-text">
                Terima kasih atas kunjungan Anda.<br/>Semoga lekas sembuh!
              </div>
            </div>
          </div>

          <div class="modal-footer" style="justify-content: space-between;">
            <button class="btn btn-secondary" onclick="App.closeAllModals()">Tutup</button>
            <button class="btn btn-primary" onclick="window.print()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px;"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
              Cetak Bukti Transaksi (Print)
            </button>
          </div>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // VIEW: LAPORAN PENDAPATAN (OWNER)
  // =========================================================================
  renderLaporanView(container) {
    const finSummary = TransaksiModule.getFinancialSummary();
    const transactions = TransaksiModule.getAllTransactions();

    const paidTotal = transactions.filter(t => t.status === 'Lunas').reduce((s, t) => s + t.total, 0);
    const unpaidTotal = transactions.filter(t => t.status === 'Belum Lunas').reduce((s, t) => s + t.total, 0);

    container.innerHTML = `
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Pendapatan Hari Ini</span>
            <div class="kpi-icon-bubble kpi-icon-emerald">
              ${this.getIconSvg('credit-card')}
            </div>
          </div>
          <div class="kpi-value text-currency">${formatRupiah(finSummary.revenueToday)}</div>
          <div class="kpi-meta">Semua dari pembayaran tunai</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Pendapatan Bulan Berjalan</span>
            <div class="kpi-icon-bubble kpi-icon-blue">
              ${this.getIconSvg('activity')}
            </div>
          </div>
          <div class="kpi-value text-currency">${formatRupiah(finSummary.monthlyRevenue)}</div>
          <div class="kpi-meta">Oktober 2026</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Tagihan Belum Lunas</span>
            <div class="kpi-icon-bubble kpi-icon-rose">
              ${this.getIconSvg('clock')}
            </div>
          </div>
          <div class="kpi-value" style="color: #dc2626;">${formatRupiah(unpaidTotal)}</div>
          <div class="kpi-meta">${finSummary.todayUnpaidCount} Transaksi Pending</div>
        </div>
      </div>

      <div class="card" style="margin-bottom: 1.5rem;">
        <div class="card-header">
          <h3>Statistik Ringkasan Keuangan</h3>
          <button class="btn btn-outline btn-sm" onclick="window.print()">Cetak Laporan</button>
        </div>
        <div class="card-body">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
            <div style="padding: 1.25rem; background: #f8fafc; border-radius: var(--radius-md); border: 1px solid #e2e8f0;">
              <h4 style="font-size: 0.95rem; margin-bottom: 0.75rem; color: #1e293b;">Rasio Pelunasan Pembayaran</h4>
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.85rem;">
                <span>Transaksi Lunas:</span>
                <strong style="color: #059669;">${formatRupiah(paidTotal)}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                <span>Transaksi Belum Lunas:</span>
                <strong style="color: #dc2626;">${formatRupiah(unpaidTotal)}</strong>
              </div>
            </div>

            <div style="padding: 1.25rem; background: #f8fafc; border-radius: var(--radius-md); border: 1px solid #e2e8f0;">
              <h4 style="font-size: 0.95rem; margin-bottom: 0.75rem; color: #1e293b;">Kepatuhan Metode Pembayaran</h4>
              <p style="font-size: 0.85rem; color: #64748b; line-height: 1.5;">
                100% transaksi menggunakan <strong>Tunai (Offline Cash)</strong> tanpa ketergantungan payment gateway.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // VIEW: PROFIL PENGGUNA
  // =========================================================================
  renderProfilView(container, user) {
    container.innerHTML = `
      <div class="card" style="max-width: 680px; margin: 0 auto;">
        <div class="card-header">
          <h3>Profil Pengguna Aktif</h3>
          <span class="badge badge-success">Sedang Masuk</span>
        </div>
        <div class="card-body">
          <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem;">
            <div class="user-avatar-sm" style="width: 72px; height: 72px; font-size: 2rem;">
              ${user.name.charAt(0)}
            </div>
            <div>
              <h2 style="font-size: 1.35rem; color: #0f172a;">${user.fullName || user.name}</h2>
              <div style="font-size: 0.85rem; color: #059669; font-weight: 600; text-transform: uppercase;">
                Role: ${user.role}
              </div>
              <div style="font-size: 0.8rem; color: #64748b; margin-top: 0.2rem;">
                ${user.title} • Username: <code>@${user.username}</code>
              </div>
            </div>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-md); padding: 1.25rem;">
            <h4 style="font-size: 0.9rem; color: #334155; margin-bottom: 0.75rem;">Hak Akses Role ${user.role.toUpperCase()}:</h4>
            <ul style="font-size: 0.85rem; color: #475569; padding-left: 1.25rem; line-height: 1.7;">
              ${user.role === 'owner' ? `
                <li>Melihat Dashboard statistik & KPI keuangan klinik</li>
                <li><strong>Manajemen User: Tambah, Edit, & Hapus data Dokter</strong> (via Modal Show)</li>
                <li><strong>Manajemen User: Tambah, Edit, & Hapus data Resepsionis</strong> (via Modal Show)</li>
                <li>Memantau transaksi dan pendapatan offline (Monitoring Read-Only)</li>
                <li>Melihat rekap pendapatan dan grafik historis 7 hari</li>
              ` : user.role === 'resepsionis' ? `
                <li><strong>Pendaftaran pasien baru via Modal Show</strong> (otomatis terbit RM & tiket antrean)</li>
                <li>Mengelola data pasien (detail rekam medis, edit, hapus via Modal)</li>
                <li>Memanggil nomor antrean pasien dengan lonceng suara audio</li>
                <li><strong>Pencatatan transaksi pembayaran tunai via Modal Show</strong></li>
                <li>Melihat riwayat transaksi dan mencetak bukti pembayaran (struk thermal)</li>
              ` : `
                <li>Melihat antrean pasien poli</li>
                <li>Memanggil pasien ke ruang periksa</li>
                <li><strong>Form Pemeriksaan Klinis (SOAP) via Modal Show</strong>: vital signs, diagnosis, resep obat</li>
                <li>Menyelesaikan pemeriksaan klinis sehingga langsung siap ditransaksikan di kasir</li>
              `}
            </ul>
          </div>

          <div style="margin-top: 2rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 1.25rem;">
            <button class="btn btn-outline btn-sm" onclick="App.resetDemoData()">
              🔄 Reset Data Demo ke Awal
            </button>
            <button class="btn btn-danger btn-sm" onclick="App.handleLogout()">
              Keluar Akun
            </button>
          </div>
        </div>
      </div>
    `;
  },

  resetDemoData() {
    if (confirm('Apakah Anda ingin mengembalikan seluruh data demo ke kondisi awal (default)? Seluruh input simulasi akan direset.')) {
      initDefaultData(true);
      this.showToast('Data demo berhasil direset ke setelan awal!', 'success');
      this.handleRoute();
    }
  },

  // =========================================================================
  // INTERACTIVE SVG CHARTS (Zero Dependency, Works Offline)
  // =========================================================================
  renderRevenueLineChart() {
    const container = document.getElementById('revenue-chart-container');
    if (!container) return;

    const data = INITIAL_HISTORICAL_REVENUE;
    const width = container.clientWidth || 500;
    const height = 240;
    const padding = { top: 20, right: 30, bottom: 40, left: 75 };

    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxVal = Math.max(...data.map(d => d.revenue)) * 1.15;
    const minVal = 0;

    const points = data.map((d, i) => {
      const x = padding.left + (i / (data.length - 1)) * chartW;
      const y = padding.top + chartH - ((d.revenue - minVal) / (maxVal - minVal)) * chartH;
      return { x, y, ...d };
    });

    const pathD = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

    const gridLines = [0, 0.25, 0.5, 0.75, 1].map(ratio => {
      const val = ratio * maxVal;
      const y = padding.top + chartH - ratio * chartH;
      return `
        <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#f1f5f9" stroke-width="1" />
        <text x="${padding.left - 10}" y="${y + 4}" font-size="10" fill="#94a3b8" text-anchor="end">${formatRupiah(val)}</text>
      `;
    }).join('');

    const dotsHtml = points.map(p => `
      <g class="chart-point-group" style="cursor: pointer;">
        <circle cx="${p.x}" cy="${p.y}" r="5" fill="#10b981" stroke="#ffffff" stroke-width="2.5" />
        <circle cx="${p.x}" cy="${p.y}" r="12" fill="transparent" onmouseover="App.showChartTooltip(event, '${p.label}: ${formatRupiah(p.revenue)}')" onmouseout="App.hideChartTooltip()" />
        <text x="${p.x}" y="${height - 15}" font-size="11" fill="#64748b" text-anchor="middle" font-weight="500">${p.label}</text>
      </g>
    `).join('');

    container.innerHTML = `
      <div id="chart-tooltip-el" class="chart-tooltip"></div>
      <svg class="chart-svg" viewBox="0 0 ${width} ${height}">
        <defs>
          <linearGradient id="revenueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#10b981" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#10b981" stop-opacity="0.0" />
          </linearGradient>
        </defs>
        ${gridLines}
        <path d="${areaD}" fill="url(#revenueGrad)" />
        <path d="${pathD}" fill="none" stroke="#059669" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        ${dotsHtml}
      </svg>
    `;
  },

  renderPatientsBarChart() {
    const container = document.getElementById('patient-chart-container');
    if (!container) return;

    const data = INITIAL_HISTORICAL_REVENUE;
    const width = container.clientWidth || 500;
    const height = 240;
    const padding = { top: 20, right: 25, bottom: 40, left: 45 };

    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxVal = Math.max(...data.map(d => d.patients)) * 1.2;
    const barWidth = Math.min(32, (chartW / data.length) * 0.6);

    const bars = data.map((d, i) => {
      const x = padding.left + (i + 0.5) * (chartW / data.length) - barWidth / 2;
      const barH = (d.patients / maxVal) * chartH;
      const y = padding.top + chartH - barH;
      return `
        <g class="chart-bar-group" style="cursor: pointer;">
          <rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" rx="6" fill="#3b82f6" opacity="0.85" onmouseover="App.showChartTooltip(event, '${d.label}: ${d.patients} Pasien')" onmouseout="App.hideChartTooltip()" />
          <text x="${x + barWidth / 2}" y="${height - 15}" font-size="11" fill="#64748b" text-anchor="middle" font-weight="500">${d.label}</text>
          <text x="${x + barWidth / 2}" y="${y - 6}" font-size="10" fill="#2563eb" text-anchor="middle" font-weight="700">${d.patients}</text>
        </g>
      `;
    }).join('');

    const gridLines = [0, 0.5, 1].map(ratio => {
      const val = Math.round(ratio * maxVal);
      const y = padding.top + chartH - ratio * chartH;
      return `
        <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#f1f5f9" stroke-width="1" />
        <text x="${padding.left - 8}" y="${y + 4}" font-size="10" fill="#94a3b8" text-anchor="end">${val}</text>
      `;
    }).join('');

    container.innerHTML = `
      <div id="bar-tooltip-el" class="chart-tooltip"></div>
      <svg class="chart-svg" viewBox="0 0 ${width} ${height}">
        ${gridLines}
        ${bars}
      </svg>
    `;
  },

  showChartTooltip(event, text) {
    const tooltip = document.querySelector('.chart-tooltip');
    if (tooltip) {
      tooltip.textContent = text;
      const containerRect = tooltip.parentElement.getBoundingClientRect();
      const x = event.clientX - containerRect.left;
      const y = event.clientY - containerRect.top;
      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${y}px`;
      tooltip.classList.add('show');
    }
  },

  hideChartTooltip() {
    const tooltips = document.querySelectorAll('.chart-tooltip');
    tooltips.forEach(t => t.classList.remove('show'));
  }
};

// Initialize Application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
