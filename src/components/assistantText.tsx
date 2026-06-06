export const AssistantText = ({ message, characterName }: { message: string; characterName: string }) => {
  if (!message) return null;
  return (
    <div className="absolute bottom-0 left-0 right-0 mb-28 sm:mb-32 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="px-5 py-2 bg-secondary/20 text-secondary text-xs font-Montserrat font-bold tracking-widest uppercase">
            {characterName}
          </div>
          <div className="px-5 py-4">
            <div className="text-text-primary typography-16 font-M_PLUS_2 leading-relaxed">
              {message.replace(/\[([a-zA-Z]*?)\]/g, "")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
