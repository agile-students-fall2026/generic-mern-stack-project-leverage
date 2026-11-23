import express from 'express'
import fs from 'fs'

// load the areas once, when the server starts
const areas = JSON.parse(
  fs.readFileSync(new URL('../data/areas.json', import.meta.url)),
)

// Matches a typed area name, borough or ZIP code, and also a full address that mentions
// the area or one of its ZIP codes, the same way the Explore screen does.
function matchesSearch(area, search) {
  const text =
    `${area.name} ${area.borough} ${area.zipCodes.join(' ')}`.toLowerCase()
  if (text.includes(search)) {
    return true
  }
  return (
    search.includes(area.name.toLowerCase()) ||
    area.zipCodes.some(zipCode => search.includes(zipCode))
  )
}

const router = express.Router()

router.get('/', (req, res) => {
  const search = (req.query.search || '').trim().toLowerCase()
  let result = areas
  if (req.query.popular === 'true') {
    result = result.filter(area => area.popular)
  }
  if (search) {
    result = result.filter(area => matchesSearch(area, search))
  }
  res.json(result)
})

router.get('/:areaId', (req, res) => {
  const area = areas.find(item => item.id === req.params.areaId)
  if (!area) {
    return res.status(404).json({ error: 'No area with this ID' })
  }
  res.json(area)
})

export default router
