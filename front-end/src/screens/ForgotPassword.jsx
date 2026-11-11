import { useState } from 'react'
import { Link } from 'react-router'
import Button from '../components/ui/Button.jsx'
import ScreenTitle from '../components/ui/ScreenTitle.jsx'
import TextField from '../components/ui/TextField.jsx'
import { forgotPassword } from '../data/api.js'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async event => {
    event.preventDefault()
    setError('')

    try {
      await forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.message)
    }
  }

  if (sent) {
    return (
      <div className="px-5 py-10">
        <p className="mb-8 text-lg font-bold tracking-tight">Leverage</p>
        <ScreenTitle
          title="Check your email"
          subtitle={`We sent a reset link to ${email}. It can take a few minutes to arrive.`}
        />
        <div className="space-y-3">
          {/* Stands in for the link in the email until the back-end sends real emails. */}
          <Button to="/reset-password">Open reset link</Button>
          <Button to="/login" variant="secondary">
            Back to log in
          </Button>
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          Didn&apos;t get it?{' '}
          <button
            type="button"
            onClick={() => setSent(false)}
            className="font-semibold text-accent hover:underline"
          >
            Try again
          </button>
        </p>
      </div>
    )
  }

  return (
    <div className="px-5 py-10">
      <p className="mb-8 text-lg font-bold tracking-tight">Leverage</p>
      <ScreenTitle
        title="Reset your password"
        subtitle="Enter your email and we'll send you a link to choose a new password."
      />
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Email"
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={event => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
        {error && (
          <p className="text-sm text-negative" role="alert">
            {error}
          </p>
        )}
        <div className="pt-2">
          <Button type="submit">Send reset link</Button>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Remembered it?{' '}
        <Link to="/login" className="font-semibold text-accent hover:underline">
          Log in
        </Link>
      </p>
    </div>
  )
}
