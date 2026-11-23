import { use, expect } from 'chai'
import { default as chaiHttp, request } from 'chai-http'
import app from '../app.js'

use(chaiHttp)

// gets the followed area IDs, so a test can check the list after a POST
async function followedIds() {
  const res = await request.execute(app).get('/followed-areas')
  return res.body.map(area => area.id)
}

// follows or unfollows an area
function setFollowing(areaId, following) {
  return request
    .execute(app)
    .post('/followed-areas')
    .send({ areaId, following })
}

describe('followed areas routes', () => {
  // The list starts from followed-areas.json, as full areas in the same order.
  it('GET /followed-areas returns the followed areas in order', done => {
    request
      .execute(app)
      .get('/followed-areas')
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(res).to.be.json
        expect(res.body.map(area => area.id)).to.deep.equal([
          'astoria',
          'bushwick',
          'harlem',
        ])
        expect(res.body[0].name).to.equal('Astoria')
        expect(res.body[0].averageRent).to.be.a('number')
        done()
      })
  })

  // Following an area replies with what was sent and adds it to the end of the list.
  it('POST /followed-areas follows an area', async () => {
    const res = await setFollowing('williamsburg', true)
    expect(res).to.have.status(200)
    expect(res.body).to.deep.equal({ areaId: 'williamsburg', following: true })
    expect(await followedIds()).to.deep.equal([
      'astoria',
      'bushwick',
      'harlem',
      'williamsburg',
    ])
  })

  // Following an area that is already followed should not change the list.
  it('POST /followed-areas does not add an area twice', async () => {
    const res = await setFollowing('astoria', true)
    expect(res).to.have.status(200)
    const ids = await followedIds()
    expect(ids.filter(id => id === 'astoria')).to.have.lengthOf(1)
    expect(ids[0]).to.equal('astoria')
  })

  // Unfollowing an area removes it from the list.
  it('POST /followed-areas unfollows an area', async () => {
    const res = await setFollowing('williamsburg', false)
    expect(res).to.have.status(200)
    expect(res.body).to.deep.equal({ areaId: 'williamsburg', following: false })
    expect(await followedIds()).to.deep.equal(['astoria', 'bushwick', 'harlem'])
  })

  // An area ID that does not exist should return 404.
  it('POST /followed-areas returns 404 for an unknown area', async () => {
    const res = await setFollowing('nowhere', true)
    expect(res).to.have.status(404)
    expect(res.body.error).to.equal('No area with this ID')
  })

  // following has to be true or false.
  it('POST /followed-areas returns 400 when following is not true or false', async () => {
    const res = await request
      .execute(app)
      .post('/followed-areas')
      .send({ areaId: 'astoria', following: 'yes' })
    expect(res).to.have.status(400)
    expect(res.body.error).to.equal('Please send following as true or false.')
  })
})
