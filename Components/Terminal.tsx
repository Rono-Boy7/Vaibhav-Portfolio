// components/Terminal.tsx

import { useEffect, useRef, useState } from "react";
import "xterm/css/xterm.css";
import { Terminal as XTerm } from "xterm";
import SnakeGame from "./SnakeGame";

const COLOR_GREEN = "\x1b[32m";
const COLOR_BLUE = "\x1b[34m";
const COLOR_WHITE = "\x1b[37m";
const COLOR_RESET = "\x1b[0m";

const HEADER =
  `${COLOR_GREEN}Type 'help' for available commands. Snake Game Built-In [Type: "game"]${COLOR_RESET}\r\n` +
  `${COLOR_GREEN}----------------------------------------------------------------------${COLOR_RESET}\r\n`;

const PROMPT = `${COLOR_BLUE}vaibhav@portfolio:~$ ${COLOR_RESET}`;

const COMMANDS: Record<string, string> = {
  help:
    `+-----------------+-------------------------------+\r\n` +
    `| Command         | Description                   |\r\n` +
    `+-----------------+-------------------------------+\r\n` +
    `| about           | Learn About Me                |\r\n` +
    `+-----------------+-------------------------------+\r\n` +
    `| projects        | View My Projects              |\r\n` +
    `+-----------------+-------------------------------+\r\n` +
    `| skills          | See My Technical Skills       |\r\n` +
    `+-----------------+-------------------------------+\r\n` +
    `| experience      | My Work Experience            |\r\n` +
    `+-----------------+-------------------------------+\r\n` +
    `| contact         | How To Reach Me               |\r\n` +
    `+-----------------+-------------------------------+\r\n` +
    `| education       | My Educational Background     |\r\n` +
    `+-----------------+-------------------------------+\r\n` +
    `| certifications  | View My Certifications        |\r\n` +
    `+-----------------+-------------------------------+\r\n` +
    `| game            | Play a mini game (Snake)      |\r\n` +
    `+-----------------+-------------------------------+\r\n` +
    `| clear           | Clear The Terminal            |\r\n` +
    `+-----------------+-------------------------------+\r\n\r\n`,

  about:
    `I am a motivated undergraduate student pursuing an Honours Bachelor of IT in Networking & Cyber Security at Ontario Tech University. I have hands-on experience in project development, AI predictive analytics, and cloud implementation. Passionate about solving complex problems, improving security systems, and leveraging emerging technologies.\r\n\r\n`,

  projects:
    `+---------------------------+----------------------------+\r\n` +
    `| Project                   | Description                |\r\n` +
    `+---------------------------+----------------------------+\r\n` +
    `| Predictive Maint. ML      | Python, TF, Sklearn; 85%   |\r\n` +
    `|                           | accuracy, -20% downtime.   |\r\n` +
    `+---------------------------+----------------------------+\r\n` +
    `| IAM & RBAC                | AD, Azure AD, AWS IAM;     |\r\n` +
    `|                           | MFA, SSO, automation.      |\r\n` +
    `+---------------------------+----------------------------+\r\n` +
    `| Cloud Virtualization      | AWS/Azure hybrid; +25%     |\r\n` +
    `|                           | scalability.               |\r\n` +
    `+---------------------------+----------------------------+\r\n` +
    `| Cyber Threat Intel        | Python compliance tool,    |\r\n` +
    `|                           | ELK, OSINT hunting.        |\r\n` +
    `+---------------------------+----------------------------+\r\n` +
    `| Inventory Mgmt System     | Java, AWS EC2, IBM Cloud;  |\r\n` +
    `|                           | +25% perf.                 |\r\n` +
    `+---------------------------+----------------------------+\r\n\r\n`,

  skills:
    `+---------------------------+----------------------------+\r\n` +
    `| Category     | Skills                                  |\r\n` +
    `+---------------------------+----------------------------+\r\n` +
    `| Prog.        | Java, Python, Go, Scala, C++, C#, YAM   |\r\n` +
    `+---------------------------+----------------------------+\r\n` +
    `| Backend      | Django, Ruby, MongoDB, MySQL, gRPC      |\r\n` +
    `+---------------------------+----------------------------+\r\n` +
    `| Frontend     | React, JS, TS, Tailwind, Vue.js, HTML5  |\r\n` +
    `+---------------------------+----------------------------+\r\n` +
    `| Cloud/DevOps | AWS, Azure, GCP, Docker, Git, K8s       |\r\n` +
    `+---------------------------+----------------------------+\r\n` +
    `| OS           | Win Server, Kali, Debian                |\r\n` +
    `+---------------------------+----------------------------+\r\n\r\n`,

  experience:
    `+---------------------------+----------------------------+\r\n` +
    `| Role                 | Organization                    |\r\n` +
    `+---------------------------+----------------------------+\r\n` +
    `| TA (Jan–Apr 2025)    | Ontario Tech University         |\r\n` +
    `+---------------------------+----------------------------+\r\n` +
    `| CyberSec Leader      | Ontario Tech University         |\r\n` +
    `| (Sep 2023–Apr 2024)  |                                 |\r\n` +
    `+---------------------------+----------------------------+\r\n` +
    `| DevOps Assistant     | SABC, South Africa              |\r\n` +
    `| (Sep–Dec 2021)       |                                 |\r\n` +
    `+----------------------+---------------------------------+\r\n\r\n`,

  contact:
    `Email: Vaibhav.patel4@ontariotechu.net\r\n` +
    `LinkedIn: https://www.linkedin.com/in/vaibhavpatel2003/\r\n\r\n`,

  education:
    `Pursuing Honours Bachelor of IT in Networking & Cyber Security at Ontario Tech University focused on cloud security, penetration testing, and enterprise infrastructure.\r\n\r\n`,

  certifications:
    `View all certifications on my Credly profile:\r\n` +
    `https://www.credly.com/users/vaibhav-patel.9063b05a/badges#credly\r\n\r\n`,
};

export default function Terminal() {
  const [term, setTerm] = useState<XTerm>();
  const terminalRef = useRef<HTMLDivElement>(null);
  const bufferRef = useRef<string>("");
  const [showGame, setShowGame] = useState(false);

  // Init xterm when terminal is visible
  useEffect(() => {
    if (showGame) return; // don't init while game is shown
    if (!terminalRef.current) return;
    const xterm = new XTerm({
      cursorBlink: true,
      scrollback: 1000,
      cols: 90
    });
    xterm.open(terminalRef.current);
    setTerm(xterm);
    return () => {
      xterm.dispose();
      setTerm(undefined);
    };
  }, [showGame]);

  // Welcome text
  useEffect(() => {
    if (!term) return;

    const writeAnimated = async (text: string, delay = 0) => {
      for (const ch of text) {
        term.write(ch);
        await new Promise((r) => setTimeout(r, delay));
      }
    };

    (async () => {
      term!.clear();
      term!.write(HEADER);
      await writeAnimated(`${COLOR_WHITE}Welcome to my interactive portfolio terminal!\r\n`);
      await writeAnimated(`${COLOR_WHITE}Type 'help' to see available commands.\r\n\r\n`);
      term!.write(PROMPT);
    })();
  }, [term]);

  // Handle input
  useEffect(() => {
    if (!term) return;

    const onData = (data: string) => {
      for (let ch of data) {
        switch (ch) {
          case "\r": { // Enter
            term.write("\r\n");
            const cmd = bufferRef.current.trim();
            bufferRef.current = "";
            (async () => {
              if (cmd === "clear") {
                term.clear();
                term.write(HEADER);
              } else if (cmd === "game") {
                // Swap to game view
                term.write(`${COLOR_WHITE}Launching Snake... Press Esc to exit.\r\n\r\n`);
                // brief delay so user sees the message
                setTimeout(() => setShowGame(true), 50);
                return; // don't print prompt now; game takes over
              } else {
                const resp =
                  COMMANDS[cmd] ??
                  `${COLOR_WHITE}Command not found: ${cmd}\r\nType 'help' for a list.\r\n`;
                for (const c of resp) {
                  term.write(c);
                  await new Promise((r) => setTimeout(r, 0));
                }
              }
              term.write(PROMPT);
            })();
            break;
          }
          case "\u007F": // Backspace
            if (bufferRef.current.length) {
              bufferRef.current = bufferRef.current.slice(0, -1);
              term.write("\b \b");
            }
            break;
          default:
            bufferRef.current += ch;
            term.write(`${COLOR_GREEN}${ch}${COLOR_RESET}`);
        }
      }
    };

    const disp = term.onData(onData);
    return () => disp.dispose();
  }, [term]);

  // Render either the terminal or the game
  return (
    <div className="h-full">
      {!showGame ? (
        <div ref={terminalRef} className="h-full p-4 font-mono text-sm" />
      ) : (
        <SnakeGame
          onExit={() => setShowGame(false)}
          // Theme: match terminal colors
          colors={{
            bg: "#0b0f14",        // deep gray/blue terminal bg
            grid: "#0f141a",      // subtle grid
            snake: "#20c20e",     // green
            snakeHead: "#2ce01b", // brighter green
            food: "#3ea6ff",      // blue accent
            text: "#c9d1d9",      // light gray text
            accent: "#3ea6ff",    // buttons
          }}
        />
      )}
    </div>
  );
}