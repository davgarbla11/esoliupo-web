import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { STORAGE_DIR } from './lib/storage.js'
import { auditLog } from './middlewares/auditLog.middleware.js'
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js'
import routes from './routes/index.js'

const app = express()

app.set('trust proxy', 1)

app.use(helmet())
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
)
app.use(morgan('dev'))
app.use(express.json())
app.use(cookieParser())
app.use(auditLog)

app.use(
  '/api/uploads',
  (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    next()
  },
  express.static(STORAGE_DIR),
)

app.use('/api', routes)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
