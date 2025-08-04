// pages/index.tsx

import { useEffect, useState } from 'react';
import IDCard from '../components/IDCard';
import dynamic from 'next/dynamic';

// load Terminal client-only as before
const Terminal = dynamic(() => import('../components/Terminal'), { ssr: false });

export default function Home() {
  const [time, setTime] = useState('');

  useEffect(() => {
    // initialize and tick every second
    const update = () => {
      setTime(new Date().toLocaleString('en-US', {
        hour12: true,
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
      }));
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-gray-900 text-green-400 font-mono p-4 text-center">
        <h1 className="text-3xl font-bold">Vaibhav Patel</h1>
        <p className="text-sm text-gray-400">Networking and Cyber Security Student</p>
      </header>

      {/* Main content */}
      <main className="flex flex-grow overflow-hidden">
        <div className="w-1/2 flex items-center justify-center">
          <IDCard />
        </div>
        <div className="w-1/2 bg-gray-900 text-green-400">
          <Terminal />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-green-400 font-mono p-2 flex justify-between items-center text-xs">
        <span>vaibhav@portfolio:~$</span>
        <span>{time}</span>
      </footer>
    </div>
  );
}