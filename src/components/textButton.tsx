import { ButtonHTMLAttributes } from "react";
type Props = ButtonHTMLAttributes<HTMLButtonElement>;

export const TextButton = (props: Props) => {
  return (
    <button
      {...props}
      className={`px-5 py-2 min-h-[44px] text-sm text-white font-bold bg-primary hover:bg-primary-hover active:bg-primary-press disabled:bg-primary-disabled rounded-xl transition-all duration-200 ease-out hover:shadow-[0_0_12px_rgba(124,92,191,0.3)] hover:scale-[1.03] active:scale-95 disabled:scale-100 ${props.className || ""}`}
    >
      {props.children}
    </button>
  );
};
