/**
 * SISTEM REKAM MEDIS ELEKTRONIK (RME) - AUTHENTICATION MODULE
 * Simulated Role-Based Access Control (Owner, Resepsionis, Dokter)
 */

const Auth = {
  getCurrentUser() {
    return getStorage(STORAGE_KEYS.CURRENT_USER, null);
  },

  setCurrentUser(user) {
    setStorage(STORAGE_KEYS.CURRENT_USER, user);
  },

  login(username, password) {
    const users = getStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    const trimmedUser = (username || '').trim().toLowerCase();
    const trimmedPass = (password || '').trim();

    const user = users.find(
      u => u.username.toLowerCase() === trimmedUser && u.password === trimmedPass
    );

    if (user) {
      const sessionUser = {
        username: user.username,
        role: user.role,
        name: user.name,
        fullName: user.fullName || user.name,
        title: user.title,
        loginAt: new Date().toISOString()
      };
      this.setCurrentUser(sessionUser);
      addAuditLog(`User @${user.username} (${user.role}) berhasil masuk`, user.role, 'blue');
      return { success: true, user: sessionUser };
    }

    return {
      success: false,
      message: 'Username atau password salah. Silakan periksa akun demo di bawah formulir.'
    };
  },

  logout() {
    const user = this.getCurrentUser();
    if (user) {
      addAuditLog(`User @${user.username} (${user.role}) telah keluar`, user.role, 'amber');
    }
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  switchRole(targetRole) {
    const users = getStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    const target = users.find(u => u.role === targetRole);
    if (target) {
      const sessionUser = {
        username: target.username,
        role: target.role,
        name: target.name,
        fullName: target.fullName || target.name,
        title: target.title,
        loginAt: new Date().toISOString()
      };
      this.setCurrentUser(sessionUser);
      addAuditLog(`Beralih peran demo ke: ${target.role.toUpperCase()}`, target.role, 'blue');
      return sessionUser;
    }
    return null;
  },

  isLoggedIn() {
    return this.getCurrentUser() !== null;
  },

  checkPermission(allowedRoles = []) {
    const user = this.getCurrentUser();
    if (!user) return false;
    if (allowedRoles.length === 0) return true;
    return allowedRoles.includes(user.role);
  }
};
