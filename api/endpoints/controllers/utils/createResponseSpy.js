module.exports = function createResponseSpy() {
  const statusSpy = jest.fn()
  const sendSpy = jest.fn()
  let resolve
  const promise = new Promise(function(_resolve) {
    resolve = _resolve
  })
  const response = {
    status(code) {
      statusSpy(code)
      return response
    },
    send(message) {
      sendSpy(message)
      resolve()
    }
  }
  return {
    statusSpy,
    sendSpy,
    response,
    tilDone: promise
  }
}
