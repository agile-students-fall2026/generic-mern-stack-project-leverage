import express from 'express'
import fs from 'fs'

// load the followed area IDs and the areas once, when the server starts
// POST changes this list in memory, so it resets when the server restarts
let followedAreaIds = JSON.parse(
  fs.readFileSync(new URL('../data/followed-areas.json', import.meta.url)),
)
const areas = JSON.parse(
  fs.readFileSync(new URL('../data/areas.json', import.meta.url)),
)

const router = express.Router()

// the full area for each followed ID, in the same order as the list
router.get('/', (req, res) => {
  const followedAreas = followedAreaIds
    .map(areaId => areas.find(area => area.id === areaId))
    .filter(area => area)
  res.json(followedAreas)
})

// follow (following: true) or unfollow (following: false) an area
router.post('/', (req, res) => {
  const { areaId, following } = req.body
  if (typeof following !== 'boolean') {
    return res
      .status(400)
      .json({ error: 'Please send following as true or false.' })
  }
  if (!areas.some(area => area.id === areaId)) {
    return res.status(404).json({ error: 'No area with this ID' })
  }
  if (!following) {
    followedAreaIds = followedAreaIds.filter(id => id !== areaId)
  } else if (!followedAreaIds.includes(areaId)) {
    // a newly followed area goes to the end of the list
    followedAreaIds.push(areaId)
  }
  res.json({ areaId, following })
})

export default router
