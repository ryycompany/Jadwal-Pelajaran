class Kalender {
  constructor() {
    this.monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
                       "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    this.dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    this.holidays = [];
    this.currentDate = new Date(); // default: hari ini
    this.init();
  }

  async init() {
    await this.loadHolidays();
    this.renderCalendar();
  }

  async loadHolidays() {
    try {
      const response = await fetch('kalender.json');
      this.holidays = await response.json();
    } catch (error) {
      console.error("Gagal memuat hari libur:", error);
      this.holidays = [];
    }
  }

  renderCalendar() {
    const container = document.getElementById('calendar-container');
    if (!container) return;

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    container.innerHTML = `
      <div class="calendar-header">
        <button id="prev-month"><i class="fas fa-chevron-left"></i></button>
        <h3>${this.monthNames[month]} ${year}</h3>
        <button id="next-month"><i class="fas fa-chevron-right"></i></button>
      </div>
      <div class="calendar-weekdays">
        ${this.dayNames.map(d => d.substring(0,3)).map(d => `<div>${d}</div>`).join('')}
      </div>
      <div class="calendar-days">
        ${this.generateDays(firstDay, daysInMonth, month, year)}
      </div>
    `;

    // ✅ Penting: pasang ulang listener setelah render ulang
    this.setupEventListeners();
  }

  generateDays(firstDay, daysInMonth, month, year) {
    let daysHtml = '';

    for (let i = 0; i < firstDay; i++) {
      daysHtml += `<div class="day empty"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${(month+1).toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`;
      const isToday = this.isToday(day, month, year);
      const isHoliday = this.isHoliday(dateStr);

      daysHtml += `
        <div class="day 
          ${isToday ? 'today' : ''} 
          ${isHoliday ? 'holiday' : ''}"
          data-date="${dateStr}">
          ${day}
          ${isHoliday ? `<div class="holiday-tooltip">${this.getHolidayName(dateStr)}</div>` : ''}
        </div>
      `;
    }

    return daysHtml;
  }

  setupEventListeners() {
    const prevBtn = document.getElementById('prev-month');
    const nextBtn = document.getElementById('next-month');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
      });
    }
  }

  isToday(day, month, year) {
    const today = new Date();
    return day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear();
  }

  isHoliday(dateStr) {
    return this.holidays.some(h => h.date === dateStr);
  }

  getHolidayName(dateStr) {
    const holiday = this.holidays.find(h => h.date === dateStr);
    return holiday ? holiday.name : '';
  }
}

// 🔁 Inisialisasi ketika DOM sudah siap
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('calendar-container')) {
    new Kalender();
  }
});