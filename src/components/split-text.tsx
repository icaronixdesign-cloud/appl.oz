import type { ElementType, ReactNode } from "react";

type SplitTextProps = {
  as?: ElementType;
  children: string;
  className?: string;
  id?: string;
  accent?: string;
  after?: ReactNode;
};

/** Splits a heading into masked words so it can rise word by word. Reads as plain text to assistive tech. */
export function SplitText({ as: Tag = "h2", children, className, id, accent, after }: SplitTextProps) {
  const words = children.split(" ");
  return (
    <Tag className={className} id={id} data-split>
      {words.map((word, index) => (
        <span key={index}>
          <span className="sw"><span className={accent && word.includes(accent) ? "accent" : undefined}>{word}</span></span>
          {index < words.length - 1 ? " " : null}
        </span>
      ))}
      {after}
    </Tag>
  );
}
