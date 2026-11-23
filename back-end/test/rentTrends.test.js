import { use, expect } from 'chai'
import { default as chaiHttp, request } from 'chai-http'
import app from '../app.js'

use(chaiHttp)

describe('rent trends route', () => {
  // A known area should return its rent trend points.
  it('GET /rent-trends/astoria returns the rent trend', done => {
    request
      .execute(app)
      .get('/rent-trends/astoria')
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(res).to.be.json
        expect(res.body.areaId).to.equal('astoria')
        expect(res.body.points).to.be.an('array').that.is.not.empty
        done()
      })
  })

  // An unknown area should return a 404 with an error message.
  it('GET /rent-trends/nowhere returns 404', done => {
    request
      .execute(app)
      .get('/rent-trends/nowhere')
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(404)
        expect(res.body.error).to.equal('No rent trend for this area')
        done()
      })
  })
})
