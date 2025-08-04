// ./components/Terminal.tsx

import { useEffect, useRef, useState } from 'react';
import 'xterm/css/xterm.css';
import { Terminal as XTerm } from 'xterm';

const COLOR_GREEN = '\x1b[32m';
const COLOR_BLUE  = '\x1b[34m';
const COLOR_WHITE = '\x1b[37m';
const COLOR_RESET = '\x1b[0m';

const HEADER = 
  `${COLOR_GREEN}help | about | projects | skills | experience | contact | education | \r\ncertifications | leadership | sudo | clear${COLOR_RESET}\r\n` +
  `${COLOR_GREEN}--------------------------------------------------------------------------------${COLOR_RESET}\r\n`;

const PROMPT = `${COLOR_BLUE}vaibhav@portfolio:~$ ${COLOR_RESET}`;

const COMMANDS: Record<string,string> = {
  help: 
    `about       - Learn about me\r\n` +
    `projects    - View my projects\r\n` +
    `skills      - See my technical skills\r\n` +
    `experience  - My work experience\r\n` +
    `contact     - How to reach me\r\n` +
    `education   - My educational background\r\n` +
    `certifications - View my certifications\r\n` +
    `leadership  - Leadership and community involvement\r\n` +
    `sudo        - A special greeting\r\n` +
    `clear       - Clear the terminal\r\n`,
  about:     `Hi, I'm Vaibhav Patel — a Cyber Security student at Ontario Tech University.\r\n`,
  projects:  `• Portfolio Website (Next.js, Tailwind, xterm.js)\r\n• Web App X (Node.js, Express, SQLite)\r\n• Cyber-sec Dashboard (React, D3)\r\n`,
  skills:    `JavaScript, TypeScript, React, Node.js, SQL, Linux, Git, AWS\r\n`,
  experience:`YMCA ECEA Assistant (2023–), Project Assistant at Ontario Tech (2024–)\r\n`,
  contact:   `Email: vaibhav@example.com\r\nLinkedIn: linkedin.com/in/vaibhav-patel\r\n`,
  education: `BIT (Hons) Networking & Cyber Security, Ontario Tech University (’22–’26)\r\n`,
  certifications: `CompTIA Security+, AWS Certified Cloud Practitioner\r\n`,
  leadership: `TA for Introductory Calculus; Radio Host, Sol Plaatje Secondary School\r\n`,
  sudo:      `Hi, I'm Vaibhav Patel — a Cyber Security student at Ontario Tech University.\r\n`,
};

export default function Terminal() {
  const [term, setTerm] = useState<XTerm>();
  const terminalRef = useRef<HTMLDivElement>(null);
  const bufferRef   = useRef<string>('');

  // 1) Initialize xterm (client-only)
  useEffect(() => {
    if (!terminalRef.current) return;
    const xterm = new XTerm({ cursorBlink: true, scrollback: 1000 });
    xterm.open(terminalRef.current);
    setTerm(xterm);
    return () => xterm.dispose();
  }, []);

  // 2) Print header + welcome + prompt
  useEffect(() => {
    if (!term) return;

    const writeAnimated = async (text: string, delay = 20) => {
      for (const ch of text) {
        term.write(ch);
        await new Promise(r => setTimeout(r, delay));
      }
    };

    (async () => {
      term.clear();
      term.write(HEADER);
      await writeAnimated(`${COLOR_WHITE}Welcome to my interactive portfolio terminal!\r\n`);
      await writeAnimated(`${COLOR_WHITE}Type 'help' to see available commands.\r\n\r\n`);
      term.write(PROMPT);
    })();
  }, [term]);

  // 3) Handle keystrokes (including animated responses & green input)
  useEffect(() => {
    if (!term) return;

    const onData = (data: string) => {
      for (let ch of data) {
        switch (ch) {
          case '\r':  // Enter
            term.write('\r\n');
            const cmd = bufferRef.current.trim();
            bufferRef.current = '';
            (async () => {
              if (cmd === 'clear') {
                term.clear();
                term.write(HEADER);
              } else {
                const resp = COMMANDS[cmd] 
                  ?? `${COLOR_WHITE}Command not found: ${cmd}\r\nType 'help' for a list.\r\n`;
                // animate the command output
                for (const c of resp) {
                  term.write(c);
                  await new Promise(r => setTimeout(r, 20));
                }
              }
              term.write(PROMPT);
            })();
            break;

          case '\u007F': // Backspace
            if (bufferRef.current.length) {
              bufferRef.current = bufferRef.current.slice(0, -1);
              term.write('\b \b');
            }
            break;

          default:
            bufferRef.current += ch;
            // echo user input in green
            term.write(`${COLOR_GREEN}${ch}${COLOR_RESET}`);
        }
      }
    };

    const disp = term.onData(onData);
    return () => disp.dispose();
  }, [term]);

  return <div ref={terminalRef} className="h-full p-4 font-mono text-sm" />;
}