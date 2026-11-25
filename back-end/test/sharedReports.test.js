import { use, expect } from 'chai'
import { default as chaiHttp, request } from 'chai-http'
import app from '../app.js'

use(chaiHttp)

describe('shared reports route', () => {
  it('GET /shared-reports/rpt-104 returns that report', done => {
    request
      .execute(app)
      .get('/shared-reports/rpt-104')
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(res).to.be.json
        expect(res.body.id).to.equal('rpt-104')
        expect(res.body).to.have.property('linkActive')
        done()
      })
  })

  it('GET /shared-reports with a wrong id returns 404', done => {
    request
      .execute(app)
      .get('/shared-reports/not-a-real-id')
      .end((err, res) => {
        expect(res).to.have.status(404)
        expect(res.body).to.have.property('error')
        done()
      })
  })
})
