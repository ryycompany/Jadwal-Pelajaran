// File: main.js

// Inisialisasi semua fitur saat DOM siap
document.addEventListener('DOMContentLoaded', function () {
  try {
    console.log('Initializing application...');

    // Panggil init umum terlebih dahulu
    safeInit(initTheme, 'Theme System');
    safeInit(initSidebar, 'Sidebar');
    safeInit(initDateTime, 'Date & Time');
    safeInit(initNavigation, 'Navigation'); // Inisialisasi event listener untuk menu
    
    // Panggil init spesifik modul
    if (typeof initSchedule === 'function') safeInit(initSchedule, 'Schedule System');
    if (typeof initAttendance === 'function') safeInit(initAttendance, 'Attendance');
    if (typeof initTodo === 'function') safeInit(initTodo, 'Todo List');
    if (typeof initCalculator === 'function') safeInit(initCalculator, 'Calculator');
    if (typeof initConverter === 'function') safeInit(initConverter, 'Converter');
    if (typeof initCalendar === 'function') safeInit(initCalendar, 'Calendar');
    if (typeof initCountdown === 'function') safeInit(initCountdown, 'Countdown');

    setActiveTab('schedule');
    console.log('Application initialized successfully');

  } catch (error) {
    console.error('Critical initialization error:', error);
    showErrorToast('Gagal memuat aplikasi. Silakan refresh halaman.');
  }
});

function safeInit(initFunction, moduleName) {
  try {
    initFunction();
    console.log(`${moduleName} initialized`);
  } catch (error) {
    console.warn(`Failed to initialize ${moduleName}:`, error);
  }
}

function initNavigation() {
  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function(event) {
      event.preventDefault();
      const tabName = this.getAttribute('data-tab');
      if (tabName) {
        setActiveTab(tabName);
      }
    });
  });
}

function initTheme() {
  const themeToggle = getElementOrThrow('theme-toggle-menu', 'Theme toggle button');

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('theme');
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  applyTheme(initialTheme);

  themeToggle.addEventListener('click', toggleTheme);

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', newTheme);
  applyTheme(newTheme);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  // Tambahkan console.log untuk debugging, pastikan atribut data-theme diterapkan
  console.log(`Theme applied: ${theme}. document.documentElement data-theme: ${document.documentElement.getAttribute('data-theme')}`);
  updateThemeIcon(theme);
}

function updateThemeIcon(theme) {
  const themeToggle = getElement('theme-toggle-menu');
  if (!themeToggle) return;

  themeToggle.innerHTML = theme === 'dark' ?
    '<i class="fas fa-sun"></i> <span>Mode Terang</span>' :
    '<i class="fas fa-moon"></i> <span>Mode Gelap</span>';
}

function initSidebar() {
  const menuToggle = getElementOrThrow('menu-toggle', 'Menu toggle button');
  const sidebar = getElementOrThrow('sidebar', 'Sidebar');
  const overlay = getElementOrThrow('overlay', 'Overlay');

  let isOpen = false;

  const toggle = (show) => {
    isOpen = show !== undefined ? show : !isOpen;
    sidebar.classList.toggle('active', isOpen);
    overlay.classList.toggle('active', isOpen);
    menuToggle.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
  };

  menuToggle.addEventListener('click', () => toggle());
  overlay.addEventListener('click', () => toggle(false));

  // Baris ini di-nonaktifkan karena sekarang ditangani oleh initNavigation
  // document.querySelectorAll('.menu-item').forEach(item => {
  //   item.addEventListener('click', () => toggle(false));
  // });
}

function initDateTime() {
  updateDateTime();
  setInterval(updateDateTime, 1000);
}

function updateDateTime() {
  try {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const now = new Date();

    const dateStr = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`;
    const timeStr = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    safeSetText('current-date', dateStr);
    safeSetText('real-clock', timeStr);

  } catch (error) {
    console.warn('Failed to update date/time:', error);
  }
}

function setActiveTab(tabName) {
  try {
    document.querySelectorAll('.card').forEach(panel => {
      panel.style.display = 'none';
    });

    const activePanel = getElement(`${tabName}-panel`);
    if (activePanel) {
      activePanel.style.display = 'block';
    } else {
        console.warn(`Panel with ID '${tabName}-panel' not found.`);
    }

    document.querySelectorAll('.menu-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-tab') === tabName);
    });

    if (tabName === 'schedule' && typeof renderTodaySchedule === 'function') {
      renderTodaySchedule();
    }
    
    // Menutup sidebar setelah item menu diklik (jika sidebar sedang terbuka)
    const sidebar = getElement('sidebar');
    if (sidebar && sidebar.classList.contains('active') && typeof initSidebar === 'function') {
        const menuToggle = getElement('menu-toggle');
        // Mensimulasikan klik pada menuToggle untuk menutup sidebar
        // Periksa apakah menuToggle ada sebelum memanggil click()
        if (menuToggle) {
          menuToggle.click(); 
        } else {
          console.warn("menu-toggle button not found when trying to close sidebar.");
        }
    }


  } catch (error) {
    console.error('Failed to switch tab:', error);
  }
}

function getElement(id) {
  return document.getElementById(id);
}

function getElementOrThrow(id, elementName = 'Element') {
  const el = document.getElementById(id);
  if (!el) throw new Error(`${elementName} with ID '${id}' not found`);
  return el;
}

function safeSetText(id, text) {
  const el = getElement(id);
  if (el) el.textContent = text;
}

function showErrorToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast-error';
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.padding = '12px 24px';
  toast.style.background = '#ff4444';
  toast.style.color = 'white';
  toast.style.borderRadius = '4px';
  toast.style.zIndex = '10000';
  toast.style.transition = 'opacity 0.3s ease-in-out';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}
