export function CollectionIcon({ type, className = "" }) {
  const common = {
    className: `collection-icon ${className}`.trim(),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  };

  if (type === "trash") {
    return (
      <svg {...common}>
        <path d="M5 7h14l-1 13H6L5 7Z" />
        <path d="M3.5 7h17M9 7V4.5h6V7M9.5 10.5v6M14.5 10.5v6" />
      </svg>
    );
  }

  if (type === "recycling") {
    return (
      <span className={`collection-icon collection-icon-symbol ${className}`.trim()} aria-hidden="true">
        ♻
      </span>
    );
  }

  return (
    <svg {...common}>
      <path d="M19.8 4.2C12 4.3 6.1 7.8 5.4 13.5c-.4 3.3 1.8 5.9 5.1 5.5 5.8-.7 9.2-6.8 9.3-14.8Z" />
      <path d="M4 21c2.3-4.6 5.8-8.1 11.2-10.7" />
    </svg>
  );
}
