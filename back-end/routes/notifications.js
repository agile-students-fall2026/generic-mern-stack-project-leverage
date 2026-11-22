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

// marks one notification as read, or all of them when no id is sent
// this is kept in memory until the server restarts, the database comes in Sprint 3
router.post('/read', (req, res) => {
  let notificationId = null
  if (req.body) {
    notificationId = req.body.id
  }

  if (notificationId) {
    const notification = notifications.find(item => item.id === notificationId)
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found.' })
    }
    notification.read = true
  } else {
    for (const notification of notifications) {
      notification.read = true
    }
  }

  res.json({ success: true })
})

export default router
