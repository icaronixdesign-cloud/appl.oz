import { ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";

export function SelectInput({ children, ...props }: ComponentProps<"select">) {
  return (
    <span className="select-wrap">
      <select {...props}>{children}</select>
      <ChevronDown size={17} aria-hidden="true" />
    </span>
  );
}
