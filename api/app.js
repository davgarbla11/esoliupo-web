import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js'
import routes from './routes/index.js'

const app = express()

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

app.use('/api', routes)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
