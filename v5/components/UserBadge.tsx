interface Props {
  role: string;
}

export default function UserBadge({ role }: Props) {
  const color = role === 'admin' ? 'bg-red-500' : 'bg-green-500';
  return (
    <span className={`text-xs text-white px-2 py-1 rounded ${color}`}>{role}</span>
  );
}
