// components/IDCard.tsx

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import type { SpringOptions } from "framer-motion";
import Image from 'next/image';
import { useEffect } from 'react';

export default function IDCard() {
  // Pointer-driven offsets
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Map offsets to rotations
  const rotateX = useTransform(y, [-150, 150], [30, -30]);
  const rotateZ = useTransform(x, [-200, 200], [-30, 30]);

  // Handle dragging physics
  const handlePointerMove = (e: React.PointerEvent) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top);
  };

  const spring: SpringOptions = { stiffness: 200, damping: 12 };

  const handlePointerUp = () => {
    animate(x, 0, spring);
    animate(y, 0, spring);
  };

  return (
    <div className="relative perspective-1000 mt-8">
      <motion.div
        className="w-64 h-96 relative cursor-pointer"
        style={{
          rotateX,
          rotateZ,
          transformOrigin: 'top center',
        }}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerUp}
        onPointerUp={handlePointerUp}
      >
        

        {/* Front Face */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 border border-gray-400 rounded-2xl shadow-lg overflow-hidden card-metal"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Shiny highlight */}
          <div className="absolute inset-0 pointer-events-none shine" />

          {/* Content */}
          <div className="relative flex flex-col justify-between h-full p-4">
            {/* Top: headshot */}
            <div className="flex justify-center">
              <Image
                src="/Headshot.JPG"
                alt="Vaibhav Patel"
                width={128}
                height={128}
                className="rounded-full"
              />
            </div>
            {/* Bottom: your info */}
            <div className="text-left">
              <h2 className="text-xl font-bold text-gray-800">Vaibhav Patel</h2>
              <p className="text-gray-600 text-sm">
                Networking &amp; Cyber Security Student
              </p>
            </div>
          </div>
        </motion.div>

        {/* Back Face */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-100 border border-gray-400 rounded-2xl shadow-lg overflow-hidden flex items-center justify-center card-metal"
          style={{
            rotateY: 180,
            backfaceVisibility: 'hidden',
          }}
        >
          {/* Example back content */}
          <p className="text-gray-800 font-mono">Back of Card</p>
        </motion.div>
      </motion.div>
    </div>
  );
}