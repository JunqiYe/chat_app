import { WebSocket, Server } from 'mock-socket';

const sockets = {}
export function initServer() {
  // useful to reset sockets when doing TDD and webpack refreshes the app
  for (const socket of Object.values(sockets)) {
    socket.close()
  }

  mockServer()
}

function mockServer() {
  // Of course, your frontend will have to connecto to localhost:4000, otherwise change this
  sockets.mockServer = new Server("ws://localhost:8080")

  sockets.mockServer.on("connection", socket => {
    sockets.server = socket

    // Will be sent any time a client connects
    // socket.send("Hello, world!")

    socket.on("message", data => {
      console.log(data.toString())
      // Do whatever you want with the message, you can use socket.send to send a response
    }
    )
  }
  )
}
