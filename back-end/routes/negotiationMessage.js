import express from 'express'
import fs from 'fs'

// load the data the message is built from, once, when the server starts
const apartmentChecks = JSON.parse(
  fs.readFileSync(new URL('../data/apartment-checks.json', import.meta.url))
)
const areas = JSON.parse(
  fs.readFileSync(new URL('../data/areas.json', import.meta.url))
)
const comparables = JSON.parse(
  fs.readFileSync(new URL('../data/comparables.json', import.meta.url))
)
const report = JSON.parse(
  fs.readFileSync(new URL('../data/report.json', import.meta.url))
)
const profile = JSON.parse(
  fs.readFileSync(new URL('../data/profile.json', import.meta.url))
)

// same money format as formatRent in the front-end's format.js
function formatRent(amount) {
  return `$${amount.toLocaleString('en-US')}`
}

function roundToNearest25(amount) {
  return Math.round(amount / 25) * 25
}

// Builds the suggested message from the renter's numbers.
// Moved here from NegotiationMessage.jsx so the back-end drafts the message.
function draftMessage({
  check,
  areaName,
  comparableCount,
  currentRent,
  proposedRent,
  report,
  firstName,
}) {
  const isRenewal = currentRent > 0
  const percent = Math.round(
    ((proposedRent - check.localAverage) / check.localAverage) * 100
  )

  let comparison = 'right at the local average'
  if (percent > 0) {
    comparison = `about ${percent}% above the local average`
  } else if (percent < 0) {
    comparison = `about ${Math.abs(percent)}% below the local average`
  }

  const opening = isRenewal
    ? `Thank you for sending the renewal terms for ${check.address}. Before I sign, I looked at what similar apartments nearby rent for.`
    : `Thank you for showing me ${check.address}. Before I apply, I looked at what similar apartments nearby rent for.`

  const market = `${comparableCount} comparable ${
    check.bedrooms
  }-bedroom apartments in ${areaName} rent for between ${formatRent(
    check.rangeLow
  )} and ${formatRent(check.rangeHigh)}, and the local average is ${formatRent(
    check.localAverage
  )}.`

  let rent = `At ${formatRent(proposedRent)}, the rent is ${comparison}.`
  if (isRenewal) {
    const increase = Math.round(
      ((proposedRent - currentRent) / currentRent) * 100
    )
    rent = `The proposed rent of ${formatRent(
      proposedRent
    )} is a ${increase}% increase from my current ${formatRent(
      currentRent
    )}, and puts it ${comparison}.`
  }

  const paragraphs = ['Hi,', opening, `${market} ${rent}`]

  if (report) {
    paragraphs.push(
      `I've also paid rent on time ${report.onTimePayments} out of ${report.totalPayments} months, verified through Leverage, so you can count on me as a reliable tenant.`
    )
  }

  if (percent > 0) {
    const target = roundToNearest25(
      Math.max(check.localAverage, isRenewal ? currentRent : 0)
    )
    paragraphs.push(
      `Would you consider ${formatRent(
        target
      )} a month? I'd be glad to sign at that rent.`
    )
  } else {
    paragraphs.push(
      "The rent looks fair for the area, and I'd be glad to move forward."
    )
  }

  paragraphs.push(`Thank you,\n${firstName}`)
  return paragraphs.join('\n\n')
}

const router = express.Router()

// receive the Negotiation message form and send back the drafted message
router.post('/', (req, res) => {
  const { checkId, currentRent, proposedRent, includeReport } = req.body

  const check = apartmentChecks.find(item => item.id === checkId)
  if (!check) {
    return res.status(404).json({ error: 'Apartment check not found.' })
  }

  const proposed = Number(proposedRent)
  if (!(proposed > 0)) {
    return res.status(400).json({ error: 'Please enter the proposed rent.' })
  }

  const area = areas.find(item => item.id === check.areaId)
  const comparableCount = comparables.filter(
    item => item.checkId === check.id
  ).length

  const message = draftMessage({
    check,
    areaName: area ? area.name : '',
    comparableCount,
    currentRent: Number(currentRent) || 0,
    proposedRent: proposed,
    report: includeReport ? report : null,
    firstName: profile.name.split(' ')[0],
  })

  res.json({ message })
})

export default router
