import type { DateRange } from '../../types/domain'
import { currentMonthRange } from '../../utils/format'

interface PeriodSelectorProps {
  value: DateRange
  onChange: (range: DateRange) => void
}

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="period-selector">
      <label>
        De
        <input
          type="date"
          value={value.startDate ?? ''}
          max={value.endDate}
          onChange={(event) => onChange({ ...value, startDate: event.target.value || undefined })}
        />
      </label>
      <label>
        Até
        <input
          type="date"
          value={value.endDate ?? ''}
          min={value.startDate}
          onChange={(event) => onChange({ ...value, endDate: event.target.value || undefined })}
        />
      </label>
      <button type="button" className="btn btn-secondary" onClick={() => onChange(currentMonthRange())}>
        Mês atual
      </button>
      <button type="button" className="btn btn-secondary" onClick={() => onChange({})}>
        Todo o período
      </button>
    </div>
  )
}
