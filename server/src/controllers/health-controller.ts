import type { Request, Response } from 'express'
import * as healthService from '../services/health-service'

/** Controllers translate HTTP <-> services; they hold no logic themselves. */
export function getHealth(_req: Request, res: Response) {
  res.json(healthService.getHealth())
}
