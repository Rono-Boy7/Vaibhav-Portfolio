// pages/index.tsx

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import IDCard from '../components/IDCard';
import Head from 'next/head';

const Terminal = dynamic(() => import('../components/Terminal'), { ssr: false });

export default function Home() {
  const [time, setTime] = useState('');

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

          {/* Left: ID card, wrapped in the OTU wallpaper */}
          <div className="w-1/2 idcard-bg flex items-center justify-center perspective-1000">
            <IDCard />
          </div>

          {/* Right: Terminal */}
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
    </>
  );
}