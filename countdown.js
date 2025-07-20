function createTickerItem(text, msRemaining, iconClass) {
    const div = document.createElement('div');

    const totalMinutes = Math.floor(msRemaining / 60000);
    const seconds = Math.floor((msRemaining % 60000) / 1000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    let timeText = '';
    if (hours > 0) {
        timeText = `${hours} jam${minutes > 0 ? ` ${minutes} menit` : ''}`;
    } else {
        timeText = `${minutes} menit ${seconds} detik`;
    }

    div.innerHTML = `<i class="${iconClass}" style="margin-right:6px;"></i> ${text}: <strong>${timeText}</strong>`;
    div.style.marginBottom = '8px';
    return div;
}

function updateCountdownTicker() {
    const now = new Date();
    const currentDayIndex = now.getDay(); // 0 = Minggu, 6 = Sabtu
    const tickerBox = document.querySelector('.countdown-ticker');
    const container = document.getElementById('ticker-container');

    // Kosongkan isi container
    container.innerHTML = '';

    // Hitung waktu sekarang dalam milidetik
    const currentTimeMs = now.getHours() * 3600000 + now.getMinutes() * 60000 + now.getSeconds() * 1000;
    const startSchoolMs = 6 * 3600000;
    const endSchoolMs = 15 * 3600000 + 45 * 60000;

    // Tampilkan countdown box
    tickerBox.style.display = 'block';

    const currentDay = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'][currentDayIndex];

    let currentClass = null, currentBreak = null;
    let nextClass = null, nextBreak = null;
    let currentClassEnd = null, nextClassStart = null;
    let nextBreakStart = null, currentBreakEnd = null;

    if (typeof schedule !== 'undefined' && schedule[currentDay]) {
        for (let event of schedule[currentDay]) {
            const [h, m] = event.time.split(':').map(Number);
            const startMs = h * 3600000 + m * 60000;
            const endMs = startMs + event.duration * 60000;

            if (currentTimeMs >= startMs && currentTimeMs < endMs) {
                if (event.isBreak) {
                    currentBreak = event;
                    currentBreakEnd = endMs;
                } else {
                    currentClass = event;
                    currentClassEnd = endMs;
                }
            } else if (startMs > currentTimeMs) {
                if (event.isBreak && !nextBreak) {
                    nextBreak = event;
                    nextBreakStart = startMs;
                } else if (!event.isBreak && !nextClass) {
                    nextClass = event;
                    nextClassStart = startMs;
                }
            }
        }
    }

    // Tampilkan countdown pelajaran
    if (currentClass) {
        const remaining = currentClassEnd - currentTimeMs;
        container.appendChild(createTickerItem(
            `Pelajaran ${currentClass.subject} berakhir dalam`, remaining, 'fas fa-book'
        ));
    } else if (nextClass) {
        const remaining = nextClassStart - currentTimeMs;
        container.appendChild(createTickerItem(
            `Pelajaran berikutnya: ${nextClass.subject} dimulai dalam`, remaining, 'fas fa-clock'
        ));
    }

    // Tampilkan countdown istirahat
    if (currentBreak) {
        const remaining = currentBreakEnd - currentTimeMs;
        container.appendChild(createTickerItem(
            `Istirahat berakhir dalam`, remaining, 'fas fa-coffee'
        ));
    } else if (nextBreak) {
        const remaining = nextBreakStart - currentTimeMs;
        container.appendChild(createTickerItem(
            `Istirahat berikutnya dalam`, remaining, 'fas fa-mug-hot'
        ));
    }

    // Countdown ke waktu pulang jika belum lewat
    const timeToHome = endSchoolMs - currentTimeMs;
    if (timeToHome > 0) {
        container.appendChild(createTickerItem(
            `Waktu pulang dalam`, timeToHome, 'fas fa-home'
        ));
    }
}

// Jalankan otomatis setiap detik
setInterval(updateCountdownTicker, 1000);
window.addEventListener('DOMContentLoaded', updateCountdownTicker);