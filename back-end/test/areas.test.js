import { use, expect } from 'chai'
import { default as chaiHttp, request } from 'chai-http'
import app from '../app.js'

use(chaiHttp)

// returns just the IDs, so the tests can check which areas came back
function areaIds(areas) {
  return areas.map(area => area.id)
}

describe('areas routes', () => {
  // With no options, every area should come back.
  it('GET /areas returns every area', done => {
    request
      .execute(app)
      .get('/areas')
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(res).to.be.json
        expect(res.body).to.be.an('array').with.lengthOf(12)
        expect(res.body[0]).to.include.all.keys(
          'id',
          'name',
          'borough',
          'zipCodes',
          'averageRent',
          'changePastYear',
          'popular',
        )
        done()
      })
  })

  // popular=true should only return the popular areas.
  it('GET /areas?popular=true returns only popular areas', done => {
    request
      .execute(app)
      .get('/areas?popular=true')
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(areaIds(res.body)).to.deep.equal([
          'astoria',
          'williamsburg',
          'upper-west-side',
        ])
        done()
      })
  })

  // Searching by a ZIP code should find the area with that ZIP code.
  it('GET /areas?search= finds an area by ZIP code', done => {
    request
      .execute(app)
      .get('/areas?search=11102')
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(areaIds(res.body)).to.deep.equal(['astoria'])
        done()
      })
  })

  // Searching by a borough should find every area in it.
  it('GET /areas?search= finds areas by borough', done => {
    request
      .execute(app)
      .get('/areas?search=Brooklyn')
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(areaIds(res.body)).to.deep.equal([
          'williamsburg',
          'bushwick',
          'crown-heights',
          'park-slope',
        ])
        done()
      })
  })

  // A full address that mentions an area should find that area.
  it('GET /areas?search= finds an area from a full address', done => {
    request
      .execute(app)
      .get('/areas')
      .query({ search: '31-18 30th Ave, Astoria' })
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(areaIds(res.body)).to.deep.equal(['astoria'])
        done()
      })
  })

  // A search that matches nothing should return an empty list.
  it('GET /areas?search= returns an empty list when nothing matches', done => {
    request
      .execute(app)
      .get('/areas?search=asdf')
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(res.body).to.be.an('array').that.is.empty
        done()
      })
  })

  // One area by its ID.
  it('GET /areas/:areaId returns one area', done => {
    request
      .execute(app)
      .get('/areas/astoria')
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(res).to.be.json
        expect(res.body.id).to.equal('astoria')
        expect(res.body.name).to.equal('Astoria')
        expect(res.body.borough).to.equal('Queens')
        done()
      })
  })

  // An ID that is not in the list should return 404.
  it('GET /areas/:areaId returns 404 for an unknown area', done => {
    request
      .execute(app)
      .get('/areas/nowhere')
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(404)
        expect(res.body.error).to.equal('No area with this ID')
        done()
      })
  })
})
