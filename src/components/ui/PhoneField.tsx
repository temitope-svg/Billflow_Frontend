import { useMemo, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { Modal } from './Modal'
import {
  COUNTRIES,
  flagFor,
  type Country,
} from '../../constants/countries'

interface PhoneFieldProps {
  label?: string
  country: Country
  number: string
  onChangeCountry: (country: Country) => void
  onChangeNumber: (number: string) => void
  placeholder?: string
}

export function PhoneField({
  label = 'Phone',
  country,
  number,
  onChangeCountry,
  onChangeNumber,
  placeholder = '800 000 0000',
}: PhoneFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return COUNTRIES
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.dial.includes(q),
    )
  }, [query])

  const closePicker = () => {
    setPickerOpen(false)
    setQuery('')
  }

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-xs font-medium text-slate-700">{label}</label>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex h-[42px] shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-sm text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-indigo-100"
        >
          <span className="text-base leading-none" aria-hidden>
            {flagFor(country.iso2)}
          </span>
          <span className="font-medium">{country.dial}</span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
        </button>
        <input
          type="tel"
          value={number}
          onChange={(e) => onChangeNumber(e.target.value)}
          placeholder={placeholder}
          className="h-[42px] w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <Modal open={pickerOpen} onClose={closePicker} className="max-w-sm">
        <div className="border-b border-slate-100 px-5 py-4 pr-12">
          <h2 className="text-sm font-semibold text-slate-900">Select country</h2>
        </div>
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country or code"
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              autoFocus
            />
          </div>
        </div>
        <ul className="max-h-72 overflow-y-auto pb-2">
          {filtered.map((item) => (
            <li key={item.iso2}>
              <button
                type="button"
                onClick={() => {
                  onChangeCountry(item)
                  closePicker()
                }}
                className="flex w-full items-center gap-3 px-5 py-2.5 text-left text-sm hover:bg-slate-50"
              >
                <span className="text-base leading-none" aria-hidden>
                  {flagFor(item.iso2)}
                </span>
                <span className="flex-1 text-slate-900">{item.name}</span>
                <span className="font-medium text-slate-500">{item.dial}</span>
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-5 py-6 text-center text-xs text-slate-400">No countries found</li>
          )}
        </ul>
      </Modal>
    </div>
  )
}
