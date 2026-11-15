import Icon from "./Icon";

export default function Search({
  value,
  onChange,
  placeholder = "Найти сервис",
}: {
  value: string;
  onChange: (s: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="search-field">
      <Icon name="search" size={18} />
      <input
        aria-label={placeholder}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button className="icon-btn" onClick={() => onChange("")} aria-label="Очистить поиск">
          <Icon name="close" size={14} />
        </button>
      )}
    </div>
  );
}
