import express from 'express'
import fs from 'fs'

// load the comparable apartments and the apartment checks once, when the server starts
const comparables = JSON.parse(
  fs.readFileSync(new URL('../data/comparables.json', import.meta.url)),
)
const apartmentChecks = JSON.parse(
  fs.readFileSync(new URL('../data/apartment-checks.json', import.meta.url)),
)

const router = express.Router()

// apartments near a check, only the ones with the same bedrooms and bathrooms
router.get('/:checkId', (req, res) => {
  const check = apartmentChecks.find(item => item.id === req.params.checkId)
  if (!check) {
    return res.status(404).json({ error: 'Apartment check not found.' })
  }
  const result = comparables.filter(
    apartment =>
      apartment.checkId === check.id &&
      apartment.bedrooms === check.bedrooms &&
      apartment.bathrooms === check.bathrooms,
  )
  res.json(result)
})

export default router
