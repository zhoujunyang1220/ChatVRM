import { buildUrl } from "@/utils/buildUrl";

export const GitHubLink = () => {
  return (
    <div className="absolute bottom-4 left-4 z-10">
      <a
        draggable={false}
        href="https://github.com/zoan37/ChatVRM"
        rel="noopener noreferrer"
        target="_blank"
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
