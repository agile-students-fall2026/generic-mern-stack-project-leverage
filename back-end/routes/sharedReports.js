import express from 'express'
import fs from 'fs'

//load the shared reports once, when the server starts
const sharedReports = JSON.parse(
  fs.readFileSync(new URL('../data/shared-reports.json', import.meta.url)),
)

const router = express.Router()

//find one report by its id, 404 if there isnt one
router.get('/:reportId', (req, res) => {
  const report = sharedReports.find(r => r.id === req.params.reportId)
  if (!report) {
    return res.status(404).json({ error: 'Report not found' })
  }
  res.json(report)
})

export default router
