interface Props {
  total: number
  skip: number
  limit: number
  onPage: (skip: number) => void
}

export default function Pagination({ total, skip, limit, onPage }: Props) {
  if (total <= limit) return null
  const page = Math.floor(skip / limit)
  const pages = Math.ceil(total / limit)
  const start = skip + 1
  const end = Math.min(skip + limit, total)

  return (
    <div className="flex items-center justify-between mt-4 px-1">
      <p className="text-xs text-gray-500">{start}–{end} dari {total} data</p>
      <div className="flex gap-1">
        <button
          onClick={() => onPage(0)}
          disabled={page === 0}
          className="px-2 py-1 text-xs rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
        >«</button>
        <button
          onClick={() => onPage(Math.max(0, skip - limit))}
          disabled={page === 0}
          className="px-2 py-1 text-xs rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
        >‹</button>
        {Array.from({ length: Math.min(5, pages) }, (_, i) => {
          const p = Math.max(0, Math.min(pages - 5, page - 2)) + i
          return (
            <button
              key={p}
              onClick={() => onPage(p * limit)}
              className={`px-2 py-1 text-xs rounded border ${p === page ? 'bg-teal-600 text-white border-teal-600' : 'border-gray-200 hover:bg-gray-50'}`}
            >{p + 1}</button>
          )
        })}
        <button
          onClick={() => onPage(Math.min((pages - 1) * limit, skip + limit))}
          disabled={page >= pages - 1}
          className="px-2 py-1 text-xs rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
        >›</button>
        <button
          onClick={() => onPage((pages - 1) * limit)}
          disabled={page >= pages - 1}
          className="px-2 py-1 text-xs rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
        >»</button>
      </div>
    </div>
  )
}
