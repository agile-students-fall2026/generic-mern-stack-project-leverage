import express from 'express'
import fs from 'fs'

// load the notifications once, when the server starts
const notifications = JSON.parse(
  fs.readFileSync(new URL('../data/notifications.json', import.meta.url)),
)

const router = express.Router()

// all notifications, newest first
router.get('/', (req, res) => {
  const sortedNotifications = [...notifications].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )
  res.json(sortedNotifications)
})

export default router
