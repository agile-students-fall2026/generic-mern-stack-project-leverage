import express from 'express'
import fs from 'fs'

// load the followed area IDs and the areas once, when the server starts
const followedAreaIds = JSON.parse(
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

export default router
