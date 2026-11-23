import { use, expect } from 'chai'
import { default as chaiHttp, request } from 'chai-http'
import app from '../app.js'

use(chaiHttp)

describe('comparables routes', () => {
  // chk-3 is a 2 bed, 1 bath apartment, so every comparable should be the same size.
  it('GET /comparables/:checkId returns apartments with the same bedrooms and bathrooms', done => {
    request
      .execute(app)
      .get('/comparables/chk-3')
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(res).to.be.json
        expect(res.body).to.be.an('array').with.lengthOf(4)
        res.body.forEach(apartment => {
          expect(apartment.checkId).to.equal('chk-3')
          expect(apartment.bedrooms).to.equal(2)
          expect(apartment.bathrooms).to.equal(1)
        })
        done()
      })
  })

  // cmp-9 is near chk-3 but has 1 bedroom, so it should be left out.
  it('GET /comparables/:checkId leaves out apartments of a different size', done => {
    request
      .execute(app)
      .get('/comparables/chk-3')
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        const ids = res.body.map(apartment => apartment.id)
        expect(ids).to.not.include('cmp-9')
        done()
      })
  })

  // Each comparable should have what the Comparables screen shows.
  it('GET /comparables/:checkId returns the fields the screen needs', done => {
    request
      .execute(app)
      .get('/comparables/chk-2')
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(res.body).to.have.lengthOf(2)
        expect(res.body[0]).to.include.all.keys(
          'id',
          'address',
          'rent',
          'bedrooms',
          'bathrooms',
          'distanceMiles',
          'imageUrl',
        )
        done()
      })
  })

  // A check ID that is not saved should return 404.
  it('GET /comparables/:checkId returns 404 for an unknown check', done => {
    request
      .execute(app)
      .get('/comparables/chk-99')
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(404)
        expect(res.body.error).to.equal('Apartment check not found.')
        done()
      })
  })
})
