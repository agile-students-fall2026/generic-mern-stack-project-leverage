import { use, expect } from 'chai'
import { default as chaiHttp, request } from 'chai-http'
import app from '../app.js'

use(chaiHttp)

// these tests run in order, because marking as read changes the notifications in memory
describe('notification routes', () => {
  it('GET /notifications returns all notifications, newest first', done => {
    request
      .execute(app)
      .get('/notifications')
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(res.body).to.be.an('array').with.lengthOf(4)
        expect(res.body[0].id).to.equal('ntf-1')
        expect(res.body[0].read).to.equal(false)
        expect(res.body[3].id).to.equal('ntf-4')
        done()
      })
  })

  it('POST /notifications/read marks one notification as read', done => {
    request
      .execute(app)
      .post('/notifications/read')
      .send({ id: 'ntf-1' })
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(res.body.success).to.equal(true)

        // only ntf-1 changed, ntf-2 is still unread
        request
          .execute(app)
          .get('/notifications')
          .end((getErr, getRes) => {
            expect(getRes.body[0].read).to.equal(true)
            expect(getRes.body[1].read).to.equal(false)
            done()
          })
      })
  })

  it('POST /notifications/read returns a 404 for an unknown id', done => {
    request
      .execute(app)
      .post('/notifications/read')
      .send({ id: 'nope' })
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(404)
        expect(res.body.error).to.equal('Notification not found.')
        done()
      })
  })

  it('POST /notifications/read with no id marks all as read', done => {
    request
      .execute(app)
      .post('/notifications/read')
      .send({})
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)

        request
          .execute(app)
          .get('/notifications')
          .end((getErr, getRes) => {
            for (const notification of getRes.body) {
              expect(notification.read).to.equal(true)
            }
            done()
          })
      })
  })
})
