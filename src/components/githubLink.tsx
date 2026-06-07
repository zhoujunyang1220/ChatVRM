import { buildUrl } from "@/utils/buildUrl";

export const GitHubLink = () => {
  return (
    <div
      className="fixed z-10"
      style={{
        bottom: `calc(16px + var(--safe-area-bottom, 0px))`,
        left: `calc(8px + var(--safe-area-left, 0px))`,
      }}
    >
      <a
        draggable={false}
        href="https://github.com/zoan37/ChatVRM"
        rel="noopener noreferrer"
        target="_blank"
        className="block p-2"
        style={{ minWidth: 44, minHeight: 44 }}
      >
        <img
          alt="GitHub"
          height={20}
          width={20}
          src={buildUrl("/github-mark-white.svg")}
          className="opacity-40 hover:opacity-70 transition-opacity"
        ></img>
      </a>
    </div>
  );
};
