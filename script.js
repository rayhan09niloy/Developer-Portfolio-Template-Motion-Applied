document.addEventListener('DOMContentLoaded', () => {
  const activityGrid = document.getElementById('activityGrid');

  if (activityGrid) {
    const activeDays = new Map([
      [5, [1, 2, 4, 5]],
      [9, [3]],
      [15, [1, 2, 3, 4, 5]],
      [20, [2]],
      [25, [5]],
      [26, [5]],
      [27, [4, 5]],
      [28, [0, 5]],
      [29, [1, 2, 4]]
    ]);

    for (let week = 15; week < 30; week += 1) {
      const column = document.createElement('div');
      column.className = 'activity-column';
      column.setAttribute('role', 'group');
      column.setAttribute('aria-label', `Week ${week + 1}`);

      for (let day = 0; day < 7; day += 1) {
        const cell = document.createElement('span');
        const level = activeDays.get(week)?.includes(day)
          ? (week > 27 ? 3 : week > 25 ? 2 : 1)
          : 0;
        cell.className = `activity-cell level-${level}`;
        cell.setAttribute('aria-hidden', 'true');
        column.appendChild(cell);
      }

      activityGrid.appendChild(column);
    }
  }

  const toolStage = document.querySelector('.tool-stage');
  if (toolStage) {
    const toolLayer = toolStage.querySelector('.tool-tokens');
    const tokens = [...toolStage.querySelectorAll('.tool-token')];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let animationFrame = 0;
    let resizeTimeout = 0;
    let hasStarted = false;

    const showToolsWithoutMotion = () => {
      const gap = 10;
      const width = toolLayer.clientWidth;
      const height = toolLayer.clientHeight;
      const tokenWidth = tokens[0].offsetWidth;
      const columns = Math.max(1, Math.floor((width + gap) / (tokenWidth + gap)));
      const rows = Math.ceil(tokens.length / columns);
      const startX = Math.max(0, (width - columns * tokenWidth - (columns - 1) * gap) / 2);
      const startY = Math.max(0, height - rows * (tokenWidth + gap));

      tokens.forEach((token, index) => {
        const row = Math.floor(index / columns);
        const column = index % columns;
        token.style.opacity = '1';
        token.style.transform = `translate(${startX + column * (tokenWidth + gap)}px, ${startY + row * (tokenWidth + gap)}px)`;
      });
    };

    const dropTools = () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      if (reducedMotion.matches) {
        showToolsWithoutMotion();
        return;
      }

      const width = toolLayer.clientWidth;
      const height = toolLayer.clientHeight;
      const floor = height - 24;
      const gravity = 1800;
      const maximumTilt = 12 * Math.PI / 180;
      const step = 1 / 60;
      let accumulator = 0;
      let previousTime = 0;
      let elapsed = 0;
      let settledTime = 0;
      const bodies = tokens.map((element) => {
        const size = element.offsetWidth;
        const body = {
          element,
          size,
          x: Math.random() * Math.max(0, width - size),
          y: -size - Math.random() * 260,
          vx: (Math.random() - 0.5) * 90,
          vy: Math.random() * 45,
          angle: (Math.random() - 0.5) * 0.45,
          angularVelocity: (Math.random() - 0.5) * 2.8
        };
        element.style.opacity = '1';
        return body;
      });

      const halfExtent = (body) => {
        const halfSize = body.size / 2;
        return halfSize * (Math.abs(Math.cos(body.angle)) + Math.abs(Math.sin(body.angle)));
      };

      const stepPhysics = () => {
        bodies.forEach((body) => {
          body.vy += gravity * step;
          body.x += body.vx * step;
          body.y += body.vy * step;
          body.angle += body.angularVelocity * step;
          if (Math.abs(body.angle) > maximumTilt) {
            body.angle = Math.sign(body.angle) * maximumTilt;
            body.angularVelocity = -body.angularVelocity * 0.18;
          }

          const extent = halfExtent(body);
          if (body.x + body.size / 2 - extent < 0) {
            body.x = extent - body.size / 2;
            body.vx = Math.abs(body.vx) * 0.35;
            body.angularVelocity += body.vy * 0.002;
          } else if (body.x + body.size / 2 + extent > width) {
            body.x = width - extent - body.size / 2;
            body.vx = -Math.abs(body.vx) * 0.35;
            body.angularVelocity -= body.vy * 0.002;
          }
        });

        for (let pass = 0; pass < 4; pass += 1) {
          for (let firstIndex = 0; firstIndex < bodies.length; firstIndex += 1) {
            const first = bodies[firstIndex];
            for (let secondIndex = firstIndex + 1; secondIndex < bodies.length; secondIndex += 1) {
              const second = bodies[secondIndex];
              const differenceX = second.x + second.size / 2 - (first.x + first.size / 2);
              const differenceY = second.y + second.size / 2 - (first.y + first.size / 2);
              const overlapX = halfExtent(first) + halfExtent(second) - Math.abs(differenceX);
              const overlapY = halfExtent(first) + halfExtent(second) - Math.abs(differenceY);
              if (overlapX <= 0 || overlapY <= 0) continue;

              const normalX = overlapX < overlapY
                ? (differenceX < 0 ? -1 : 1)
                : 0;
              const normalY = normalX === 0
                ? (differenceY < 0 ? -1 : 1)
                : 0;
              const overlap = normalX ? overlapX : overlapY;
              first.x -= normalX * overlap / 2;
              first.y -= normalY * overlap / 2;
              second.x += normalX * overlap / 2;
              second.y += normalY * overlap / 2;

              const relativeNormalVelocity = (second.vx - first.vx) * normalX
                + (second.vy - first.vy) * normalY;
              if (relativeNormalVelocity < 0) {
                const impulse = -(1 + 0.2) * relativeNormalVelocity / 2;
                first.vx -= impulse * normalX;
                first.vy -= impulse * normalY;
                second.vx += impulse * normalX;
                second.vy += impulse * normalY;

                if (normalX) {
                  const friction = (second.vy - first.vy) * 0.08;
                  first.vy += friction;
                  second.vy -= friction;
                } else {
                  const friction = (second.vx - first.vx) * 0.08;
                  first.vx += friction;
                  second.vx -= friction;
                }
                first.angularVelocity -= relativeNormalVelocity * 0.012;
                second.angularVelocity += relativeNormalVelocity * 0.012;
              }
            }
          }
        }

        let maximumSpeed = 0;
        bodies.forEach((body) => {
          const extent = halfExtent(body);
          if (body.x + body.size / 2 - extent < 0) {
            body.x = extent - body.size / 2;
            body.vx = Math.abs(body.vx) * 0.35;
          } else if (body.x + body.size / 2 + extent > width) {
            body.x = width - extent - body.size / 2;
            body.vx = -Math.abs(body.vx) * 0.35;
          }
          if (body.y + body.size / 2 + extent > floor) {
            body.y = floor - body.size / 2 - extent;
            if (body.vy > 0) {
              body.vy = body.vy < 55 ? 0 : -body.vy * 0.18;
              body.angularVelocity += body.vx * 0.002;
            }
            body.vx *= 0.82;
            body.angularVelocity *= 0.82;
          }

          maximumSpeed = Math.max(maximumSpeed, Math.abs(body.vx), Math.abs(body.vy));
          body.element.style.transform = `translate(${body.x}px, ${body.y}px) rotate(${body.angle}rad)`;
        });
        return maximumSpeed;
      };

      const animate = (time) => {
        if (!previousTime) previousTime = time;
        const delta = Math.min((time - previousTime) / 1000, 0.05);
        accumulator += delta;
        previousTime = time;
        elapsed += delta;

        while (accumulator >= step) {
          const maximumSpeed = stepPhysics();
          accumulator -= step;
          settledTime = maximumSpeed < 12 ? settledTime + step : 0;
        }

        if (settledTime >= 0.8 || elapsed >= 8) {
          animationFrame = 0;
          return;
        }
        animationFrame = window.requestAnimationFrame(animate);
      };

      animationFrame = window.requestAnimationFrame(animate);
    };

    const revealTools = () => {
      if (hasStarted) return;
      hasStarted = true;
      dropTools();
    };

    reducedMotion.addEventListener('change', () => {
      if (hasStarted) dropTools();
    });
    window.addEventListener('resize', () => {
      if (!hasStarted) return;
      window.clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(dropTools, 120);
    });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, currentObserver) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          revealTools();
          currentObserver.disconnect();
        }
      }, { threshold: 0.25 });
      observer.observe(toolStage);
    } else {
      revealTools();
    }
  }

  const terminalHistory = document.getElementById('terminalHistory');
  const terminalEntries = document.getElementById('terminalEntries');
  const terminalForm = document.getElementById('terminalForm');
  const terminalInput = document.getElementById('terminalInput');
  const commandButtons = document.querySelectorAll('.command-button');
  const commandDescriptions = {
    '--help': 'Show this command list',
    whoami: 'Show profile and background',
    skills: 'List tools and focus areas',
    repos: 'List selected repositories',
    contact: 'Show contact details and social links',
    date: 'Print the current local date and time',
    'echo <text>': 'Print text to the terminal',
    clear: 'Clear the terminal history'
  };
  const commandHistory = [];
  let historyIndex = 0;

  const skills = [
    ['HTML', 'Markup', 'Interface structure'],
    ['CSS', 'Styling', 'Responsive visual design'],
    ['JavaScript', 'Programming', 'Interactive experiences'],
    ['Python', 'Programming', 'Data science and automation'],
    ['React', 'Library', 'Component-based interfaces']
  ];

  const repositories = [
    ['iplome-using-python', 'Python', 'Generative certificate and diploma design tool', '0 stars'],
    ['ibm-data-science-tools-lab', 'Jupyter NB', 'Data science languages, libraries, and tools practice lab', '2 stars'],
    ['questiongg-discord-bot', 'Python', 'Timed trivia bot with answer verification and a player leaderboard', '0 stars']
  ];

  const isTerminalPage = terminalHistory && terminalEntries && terminalForm && terminalInput;

  if (isTerminalPage) {
    const scrollToLatest = () => {
      terminalHistory.scrollTop = terminalHistory.scrollHeight;
    };

    const appendOutput = (command, output) => {
      const entry = document.createElement('article');
      entry.className = 'terminal-entry';

      const commandLine = document.createElement('div');
      commandLine.className = 'terminal-command-line';

      const prompt = document.createElement('span');
      prompt.className = 'terminal-prompt';
      for (const [className, text] of [
        ['terminal-host', 'github@rayhan09niloy'],
        ['terminal-separator', ':'],
        ['terminal-path', '~'],
        ['terminal-dollar', '$']
      ]) {
        const segment = document.createElement('span');
        segment.className = className;
        segment.textContent = text;
        prompt.appendChild(segment);
      }

      const typedCommand = document.createElement('span');
      typedCommand.className = 'terminal-command';
      typedCommand.textContent = command;

      commandLine.append(prompt, typedCommand);
      entry.appendChild(commandLine);

      if (output !== null && output !== undefined) {
        if (output.links) {
          const repoLinks = document.createElement('div');
          repoLinks.className = 'terminal-repo-links';
          output.links.forEach(({ name, href }) => {
            const row = document.createElement('div');
            row.className = 'terminal-repo-link-row';

            const link = document.createElement('a');
            link.className = 'terminal-value-link';
            link.href = href;
            link.textContent = '(link)';

            row.append(document.createTextNode(`${name} `), link);
            repoLinks.appendChild(row);
          });
          entry.appendChild(repoLinks);
          terminalEntries.appendChild(entry);
          scrollToLatest();
          return;
        }

        if (output.rows) {
          const data = document.createElement('div');
          data.className = 'terminal-data';
          output.rows.forEach(([label, value]) => {
            const row = document.createElement('div');
            row.className = 'terminal-data-row';

            const labelCell = document.createElement('span');
            labelCell.className = 'data-label';
            labelCell.textContent = label;

            const colon = document.createElement('span');
            colon.className = 'data-colon';
            colon.textContent = ':';

            const valueCell = document.createElement('span');
            if (value && typeof value === 'object' && value.href) {
              const link = document.createElement('a');
              link.className = 'terminal-value-link';
              link.href = value.href;
              link.textContent = value.text;
              if (value.external) {
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
              }
              valueCell.appendChild(link);
            } else {
              valueCell.textContent = value;
            }

            row.append(labelCell, colon, valueCell);
            data.appendChild(row);
          });
          entry.appendChild(data);
          terminalEntries.appendChild(entry);
          scrollToLatest();
          return;
        }

        const outputBlock = document.createElement('pre');
        outputBlock.className = 'terminal-output';
        outputBlock.textContent = output;
        entry.appendChild(outputBlock);
      }

      terminalEntries.appendChild(entry);
      scrollToLatest();
    };

    const runCommand = (rawCommand) => {
      const commandLine = rawCommand.trim();
      if (!commandLine) return;

      commandHistory.push(commandLine);
      historyIndex = commandHistory.length;

      const [name, ...argumentParts] = commandLine.split(/\s+/);
      const command = name.toLowerCase();
      const args = argumentParts.join(' ');

      if (command === 'clear' || command === 'cls') {
        terminalEntries.replaceChildren();
        scrollToLatest();
        return;
      }

      let output;
      if (command === '--help' || command === 'help' || command === '-h') {
        const commandRows = Object.entries(commandDescriptions)
          .map(([availableCommand, description]) => [availableCommand, description]);
        output = { rows: [['Usage', '<command> [arguments]'], ...commandRows] };
      } else if (command === 'whoami') {
        output = {
          rows: [
            ['Name', 'Rayhan Ahmed'],
            ['Role', 'Product Designer'],
            ['Level', 'Entry-level/Junior'],
            ['Education', 'Diploma in-Engineering (Major: Computer Science)'],
            ['Based on', 'Dhaka, Bangladesh']
          ]
        };
      } else if (command === 'skills') {
        output = {
          rows: skills.map(([name, category, focus]) => [name, `${category} — ${focus}`])
        };
      } else if (command === 'repos' || command === 'projects') {
        const matchingRepositories = args
          ? repositories.filter(([name]) => name.includes(args.toLowerCase()))
          : repositories;
        output = matchingRepositories.length
          ? {
            links: matchingRepositories.map(([name]) => ({ name, href: '#' }))
          }
          : `No repository matched "${args}".`;
      } else if (command === 'contact') {
        output = {
          rows: [
            ['Email', { text: 'hellorayhan09niloy@gmail.com', href: 'mailto:hellorayhan09niloy@gmail.com' }],
            ['GitHub', { text: 'github.com/rayhan09niloy', href: 'https://github.com/rayhan09niloy', external: true }],
            ['LinkedIn', { text: 'linkedin.com/in/rayhan09niloy', href: 'https://linkedin.com/in/rayhan09niloy', external: true }],
            ['X', { text: 'x.com/rayhan09niloy', href: 'https://x.com/rayhan09niloy', external: true }],
            ['Behance', { text: 'behance.net/rayhan09niloy', href: 'https://behance.net/rayhan09niloy', external: true }]
          ]
        };
      } else if (command === 'date') {
        output = new Date().toLocaleString();
      } else if (command === 'echo') {
        output = args;
      } else {
        output = `bash: ${name}: command not found. Type --help to see available commands.`;
      }

      appendOutput(commandLine, output);
    };

    terminalForm.addEventListener('submit', (event) => {
      event.preventDefault();
      runCommand(terminalInput.value);
      terminalInput.value = '';
      terminalInput.focus();
    });

    terminalInput.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (historyIndex > 0) {
          historyIndex -= 1;
          terminalInput.value = commandHistory[historyIndex];
        }
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
          historyIndex += 1;
          terminalInput.value = commandHistory[historyIndex];
        } else {
          historyIndex = commandHistory.length;
          terminalInput.value = '';
        }
      } else if (event.key === 'Tab') {
        event.preventDefault();
        const input = terminalInput.value.trim().toLowerCase();
        const match = Object.keys(commandDescriptions)
          .filter((command) => !command.includes(' '))
          .find((command) => command.startsWith(input));
        if (match) terminalInput.value = match;
      }
    });

    commandButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const command = button.dataset.command;
        if (!command) return;
        if (command === 'clear') {
          terminalEntries.replaceChildren();
          scrollToLatest();
        } else {
          runCommand(command);
        }
        terminalInput.value = '';
        terminalInput.focus();
      });
    });
  }
});
