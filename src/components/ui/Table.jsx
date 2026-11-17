// A simple responsive table. columns: [{ key, label, render?(row), className? }]

export default function Table({ columns, rows, rowKey = 'id', onRowClick, empty = 'No results.' }) {
  if (!rows.length) return <p className="rounded-3xl border border-dashed border-line px-6 py-10 text-center text-sm text-muted">{empty}</p>
  return (
    <div className="overflow-x-auto rounded-3xl border border-line bg-card">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={`px-4 py-3 font-semibold ${c.className ?? ''}`}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={typeof rowKey === 'function' ? rowKey(r) : r[rowKey]}
              onClick={onRowClick ? () => onRowClick(r) : undefined}
              className={`border-b border-line last:border-0 ${onRowClick ? 'cursor-pointer hover:bg-field' : ''}`}
            >
              {columns.map((c) => (
                <td key={c.key} className={`px-4 py-3 align-middle ${c.className ?? ''}`}>
                  {c.render ? c.render(r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
