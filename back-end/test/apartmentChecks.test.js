import { use, expect } from 'chai'
import { default as chaiHttp, request } from 'chai-http'
import app from '../app.js'

use(chaiHttp)

// a valid apartment in Astoria, each test changes only what it needs
const astoriaApartment = {
  address: '45-10 Broadway, Astoria',
  askingRent: 2600,
  bedrooms: 2,
  bathrooms: 1,
}

describe('apartment check routes', () => {
  describe('GET /apartment-checks', () => {
    it('returns all checks, newest first', done => {
      request
        .execute(app)
        .get('/apartment-checks')
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body).to.be.an('array').with.lengthOf(3)
          expect(res.body[0].id).to.equal('chk-3')
          expect(res.body[2].id).to.equal('chk-1')
          done()
        })
    })
  })

  describe('GET /apartment-checks/:checkId', () => {
    it('returns one check by its id', done => {
      request
        .execute(app)
        .get('/apartment-checks/chk-2')
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body.id).to.equal('chk-2')
          expect(res.body.areaId).to.equal('upper-west-side')
          done()
        })
    })

    it('returns a 404 for an unknown id', done => {
      request
        .execute(app)
        .get('/apartment-checks/nope')
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(404)
          expect(res.body.error).to.equal('Apartment check not found.')
          done()
        })
    })
  })

  describe('POST /apartment-checks', () => {
    it('returns the fair-price result for an apartment', done => {
      request
        .execute(app)
        .post('/apartment-checks')
        .send(astoriaApartment)
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body.areaId).to.equal('astoria')
          expect(res.body.localAverage).to.equal(2450)
          expect(res.body.percentVsAverage).to.equal(6.1)
          expect(res.body.bedrooms).to.equal(2)
          expect(res.body.bathrooms).to.equal(1)
          done()
        })
    })

    it('finds the area from a zip code', done => {
      request
        .execute(app)
        .post('/apartment-checks')
        .send({ ...astoriaApartment, address: '88 Wilson Ave, NY 11237' })
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body.areaId).to.equal('bushwick')
          done()
        })
    })

    it('accepts a studio (0 bedrooms)', done => {
      request
        .execute(app)
        .post('/apartment-checks')
        .send({ ...astoriaApartment, bedrooms: 0 })
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body.bedrooms).to.equal(0)
          done()
        })
    })

    it('rejects a request with no asking rent', done => {
      request
        .execute(app)
        .post('/apartment-checks')
        .send({ ...astoriaApartment, askingRent: undefined })
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(400)
          expect(res.body.error).to.equal(
            'Please enter the address and the asking rent.',
          )
          done()
        })
    })

    it('rejects an address with no area name or zip code', done => {
      request
        .execute(app)
        .post('/apartment-checks')
        .send({ ...astoriaApartment, address: '123 Main St' })
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(400)
          expect(res.body.error).to.include('We could not find that area')
          done()
        })
    })

    it('rejects missing bedrooms and bathrooms', done => {
      request
        .execute(app)
        .post('/apartment-checks')
        .send({ address: astoriaApartment.address, askingRent: 2600 })
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(400)
          expect(res.body.error).to.equal(
            'Please choose the number of bedrooms and bathrooms.',
          )
          done()
        })
    })

    it('rejects bedrooms outside the form choices', done => {
      request
        .execute(app)
        .post('/apartment-checks')
        .send({ ...astoriaApartment, bedrooms: 7 })
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(400)
          done()
        })
    })

    it('rejects bedrooms that are not a number', done => {
      request
        .execute(app)
        .post('/apartment-checks')
        .send({ ...astoriaApartment, bedrooms: 'two' })
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(400)
          done()
        })
    })

    it('rejects 0 bathrooms', done => {
      request
        .execute(app)
        .post('/apartment-checks')
        .send({ ...astoriaApartment, bathrooms: 0 })
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(400)
          done()
        })
    })
  })
})
