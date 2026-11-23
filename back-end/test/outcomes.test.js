import { use, expect } from 'chai'
import { default as chaiHttp, request } from 'chai-http'
import app from '../app.js'

use(chaiHttp)

describe('outcomes routes', () => {
  // A check with no saved outcome should return null.
  it('GET /outcomes/chk-3 returns null when nothing is saved', done => {
    request
      .execute(app)
      .get('/outcomes/chk-3')
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(res.body).to.be.null
        done()
      })
  })

  // An unknown check should return a 404.
  it('GET /outcomes/nope returns 404', done => {
    request
      .execute(app)
      .get('/outcomes/nope')
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(404)
        expect(res.body.error).to.equal('Apartment check not found.')
        done()
      })
  })

  // A valid outcome should come back with an updatedAt date.
  it('POST /outcomes/chk-3 returns the outcome', done => {
    request
      .execute(app)
      .post('/outcomes/chk-3')
      .send({ outcome: 'rent-lowered', finalRent: 2500, note: 'Agreed' })
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(res.body.outcome).to.equal('rent-lowered')
        expect(res.body.finalRent).to.equal(2500)
        expect(res.body.note).to.equal('Agreed')
        expect(res.body.updatedAt).to.be.a('string')
        done()
      })
  })

  // An outcome that isn't one of the choices should return a 400.
  it('POST /outcomes/chk-3 rejects an invalid outcome', done => {
    request
      .execute(app)
      .post('/outcomes/chk-3')
      .send({ outcome: 'banana' })
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(400)
        expect(res.body.error).to.equal('Please choose an outcome.')
        done()
      })
  })

  // Posting to an unknown check should return a 404.
  it('POST /outcomes/nope returns 404', done => {
    request
      .execute(app)
      .post('/outcomes/nope')
      .send({ outcome: 'rent-lowered' })
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(404)
        done()
      })
  })
})
