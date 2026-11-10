import app from './app.js'

const port = process.env.PORT || 3000

const listener = app.listen(port, () => {
  console.log(`Server running on port: ${port}`)
})

// used by tests to stop the server
const close = () => {
  listener.close()
}

export { close }
