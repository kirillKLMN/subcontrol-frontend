type AvatarProps = {
  name: string;
  size?: string;
};

export default function Avatar({
  name,
  size = "",
}: AvatarProps) {
  return (
    <span
      className={`avatar ${size} avatar-${name.charCodeAt(0) % 4}`}
    >
      {name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")}
    </span>
  );
}
