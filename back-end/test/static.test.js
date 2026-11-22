import { use, expect } from 'chai'
import { default as chaiHttp, request } from 'chai-http'
import app from '../app.js'

use(chaiHttp)

describe('static route', () => {
  it('GET /static/about.txt sends the file', done => {
    request.execute(app)
      .get('/static/about.txt')
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        done()
      })
  })
})
