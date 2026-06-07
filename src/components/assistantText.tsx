export const AssistantText = ({ message, characterName }: { message: string; characterName: string }) => {
  if (!message) return null;
  return (
    <div className="absolute bottom-0 left-0 right-0 mb-36 sm:mb-40 px-4 pointer-events-none">
      <div className="mx-auto max-w-4xl pointer-events-auto">
        <div className="glass-panel rounded-2xl overflow-hidden shadow-lg">
          <div className="px-5 py-2 bg-secondary/20 text-secondary text-xs font-Montserrat font-bold tracking-widest uppercase">
            {characterName}
          </div>
          <div className="px-5 py-4 bg-surface1/95">
            <div className="text-text-primary typography-16 font-M_PLUS_2 leading-relaxed">
              {message.replace(/\[([a-zA-Z]*?)\]/g, "")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
