import { motion } from "framer-motion";

type Props = {
  characterName: string;
};

const dotVariants = {
  animate: (i: number) => ({
    y: [0, -6, 0],
    opacity: [0.4, 1, 0.4],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      delay: i * 0.15,
      ease: "easeInOut",
    },
  }),
};

export const TypingIndicator = ({ characterName }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed left-0 right-0 z-40 px-3 sm:px-6 pointer-events-none"
      style={{
        bottom: `calc(100px + var(--safe-area-bottom, 0px) + var(--keyboard-offset, 0px))`,
      }}
    >
      <div className="mx-auto max-w-lg sm:max-w-2xl">
        <div className="glass-panel rounded-2xl rounded-bl-md max-w-[200px] px-5 py-3.5 pointer-events-auto">
          <div className="text-[10px] font-bold tracking-wider text-secondary/80 uppercase mb-2 font-Montserrat">
            {characterName}
          </div>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                custom={i}
                variants={dotVariants}
                animate="animate"
                className="w-2 h-2 rounded-full bg-primary/60 block"
              />
            ))}
            <span className="ml-1 text-[11px] text-text-secondary/50 font-Montserrat">
              thinking...
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
