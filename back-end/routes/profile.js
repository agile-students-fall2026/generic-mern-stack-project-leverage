import express from 'express'
import fs from 'fs'

//load the profile once, when the server starts
const profile = JSON.parse(
  fs.readFileSync(new URL('../data/profile.json', import.meta.url)),
)

const router = express.Router()

router.get('/', (req, res) => {
  res.json(profile)
})

//not saving anything yet, just send back what we got
router.post('/', (req, res) => {
  const { name, email, city } = req.body
  if (!name || !email || !city) {
    return res.status(400).json({ error: 'Name, email and city are required' })
  }
  res.json({ name, email, city })
})

export default router
