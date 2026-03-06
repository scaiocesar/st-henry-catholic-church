'use client'

import { useState, useEffect } from 'react'

interface MassSchedule {
  id: number
  day: string
  time: string
  language: string
  locationId: number | null
  location: { id: number; name: string } | null
  massType: string
  isActive: boolean
  sortOrder: number
}

interface Location {
  id: number
  name: string
}

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

function to24Hour(value: string): string | null {
  const normalized = value.trim().toLowerCase()
  const ampm = normalized.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/)
  if (ampm) {
    let hour = parseInt(ampm[1], 10)
    const minute = ampm[2]
    const period = ampm[3]
    if (period === 'pm' && hour !== 12) hour += 12
    if (period === 'am' && hour === 12) hour = 0
    return `${String(hour).padStart(2, '0')}:${minute}`
  }

  const hhmm = normalized.match(/^([01]\d|2[0-3]):([0-5]\d)$/)
  if (hhmm) return `${hhmm[1]}:${hhmm[2]}`

  return null
}

function parseTimeRange(value: string): { startTime: string; endTime: string } {
  const parts = value.split('-').map((item) => item.trim())
  const start = parts[0] ? to24Hour(parts[0]) : null
  const end = parts[1] ? to24Hour(parts[1]) : null
  return {
    startTime: start || '',
    endTime: end || '',
  }
}

export default function ScheduleAdmin() {
  const [schedules, setSchedules] = useState<MassSchedule[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [form, setForm] = useState({
    day: 'Sunday',
    startTime: '',
    endTime: '',
    language: '',
    locationId: '',
    massType: 'mass',
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  async function fetchSchedules() {
    const res = await fetch('/api/mass-schedule')
    const data = await res.json()
    setSchedules(data)
  }

  async function fetchLocations() {
    const res = await fetch('/api/location')
    const data = await res.json()
    setLocations(data)
  }

  const filteredSchedules = filter === 'all' 
    ? schedules 
    : schedules.filter(s => s.massType === filter)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      await fetch(`/api/mass-schedule/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          time: form.endTime ? `${form.startTime} - ${form.endTime}` : form.startTime,
          locationId: form.locationId ? parseInt(form.locationId) : null,
        })
      })
      setEditingId(null)
    } else {
      await fetch('/api/mass-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          time: form.endTime ? `${form.startTime} - ${form.endTime}` : form.startTime,
          locationId: form.locationId ? parseInt(form.locationId) : null,
        })
      })
    }
    setForm({ day: 'Sunday', startTime: '', endTime: '', language: '', locationId: '', massType: 'mass' })
    fetchSchedules()
  }

  const handleEdit = (schedule: MassSchedule) => {
    const parsed = parseTimeRange(schedule.time)
    setForm({
      day: schedule.day,
      startTime: parsed.startTime,
      endTime: parsed.endTime,
      language: schedule.language,
      locationId: schedule.locationId ? String(schedule.locationId) : '',
      massType: schedule.massType
    })
    setEditingId(schedule.id)
  }

  const handleCancel = () => {
    setForm({ day: 'Sunday', startTime: '', endTime: '', language: '', locationId: '', massType: 'mass' })
    setEditingId(null)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this schedule?')) return
    await fetch(`/api/mass-schedule/${id}`, { method: 'DELETE' })
    fetchSchedules()
  }

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'adoration': return 'Adoration'
      case 'confession': return 'Confession'
      default: return 'Mass'
    }
  }

  useEffect(() => {
    ;(async () => {
      const [schedulesRes, locationsRes] = await Promise.all([
        fetch('/api/mass-schedule'),
        fetch('/api/location'),
      ])
      const schedulesData = await schedulesRes.json()
      const locationsData = await locationsRes.json()
      setSchedules(schedulesData)
      setLocations(locationsData)
      setLoading(false)
    })()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800 mb-8">Mass Schedule Management</h1>
      
      {/* Filter */}
      <div className="mb-6 flex gap-2">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-[var(--primary)] text-white' : 'bg-gray-200'}`}>All</button>
        <button onClick={() => setFilter('mass')} className={`px-4 py-2 rounded ${filter === 'mass' ? 'bg-[var(--primary)] text-white' : 'bg-gray-200'}`}>Masses</button>
        <button onClick={() => setFilter('adoration')} className={`px-4 py-2 rounded ${filter === 'adoration' ? 'bg-[var(--primary)] text-white' : 'bg-gray-200'}`}>Adoration</button>
        <button onClick={() => setFilter('confession')} className={`px-4 py-2 rounded ${filter === 'confession' ? 'bg-[var(--primary)] text-white' : 'bg-gray-200'}`}>Confession</button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Schedule' : 'Add New Schedule'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={form.massType}
                onChange={(e) => setForm({ ...form, massType: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
              >
                <option value="mass">Mass</option>
                <option value="adoration">Adoration</option>
                <option value="confession">Confession</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
              <select
                value={form.day}
                onChange={(e) => setForm({ ...form, day: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
                required
              >
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language (for Mass only)</label>
              <input
                type="text"
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                placeholder="e.g., English, Spanish"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select
                value={form.locationId}
                onChange={(e) => setForm({ ...form, locationId: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
                required
              >
                <option value="">Select location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-[var(--primary)] text-white py-2 rounded hover:bg-[#5ab0d4] transition">
                {editingId ? 'Update' : 'Add Schedule'}
              </button>
              {editingId && (
                <button type="button" onClick={handleCancel} className="px-4 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Current Schedules</h2>
          {filteredSchedules.length === 0 ? (
            <p className="text-gray-500">No schedules yet</p>
          ) : (
            <ul className="space-y-3">
              {filteredSchedules.map((schedule) => (
                <li key={schedule.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">
                      {schedule.day} - {schedule.time}
                      <span className="ml-2 text-xs px-2 py-1 bg-[var(--primary)] text-white rounded">
                        {getTypeLabel(schedule.massType)}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      {schedule.language} {schedule.location?.name && `(${schedule.location.name})`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(schedule)}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(schedule.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
