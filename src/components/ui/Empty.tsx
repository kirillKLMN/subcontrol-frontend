import Icon from "./Icon";

export default function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty">
      <Icon name="search" size={26} />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
