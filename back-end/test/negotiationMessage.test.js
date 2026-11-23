import { use, expect } from 'chai'
import { default as chaiHttp, request } from 'chai-http'
import app from '../app.js'

use(chaiHttp)

describe('negotiation message route', () => {
  // With the report included, the message mentions on-time payments.
  it('POST /negotiation-message includes the report when asked', done => {
    request
      .execute(app)
      .post('/negotiation-message')
      .send({ checkId: 'chk-3', proposedRent: 2650, includeReport: true })
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(res.body.message).to.include('31-18 30th Ave, Apt 4B')
        expect(res.body.message).to.include('paid rent on time')
        expect(res.body.message).to.include('Would you consider $2,450')
        done()
      })
  })

  // Without the report, the on-time sentence is left out.
  it('POST /negotiation-message leaves out the report when not asked', done => {
    request
      .execute(app)
      .post('/negotiation-message')
      .send({ checkId: 'chk-3', proposedRent: 2650, includeReport: false })
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(res.body.message).to.not.include('paid rent on time')
        done()
      })
  })

  // A renewal mentions the increase from the current rent.
  it('POST /negotiation-message handles a renewal', done => {
    request
      .execute(app)
      .post('/negotiation-message')
      .send({ checkId: 'chk-3', currentRent: 2500, proposedRent: 2650 })
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(res.body.message).to.include('renewal terms')
        expect(res.body.message).to.include('6% increase')
        done()
      })
  })

  // A rent at or below the local average gets the "looks fair" ending.
  it('POST /negotiation-message says a low rent looks fair', done => {
    request
      .execute(app)
      .post('/negotiation-message')
      .send({ checkId: 'chk-3', proposedRent: 2300 })
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(res.body.message).to.include('below the local average')
        expect(res.body.message).to.include('looks fair')
        done()
      })
  })

  // A missing proposed rent should return a 400.
  it('POST /negotiation-message rejects a missing proposed rent', done => {
    request
      .execute(app)
      .post('/negotiation-message')
      .send({ checkId: 'chk-3', proposedRent: '' })
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(400)
        expect(res.body.error).to.equal('Please enter the proposed rent.')
        done()
      })
  })

  // An unknown check should return a 404.
  it('POST /negotiation-message returns 404 for an unknown check', done => {
    request
      .execute(app)
      .post('/negotiation-message')
      .send({ checkId: 'nope', proposedRent: 2650 })
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(404)
        expect(res.body.error).to.equal('Apartment check not found.')
        done()
      })
  })
})
