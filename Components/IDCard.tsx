// components/IDCard.tsx
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import Image from 'next/image';

export default function IDCard() {
  // raw pointer offsets
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // map those to rotations
  const rotateX = useTransform(y, [-150, 150], [30, -30]);
  const rotateZ = useTransform(x, [-200, 200], [-30, 30]);

  // pointer handlers
  const handlePointerMove = (e: React.PointerEvent) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top;
    x.set(offsetX);
    y.set(offsetY);
  };
  const spring = { type: 'spring', stiffness: 200, damping: 12 };
  const handlePointerUp = () => {
    animate(x, 0, spring);
    animate(y, 0, spring);
  };

  return (
    <div className="relative">
      <motion.div
        className="relative mt-8 w-64 h-96 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 
                   border border-gray-400 rounded-2xl shadow-lg cursor-pointer overflow-hidden card-metal"
        style={{ rotateX, rotateZ, transformOrigin: 'top center' }}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerUp}
        onPointerUp={handlePointerUp}
      >
        {/* Lanyard */}
        <div
          className="absolute -top-8 left-1/2 w-1 h-8 bg-gray-800 rounded"
          style={{ transform: 'translateX(-50%)' }}
        />

        {/* Shiny highlight */}
        <div className="absolute inset-0 pointer-events-none shine" />

        {/* Content: flex-col, headshot at top, text at bottom */}
        <div className="relative flex flex-col justify-between h-full p-4">
          {/* Top: headshot */}
          <div className="flex justify-center">
            <Image
              src="/Headshot.jpg"
              alt="Vaibhav Patel"
              width={128}
              height={128}
              className="rounded-full"
            />
          </div>

          {/* Bottom: name, title, student no. */}
          <div className="text-left">
            <h2 className="text-xl font-bold text-gray-800">Vaibhav Patel</h2>
            <p className="text-gray-600 text-sm">
              Networking &amp; Cyber Security
            </p>
            <p className="text-gray-600 text-sm">
              Student No.: 100889689
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}