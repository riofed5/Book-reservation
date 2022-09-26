import { ForbiddenError, NotFoundError } from '../helpers/apiError'

export const middlewareAdmin = (req: any, res: any, next: any) => {
  const { isAdmin } = req.user
  if (isAdmin) {
    return next()
  } else {
    return next(new ForbiddenError('Admin required !'))
  }
}
