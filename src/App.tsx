import { useState } from 'react'
import AppLayout from './components/AppLayout'

function App() {
  const password = import.meta.env.VITE_APP_PASSWORD as string | undefined
  const isGateEnabled = Boolean(password)
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [isAuthed, setIsAuthed] = useState(() => {
    if (!isGateEnabled) return true
    return localStorage.getItem('ux-shell:authorized') === 'true'
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!password) {
      setIsAuthed(true)
      return
    }
    if (input === password) {
      localStorage.setItem('ux-shell:authorized', 'true')
      setIsAuthed(true)
      setError('')
      return
    }
    setError('Incorrect password')
  }

  if (isGateEnabled && !isAuthed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7fafb] px-4">
        <div className="w-full max-w-sm rounded-lg border border-[#c7cfd1] bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-[#18191a]">Enter password</h1>
          <p className="mt-2 text-sm text-[#5e656a]">
            This preview is password protected.
          </p>
          <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
            <input
              type="password"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="w-full rounded-md border border-[#c7cfd1] px-3 py-2 text-sm text-[#18191a] outline-none focus:border-[#328be5]"
              placeholder="Password"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-md bg-[#328be5] px-3 py-2 text-sm font-semibold text-white hover:bg-[#328be5]/90"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    )
  }

  return <AppLayout />
}

export default App


