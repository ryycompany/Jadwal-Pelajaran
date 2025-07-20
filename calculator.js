/**

Sistem Kalkulator - Bundel Final */


function initCalculator() { console.log('✅ initCalculator dijalankan...');

// Ambil elemen tampilan dan tombol const display = document.getElementById('calculator-display'); const buttons = document.querySelectorAll('.calculator-buttons button');

if (!display || buttons.length === 0) { console.warn('⚠️ Kalkulator: elemen belum siap, inisialisasi dibatalkan.'); return; }

let currentInput = '0'; updateDisplay();

function updateDisplay() { display.textContent = currentInput; }

buttons.forEach(button => { button.addEventListener('click', () => { const value = button.getAttribute('data-value'); if (!value) return;

switch (value) {
    case 'C':
      currentInput = '0';
      break;
    case 'del':
      currentInput = currentInput.slice(0, -1) || '0';
      break;
    case '=':
      try {
        currentInput = String(new Function('return ' + currentInput)());
      } catch (error) {
        currentInput = 'Error';
      }
      break;
    default:
      if (currentInput === '0' || currentInput === 'Error') {
        currentInput = value;
      } else {
        currentInput += value;
      }
  }

  updateDisplay();
});

}); }

// ✅ Inisialisasi saat DOM siap document.addEventListener('DOMContentLoaded', initCalculator);

