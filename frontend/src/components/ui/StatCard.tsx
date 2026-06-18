type StatCardProps = {
  label: string
  value: string | number
  icon?: string
}

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <article className="stat-card">
      {icon && (
        <span className="stat-card__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <div className="stat-card__body">
        <span className="stat-card__label">{label}</span>
        <strong className="stat-card__value">{value}</strong>
      </div>
    </article>
  )
}
