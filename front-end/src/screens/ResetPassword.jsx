import { useState } from 'react'
import Button from '../components/ui/Button.jsx'
import ScreenTitle from '../components/ui/ScreenTitle.jsx'
import TextField from '../components/ui/TextField.jsx'
import { resetPassword } from '../data/api.js'

const MIN_PASSWORD_LENGTH = 8

export default function ResetPassword() {
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [updated, setUpdated] = useState(false)
  const [error, setError] = useState('')

  const updateField = event =>
    setForm({ ...form, [event.target.name]: event.target.value })

  const longEnough = form.password.length >= MIN_PASSWORD_LENGTH
  const matches = form.password === form.confirm
  const showMismatch = form.confirm !== '' && !matches

  const handleSubmit = async event => {
    event.preventDefault()
    setError('')

    try {
      await resetPassword(form)
      setUpdated(true)
    } catch (err) {
      setError(err.message)
    }
  }

  if (updated) {
    return (
      <div className="px-5 py-10">
        <p className="mb-8 text-lg font-bold tracking-tight">Leverage</p>
        <ScreenTitle
          title="Password updated"
          subtitle="You can now log in with your new password."
        />
        <Button to="/login">Log in</Button>
      </div>
    )
  }

  return (
    <div className="px-5 py-10">
      <p className="mb-8 text-lg font-bold tracking-tight">Leverage</p>
      <ScreenTitle
        title="Choose a new password"
        subtitle="Use at least 8 characters."
      />
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="New password"
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={updateField}
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
        />
        <TextField
          label="Confirm new password"
          id="confirm"
          name="confirm"
          type="password"
          value={form.confirm}
          onChange={updateField}
          autoComplete="new-password"
          required
        />
        {showMismatch && (
          <p className="text-sm text-negative" role="alert">
            Passwords don&apos;t match.
          </p>
        )}
        {error && (
          <p className="text-sm text-negative" role="alert">
            {error}
          </p>
        )}
        <div className="pt-2">
          <Button type="submit" disabled={!longEnough || !matches}>
            Update password
          </Button>
        </div>
      </form>
    </div>
  )
}
