import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const moodConfig = {
  joyful: {
    emoji: "😊",
    label: "Joyful",
    color: "from-amber-400 to-orange-400",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200"
  },
  calm: {
    emoji: "😌",
    label: "Calm",
    color: "from-teal-400 to-cyan-400",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200"
  },
  neutral: {
    emoji: "😐",
    label: "Neutral",
    color: "from-slate-400 to-gray-400",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200"
  },
  anxious: {
    emoji: "😰",
    label: "Anxious",
    color: "from-violet-400 to-purple-400",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200"
  },
  sad: {
    emoji: "😢",
    label: "Sad",
    color: "from-blue-400 to-indigo-400",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  overwhelmed: {
    emoji: "😵‍💫",
    label: "Overwhelmed",
    color: "from-rose-400 to-pink-400",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200"
  },
  hopeful: {
    emoji: "🌱",
    label: "Hopeful",
    color: "from-emerald-400 to-green-400",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200"
  },
  tired: {
    emoji: "😴",
    label: "Tired",
    color: "from-indigo-400 to-blue-400",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200"
  }
};

export default function MoodEmoji({ 
  mood, 
  selected, 
  onClick, 
  size = "default",
  showLabel = true 
}) {
  const config = moodConfig[mood];
  if (!config) return null;

  const sizes = {
    small: "w-12 h-12 text-xl",
    default: "w-16 h-16 text-2xl",
    large: "w-20 h-20 text-3xl"
  };

  return (
    <motion.button
      onClick={() => onClick?.(mood)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "flex flex-col items-center gap-2 transition-all duration-200",
        selected && "transform scale-105"
      )}
    >
      <div
        className={cn(
          sizes[size],
          "rounded-2xl flex items-center justify-center border-2 transition-all duration-200",
          selected 
            ? `${config.bgColor} ${config.borderColor} shadow-lg` 
            : "bg-white border-slate-100 hover:border-slate-200"
        )}
      >
        <span className={selected ? "filter-none" : "opacity-70"}>
          {config.emoji}
        </span>
      </div>
      {showLabel && (
        <span className={cn(
          "text-sm font-medium transition-colors",
          selected ? "text-slate-700" : "text-slate-500"
        )}>
          {config.label}
        </span>
      )}
    </motion.button>
  );
}

export { moodConfig };