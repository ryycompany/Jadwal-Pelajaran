function initAttendanceTracker() {
  const markPresentBtn = document.getElementById('mark-present-btn');
  const markAbsentBtn = document.getElementById('mark-absent-btn');
  const clearAttendanceBtn = document.getElementById('clear-attendance-btn');
  const attendanceList = document.getElementById('attendance-list');
  
  // 🔒 Cegah error jika elemen tidak ditemukan
  if (!markPresentBtn || !markAbsentBtn || !clearAttendanceBtn || !attendanceList) {
    console.warn('Attendance Tracker: Salah satu elemen tidak ditemukan, inisialisasi dibatalkan.');
    return;
  }
  
  let attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
  
  function renderAttendance() {
    attendanceList.innerHTML = '';
    
    if (attendanceRecords.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'attendance-item';
      emptyMessage.textContent = 'Belum ada data absensi';
      attendanceList.appendChild(emptyMessage);
      return;
    }
    
    attendanceRecords.forEach(record => {
      const date = new Date(record.timestamp);
      const formattedDate = date.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const formattedTime = date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const attendanceItem = document.createElement('div');
      attendanceItem.className = 'attendance-item';
      
      const nameSpan = document.createElement('span');
      nameSpan.className = 'attendance-name';
      nameSpan.textContent = record.name || 'Siswa';
      
      const timeSpan = document.createElement('span');
      timeSpan.className = 'attendance-time';
      timeSpan.textContent = formattedTime;
      
      const dateSpan = document.createElement('span');
      dateSpan.className = 'attendance-date';
      dateSpan.textContent = formattedDate;
      
      const statusSpan = document.createElement('span');
      statusSpan.className = 'attendance-status';
      statusSpan.textContent = record.status === 'absent' ? 'Absen' : 'Hadir';
      if (record.status === 'absent') {
        statusSpan.classList.add('absent');
      }
      
      attendanceItem.appendChild(nameSpan);
      attendanceItem.appendChild(timeSpan);
      attendanceItem.appendChild(dateSpan);
      attendanceItem.appendChild(statusSpan);
      
      attendanceList.appendChild(attendanceItem);
    });
  }
  
  function markAttendance(status) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const alreadyMarked = attendanceRecords.some(record => {
      const recordDate = new Date(record.timestamp);
      return (
        recordDate.getFullYear() === today.getFullYear() &&
        recordDate.getMonth() === today.getMonth() &&
        recordDate.getDate() === today.getDate()
      );
    });
    
    if (alreadyMarked) {
      alert('Anda sudah melakukan absensi hari ini');
      return;
    }
    
    attendanceRecords.unshift({
      name: 'Anda',
      status,
      timestamp: now.toISOString()
    });
    
    saveAttendance();
    renderAttendance();
  }
  
  function clearAttendance() {
    if (!confirm('Hapus semua data absensi?')) return;
    attendanceRecords = [];
    saveAttendance();
    renderAttendance();
  }
  
  function saveAttendance() {
    localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
  }
  
  // 👇 Aman dipanggil setelah validasi
  markPresentBtn.addEventListener('click', () => markAttendance('present'));
  markAbsentBtn.addEventListener('click', () => markAttendance('absent'));
  clearAttendanceBtn.addEventListener('click', clearAttendance);
  
  renderAttendance();
}