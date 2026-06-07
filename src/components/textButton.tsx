import { ButtonHTMLAttributes } from "react";
type Props = ButtonHTMLAttributes<HTMLButtonElement>;

export const TextButton = (props: Props) => {
  return (
    <button
      {...props}
      className={`px-5 py-2 text-sm text-white font-bold bg-primary hover:bg-primary-hover active:bg-primary-press disabled:bg-primary-disabled rounded-xl transition-colors ${props.className || ""}`}
    >
      {props.children}
    </button>
  );
};
