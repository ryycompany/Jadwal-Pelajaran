function initNumberConverter() {
  const binaryInput = document.getElementById('binary-input');
  const decimalInput = document.getElementById('decimal-input');
  const hexInput = document.getElementById('hex-input');
  const octalInput = document.getElementById('octal-input');
  
  // Cegah error jika ada elemen yang tidak ditemukan
  if (!binaryInput || !decimalInput || !hexInput || !octalInput) {
    console.warn('Konversi Bilangan: Salah satu input tidak ditemukan, inisialisasi dibatalkan.');
    return;
  }
  
  binaryInput.addEventListener('input', () => {
    const value = binaryInput.value.trim();
    if (!value) {
      clearOtherInputs(binaryInput);
      return;
    }
    
    if (/^[01]+$/.test(value)) {
      const decimal = parseInt(value, 2);
      decimalInput.value = decimal;
      hexInput.value = decimal.toString(16).toUpperCase();
      octalInput.value = decimal.toString(8);
    }
  });
  
  decimalInput.addEventListener('input', () => {
    const value = decimalInput.value.trim();
    if (!value) {
      clearOtherInputs(decimalInput);
      return;
    }
    
    if (/^\d+$/.test(value)) {
      const decimal = parseInt(value, 10);
      binaryInput.value = decimal.toString(2);
      hexInput.value = decimal.toString(16).toUpperCase();
      octalInput.value = decimal.toString(8);
    }
  });
  
  hexInput.addEventListener('input', () => {
    const value = hexInput.value.trim();
    if (!value) {
      clearOtherInputs(hexInput);
      return;
    }
    
    if (/^[0-9A-Fa-f]+$/.test(value)) {
      const decimal = parseInt(value, 16);
      binaryInput.value = decimal.toString(2);
      decimalInput.value = decimal;
      octalInput.value = decimal.toString(8);
    }
  });
  
  octalInput.addEventListener('input', () => {
    const value = octalInput.value.trim();
    if (!value) {
      clearOtherInputs(octalInput);
      return;
    }
    
    if (/^[0-7]+$/.test(value)) {
      const decimal = parseInt(value, 8);
      binaryInput.value = decimal.toString(2);
      decimalInput.value = decimal;
      hexInput.value = decimal.toString(16).toUpperCase();
    }
  });
  
  function clearOtherInputs(excludeInput) {
    if (excludeInput !== binaryInput) binaryInput.value = '';
    if (excludeInput !== decimalInput) decimalInput.value = '';
    if (excludeInput !== hexInput) hexInput.value = '';
    if (excludeInput !== octalInput) octalInput.value = '';
  }
}