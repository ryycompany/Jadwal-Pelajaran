class ScheduleApp {
    constructor() {
        this.data = {
            schedule: {
                1: ["PAI", "IPAS", "Bahasa Inggris", "Bahasa Indonesia"],
                2: ["Bahasa Indonesia", "IPAS", "OR", "Matematika", "DD E1-3 X"],
                3: ["DD E4-7 X", "PAI", "Matematika", "SBY", "Bahasa Indonesia"],
                4: ["BP", "Bahasa Sunda", "BP", "Informatika", "PPKN", "Sejarah", "Coding XI"],
                5: ["DD E4-7 X", "IPAS"]
            },
            books: {
                "PAI": ["Buku Catatan PAI"],
                "IPAS": ["Buku Catatan IPAS"],
                "Bahasa Inggris": ["Buku Catatan Bahasa Inggris"],
                "Bahasa Indonesia": ["Buku Catatan Bahasa Indonesia"],
                "OR": ["Buku Catatan OR"],
                "Matematika": ["Buku Catatan Matematika"],
                "DD E1-3 X": ["Buku Catatan DD TKJ 1"],
                "DD E4-7 X": ["Buku Catatan DD TKJ 2"],
                "SBY": ["Buku Catatan SBY, Peralatan Menggambar"],
                "Bahasa Sunda": ["Buku Catatan B. Sunda"],
                "Informatika": ["Buku Catatan Informatika"],
                "PPKN": ["Buku Catatan PPKN"],
                "Sejarah": ["Buku Catatan Sejarah"],
                "Coding XI": ["Buku Catatan Coding"]
            },
            days: {
                1: "Senin", 2: "Selasa", 3: "Rabu", 4: "Kamis", 5: "Jumat"
            }
        };

        this.today = new Date();
        this.day = this.today.getDay();
        this.calcExpression = "";
        this.prList = JSON.parse(localStorage.getItem("prList")) || [];
        this.prayerTimes = [];
        this.prayerCountdownInterval = null;

        // Warna default
        this.themeColor = localStorage.getItem("themeColor") || "#223CE7";
        this.tableHeaderColor = localStorage.getItem("tableHeaderColor") || "#223CE7";
        this.tableRowColor = localStorage.getItem("tableRowColor") || "#f9f9f9";
        this.tableBorderColor = localStorage.getItem("tableBorderColor") || "#dddddd";
        this.language = localStorage.getItem("language") || "id";
        this.darkMode = localStorage.getItem("darkMode") === "true" || false;

        this.initPrayerTimes().then(() => {
            this.initElements();
            this.initEventListeners();
            this.initData();
            this.showPreparation();
            this.applyTheme();
            this.applyTableStyle();
            this.applyDarkMode();
        }).catch(error => {
            console.error("Error:", error);
            this.initElements();
            this.initEventListeners();
            this.initData();
            this.showPreparation();
            this.applyTheme();
            this.applyTableStyle();
            this.applyDarkMode();
        });
    }

    async initPrayerTimes() {
        try {
            const response = await fetch('jadwal-sholat.txt');
            if (!response.ok) {
                throw new Error('File jadwal-sholat.txt tidak ditemukan');
            }

            const textData = await response.text();
            const todayStr = this.formatDate(this.today);
            const lines = textData.split('\n').filter(line => line.trim() !== '');

            let found = false;
            for (const line of lines) {
                if (line.includes(todayStr)) {
                    const prayerData = this.parsePrayerLine(line);
                    if (prayerData) {
                        this.prayerTimes = [
                            { name: "Subuh", time: prayerData.Subuh },
                            { name: "Dzuhur", time: prayerData.Dzuhur },
                            { name: "Ashar", time: prayerData.Ashar },
                            { name: "Maghrib", time: prayerData.Maghrib },
                            { name: "Isya", time: prayerData.Isya }
                        ];
                        found = true;
                        break;
                    }
                }
            }

            if (!found) {
                throw new Error('Tidak ada jadwal sholat untuk hari ini');
            }
        } catch (error) {
            console.error("Error loading prayer times:", error);
            throw error;
        }
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    parsePrayerLine(line) {
        try {
            // Format: Tanggal: 2025-03-25, Subuh: 04:36, Dzuhur: 11:56, Ashar: 15:08, Maghrib: 17:59, Isya: 19:06
            const parts = line.split(', ');
            const result = {};
            
            parts.forEach(part => {
                const colonIndex = part.indexOf(':');
                if (colonIndex > 0) {
                    const key = part.substring(0, colonIndex).trim();
                    const value = part.substring(colonIndex + 1).trim();
                    result[key] = value;
                }
            });

            // Validasi data
            const requiredPrayers = ['Subuh', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya'];
            for (const prayer of requiredPrayers) {
                if (!result[prayer] || !this.isValidTime(result[prayer])) {
                    throw new Error(`Format waktu sholat ${prayer} tidak valid`);
                }
            }

            return result;
        } catch (error) {
            console.error("Error parsing prayer line:", error);
            return null;
        }
    }

    isValidTime(time) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
    }

    initElements() {
        this.elements = {
            containers: document.querySelectorAll('.container'),
            navButtons: document.querySelectorAll('.footer-nav button'),
            
            currentDate: document.getElementById('currentDate'),
            todayScheduleTable: document.getElementById('todayScheduleTable'),
            
            tomorrowDate: document.getElementById('tomorrowDate'),
            tomorrowScheduleTable: document.getElementById('tomorrowScheduleTable'),
            
            fullScheduleTable: document.getElementById('fullScheduleTable'),
            
            preparationDate: document.getElementById('preparationDate'),
            preparationTableBody: document.getElementById('preparationTableBody'),
            
            prayerDate: document.getElementById('prayerDate'),
            prayerTimesTable: document.getElementById('prayerTimesTable'),
            
            prSubject: document.getElementById('prSubject'),
            prDeadline: document.getElementById('prDeadline'),
            prDescription: document.getElementById('prDescription'),
            prTableBody: document.getElementById('prTableBody'),
            addPRBtn: document.getElementById('addPRBtn'),
            
            calculatorInput: document.getElementById('calculatorInput'),
            calculatorButtons: document.querySelectorAll('.calculator-buttons button[data-value]'),
            equalsBtn: document.getElementById('equalsBtn'),
            
            tableHeaderColor: document.getElementById('tableHeaderColor'),
            tableRowColor: document.getElementById('tableRowColor'),
            tableBorderColor: document.getElementById('tableBorderColor'),
            saveSettingsBtn: document.getElementById('saveSettingsBtn'),
            applySettingsBtn: document.getElementById('applySettingsBtn'),
            resetTableStyle: document.getElementById('resetTableStyle'),
            resetAllSettings: document.getElementById('resetAllSettings'),
            darkModeToggle: document.getElementById('darkModeToggle')
        };
    }

    initEventListeners() {
        // Navigation
        this.elements.navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const target = button.dataset.target;
                this.showContainer(target);
                this.setActiveButton(button);
            });
        });

        // PR Management
        this.elements.addPRBtn.addEventListener('click', () => this.addPR());

        // Calculator
        this.elements.calculatorButtons.forEach(button => {
            button.addEventListener('click', () => {
                const value = button.dataset.value;
                if (value === 'C') {
                    this.calculatorClear();
                } else {
                    this.calculatorInput(value);
                }
            });
        });

        this.elements.equalsBtn.addEventListener('click', () => this.calculatorEquals());

        // Pengaturan Warna Tema
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.color-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
                this.themeColor = option.dataset.color;
                document.documentElement.style.setProperty('--theme-color', this.themeColor);
            });
        });

        // Pengaturan Tabel
        this.elements.tableHeaderColor.addEventListener('input', (e) => {
            this.tableHeaderColor = e.target.value;
        });

        this.elements.tableRowColor.addEventListener('input', (e) => {
            this.tableRowColor = e.target.value;
        });

        this.elements.tableBorderColor.addEventListener('input', (e) => {
            this.tableBorderColor = e.target.value;
        });

        // Pengaturan Bahasa
        document.querySelectorAll('.language-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.language-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
                this.language = option.dataset.lang;
            });
        });

        // Dark Mode Toggle
        this.elements.darkModeToggle.addEventListener('change', (e) => {
            this.darkMode = e.target.checked;
            this.applyDarkMode();
        });

        // Tombol Reset
        this.elements.resetTableStyle.addEventListener('click', () => {
            this.resetTableStyle();
        });

        this.elements.resetAllSettings.addEventListener('click', () => {
            this.resetAllSettings();
        });

        // Tombol Simpan & Terapkan
        this.elements.saveSettingsBtn.addEventListener('click', () => {
            this.saveSettings();
        });

        this.elements.applySettingsBtn.addEventListener('click', () => {
            this.applyTheme();
            this.applyTableStyle();
            this.applySettings();
        });
    }

    initData() {
        this.elements.prDeadline.valueAsDate = new Date();
        this.loadSettings();
        this.elements.darkModeToggle.checked = this.darkMode;
    }

    applyDarkMode() {
        if (this.darkMode) {
            document.body.classList.add('dark-mode');
            document.documentElement.style.setProperty('--bg-color', '#1a1a1a');
            document.documentElement.style.setProperty('--text-color', '#ffffff');
            document.documentElement.style.setProperty('--container-bg', '#2d2d2d');
            document.documentElement.style.setProperty('--footer-bg', '#1e1e1e');
            document.documentElement.style.setProperty('--button-bg', '#333333');
            document.documentElement.style.setProperty('--button-text', '#ffffff');
            document.documentElement.style.setProperty('--input-bg', '#333333');
            document.documentElement.style.setProperty('--input-text', '#ffffff');
            document.documentElement.style.setProperty('--table-row-hover', '#3a3a3a');
        } else {
            document.body.classList.remove('dark-mode');
            document.documentElement.style.setProperty('--bg-color', '#f5f5f5');
            document.documentElement.style.setProperty('--text-color', '#333333');
            document.documentElement.style.setProperty('--container-bg', '#ffffff');
            document.documentElement.style.setProperty('--footer-bg', '#223CE7');
            document.documentElement.style.setProperty('--button-bg', '#f0f0f0');
            document.documentElement.style.setProperty('--button-text', '#333333');
            document.documentElement.style.setProperty('--input-bg', '#ffffff');
            document.documentElement.style.setProperty('--input-text', '#333333');
            document.documentElement.style.setProperty('--table-row-hover', '#f0f0f0');
        }
    }

    showContainer(containerId) {
        clearInterval(this.prayerCountdownInterval);
        
        this.elements.containers.forEach(container => {
            container.classList.remove('active');
        });
        document.getElementById(containerId).classList.add('active');
        
        switch(containerId) {
            case 'todaySchedule':
                this.showTodaySchedule();
                break;
            case 'tomorrowSchedule':
                this.showTomorrowSchedule();
                break;
            case 'fullSchedule':
                this.showFullSchedule();
                break;
            case 'preparationContainer':
                this.showPreparation();
                break;
            case 'prayerTimesContainer':
                this.showPrayerTimes();
                break;
            case 'prContainer':
                this.renderPRList();
                break;
        }
    }

    setActiveButton(activeButton) {
        this.elements.navButtons.forEach(button => {
            button.classList.remove('active');
        });
        activeButton.classList.add('active');
    }

    showTodaySchedule() {
        const dateString = this.today.toLocaleDateString("id-ID", { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
        
        this.elements.currentDate.textContent = dateString;
        this.renderScheduleTable(this.elements.todayScheduleTable, this.data.schedule[this.day] || []);
    }

    showTomorrowSchedule() {
        const tomorrow = new Date();
        tomorrow.setDate(this.today.getDate() + 1);
        const tomorrowDay = tomorrow.getDay();
        const tomorrowDate = tomorrow.toLocaleDateString("id-ID", { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });

        this.elements.tomorrowDate.textContent = tomorrowDate;
        this.renderScheduleTable(this.elements.tomorrowScheduleTable, this.data.schedule[tomorrowDay] || []);
    }

    showFullSchedule() {
        const table = this.elements.fullScheduleTable;
        table.innerHTML = '';

        for (let dayNum = 1; dayNum <= 5; dayNum++) {
            const row = document.createElement('tr');
            const dayName = this.data.days[dayNum];
            const lessons = this.data.schedule[dayNum] || [];
            
            let rowContent = `<td>${dayName}</td>`;
            
            for (let i = 0; i < 7; i++) {
                rowContent += `<td>${lessons[i] || "-"}</td>`;
            }
            
            row.innerHTML = rowContent;
            table.appendChild(row);
        }
    }

    showPreparation() {
        const tomorrow = new Date();
        tomorrow.setDate(this.today.getDate() + 1);
        const tomorrowDay = tomorrow.getDay();
        const tomorrowDate = tomorrow.toLocaleDateString("id-ID", { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });

        this.elements.preparationDate.textContent = tomorrowDate;
        const table = this.elements.preparationTableBody;
        table.innerHTML = '';

        const lessons = this.data.schedule[tomorrowDay] || [];
        if (lessons.length === 0) {
            table.innerHTML = `<tr><td colspan="3">Tidak ada persiapan untuk besok</td></tr>`;
            return;
        }

        lessons.forEach((lesson, index) => {
            const row = document.createElement('tr');
            const booksNeeded = this.data.books[lesson] ? this.data.books[lesson].join(", ") : "-";
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${lesson}</td>
                <td>${booksNeeded}</td>
            `;
            table.appendChild(row);
        });
    }

    showPrayerTimes() {
        const todayStr = this.today.toLocaleDateString("id-ID", { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
        this.elements.prayerDate.textContent = todayStr;
        
        const table = this.elements.prayerTimesTable;
        table.innerHTML = '';
        
        if (this.prayerTimes.length === 0) {
            table.innerHTML = '<tr><td colspan="3">Jadwal sholat tidak tersedia untuk hari ini</td></tr>';
            return;
        }
        
        // Urutkan jadwal berdasarkan waktu
        this.sortPrayerTimes();
        
        this.prayerTimes.forEach(prayer => {
            const row = document.createElement('tr');
            const countdown = this.calculatePrayerCountdown(prayer.time);
            const isNextPrayer = this.isNextPrayer(prayer.time);
            
            row.innerHTML = `
                <td>${prayer.name}</td>
                <td>${prayer.time}</td>
                <td class="countdown">${countdown}</td>
            `;
            
            if (isNextPrayer) {
                row.classList.add('next-prayer');
            }
            
            table.appendChild(row);
        });
        
        // Update countdown setiap detik
        this.prayerCountdownInterval = setInterval(() => {
            const rows = table.querySelectorAll('tr');
            this.prayerTimes.forEach((prayer, index) => {
                const countdown = this.calculatePrayerCountdown(prayer.time);
                const isNextPrayer = this.isNextPrayer(prayer.time);
                
                if (rows[index]) {
                    rows[index].querySelector('.countdown').textContent = countdown;
                    
                    // Update highlight untuk sholat berikutnya
                    if (isNextPrayer) {
                        rows[index].classList.add('next-prayer');
                    } else {
                        rows[index].classList.remove('next-prayer');
                    }
                }
            });
        }, 1000);
    }

    sortPrayerTimes() {
        this.prayerTimes.sort((a, b) => {
            const timeA = this.parseTimeString(a.time);
            const timeB = this.parseTimeString(b.time);
            return timeA - timeB;
        });
    }

    parseTimeString(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    isNextPrayer(prayerTime) {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const prayerMinutes = this.parseTimeString(prayerTime);
        
        // Jika waktu sholat sudah lewat hari ini, cek untuk besok
        if (prayerMinutes <= currentMinutes) {
            return false;
        }
        
        // Cek apakah ini sholat berikutnya yang akan datang
        const nextPrayers = this.prayerTimes.filter(pt => {
            const ptMinutes = this.parseTimeString(pt.time);
            return ptMinutes > currentMinutes;
        });
        
        if (nextPrayers.length > 0) {
            return this.parseTimeString(nextPrayers[0].time) === prayerMinutes;
        }
        
        return false;
    }

    calculatePrayerCountdown(prayerTime) {
        const now = new Date();
        const [hours, minutes] = prayerTime.split(':').map(Number);
        
        const prayerDate = new Date();
        prayerDate.setHours(hours, minutes, 0, 0);
        
        if (prayerDate < now) {
            prayerDate.setDate(prayerDate.getDate() + 1);
        }
        
        const diff = prayerDate - now;
        const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
        const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secondsLeft = Math.floor((diff % (1000 * 60)) / 1000);
        
        return `${hoursLeft.toString().padStart(2, '0')}:${minutesLeft.toString().padStart(2, '0')}:${secondsLeft.toString().padStart(2, '0')}`;
    }

    renderScheduleTable(tableElement, lessons) {
        tableElement.innerHTML = '';
        
        if (lessons.length === 0) {
            tableElement.innerHTML = `<tr><td colspan="2">Tidak ada jadwal</td></tr>`;
            return;
        }
        
        lessons.forEach((lesson, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${index + 1}</td><td>${lesson}</td>`;
            tableElement.appendChild(row);
        });
    }

    addPR() {
        const subject = this.elements.prSubject.value;
        const deadline = this.elements.prDeadline.value;
        const description = this.elements.prDescription.value;

        if (!subject || !deadline || !description) {
            alert("Harap isi semua field!");
            return;
        }

        this.prList.push({
            id: Date.now(),
            subject,
            deadline,
            description,
            completed: false
        });

        this.savePRList();
        this.renderPRList();
        this.resetPRForm();
    }

    deletePR(id) {
        this.prList = this.prList.filter(pr => pr.id !== id);
        this.savePRList();
        this.renderPRList();
    }

    toggleComplete(id) {
        this.prList = this.prList.map(pr => {
            if (pr.id === id) {
                return { ...pr, completed: !pr.completed };
            }
            return pr;
        });
        this.savePRList();
        this.renderPRList();
    }

    savePRList() {
        localStorage.setItem("prList", JSON.stringify(this.prList));
    }

    renderPRList() {
        const table = this.elements.prTableBody;
        table.innerHTML = '';

        if (this.prList.length === 0) {
            table.innerHTML = `<tr><td colspan="4">Tidak ada PR</td></tr>`;
            return;
        }

        this.prList.forEach(pr => {
            const row = document.createElement('tr');
            if (pr.completed) {
                row.classList.add('completed');
            }
            row.innerHTML = `
                <td>${pr.subject}</td>
                <td>${new Date(pr.deadline).toLocaleDateString("id-ID")}</td>
                <td>${pr.description}</td>
                <td>
                    <button onclick="app.toggleComplete(${pr.id})">
                        <i class="fas ${pr.completed ? 'fa-undo' : 'fa-check'}"></i>
                    </button>
                    <button onclick="app.deletePR(${pr.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            table.appendChild(row);
        });
    }

    resetPRForm() {
        this.elements.prSubject.value = "PAI";
        this.elements.prDeadline.valueAsDate = new Date();
        this.elements.prDescription.value = "";
    }

    calculatorInput(value) {
        this.calcExpression += value;
        this.updateCalculator();
    }

    calculatorClear() {
        this.calcExpression = "";
        this.updateCalculator();
    }

    calculatorEquals() {
        try {
            let expr = this.calcExpression
                .replace(/×/g, '*')
                .replace(/÷/g, '/');
            
            const result = eval(expr);
            this.calcExpression = result.toString();
            this.updateCalculator();
        } catch (error) {
            this.calcExpression = "Error";
            this.updateCalculator();
            setTimeout(() => {
                this.calcExpression = "";
                this.updateCalculator();
            }, 1000);
        }
    }

    updateCalculator() {
        this.elements.calculatorInput.value = this.calcExpression || "0";
    }

    applyTheme() {
        document.documentElement.style.setProperty('--theme-color', this.themeColor);
        
        // Update UI warna tema yang aktif
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.color === this.themeColor) {
                option.classList.add('selected');
            }
        });
    }

    applyTableStyle() {
        const style = document.createElement('style');
        style.id = 'table-custom-style';
        style.textContent = `
            th {
                background-color: ${this.tableHeaderColor} !important;
            }
            tr:nth-child(even) {
                background-color: ${this.tableRowColor} !important;
            }
            th, td {
                border-bottom-color: ${this.tableBorderColor} !important;
            }
            .next-prayer {
                background-color: rgba(34, 60, 231, 0.2) !important;
                font-weight: bold;
            }
        `;
        
        // Hapus style lama jika ada
        const oldStyle = document.getElementById('table-custom-style');
        if (oldStyle) {
            oldStyle.remove();
        }
        
        document.head.appendChild(style);
    }

    resetTableStyle() {
        this.tableHeaderColor = "#223CE7";
        this.tableRowColor = "#f9f9f9";
        this.tableBorderColor = "#dddddd";
        
        this.elements.tableHeaderColor.value = this.tableHeaderColor;
        this.elements.tableRowColor.value = this.tableRowColor;
        this.elements.tableBorderColor.value = this.tableBorderColor;
        
        this.applyTableStyle();
    }

    resetAllSettings() {
        if (confirm("Apakah Anda yakin ingin mereset semua pengaturan ke default?")) {
            this.themeColor = "#223CE7";
            this.tableHeaderColor = "#223CE7";
            this.tableRowColor = "#f9f9f9";
            this.tableBorderColor = "#dddddd";
            this.language = "id";
            this.darkMode = false;
            this.elements.darkModeToggle.checked = false;
            
            // Update UI
            this.elements.tableHeaderColor.value = this.tableHeaderColor;
            this.elements.tableRowColor.value = this.tableRowColor;
            this.elements.tableBorderColor.value = this.tableBorderColor;
            
            // Reset color picker
            document.querySelectorAll('.color-option').forEach(option => {
                option.classList.remove('selected');
                if (option.dataset.color === this.themeColor) {
                    option.classList.add('selected');
                }
            });
            
            // Reset language
            document.querySelectorAll('.language-option').forEach(option => {
                option.classList.remove('selected');
                if (option.dataset.lang === this.language) {
                    option.classList.add('selected');
                }
            });
            
            this.applyTheme();
            this.applyTableStyle();
            this.applySettings();
            this.applyDarkMode();
        }
    }

    loadSettings() {
        this.themeColor = localStorage.getItem("themeColor") || "#223CE7";
        this.tableHeaderColor = localStorage.getItem("tableHeaderColor") || "#223CE7";
        this.tableRowColor = localStorage.getItem("tableRowColor") || "#f9f9f9";
        this.tableBorderColor = localStorage.getItem("tableBorderColor") || "#dddddd";
        this.language = localStorage.getItem("language") || "id";
        this.darkMode = localStorage.getItem("darkMode") === "true" || false;
        
        // Update UI
        this.elements.tableHeaderColor.value = this.tableHeaderColor;
        this.elements.tableRowColor.value = this.tableRowColor;
        this.elements.tableBorderColor.value = this.tableBorderColor;
        this.elements.darkModeToggle.checked = this.darkMode;
        
        // Select color option
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.color === this.themeColor) {
                option.classList.add('selected');
            }
        });
        
        // Select language
        document.querySelectorAll('.language-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.lang === this.language) {
                option.classList.add('selected');
            }
        });
        
        this.applyTheme();
        this.applyTableStyle();
        this.applySettings();
        this.applyDarkMode();
    }

    saveSettings() {
        localStorage.setItem("themeColor", this.themeColor);
        localStorage.setItem("tableHeaderColor", this.tableHeaderColor);
        localStorage.setItem("tableRowColor", this.tableRowColor);
        localStorage.setItem("tableBorderColor", this.tableBorderColor);
        localStorage.setItem("language", this.language);
        localStorage.setItem("darkMode", this.darkMode);
        
        alert("Pengaturan berhasil disimpan!");
    }

    applySettings() {
        const translations = {
            id: {
                today: "Hari Ini",
                tomorrow: "Besok",
                full: "Jadwal Lengkap",
                preparation: "Persiapan",
                prayer: "Sholat",
                pr: "PR",
                calculator: "Kalkulator",
                settings: "Pengaturan"
            },
            en: {
                today: "Today",
                tomorrow: "Tomorrow",
                full: "Full Schedule",
                preparation: "Preparation",
                prayer: "Prayer",
                pr: "Homework",
                calculator: "Calculator",
                settings: "Settings"
            }
        };

        const trans = translations[this.language] || translations.id;
        this.elements.navButtons.forEach((button, index) => {
            const keys = Object.keys(trans);
            if (index < keys.length) {
                button.querySelector('span').textContent = trans[keys[index]];
            }
        });
    }
}

// Inisialisasi app
document.addEventListener('DOMContentLoaded', () => {
    // Set CSS variable untuk tema
    document.documentElement.style.setProperty('--theme-color', '#223CE7');
    document.documentElement.style.setProperty('--bg-color', '#f5f5f5');
    document.documentElement.style.setProperty('--text-color', '#333333');
    document.documentElement.style.setProperty('--container-bg', '#ffffff');
    document.documentElement.style.setProperty('--footer-bg', '#223CE7');
    document.documentElement.style.setProperty('--button-bg', '#f0f0f0');
    document.documentElement.style.setProperty('--button-text', '#333333');
    document.documentElement.style.setProperty('--input-bg', '#ffffff');
    document.documentElement.style.setProperty('--input-text', '#333333');
    document.documentElement.style.setProperty('--table-row-hover', '#f0f0f0');
    
    window.app = new ScheduleApp();
});