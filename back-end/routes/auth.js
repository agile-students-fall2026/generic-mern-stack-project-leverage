import express from 'express'
import fs from 'fs'

// load the existing users once, when the server starts
const users = JSON.parse(
  fs.readFileSync(new URL('../data/users.json', import.meta.url)),
)

const router = express.Router()

router.post('/signup', (req, res) => {
  const { name, email, password, role } = req.body

  // 1. everything filled in
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: 'Please fill in your name, email and password.' })
  }

  // 2. role is one of the two allowed
  if (role !== 'renter' && role !== 'landlord') {
    return res.status(400).json({ error: 'Please choose renter or landlord.' })
  }

  // 3. password is at least 8 characters (same as the form's minLength)
  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: 'Your password must be at least 8 characters.' })
  }

  // 4. email isn't already used (ignore capital letters)
  const emailTaken = users.some(
    user => user.email.toLowerCase() === email.toLowerCase(),
  )
  if (emailTaken) {
    return res
      .status(400)
      .json({ error: 'An account with this email already exists.' })
  }

  // all good: remember the new user until the server restarts
  const newUser = { id: `user-${Date.now()}`, name, email, password, role }
  users.push(newUser)

  // send it back without the password
  res.status(201).json({ id: newUser.id, name, email, role })
})

router.post('/login', (req, res) => {
  const { email, password } = req.body

  // find the user with this email (ignore capital letters)
  const user = users.find(
    u => u.email.toLowerCase() === (email || '').toLowerCase(),
  )

  // no such user, or wrong password
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Incorrect email or password.' })
  }

  // send the user back without the password
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role })
})

router.post('/logout', (req, res) => {
  res.json({ status: 'Logged out' })
})

export default router