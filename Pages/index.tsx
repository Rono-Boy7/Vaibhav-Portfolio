// ./Pages/index.tsx

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import CoverPage from '../Components/CoverPage';

// Client-only 3D card and terminal
const IDCard3D = dynamic(() => import('../Components/IDCard'), { ssr: false });
const Terminal = dynamic(() => import('../Components/Terminal'), { ssr: false });

export default function Home() {
  const [time, setTime] = useState('');
  const [showCover, setShowCover] = useState(true);

  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleString('en-US', {
          hour12: true,
          month: 'numeric',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <>
      <Head>
        <title>Vaibhav Patel • Portfolio</title>
      </Head>

      <CoverPage
        show={showCover}
        onFinish={() => setShowCover(false)}
        colors={{
          bg: '#0b0f14',
          lampOffOutline: '#3ea6ff',
          lampOn: '#20c20e',
          text: '#c9d1d9',
        }}
      />

      <div className="flex flex-col h-screen">
        {/* Header */}
        <header className="bg-gray-900 text-green-400 font-mono p-4 text-center">
          <h1 className="text-3xl font-bold">Vaibhav Patel</h1>
          <p className="text-sm text-gray-400">
            Networking and Cyber Security Student
          </p>
        </header>

        {/* Main */}
        <main className="flex flex-grow overflow-hidden">
          {/* Left: ID card smaller */}
          <div className="w-2/5 idcard-bg flex items-center justify-center relative">
            <div className="w-64 h-96 perspective-1000">
              <IDCard3D />
            </div>

            {/* Bottom-right pulsing, clickable label */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('poke-id-card'))}
              title="Poke My ID Card"
              className="absolute bottom-2 right-2 text-green-400 font-mono text-sm opacity-80 animate-pulse
                         hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-green-400 rounded px-1"
              aria-label="Poke My ID Card"
            >
              [Poke My ID Card]
            </button>
          </div>

          {/* Right: Terminal bigger */}
          <div className="w-3/5 bg-gray-900 text-green-400 flex flex-col">
            <Terminal />
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-green-400 font-mono p-2 flex justify-between items-center text-xs">
          <span>vaibhav@portfolio:~$</span>
          <span>{time}</span>
        </footer>
      </div>
    </>
  );
}