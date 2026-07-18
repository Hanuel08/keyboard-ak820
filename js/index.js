

const d = document;

const audioBasePath = "./media/audio/";

// Character mapping helpers
const shiftCharMap = {
  '`': '~', '1': '!', '2': '@', '3': '#', '4': '$', '5': '%', '6': '^', '7': '&', '8': '*', '9': '(', '0': ')',
  '-': '_', '=': '+', '[': '{', ']': '}', '\\': '|', ';': ':', "'": '"', ',': '<', '.': '>', '/': '?'
};

const normalCharMap = {
  '~': '`', '!': '1', '@': '2', '#': '3', '$': '4', '%': '5', '^': '6', '&': '7', '*': '8', '(': '9', ')': '0',
  '_': '-', '+': '=', '{': '[', '}': ']', '|': '\\', ':': ';', '"': "'", '<': ',', '>': '.', '?': '/'
};

// Map KeyboardEvent.code to virtual key data-key if different
const mapEventCode = (code) => {
  if (code === 'PageUp') return 'PgUp';
  if (code === 'PageDown') return 'PgDn';
  return code;
};

// UI Elements
const soundToggle = d.getElementById('sound-toggle');
const volumeSlider = d.getElementById('volume-slider');
const backlightMode = d.getElementById('backlight-mode');
const btnCopy = d.getElementById('btn-copy');
const btnClear = d.getElementById('btn-clear');
const themeToggleBtn = d.getElementById('theme-toggle');
const typingArea = d.getElementById('typing-area');
const keyboard = d.querySelector('.keyboard');

// Helper checking for F-keys (F1-F12)
const isFKey = (code) => /^F[1-9]$|^F1[0-2]$/.test(code);

// Toast Notification system
const showNotification = (message, icon = '🔧') => {
  let container = d.getElementById('toast-container');
  if (!container) {
    container = d.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    d.body.appendChild(container);
  }
  const toast = d.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-message">${message}</span>`;
  container.appendChild(toast);
  
  // Slide in
  setTimeout(() => toast.classList.add('show'), 10);
  
  // Remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2200);
};

// Theme Mode update
const updateThemeButton = (isLight) => {
  if (themeToggleBtn) {
    themeToggleBtn.innerHTML = isLight ? '<i class="ti ti-sun"></i> Theme' : '<i class="ti ti-moon"></i> Theme';
  }
};

// Interactive Simulator Functions mapped to F-keys
const handleFunctionKey = (keyCode, event = null) => {
  if (event) {
    const preventKeys = ['F1', 'F2', 'F3', 'F4', 'F6', 'F7', 'F8'];
    if (preventKeys.includes(keyCode)) {
      event.preventDefault();
    }
  }

  if (keyCode === 'F1') {
    if (themeToggleBtn) {
      themeToggleBtn.click();
    }
  } else if (keyCode === 'F2') {
    if (volumeSlider) {
      const cur = parseFloat(volumeSlider.value);
      volumeSlider.value = Math.max(0, cur - 0.1).toFixed(1);
      volumeSlider.dispatchEvent(new Event('change'));
      showNotification(`Volumen: ${Math.round(volumeSlider.value * 100)}%`, '🔈');
    }
  } else if (keyCode === 'F3') {
    if (volumeSlider) {
      const cur = parseFloat(volumeSlider.value);
      volumeSlider.value = Math.min(1, cur + 0.1).toFixed(1);
      volumeSlider.dispatchEvent(new Event('change'));
      showNotification(`Volumen: ${Math.round(volumeSlider.value * 100)}%`, '🔊');
    }
  } else if (keyCode === 'F4') {
    if (soundToggle) {
      soundToggle.checked = !soundToggle.checked;
      soundToggle.dispatchEvent(new Event('change'));
      showNotification(`Sonido: ${soundToggle.checked ? 'Activado' : 'Silenciado'}`, soundToggle.checked ? '🔊' : '🔇');
    }
  } else if (keyCode === 'F6') {
    if (backlightMode) {
      const currentIdx = backlightMode.selectedIndex;
      const nextIdx = (currentIdx + 1) % backlightMode.options.length;
      backlightMode.selectedIndex = nextIdx;
      backlightMode.dispatchEvent(new Event('change'));
      showNotification(`Retroiluminación: ${backlightMode.options[nextIdx].text}`, '💡');
    }
  } else if (keyCode === 'F7') {
    if (btnCopy) {
      btnCopy.click();
    }
  } else if (keyCode === 'F8') {
    if (btnClear) {
      btnClear.click();
    }
  } else {
    showNotification(`Tecla ${keyCode} presionada (Sin función)`, '🔑');
  }
};

// State Variables
let isShift = false;
let isCapsLock = false;
let keystrokeCount = 0;
let startTime = null;
let timerInterval = null;
const activePhysicalKeys = new Set();

// Set default backlight class on load
if (keyboard && backlightMode) {
  keyboard.classList.add(`backlight-${backlightMode.value}`);
}

// Stats functions
const updateWPM = () => {
  if (!startTime) return;
  const minutesElapsed = (Date.now() - startTime) / 60000;
  if (minutesElapsed < 0.05) { // Prevent division by tiny values at start
    d.getElementById('stat-wpm').textContent = '0';
    return;
  }
  const textLength = typingArea.value.length;
  const words = textLength / 5;
  const wpm = Math.round(words / minutesElapsed);
  d.getElementById('stat-wpm').textContent = wpm;
};

const startStatsTimer = () => {
  if (timerInterval) return;
  timerInterval = setInterval(updateWPM, 1000);
};

// Audio play logic
const playKeyAudio = ($key) => {
  if (!soundToggle || !soundToggle.checked) return;
  const volume = volumeSlider ? parseFloat(volumeSlider.value) : 0.7;
  let soundPath = `${audioBasePath}simple_key_sound_1.m4a`;

  if ($key.closest('[data-key="Space"]')) {
    soundPath = `${audioBasePath}space_key_sound_1.m4a`;
  } else if ($key.closest('[data-key="Enter"]')) {
    soundPath = `${audioBasePath}enter_key_sound_1.m4a`;
  } else if ($key.closest('[data-key="Backspace"]')) {
    soundPath = `${audioBasePath}backspace_key_sound_1.m4a`;
  }

  const audio = new Audio(soundPath);
  audio.volume = volume;
  audio.play().catch(err => console.warn("Audio playback blocked:", err));
};

// CapsLock status indicator helper
const syncCapsLockState = (active) => {
  const capsLed = d.getElementById('led-caps');
  if (capsLed) {
    if (active) capsLed.classList.add('active');
    else capsLed.classList.remove('active');
  }
  
  // Highlight virtual CapsLock key permanently while active
  const capsKey = d.querySelector('.key[data-key="CapsLock"]');
  if (capsKey) {
    if (active) capsKey.classList.add('pressed');
    else capsKey.classList.remove('pressed');
  }
};

// Insert character at cursor position in textarea
const insertAtCursor = (textarea, text) => {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const val = textarea.value;
  textarea.value = val.substring(0, start) + text + val.substring(end);
  textarea.selectionStart = textarea.selectionEnd = start + text.length;
};

// Virtual key trigger handler
const handleVirtualKeyPress = ($key) => {
  const keyName = $key.dataset.keyName;
  const keyCode = $key.dataset.key;

  // Add visual pressed styling
  $key.classList.add('pressed');
  if (keyboard.classList.contains('backlight-reactive-ripple')) {
    $key.classList.add('pressed-glow');
  }

  // Remove pressed state after brief simulation delay
  setTimeout(() => {
    // Only remove pressed class if it's not the Shift or CapsLock keys locked in active states
    if ((keyCode !== 'ShiftLeft' && keyCode !== 'ShiftRight' || !isShift) && (keyCode !== 'CapsLock' || !isCapsLock)) {
      $key.classList.remove('pressed');
    }
    $key.classList.remove('pressed-glow');
  }, 100);

  // Play sound
  playKeyAudio($key);

  // Stats update
  keystrokeCount++;
  d.getElementById('stat-keys').textContent = keystrokeCount;
  if (!startTime) {
    startTime = Date.now();
    startStatsTimer();
  }

  // Special Keys
  if (keyCode === 'CapsLock') {
    isCapsLock = !isCapsLock;
    syncCapsLockState(isCapsLock);
    return;
  }

  if (isFKey(keyCode)) {
    handleFunctionKey(keyCode);
    return;
  }

  if (keyCode === 'ArrowLeft') {
    const start = typingArea.selectionStart;
    if (start > 0) {
      typingArea.selectionStart = typingArea.selectionEnd = start - 1;
    }
    typingArea.focus();
    updateWPM();
    return;
  }

  if (keyCode === 'ArrowRight') {
    const start = typingArea.selectionStart;
    if (start < typingArea.value.length) {
      typingArea.selectionStart = typingArea.selectionEnd = start + 1;
    }
    typingArea.focus();
    updateWPM();
    return;
  }

  if (keyCode === 'ArrowUp') {
    const cursorPosition = typingArea.selectionStart;
    const text = typingArea.value;
    const lines = text.substring(0, cursorPosition).split('\n');
    if (lines.length > 1) {
      const currentLineCol = lines[lines.length - 1].length;
      const previousLineLength = lines[lines.length - 2].length;
      let prevLineStartIndex = 0;
      for (let i = 0; i < lines.length - 2; i++) {
        prevLineStartIndex += lines[i].length + 1;
      }
      const targetCol = Math.min(currentLineCol, previousLineLength);
      typingArea.selectionStart = typingArea.selectionEnd = prevLineStartIndex + targetCol;
    } else {
      typingArea.selectionStart = typingArea.selectionEnd = 0;
    }
    typingArea.focus();
    updateWPM();
    return;
  }

  if (keyCode === 'ArrowDown') {
    const cursorPosition = typingArea.selectionStart;
    const text = typingArea.value;
    const linesBefore = text.substring(0, cursorPosition).split('\n');
    const currentLineCol = linesBefore[linesBefore.length - 1].length;
    const linesAll = text.split('\n');
    const currentLineIndex = linesBefore.length - 1;
    if (currentLineIndex < linesAll.length - 1) {
      const nextLineLength = linesAll[currentLineIndex + 1].length;
      let nextLineStartIndex = 0;
      for (let i = 0; i <= currentLineIndex; i++) {
        nextLineStartIndex += linesAll[i].length + 1;
      }
      const targetCol = Math.min(currentLineCol, nextLineLength);
      typingArea.selectionStart = typingArea.selectionEnd = nextLineStartIndex + targetCol;
    } else {
      typingArea.selectionStart = typingArea.selectionEnd = text.length;
    }
    typingArea.focus();
    updateWPM();
    return;
  }

  if (keyCode === 'ShiftLeft' || keyCode === 'ShiftRight') {
    isShift = !isShift;
    const shiftKeys = d.querySelectorAll('.key[data-key="ShiftLeft"], .key[data-key="ShiftRight"]');
    shiftKeys.forEach(k => {
      if (isShift) k.classList.add('pressed');
      else k.classList.remove('pressed');
    });
    return;
  }

  if (keyCode === 'Backspace') {
    const start = typingArea.selectionStart;
    const end = typingArea.selectionEnd;
    const val = typingArea.value;
    if (start === end) {
      if (start > 0) {
        typingArea.value = val.substring(0, start - 1) + val.substring(end);
        typingArea.selectionStart = typingArea.selectionEnd = start - 1;
      }
    } else {
      typingArea.value = val.substring(0, start) + val.substring(end);
      typingArea.selectionStart = typingArea.selectionEnd = start;
    }
    typingArea.focus();
    updateWPM();
    return;
  }

  if (keyCode === 'Enter') {
    insertAtCursor(typingArea, '\n');
    typingArea.focus();
    updateWPM();
    return;
  }

  if (keyCode === 'Tab') {
    insertAtCursor(typingArea, '  '); // 2 spaces
    typingArea.focus();
    updateWPM();
    return;
  }

  if (keyCode === 'Space') {
    insertAtCursor(typingArea, ' ');
    typingArea.focus();
    updateWPM();
    return;
  }

  // Standard characters
  if (keyName) {
    const ignoreKeys = ['Ctrl', 'Win', 'Alt', 'Fn', 'Del', 'Home', 'PgUp', 'PgDn', 'End'];
    if (ignoreKeys.includes(keyName) || keyCode.includes('Arrow') || keyCode === 'Escape') {
      typingArea.focus();
      return;
    }

    let char = '';
    const isLetter = /^[A-Z]$/i.test(keyName);

    if (isLetter) {
      const upper = (isCapsLock && !isShift) || (!isCapsLock && isShift);
      char = upper ? keyName.toUpperCase() : keyName.toLowerCase();
    } else {
      if (isShift) {
        char = shiftCharMap[keyName] || keyName;
      } else {
        char = normalCharMap[keyName] || keyName;
      }
    }

    insertAtCursor(typingArea, char);
    typingArea.focus();

    // Reset sticky shift state after one character input
    if (isShift) {
      isShift = false;
      const shiftKeys = d.querySelectorAll('.key[data-key="ShiftLeft"], .key[data-key="ShiftRight"]');
      shiftKeys.forEach(k => k.classList.remove('pressed'));
    }

    updateWPM();
  }
};

// Physical Keyboard Listeners
d.addEventListener('keydown', e => {
  // Ignore inputs if the user is explicitly interacting with configuration selectors
  if (d.activeElement && (d.activeElement.tagName === 'INPUT' || d.activeElement.tagName === 'SELECT' || d.activeElement.id === 'sound-toggle')) {
    return;
  }

  // Input focus redirection
  if (d.activeElement !== typingArea && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
    typingArea.focus();
  }

  const mappedCode = mapEventCode(e.code);
  const $key = d.querySelector(`.key[data-key="${mappedCode}"]`);

  if ($key) {
    // Avoid hardware-level keyboard repetition triggers
    if (activePhysicalKeys.has(e.code)) return;
    activePhysicalKeys.add(e.code);

    $key.classList.add('pressed');
    if (keyboard.classList.contains('backlight-reactive-ripple')) {
      $key.classList.add('pressed-glow');
    }

    playKeyAudio($key);

    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      isShift = true;
    }

    if (e.code === 'CapsLock') {
      isCapsLock = e.getModifierState('CapsLock');
      syncCapsLockState(isCapsLock);
    }

    if (isFKey(mappedCode)) {
      handleFunctionKey(mappedCode, e);
      keystrokeCount++;
      d.getElementById('stat-keys').textContent = keystrokeCount;
      if (!startTime) {
        startTime = Date.now();
        startStatsTimer();
      }
      return;
    }

    keystrokeCount++;
    d.getElementById('stat-keys').textContent = keystrokeCount;
    if (!startTime) {
      startTime = Date.now();
      startStatsTimer();
    }

    // Capture tab inside the simulation console to avoid losing focus
    if (e.code === 'Tab' && d.activeElement === typingArea) {
      e.preventDefault();
      insertAtCursor(typingArea, '  ');
      updateWPM();
    }
  }
});

d.addEventListener('keyup', e => {
  activePhysicalKeys.delete(e.code);

  const mappedCode = mapEventCode(e.code);
  const $key = d.querySelector(`.key[data-key="${mappedCode}"]`);

  if ($key) {
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      const leftShiftPressed = activePhysicalKeys.has('ShiftLeft');
      const rightShiftPressed = activePhysicalKeys.has('ShiftRight');
      isShift = leftShiftPressed || rightShiftPressed;
    }

    // Only release pressed class if shift isn't sticky/locked active
    if (((e.code !== 'ShiftLeft' && e.code !== 'ShiftRight') || !isShift) && (e.code !== 'CapsLock' || !isCapsLock)) {
      $key.classList.remove('pressed');
    }
    $key.classList.remove('pressed-glow');
  }

  // Re-verify CapsLock state on physical key release
  const capActive = e.getModifierState('CapsLock');
  if (capActive !== isCapsLock) {
    isCapsLock = capActive;
    syncCapsLockState(isCapsLock);
  }

  updateWPM();
});

// Virtual clicks (MouseDown for immediate audio-visual response, e.preventDefault to keep focus in textarea)
d.addEventListener('mousedown', e => {
  const $key = e.target.closest(".key");
  if ($key) {
    e.preventDefault();
    handleVirtualKeyPress($key);
  }
});

// Control Options Panel Event Listeners
if (backlightMode) {
  backlightMode.addEventListener('change', () => {
    keyboard.classList.remove('backlight-rgb-wave', 'backlight-reactive-ripple', 'backlight-solid-cyan', 'backlight-solid-magenta', 'backlight-backlight-off');
    keyboard.classList.add(`backlight-${backlightMode.value}`);
  });
}

if (btnCopy) {
  btnCopy.addEventListener('click', () => {
    if (!typingArea.value) return;
    navigator.clipboard.writeText(typingArea.value)
      .then(() => {
        const originalText = btnCopy.innerHTML;
        btnCopy.innerHTML = '<i class="ti ti-circle-check"></i> Copied!';
        btnCopy.style.borderColor = '#00ffcc';
        btnCopy.style.color = '#00ffcc';
        setTimeout(() => {
          btnCopy.innerHTML = originalText;
          btnCopy.style.borderColor = '';
          btnCopy.style.color = '';
        }, 1500);
      })
      .catch(err => {
        console.error('Failed to copy text:', err);
      });
  });
}

if (btnClear) {
  btnClear.addEventListener('click', () => {
    typingArea.value = '';
    keystrokeCount = 0;
    d.getElementById('stat-keys').textContent = '0';
    d.getElementById('stat-wpm').textContent = '0';
    startTime = null;
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    
    // Quick visual button feedback
    const originalText = btnClear.innerHTML;
    btnClear.innerHTML = '<i class="ti ti-circle-check"></i> Cleared';
    setTimeout(() => {
      btnClear.innerHTML = originalText;
    }, 1000);
    typingArea.focus();
  });
}

// Theme mode toggler and listener
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const isLight = d.body.classList.toggle('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    updateThemeButton(isLight);
    showNotification(`Fondo: Modo ${isLight ? 'Claro' : 'Oscuro'}`, isLight ? '☀️' : '🌙');
  });

  // Init Theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    d.body.classList.add('light-theme');
    updateThemeButton(true);
  } else {
    updateThemeButton(false);
  }
}





