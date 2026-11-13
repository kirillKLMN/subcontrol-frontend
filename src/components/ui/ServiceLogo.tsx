export default function ServiceLogo({
  name,
  small = false,
}: {
  name: string;
  small?: boolean;
}) {
  return (
    <span className={`service-logo logo-${name.toLowerCase()} ${small ? "small" : ""}`}>
      {name === "Figma" ? (
        <svg width="18" height="26" viewBox="0 0 18 27">
          <path fill="#f24e1e" d="M4.5 0H9v9H4.5a4.5 4.5 0 0 1 0-9" />
          <path fill="#ff7262" d="M9 0h4.5a4.5 4.5 0 0 1 0 9H9" />
          <path fill="#a259ff" d="M4.5 9H9v9H4.5a4.5 4.5 0 0 1 0-9" />
          <circle cx="13.5" cy="13.5" r="4.5" fill="#1abcfe" />
          <path fill="#0acf83" d="M4.5 18H9v4.5A4.5 4.5 0 1 1 4.5 18" />
        </svg>
      ) : name === "Slack" ? (
        <span className="slack-symbol">#</span>
      ) : name === "Notion" ? (
        <span className="notion-symbol">N</span>
      ) : name === "Miro" ? (
        <span className="miro-symbol">Ⅲ</span>
      ) : name === "OnlyOffice" ? (
        <span className="only-symbol">▱</span>
      ) : name === "Linear" ? (
        "◒"
      ) : (
        name[0]
      )}
    </span>
  );
}