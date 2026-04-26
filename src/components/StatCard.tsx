interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  color = "blue",
}: StatCardProps) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
    red: "bg-red-50 border-red-200 text-red-700",
    cyan: "bg-cyan-50 border-cyan-200 text-cyan-700",
  };

  return (
    <div
      className={`rounded-xl border p-3 sm:p-5 ${colorClasses[color] || colorClasses.blue}`}
    >
      <p className="text-xs sm:text-sm font-medium opacity-80 leading-tight">{title}</p>
      <p className="text-2xl sm:text-3xl font-bold mt-1">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {subtitle && (
        <p className="text-xs mt-1 opacity-60 leading-tight">{subtitle}</p>
      )}
    </div>
  );
}
