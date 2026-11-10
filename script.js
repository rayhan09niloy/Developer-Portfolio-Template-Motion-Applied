/* ═══════════════════════════════════════════════════════════
   RAYHAN AHMED — Portfolio Script
   Interactive animations, scroll reveals, contribution grid,
   typing effects, code rain, and more.
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // ── Cursor glow follow ──────────────────────────────────
  const cursorGlow = document.getElementById('cursorGlow');
  let mouseX = 0, mouseY = 0;
  let glowX = 0, glowY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateGlow() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    cursorGlow.style.left = glowX + 'px';
    cursorGlow.style.top = glowY + 'px';
    requestAnimationFrame(animateGlow);
  }
  animateGlow();

  // ── Typing effect for greeting ──────────────────────────
  const greeting = document.querySelector('.hero-greeting');
  const greetingText = "HELLO, WORLD. I'M ";
  greeting.textContent = '';
  greeting.classList.add('typed');
  let charIndex = 0;

  function typeGreeting() {
    if (charIndex < greetingText.length) {
      greeting.textContent += greetingText[charIndex];
      charIndex++;
      setTimeout(typeGreeting, 80 + Math.random() * 40);
    } else {
      // Add blinking cursor
      greeting.innerHTML += '<span class="blink-cursor">▌</span>';
      // Add cursor blink style
      const style = document.createElement('style');
      style.textContent = `
        .blink-cursor {
          animation: blink 1s step-end infinite;
          color: #1095e4;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }
  setTimeout(typeGreeting, 600);

  // ── Scroll-based reveal (IntersectionObserver) ─────────
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay) || 0;
          setTimeout(() => {
            entry.target.classList.add('in-view');
          }, delay);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('[data-animate]').forEach((el) => {
    revealObserver.observe(el);
  });

  // ── Skill bars animation ────────────────────────────────
  const barObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay) || 0;
          setTimeout(() => {
            entry.target.classList.add('in-view');
          }, delay);
        }
      });
    },
    { threshold: 0.3 }
  );

  document.querySelectorAll('.skill-bar').forEach((bar) => {
    barObserver.observe(bar);
  });

  // ── Counting animation for stats ───────────────────────
  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count);
          animateCount(el, 0, target, 1200);
          countObserver.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll('[data-count]').forEach((el) => {
    countObserver.observe(el);
  });

  function animateCount(el, start, end, duration) {
    const startTime = performance.now();
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * ease);
      el.textContent = String(current).padStart(2, '0');
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    requestAnimationFrame(update);
  }

  // ── Contribution grid generation ────────────────────────
  const grid = document.getElementById('contributionGrid');
  const weeks = 30;
  const daysPerWeek = 7;

  // Specific activity pattern (sparse, with a few highlights)
  const activeWeeks = {
    26: [6],       // level-1
    27: [5, 6],    // level-2, level-3
    28: [0],       // level-3
  };

  for (let w = 0; w < weeks; w++) {
    const col = document.createElement('div');
    col.className = 'contribution-column';

    const daysInThisWeek = (w === weeks - 1) ? 4 : daysPerWeek;

    for (let d = 0; d < daysInThisWeek; d++) {
      const cell = document.createElement('div');
      cell.className = 'contribution-cell';

      // Check if this cell should be colored
      if (activeWeeks[w]) {
        if (activeWeeks[w].includes(d)) {
          if (w === 28) cell.classList.add('level-3');
          else if (w === 27 && d === 6) cell.classList.add('level-3');
          else if (w === 27 && d === 5) cell.classList.add('level-2');
          else cell.classList.add('level-1');
        }
      }

      col.appendChild(cell);
    }
    grid.appendChild(col);
  }

  // Animate contribution cells on scroll
  const contribObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const cells = entry.target.querySelectorAll('.contribution-cell');
          cells.forEach((cell, i) => {
            setTimeout(() => {
              cell.classList.add('in-view');
            }, i * 8);
          });
          contribObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  contribObserver.observe(grid);

  // ── Code rain effect ────────────────────────────────────
  const codeRain = document.getElementById('codeRain');
  if (codeRain) {
    const chars = '01{}[]()=><;:+-*/%!&|~^?#@$_abcdefghijklmnopqrstuvwxyz';
    for (let i = 0; i < 15; i++) {
      const col = document.createElement('div');
      col.className = 'rain-column';
      col.style.left = (i * 7) + '%';
      col.style.animationDuration = (3 + Math.random() * 4) + 's';
      col.style.animationDelay = (Math.random() * 3) + 's';

      let text = '';
      for (let j = 0; j < 20; j++) {
        text += chars[Math.floor(Math.random() * chars.length)] + '\n';
      }
      col.textContent = text;
      codeRain.appendChild(col);
    }
  }

  // ── Matrix text effect ──────────────────────────────────
  const matrixText = document.getElementById('matrixText');
  if (matrixText) {
    const snippet = `def generate_diploma(name, course):\n    canvas = create_canvas(800, 600)\n    canvas.set_bg('#0d1117')\n    canvas.draw_border(style='ornate')\n    canvas.add_text(name, font='serif', size=36)\n    canvas.add_text(course, y=300)\n    return canvas.export('png')`;
    matrixText.textContent = snippet.repeat(4);
  }

  // ── Copy email functionality ────────────────────────────
  const copyBtn = document.getElementById('copyEmail');
  const toast = document.getElementById('toast');

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('hellorayhan09niloy@gmail.com').then(() => {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
      }).catch(() => {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = 'hellorayhan09niloy@gmail.com';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
      });
    });
  }

  // ── Tilt effect on repo cards ───────────────────────────
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -3;
      const rotateY = ((x - centerX) / centerX) * 3;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
    });
  });

  // ── Smooth parallax on scroll ───────────────────────────
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const heroImg = document.querySelector('.hero-image img');
        if (heroImg) {
          const parallax = scrollY * 0.1;
          heroImg.style.transform = `translateY(${parallax}px)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  });

  // ── Section divider line draw on scroll ─────────────────
  const dividerObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll('.section-divider').forEach((div) => {
    dividerObserver.observe(div);
  });

  // ═══════════════════════════════════════════════════════════
  // ── INTERACTIVE TERMINAL ENGINE ────────────────────────────
  // ═══════════════════════════════════════════════════════════
  const terminalShell = document.getElementById('terminalShell');
  const terminalHistory = document.getElementById('terminalHistory');
  const terminalInput = document.getElementById('terminalInput');
  const terminalForm = document.getElementById('terminalForm');
  const helpCmdButtons = document.querySelectorAll('.help-cmd-item');

  const commandHistory = [];
  let historyIndex = -1;

  // Focus terminal input when clicking inside the shell
  if (terminalShell && terminalInput) {
    terminalShell.addEventListener('click', (e) => {
      // Don't steal focus if clicking an existing link
      if (e.target.tagName !== 'A') {
        terminalInput.focus();
      }
    });
  }

  // Command responses definition
  const COMMANDS = {
    whoami: () => `
      <table class="info-table">
        <tr><td class="label">Name</td><td class="colon">:</td><td class="value">Rayhan Ahmed</td></tr>
        <tr><td class="label">Role</td><td class="colon">:</td><td class="value">Product Designer</td></tr>
        <tr><td class="label">Level</td><td class="colon">:</td><td class="value">Entry</td></tr>
        <tr><td class="label">Industry</td><td class="colon">:</td><td class="value">FinTech &amp; MedTech</td></tr>
        <tr><td class="label">Background</td><td class="colon">:</td><td class="value">Computer Science</td></tr>
        <tr><td class="label">Experience</td><td class="colon">:</td><td class="value">20 months</td></tr>
        <tr><td class="label">Based on</td><td class="colon">:</td><td class="value">Dhaka, Bangladesh</td></tr>
      </table>`,

    skills: () => `
      <div class="terminal-msg info">
        <div style="margin-bottom: 6px;"><strong>TECHNICAL TOOLBOX &amp; PROFICIENCY:</strong></div>
        <div style="line-height: 1.8;">
          <div>• HTML5 / CSS3  ...................... <span style="color:#7ee787; font-weight:600;">78%</span></div>
          <div>• JavaScript    ...................... <span style="color:#7ee787; font-weight:600;">78%</span></div>
          <div>• Python        ...................... <span style="color:#7ee787; font-weight:600;">78%</span></div>
          <div>• React.js      ...................... <span style="color:#7ee787; font-weight:600;">78%</span></div>
          <div>• Figma / UI    ...................... <span style="color:#7ee787; font-weight:600;">85%</span></div>
        </div>
      </div>`,

    repos: () => `
      <div class="terminal-msg info">
        <div><strong>FEATURED REPOSITORIES:</strong></div>
        <div style="margin-top: 4px;">1. <a href="#repos" style="color:#58a6ff; font-weight:600; text-decoration:none;">DataScienceEcosystem</a> — IBM Data Science tools lab <span style="color:#f0883e;">★ 0</span></div>
        <div>2. <a href="#repos" style="color:#58a6ff; font-weight:600; text-decoration:none;">iplome-using-python</a> — Generative diploma certificate generator <span style="color:#f0883e;">★ 0</span></div>
        <div>3. <a href="#repos" style="color:#58a6ff; font-weight:600; text-decoration:none;">AutomateQG</a> — Automated question generation scripts <span style="color:#f0883e;">★ 0</span></div>
        <div>4. <a href="#repos" style="color:#58a6ff; font-weight:600; text-decoration:none;">questiongg-discord-bot</a> — Competitive Discord trivia bot <span style="color:#f0883e;">★ 0</span></div>
        <div>5. <a href="#repos" style="color:#58a6ff; font-weight:600; text-decoration:none;">ibm-data-science-tools-lab</a> — Jupyter Notebook lab <span style="color:#f0883e;">★ 2</span></div>
      </div>`,

    contact: () => `
      <div class="terminal-msg success">
        <div><strong>GET IN TOUCH:</strong></div>
        <div style="margin-top: 6px; line-height: 1.8;">
          <div>• Email: <a href="mailto:hellorayhan09niloy@gmail.com" style="color:#7ee787; text-decoration:none;">hellorayhan09niloy@gmail.com</a></div>
          <div>• LinkedIn: <a href="https://linkedin.com/in/rayhan09niloy" target="_blank" rel="noopener noreferrer" style="color:#58a6ff; text-decoration:none;">linkedin.com/in/rayhan09niloy</a></div>
          <div>• X / Twitter: <a href="https://x.com/rayhan09niloy" target="_blank" rel="noopener noreferrer" style="color:#58a6ff; text-decoration:none;">@rayhan09niloy</a></div>
          <div>• Location: Dhaka, Bangladesh</div>
        </div>
      </div>`,

    help: () => `
      <div class="terminal-msg info">
        <div><strong>AVAILABLE COMMANDS:</strong></div>
        <div style="margin-top: 4px;"><span style="color:#58a6ff; font-weight:600;">whoami</span>   - Print identity, role &amp; background</div>
        <div><span style="color:#58a6ff; font-weight:600;">skills</span>   - List technical skills and proficiency</div>
        <div><span style="color:#58a6ff; font-weight:600;">repos</span>    - List highlighted open-source projects</div>
        <div><span style="color:#58a6ff; font-weight:600;">contact</span>  - Display email and social channels</div>
        <div><span style="color:#58a6ff; font-weight:600;">date</span>     - Display current local date &amp; time</div>
        <div><span style="color:#58a6ff; font-weight:600;">echo [t]</span> - Echo arguments back to terminal</div>
        <div><span style="color:#58a6ff; font-weight:600;">clear</span>    - Reset terminal screen log</div>
      </div>`,

    date: () => `
      <div class="terminal-msg info">${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'medium' })}</div>`,

    ls: () => `
      <div class="terminal-msg info">
        <span style="color:#58a6ff;">whoami</span>&nbsp;&nbsp;&nbsp;&nbsp;
        <span style="color:#58a6ff;">skills/</span>&nbsp;&nbsp;&nbsp;&nbsp;
        <span style="color:#58a6ff;">repos/</span>&nbsp;&nbsp;&nbsp;&nbsp;
        <span style="color:#7ee787;">contact.sh</span>&nbsp;&nbsp;&nbsp;&nbsp;
        <span style="color:#d2a8ff;">info.json</span>
      </div>`,

    cat: (args) => {
      const file = args.trim().toLowerCase();
      if (file === 'info.json') {
        return `
          <div class="terminal-msg info">
            <pre style="font-family: inherit; margin: 0; color: #79c0ff;">{\n  "name": "Rayhan Ahmed",\n  "role": "Product Designer",\n  "status": "Available for opportunities",\n  "openSource": true\n}</pre>
          </div>`;
      }
      return `<div class="terminal-msg error">cat: ${file || 'unspecified'}: No such file or directory</div>`;
    },

    sudo: () => `
      <div class="terminal-msg error">Permission denied: nice try! Rayhan is the only root user here 😉</div>`,
  };

  // Aliases
  COMMANDS['--help'] = COMMANDS.help;
  COMMANDS['-h'] = COMMANDS.help;
  COMMANDS['toolbox'] = COMMANDS.skills;
  COMMANDS['projects'] = COMMANDS.repos;
  COMMANDS['email'] = COMMANDS.contact;
  COMMANDS['socials'] = COMMANDS.contact;

  function runTerminalCommand(rawInput) {
    if (!rawInput && rawInput !== '') return;
    const trimmed = rawInput.trim();
    if (!trimmed) return;

    // Save to command history
    commandHistory.push(trimmed);
    historyIndex = commandHistory.length;

    // Handle clear specially
    if (trimmed.toLowerCase() === 'clear' || trimmed.toLowerCase() === 'cls') {
      terminalHistory.innerHTML = '';
      return;
    }

    // Split into command name and arguments
    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    let outputHtml = '';

    if (cmd === 'echo') {
      const safeText = args.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      outputHtml = `<div class="terminal-msg">${safeText || ''}</div>`;
    } else if (COMMANDS[cmd]) {
      outputHtml = COMMANDS[cmd](args);
    } else {
      const safeCmd = cmd.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      outputHtml = `<div class="terminal-msg error">bash: command not found: "${safeCmd}". Type <span style="color:#58a6ff;">help</span> to see available commands.</div>`;
    }

    // Create log entry in terminal history
    const entry = document.createElement('div');
    entry.className = 'terminal-log-entry';
    entry.innerHTML = `
      <div class="terminal-prompt-line">
        <span class="t-user">github@rayhan09niloy</span><span class="t-sep">:</span><span class="t-path">~</span><span class="t-dollar">$</span>
        <span class="t-cmd">${trimmed.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>
      </div>
      <div class="terminal-output-block">${outputHtml}</div>
    `;

    terminalHistory.appendChild(entry);

    // Scroll to bottom
    terminalShell.scrollTop = terminalShell.scrollHeight;
  }

  // Form submission / Enter key
  if (terminalForm && terminalInput) {
    terminalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = terminalInput.value;
      terminalInput.value = '';
      runTerminalCommand(val);
    });

    // History navigation and tab autocompletion
    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (commandHistory.length > 0 && historyIndex > 0) {
          historyIndex--;
          terminalInput.value = commandHistory[historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
          historyIndex++;
          terminalInput.value = commandHistory[historyIndex];
        } else {
          historyIndex = commandHistory.length;
          terminalInput.value = '';
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const current = terminalInput.value.trim().toLowerCase();
        const available = ['whoami', 'skills', 'repos', 'contact', 'clear', 'help', 'date', 'echo'];
        const match = available.find(c => c.startsWith(current));
        if (match) {
          terminalInput.value = match;
        }
      }
    });
  }

  // Click on any --help command button
  helpCmdButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cmd = btn.getAttribute('data-cmd');
      if (cmd) {
        if (terminalInput) {
          terminalInput.value = '';
        }
        runTerminalCommand(cmd);
        if (terminalInput) {
          terminalInput.focus();
        }
      }
    });
  });
});
