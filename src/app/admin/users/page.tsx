'use client'

import { useState, useEffect } from 'react'

const emptyForm = { username: '', password: '', email: '' }

type AdminUserRow = {
  id: number
  username: string
  email: string | null
  createdAt: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function fetchUsers() {
    const res = await fetch('/api/admin-user')
    if (!res.ok) {
      setError('Failed to load users.')
      setUsers([])
      return
    }
    const data = await res.json()
    setUsers(data)
  }

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const authRes = await fetch('/api/auth')
        const authData = await authRes.json()
        if (authData.authenticated && typeof authData.userId === 'number') {
          setCurrentUserId(authData.userId)
        }
      } catch {
        /* ignore */
      }
      await fetchUsers()
      setLoading(false)
    })()
  }, [])

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      if (editingId) {
        const body: Record<string, string | null> = {
          username: form.username,
          email: form.email.trim() || null,
        }
        if (form.password.trim()) {
          body.password = form.password
        }
        const res = await fetch(`/api/admin-user/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Update failed.')
          return
        }
        setSuccess('User updated.')
      } else {
        const res = await fetch('/api/admin-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: form.username,
            password: form.password,
            email: form.email.trim() || null,
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Create failed.')
          return
        }
        setSuccess('User created.')
      }
      resetForm()
      await fetchUsers()
    } catch {
      setError('Request failed.')
    }
  }

  const handleEdit = (user: AdminUserRow) => {
    setEditingId(user.id)
    setForm({
      username: user.username,
      password: '',
      email: user.email || '',
    })
    setError('')
    setSuccess('')
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this administrator? This cannot be undone.')) return
    setError('')
    setSuccess('')
    const res = await fetch(`/api/admin-user/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Delete failed.')
      return
    }
    setSuccess('User deleted.')
    if (editingId === id) resetForm()
    await fetchUsers()
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800 mb-8">Administrator users</h1>

      {error && (
        <div className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded border border-red-200">{error}</div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 text-green-800 px-4 py-3 rounded border border-green-200">
          {success}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit administrator' : 'Add administrator'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
                required
                minLength={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password {editingId && '(leave blank to keep current)'}
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
                required={!editingId}
                minLength={editingId ? 0 : 8}
                placeholder={editingId ? '••••••••' : ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--primary)] outline-none"
                placeholder="name@example.org"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-[var(--primary)] text-white py-2 rounded hover:bg-[#5ab0d4] transition"
              >
                {editingId ? 'Update' : 'Create'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">All administrators</h2>
          {users.length === 0 ? (
            <p className="text-gray-500">No users found.</p>
          ) : (
            <ul className="space-y-3">
              {users.map((user) => (
                <li
                  key={user.id}
                  className="flex justify-between items-start gap-3 p-3 bg-gray-50 rounded border border-gray-100"
                >
                  <div>
                    <p className="font-medium">{user.username}</p>
                    {user.email && <p className="text-sm text-gray-500">{user.email}</p>}
                    <p className="text-xs text-gray-400 mt-1">
                      Created {new Date(user.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    {currentUserId === user.id ? (
                      <span className="text-xs text-gray-400 self-center" title="Log in as another admin to remove this account">
                        (you)
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    )}
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
