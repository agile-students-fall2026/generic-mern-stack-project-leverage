import { use, expect } from 'chai'
import { default as chaiHttp, request } from 'chai-http'
import app from '../app.js'

use(chaiHttp)

describe('Auth routes', () => {
  describe('POST /auth/signup', () => {
    it('creates a new user and does not send back the password', async () => {
      const res = await request
        .execute(app)
        .post('/auth/signup')
        .send({
          name: 'Test Renter',
          email: 'test.renter@example.com',
          password: 'password123',
          role: 'renter',
        })

      expect(res).to.have.status(201)
      expect(res).to.be.json
      expect(res.body).to.include({
        name: 'Test Renter',
        email: 'test.renter@example.com',
        role: 'renter',
      })
      expect(res.body).to.have.property('id')
      expect(res.body).to.not.have.property('password')
    })

    it('accepts the landlord role', async () => {
      const res = await request
        .execute(app)
        .post('/auth/signup')
        .send({
          name: 'Test Landlord',
          email: 'test.landlord@example.com',
          password: 'password123',
          role: 'landlord',
        })

      expect(res).to.have.status(201)
      expect(res.body.role).to.equal('landlord')
    })

    it('rejects an email that is already used', async () => {
      const res = await request
        .execute(app)
        .post('/auth/signup')
        .send({
          name: 'Someone',
          email: 'maya.rahman@example.com',
          password: 'password123',
          role: 'renter',
        })

      expect(res).to.have.status(400)
      expect(res).to.be.json
      expect(res.body.error).to.equal(
        'An account with this email already exists.',
      )
    })

    it('rejects a password shorter than 8 characters', async () => {
      const res = await request
        .execute(app)
        .post('/auth/signup')
        .send({
          name: 'Someone',
          email: 'short@example.com',
          password: 'abc',
          role: 'renter',
        })

      expect(res).to.have.status(400)
      expect(res.body.error).to.equal(
        'Your password must be at least 8 characters.',
      )
    })

    it('rejects a role that is not renter or landlord', async () => {
      const res = await request
        .execute(app)
        .post('/auth/signup')
        .send({
          name: 'Someone',
          email: 'admin@example.com',
          password: 'password123',
          role: 'admin',
        })

      expect(res).to.have.status(400)
      expect(res.body.error).to.equal('Please choose renter or landlord.')
    })

    it('rejects a sign up with missing fields', async () => {
      const res = await request
        .execute(app)
        .post('/auth/signup')
        .send({ email: 'nofields@example.com' })

      expect(res).to.have.status(400)
      expect(res.body.error).to.equal(
        'Please fill in your name, email and password.',
      )
    })
  })

  describe('POST /auth/login', () => {
    it('logs in with the right email and password', async () => {
      const res = await request
        .execute(app)
        .post('/auth/login')
        .send({ email: 'maya.rahman@example.com', password: 'password123' })

      expect(res).to.have.status(200)
      expect(res).to.be.json
      expect(res.body).to.include({
        name: 'Maya Rahman',
        email: 'maya.rahman@example.com',
        role: 'renter',
      })
      expect(res.body).to.not.have.property('password')
    })

    it('rejects a wrong password', async () => {
      const res = await request
        .execute(app)
        .post('/auth/login')
        .send({ email: 'maya.rahman@example.com', password: 'wrongpass' })

      expect(res).to.have.status(401)
      expect(res.body.error).to.equal('Incorrect email or password.')
    })

    it('rejects an email with no account', async () => {
      const res = await request
        .execute(app)
        .post('/auth/login')
        .send({ email: 'nobody@example.com', password: 'password123' })

      expect(res).to.have.status(401)
      expect(res.body.error).to.equal('Incorrect email or password.')
    })

    it('lets a user who just signed up log in', async () => {
      await request.execute(app).post('/auth/signup').send({
        name: 'New User',
        email: 'new.user@example.com',
        password: 'password123',
        role: 'renter',
      })

      const res = await request
        .execute(app)
        .post('/auth/login')
        .send({ email: 'new.user@example.com', password: 'password123' })

      expect(res).to.have.status(200)
      expect(res.body.name).to.equal('New User')
    })
  })

  describe('POST /auth/logout', () => {
    it('confirms the user is logged out', async () => {
      const res = await request.execute(app).post('/auth/logout')

      expect(res).to.have.status(200)
      expect(res).to.be.json
      expect(res.body.status).to.equal('Logged out')
    })
  })

  describe('POST /auth/forgot-password', () => {
    it('gives the same reply for an email with an account', async () => {
      const res = await request
        .execute(app)
        .post('/auth/forgot-password')
        .send({ email: 'maya.rahman@example.com' })

      expect(res).to.have.status(200)
      expect(res.body.status).to.equal(
        'If an account exists for this email, a reset link has been sent.',
      )
    })

    it('gives the same reply for an email with no account', async () => {
      const res = await request
        .execute(app)
        .post('/auth/forgot-password')
        .send({ email: 'nobody@example.com' })

      expect(res).to.have.status(200)
      expect(res.body.status).to.equal(
        'If an account exists for this email, a reset link has been sent.',
      )
    })

    it('rejects a request with no email', async () => {
      const res = await request
        .execute(app)
        .post('/auth/forgot-password')
        .send({})

      expect(res).to.have.status(400)
      expect(res.body.error).to.equal('Please enter your email.')
    })
  })

  describe('POST /auth/reset-password', () => {
    it('accepts a valid new password', async () => {
      const res = await request
        .execute(app)
        .post('/auth/reset-password')
        .send({ password: 'newpass123', confirm: 'newpass123' })

      expect(res).to.have.status(200)
      expect(res.body.status).to.equal('Your password has been updated.')
    })

    it('rejects a password shorter than 8 characters', async () => {
      const res = await request
        .execute(app)
        .post('/auth/reset-password')
        .send({ password: 'abc', confirm: 'abc' })

      expect(res).to.have.status(400)
      expect(res.body.error).to.equal(
        'Your password must be at least 8 characters.',
      )
    })

    it('rejects passwords that do not match', async () => {
      const res = await request
        .execute(app)
        .post('/auth/reset-password')
        .send({ password: 'newpass123', confirm: 'different1' })

      expect(res).to.have.status(400)
      expect(res.body.error).to.equal('The passwords do not match.')
    })
  })
})