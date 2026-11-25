import { use, expect } from 'chai'
import { default as chaiHttp, request } from 'chai-http'
import app from '../app.js'

use(chaiHttp)

describe('bank connection routes', () => {
  // The bank connection starts in the disconnected state.
  it('GET /bank-connection returns the starting state', done => {
    request
      .execute(app)
      .get('/bank-connection')
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(res.body).to.deep.equal({ connected: false })
        done()
      })
  })

  // Connecting should save the demo bank connection.
  it('POST /bank-connection connects the demo bank', done => {
    request
      .execute(app)
      .post('/bank-connection')
      .send({})
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(res.body).to.deep.equal({ connected: true })

        request
          .execute(app)
          .get('/bank-connection')
          .end((getErr, getRes) => {
            expect(getErr).to.be.null
            expect(getRes.body).to.deep.equal({
              connected: true,
              bankName: 'Chase',
            })
            done()
          })
      })
  })

  // Disconnecting should clear the saved bank name.
  it('POST /bank-connection disconnects the bank', done => {
    request
      .execute(app)
      .post('/bank-connection')
      .send({ connected: false })
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(res.body).to.deep.equal({ connected: false })
        done()
      })
  })
})

describe('report routes', () => {
  // The GET route should return the saved report data.
  it('GET /report returns the report', done => {
    request
      .execute(app)
      .get('/report')
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(res.body.renterFirstName).to.equal('Maya')
        expect(res.body.bankName).to.equal('Chase')
        done()
      })
  })

  // The sections route should return the renter's selected sections.
  it('POST /report/sections returns an array of sections', done => {
    const sections = ['months', 'onTime']

    request
      .execute(app)
      .post('/report/sections')
      .send({ sections })
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(res.body).to.deep.equal({ sections })
        done()
      })
  })

  // A non-array sections value should be rejected.
  it('POST /report/sections rejects an invalid sections value', done => {
    request
      .execute(app)
      .post('/report/sections')
      .send({ sections: 'months' })
      .end((err, res) => {
        expect(res).to.have.status(400)
        expect(res.body).to.have.property('error')
        done()
      })
  })
})
