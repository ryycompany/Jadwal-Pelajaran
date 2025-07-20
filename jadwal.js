// Schedule Data with breaks
const schedule = {
  senin: [
    { subject: "Up / KEB", teacher: "-", time: "06:30", duration: 55 },
    { subject: "KK (AIJ 2) XI", teacher: "Pak Wahyudi", time: "07:25", duration: 90 },
    { subject: "Istirahat", time: "08:55", duration: 30, isBreak: true },
    { subject: "OR", teacher: "Pak Wira", time: "09:25", duration: 90 },
    { subject: "BP", teacher: "Pak Restu", time: "10:10", duration: 90 },
    { subject: "PKN", teacher: "Bu Isni", time: "11:40", duration: 45 },
    { subject: "Istirahat", time: "12:35", duration: 30, isBreak: true },
    { subject: "PKN", teacher: "Bu Isni", time: "13:05", duration: 40 },
    { subject: "MP TKJ 2 XI", teacher: "Pak Asmana", time: "13:45", duration: 80 },
    { subject: "BP", teacher: "Pak Restu", time: "15:05", duration: 40 }
  ],
  selasa: [
    { subject: "SID", teacher: "Pak Rachmat", time: "06:30", duration: 55 },
    { subject: "MP Kelistrikan", teacher: "Pak Hendri", time: "07:25", duration: 90 },
    { subject: "Istirahat", time: "08:55", duration: 30, isBreak: true },
    { subject: "BIG", teacher: "Pak Ali", time: "09:25", duration: 90 },
    { subject: "KK (AIJ 2) XI", teacher: "Pak Wahyudi", time: "10:55", duration: 100 },
    { subject: "Istirahat", time: "12:35", duration: 30, isBreak: true },
    { subject: "KK (AIJ 2) XI", teacher: "Pak Wahyudi", time: "13:05", duration: 100 },
  ],
  rabu: [
    { subject: "BID", teacher: "Pak Abdul Rokman", time: "06:30", duration: 145 },
    { subject: "Istirahat", time: "08:55", duration: 30, isBreak: true },
    { subject: "BIG", teacher: "Pak Ali", time: "09:25", duration: 90 },
    { subject: "KK PR 2 XI", teacher: "Pak Agung", time: "10:55", duration: 100 },
    { subject: "Istirahat", time: "12:35", duration: 30, isBreak: true },
    { subject: "PKK XI", teacher: "Bu Melinda", time: "13:05", duration: 120 },
    { subject: "SID", teacher: "Pak Rachmat", time: "15:05", duration: 40 },
  ],
  kamis: [
    { subject: "KK (ASJ 3) XI", teacher: "Pak Arifin", time: "06:30", duration: 100 },
    { subject: "PAI", teacher: "Pak Romdon", time: "08:10", duration: 45 },
    { subject: "Istirahat", time: "08:55", duration: 30, isBreak: true },
    { subject: "PAI", teacher: "Pak Romdon", time: "09:25", duration: 90 },
    { subject: "KK (ASJ 3) XI", teacher: "Pak Arifin", time: "10:55", duration: 100 },
    { subject: "Istirahat", time: "12:35", duration: 30, isBreak: true },
    { subject: "KK (ASJ 3) XI", teacher: "Pak Arifin", time: "13:05", duration: 80 },
    { subject: "PKK XI", teacher: "Bu Melinda", time: "14:25", duration: 80 },

  ],
  jumat: [
    { subject: "KK PR 2 XI", teacher: "Pak Agung", time: "06:30", duration: 100 },
    { subject: "Bahasa Sunda", teacher: "Bu Dewi", time: "08:10", duration: 45 },
    { subject: "Istirahat", time: "08:55", duration: 30, isBreak: true },
    { subject: "MTK", teacher: "Bu Rica", time: "09:25", duration: 13 },
  ]
};

const subjectColors = {};

function initSubjectColors() {
  const subjects = new Set();
  Object.values(schedule).flat().forEach(item => {
    if (!item.isBreak) subjects.add(item.subject);
  });
  Array.from(subjects).forEach((subj, i) => subjectColors[subj] = (i % 12) + 1);
}

function initSchedule() {
  initSubjectColors();
  renderTodaySchedule();
  document.querySelectorAll('.day-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      renderScheduleForDay(this.dataset.day);
    });
  });
}

function renderTodaySchedule() {
  const days = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
  const today = days[new Date().getDay()];
  document.querySelectorAll('.day-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.day === today);
  });
  renderScheduleForDay(today, true);
}

function renderScheduleForDay(day, isToday = false) {
  const scheduleContainer = document.getElementById('schedule-container');
  if (!scheduleContainer) return;
  scheduleContainer.innerHTML = '';
  
  const header = document.createElement('h3');
  header.innerHTML = `<i class="fas fa-calendar-day"></i> ${capitalize(day)}`;
  scheduleContainer.appendChild(header);
  
  const list = schedule[day];
  if (!list?.length) {
    scheduleContainer.innerHTML += '<div class="schedule-item">Tidak ada pelajaran hari ini</div>';
    return;
  }
  
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  let marked = false;
  
  for (const item of list) {
    const itemEl = createScheduleItem(item);
    const [h, m] = item.time.split(':').map(Number);
    const startMin = h * 60 + m;
    const endMin = startMin + item.duration;
    
    if (isToday && !marked && nowMin < endMin && !item.isBreak) {
      itemEl.classList.add(nowMin >= startMin ? 'current-subject' : 'next-subject');
      marked = true;
    }
    
    if (item.isBreak) itemEl.classList.add('break-item');
    else itemEl.classList.add(`subject-color-${subjectColors[item.subject]}`);
    
    scheduleContainer.appendChild(itemEl);
  }
}

function createScheduleItem(item) {
  const el = document.createElement('div');
  el.className = 'schedule-item';
  el.innerHTML = `
    <div class="subject">${item.subject}</div>
    <div class="details">
      <span>${item.teacher || (item.isBreak ? 'Istirahat' : '')}</span>
      <span class="time">${item.time} - ${calculateEndTime(item.time, item.duration)}</span>
    </div>
  `;
  return el;
}

function calculateEndTime(start, duration) {
  const [h, m] = start.split(':').map(Number);
  const t = h * 60 + m + duration;
  return `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

document.addEventListener('DOMContentLoaded', initSchedule);