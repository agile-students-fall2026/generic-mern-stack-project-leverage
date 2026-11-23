import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import ScreenTitle from '../components/ui/ScreenTitle.jsx'
import SectionTitle from '../components/ui/SectionTitle.jsx'
import TextField from '../components/ui/TextField.jsx'
import Toggle from '../components/ui/Toggle.jsx'
import {
  draftNegotiationMessage,
  getApartmentCheck,
  getComparables,
  getReport,
} from '../data/api.js'
import { isBankConnected } from '../data/bankConnection.js'
import { formatRent } from '../data/format.js'

export default function NegotiationMessage() {
  const { checkId } = useParams()
  const [data, setData] = useState(undefined)
  const [currentRent, setCurrentRent] = useState('')
  const [proposedRent, setProposedRent] = useState('')
  const [includeReport, setIncludeReport] = useState(true)
  const [suggestedMessage, setSuggestedMessage] = useState('')
  const [editedMessage, setEditedMessage] = useState(null)
  const [copyStatus, setCopyStatus] = useState('idle')

  useEffect(() => {
    getApartmentCheck(checkId).then(async check => {
      if (!check) {
        setData(null)
        return
      }
      const [comparables, connected] = await Promise.all([
        getComparables(check.id),
        isBankConnected().catch(() => false),
      ])
      // only load the Reliability Report if the bank is connected
      const report = connected ? await getReport() : null
      setProposedRent(String(check.askingRent))
      setData({ check, comparables, report })
    })
  }, [checkId])

  // ask the back-end to draft the message whenever the form changes
  useEffect(() => {
    if (!data || !(Number(proposedRent) > 0)) {
      return
    }
    let ignore = false
    draftNegotiationMessage({
      checkId: data.check.id,
      currentRent,
      proposedRent,
      includeReport: includeReport && data.report !== null,
    })
      .then(result => {
        if (!ignore) setSuggestedMessage(result.message)
      })
      .catch(() => {
        if (!ignore) setSuggestedMessage('')
      })
    return () => {
      ignore = true
    }
  }, [data, currentRent, proposedRent, includeReport])

  if (data === undefined) {
    return <p className="text-sm text-muted">Loading…</p>
  }

  if (data === null) {
    return (
      <ScreenTitle
        title="Apartment not found"
        subtitle="Go back to Negotiate and choose an apartment."
      />
    )
  }

  const { check, comparables, report } = data
  const proposed = Number(proposedRent)
  const comparableAverage = Math.round(
    comparables.reduce((sum, item) => sum + item.rent, 0) / comparables.length,
  )

  const message = editedMessage ?? (proposed > 0 ? suggestedMessage : '')

  const changeInput = setter => event => {
    setter(event.target.value)
    setCopyStatus('idle')
  }

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('failed')
    }
  }

  return (
    <div>
      <ScreenTitle title="Negotiation message" subtitle={check.address} />

      <div className="mb-6 grid grid-cols-2 gap-3">
        <TextField
          label="Current rent ($)"
          id="currentRent"
          type="number"
          inputMode="numeric"
          min="0"
          placeholder="If renewing"
          value={currentRent}
          onChange={changeInput(setCurrentRent)}
        />
        <TextField
          label="Proposed rent ($)"
          id="proposedRent"
          type="number"
          inputMode="numeric"
          min="1"
          value={proposedRent}
          onChange={changeInput(setProposedRent)}
        />
      </div>

      <SectionTitle>What the message is based on</SectionTitle>
      <Card>
        <dl className="divide-y divide-line">
          <div className="flex justify-between py-2.5">
            <dt className="text-sm text-muted">Comparable apartments</dt>
            <dd className="font-semibold">{comparables.length} nearby</dd>
          </div>
          <div className="flex justify-between py-2.5">
            <dt className="text-sm text-muted">Their average rent</dt>
            <dd className="font-semibold">{formatRent(comparableAverage)}</dd>
          </div>
          <div className="flex justify-between py-2.5">
            <dt className="text-sm text-muted">Range nearby</dt>
            <dd className="font-semibold whitespace-nowrap">
              {formatRent(check.rangeLow)} – {formatRent(check.rangeHigh)}
            </dd>
          </div>
          <div className="flex justify-between py-2.5">
            <dt className="text-sm text-muted">Local average</dt>
            <dd className="font-semibold">{formatRent(check.localAverage)}</dd>
          </div>
        </dl>
      </Card>

      {report && (
        <div className="mt-4 flex items-center justify-between gap-4 border border-line bg-surface p-4">
          <div>
            <p className="text-sm font-semibold">Mention my on-time payments</p>
            <p className="text-xs text-muted">From your Reliability Report</p>
          </div>
          <Toggle
            checked={includeReport}
            onChange={setIncludeReport}
            label="Mention my on-time payments"
          />
        </div>
      )}

      <div className="mt-6">
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="message" className="text-sm font-medium">
            Your message
          </label>
          {editedMessage !== null && (
            <button
              type="button"
              onClick={() => setEditedMessage(null)}
              className="text-sm font-semibold text-accent hover:underline"
            >
              Reset to suggested
            </button>
          )}
        </div>
        <textarea
          id="message"
          rows={14}
          value={message}
          onChange={event => {
            setEditedMessage(event.target.value)
            setCopyStatus('idle')
          }}
          placeholder="Enter the proposed rent to get a suggested message."
          className="w-full border border-line bg-surface px-3 py-3 text-sm leading-relaxed text-ink focus:border-ink focus:outline-none"
        />
        <p className="mt-1 text-xs text-muted">
          Edit anything you like. Leverage never sends messages for you.
        </p>
      </div>

      {copyStatus === 'copied' && (
        <p
          className="mt-4 border border-positive px-3 py-2 text-sm font-semibold text-positive"
          role="status"
        >
          ✓ Message copied. Paste it into your email or text to the landlord.
        </p>
      )}
      {copyStatus === 'failed' && (
        <p className="mt-4 text-sm text-negative" role="status">
          Couldn't copy automatically. Select the message and copy it.
        </p>
      )}

      <div className="mt-6 space-y-3">
        <Button onClick={copyMessage} disabled={message.trim() === ''}>
          {copyStatus === 'copied' ? 'Copy again' : 'Copy message'}
        </Button>
        <Button to={`/negotiate/${check.id}/outcome`} variant="secondary">
          Record what happened
        </Button>
      </div>
    </div>
  )
}
