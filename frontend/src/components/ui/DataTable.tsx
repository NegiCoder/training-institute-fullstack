export type DataTableColumn<T> = {
  key: string
  header: string
  render: (row: T) => React.ReactNode
  /** Used for mobile card label */
  mobileLabel?: string
  /** Hide on mobile card (e.g. ID columns) */
  hideOnMobile?: boolean
}

type DataTableProps<T> = {
  columns: DataTableColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string | number
  emptyMessage?: string
  isLoading?: boolean
  caption?: string
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = 'No records found.',
  isLoading = false,
  caption,
}: DataTableProps<T>) {
  if (isLoading) {
    return <p className="page-text">Loading…</p>
  }

  if (rows.length === 0) {
    return <div className="empty-state">{emptyMessage}</div>
  }

  const mobileColumns = columns.filter((col) => !col.hideOnMobile)

  return (
    <>
      <div
        className="data-table-wrap"
        role="region"
        aria-label={caption ?? 'Data table'}
      >
        <table className="data-table">
          {caption && <caption className="visually-hidden">{caption}</caption>}
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} scope="col">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)}>
                {columns.map((col) => (
                  <td key={col.key} data-label={col.mobileLabel ?? col.header}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="data-table-cards" aria-label={caption ?? 'Records list'}>
        {rows.map((row) => (
          <li key={rowKey(row)} className="data-table-card">
            {mobileColumns.map((col) => (
              <div key={col.key} className="data-table-card__row">
                <span className="data-table-card__label">
                  {col.mobileLabel ?? col.header}
                </span>
                <span className="data-table-card__value">{col.render(row)}</span>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </>
  )
}

type PaginationProps = {
  pageNumber: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
  onPrevious: () => void
  onNext: () => void
}

export function PaginationRow({
  pageNumber,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  onPrevious,
  onNext,
}: PaginationProps) {
  return (
    <div className="pagination-row">
      <button
        className="secondary-button"
        type="button"
        disabled={!hasPreviousPage}
        onClick={onPrevious}
      >
        Previous
      </button>
      <span>
        Page {pageNumber} of {totalPages}
      </span>
      <button
        className="secondary-button"
        type="button"
        disabled={!hasNextPage}
        onClick={onNext}
      >
        Next
      </button>
    </div>
  )
}
