import { rest, setupWorker } from 'msw'
import { factory, oneOf, manyOf, primaryKey } from '@mswjs/data'
import { nanoid } from '@reduxjs/toolkit'
import faker from 'faker'
import seedrandom from 'seedrandom'
import { Server as MockSocketServer } from 'mock-socket'
import { setRandom } from 'txtgen'

import { parseISO } from 'date-fns'

const SESSIONS_PER_USER = 3
const RECENT_NOTIFICATIONS_DAYS = 7

// Add an extra delay to all endpoints, so loading spinners show up.
const ARTIFICIAL_DELAY_MS = 2000

/* RNG setup */

// Set up a seeded random number generator, so that we get
// a consistent set of users / entries each time the page loads.
// This can be reset by deleting this localStorage value,
// or turned off by setting `useSeededRNG` to false.
let useSeededRNG = true

let rng = seedrandom()

if (useSeededRNG) {
  let randomSeedString = localStorage.getItem('randomTimestampSeed')
  let seedDate

  if (randomSeedString) {
    seedDate = new Date(randomSeedString)
  } else {
    seedDate = new Date()
    randomSeedString = seedDate.toISOString()
    localStorage.setItem('randomTimestampSeed', randomSeedString)
  }

  rng = seedrandom(randomSeedString)
  setRandom(rng)
  faker.seed(seedDate.getTime())
}

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(rng() * (max - min + 1)) + min
}

const randomFromArray = (array) => {
  const index = getRandomInt(0, array.length - 1)
  return array[index]
}

/* MSW Data Model Setup */

export const db = factory({
  user: {
    id: primaryKey(nanoid),
    firstName: String,
    lastName: String,
    name: String,
    username: String,
    sessions: manyOf('session'),
  },
  session: {
    id: primaryKey(nanoid),
    title: String,
    date: String,
    content: String,
    user: oneOf('user'),
  },
})

const createUserData = () => {
  const firstName = faker.name.firstName()
  const lastName = faker.name.lastName()

  return {
    firstName,
    lastName,
    name: `${firstName} ${lastName}`,
    username: faker.internet.userName(),
  }
}

const createSessionData = () => {
  return {
    sessionId: 1,
    progress: Math.floor(Math.random()*12 + 1),
    lastWorkedOnDate: faker.date.recent(RECENT_NOTIFICATIONS_DAYS).toISOString(),
    content: {
      step1: {
        instruction: 'instruction',
        options: {
          description: 'description',
          choices: {
            choice1: {
              description: 'choice 1',
              answer: ''
            },
            choice2: {
              description: 'choice 2',
              answer: ''
            }
          },
          videoLink: ''
        }
      },
      step2: {
        instruction: 'instruction',
        options: {
          description: 'description',
          choices: {
            choice1: {
              description: 'choice 1',
              answer: ''
            },
            choice2: {
              description: 'choice 2',
              answer: ''
            },
            choice3: {
              description: 'choice 3',
              answer: ''
            }
          },
          videoLink: ''
        }
      },
    }
  }
}

// Create an initial set of users and posts
  const user = db.user.create(createUserData())
  for (let j = 0; j < SESSIONS_PER_USER; j++) {
    const newSession = createSessionData(user)
    db.session.create(newSession)
  }

const serializeSession = (session) => ({
  ...session,
  user: session.user.id,
})

/* MSW REST API Handlers */

export const handlers = [
  rest.get('/fakeApi/sessions', function (req, res, ctx) {
    const sessions = db.session.getAll().map(serializeSession)
    return res(ctx.delay(ARTIFICIAL_DELAY_MS), ctx.json(sessions))
  }),
  rest.post('/fakeApi/sessions', function (req, res, ctx) {
    const data = req.body

    if (data.content === 'error') {
      return res(
        ctx.delay(ARTIFICIAL_DELAY_MS),
        ctx.status(500),
        ctx.json('Server error saving this session!')
      )
    }

    data.date = new Date().toISOString()

    const user = db.user.findFirst({ where: { id: { equals: data.user } } })
    data.user = user

    const session = db.session.create(data)
    return res(ctx.delay(ARTIFICIAL_DELAY_MS), ctx.json(serializeSession(session)))
  }),
  rest.get('/fakeApi/sessions/:sessionId', function (req, res, ctx) {
    const session = db.session.findFirst({
      where: { id: { equals: req.params.postId } },
    })
    return res(ctx.delay(ARTIFICIAL_DELAY_MS), ctx.json(serializeSession(session)))
  }),
  rest.patch('/fakeApi/sessions/:sessionId', (req, res, ctx) => {
    const { id, ...data } = req.body
    const updatedSession = db.session.update({
      where: { id: { equals: req.params.sessionId } },
      data,
    })
    return res(
      ctx.delay(ARTIFICIAL_DELAY_MS),
      ctx.json(serializeSession(updatedSession))
    )
  }),
]

export const worker = setupWorker(...handlers)
// worker.printHandlers() // Optional: nice for debugging to see all available route handlers that will be intercepted

/* Mock Websocket Setup */

const socketServer = new MockSocketServer('ws://localhost')

let currentSocket

const sendMessage = (socket, obj) => {
  socket.send(JSON.stringify(obj))
}

// Allow our UI to fake the server pushing out some notifications over the websocket,
// as if other users were interacting with the system.
const sendRandomNotifications = (socket, since) => {
  const numNotifications = getRandomInt(1, 5)

  const notifications = generateRandomNotifications(since, numNotifications, db)

  sendMessage(socket, { type: 'notifications', payload: notifications })
}

export const forceGenerateNotifications = (since) => {
  sendRandomNotifications(currentSocket, since)
}

socketServer.on('connection', (socket) => {
  currentSocket = socket

  socket.on('message', (data) => {
    const message = JSON.parse(data)

    switch (message.type) {
      case 'notifications': {
        const since = message.payload
        sendRandomNotifications(socket, since)
        break
      }
      default:
        break
    }
  })
})

/* Random Notifications Generation */

const notificationTemplates = [
  'updated',
  'logged in',
  'logged out',
]

function generateRandomNotifications(since, numNotifications, db) {
  const now = new Date()
  let sessionDate

  if (since) {
    sessionDate = parseISO(since)
  } else {
    sessionDate = new Date(now.valueOf())
    sessionDate.setMinutes(sessionDate.getMinutes() - 15)
  }

  // Create N random notifications. We won't bother saving these
  // in the DB - just generate a new batch and return them.
  const notifications = [...Array(numNotifications)].map(() => {
    const user = randomFromArray(db.user.getAll())
    const template = randomFromArray(notificationTemplates)
    return {
      id: nanoid(),
      date: faker.date.between(sessionDate, now).toISOString(),
      message: template,
      user: user.id,
    }
  })

  return notifications
}
