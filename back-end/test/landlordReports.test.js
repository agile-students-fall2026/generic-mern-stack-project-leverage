import { use, expect } from 'chai'
import { default as chaiHttp, request } from 'chai-http'
import app from '../app.js'

use(chaiHttp)

describe('landlord reports route', () => {
  it('GET /landlord/reports returns the newest report first', done => {
    request
      .execute(app)
      .get('/landlord/reports')
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(res.body).to.be.an('array')
        for (let i = 1; i < res.body.length; i++) {
          expect(res.body[i - 1].sharedOn >= res.body[i].sharedOn).to.be.true
        }
        done()
      })
  })
})
