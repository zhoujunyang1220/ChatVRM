import { KnownIconType } from "@charcoal-ui/icons";
import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  iconName: keyof KnownIconType;
  isProcessing: boolean;
  label?: string;
};

export const IconButton = ({
  iconName,
  isProcessing,
  label,
  ...rest
}: Props) => {
  return (
    <button
      {...rest}
      className={`rounded-full text-sm p-3 text-center inline-flex items-center justify-center transition-all duration-200
        bg-primary hover:bg-primary-hover active:bg-primary-press disabled:bg-primary-disabled text-white
        disabled:opacity-40 disabled:cursor-not-allowed
        ${rest.className || ""}
      `}
    >
      {isProcessing ? (
        <pixiv-icon name={"24/Dot"} scale="1"></pixiv-icon>
      ) : (
        <pixiv-icon name={iconName} scale="1"></pixiv-icon>
      )}
      {label && <div className="mx-2 font-M_PLUS_2 font-bold text-sm">{label}</div>}
    </button>
  );
};
