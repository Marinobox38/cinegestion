import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Armchair } from 'lucide-react';

const SeatingPlan = ({ room, occupiedSeats = [], selectedSeats = [], onSeatSelect }) => {
  // Default fallback layout if none exists in DB
  const layout = room?.seat_layout || { rows: 8, cols: 12, gaps: [] };
  const rows = Array.from({ length: layout.rows }, (_, i) => String.fromCharCode(65 + i));
  const cols = Array.from({ length: layout.cols }, (_, i) => i + 1);

  const getSeatStatus = (row, col) => {
    const seatId = `${row}${col}`;
    if (occupiedSeats.includes(seatId)) return 'occupied';
    if (selectedSeats.includes(seatId)) return 'selected';
    // Logic for gaps or wheelchair seats could go here
    return 'available';
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-gray-900 rounded-xl border border-gray-800 shadow-2xl">
      {/* Screen */}
      <div className="mb-12 relative">
        <div className="w-full h-2 bg-gradient-to-r from-gray-800 via-gray-400 to-gray-800 rounded-full opacity-50 mb-2" />
        <div className="w-3/4 h-16 bg-gradient-to-b from-white/10 to-transparent mx-auto transform perspective-origin-top perspective-1000 rotate-x-12 blur-xl" />
        <p className="text-center text-gray-500 text-sm uppercase tracking-widest mt-2">Écran</p>
      </div>

      {/* Grid */}
      <div className="flex flex-col gap-2 items-center overflow-x-auto pb-4">
        {rows.map((row) => (
          <div key={row} className="flex items-center gap-2 flex-nowrap">
            <span className="w-6 text-center text-gray-500 font-mono text-sm">{row}</span>
            <div className="flex gap-1 md:gap-2">
              {cols.map((col) => {
                const status = getSeatStatus(row, col);
                const seatId = `${row}${col}`;
                
                return (
                  <motion.button
                    key={seatId}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => status !== 'occupied' && onSeatSelect(seatId)}
                    disabled={status === 'occupied'}
                    className={cn(
                      "w-8 h-8 md:w-10 md:h-10 rounded-t-lg rounded-b-md flex items-center justify-center transition-colors relative group",
                      status === 'available' && "bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white",
                      status === 'selected' && "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]",
                      status === 'occupied' && "bg-gray-800 text-gray-600 cursor-not-allowed opacity-50"
                    )}
                  >
                    <Armchair className="w-5 h-5 md:w-6 md:h-6" />
                    <span className="absolute -top-8 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap border border-gray-700">
                      Rang {row} - Siège {col}
                    </span>
                  </motion.button>
                );
              })}
            </div>
            <span className="w-6 text-center text-gray-500 font-mono text-sm">{row}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-8 pt-6 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-700 rounded-t-lg rounded-b-md" />
          <span className="text-sm text-gray-400">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-600 rounded-t-lg rounded-b-md shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
          <span className="text-sm text-white">Sélectionné</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-800 opacity-50 rounded-t-lg rounded-b-md" />
          <span className="text-sm text-gray-500">Occupé</span>
        </div>
      </div>
    </div>
  );
};

export default SeatingPlan;