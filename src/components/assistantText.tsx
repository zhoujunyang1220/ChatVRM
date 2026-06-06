export const AssistantText = ({ message, characterName }: { message: string; characterName: string }) => {
  if (!message) return null;
  return (
    <div className="absolute bottom-0 left-0 right-0 mb-24 sm:mb-32 px-2 sm:px-4">
      <div className="mx-auto max-w-lg sm:max-w-4xl">
        <div className="glass-panel rounded-xl sm:rounded-2xl overflow-hidden">
          <div className="px-4 sm:px-5 py-1.5 sm:py-2 bg-secondary/20 text-secondary text-[10px] sm:text-xs font-Montserrat font-bold tracking-widest uppercase">
            {characterName}
          </div>
          <div className="px-3 sm:px-5 py-3 sm:py-4">
            <div className="text-text-primary text-sm sm:text-base font-M_PLUS_2 leading-relaxed">
              {message.replace(/\[([a-zA-Z]*?)\]/g, "")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
