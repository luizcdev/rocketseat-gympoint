import httpCode from 'http-status-codes';
import errorMessage from '../messages/error';
import User from '../models/User';

export default async (req, res, next) => {
  if (req.userId) {
    const user = await User.findOne({ where: { id: req.userId } });
    if (!(user && user.manager)) {
      return res
        .status(httpCode.UNAUTHORIZED)
        .json({ error: errorMessage.ACCESS_DENIED });
    }

    return next();
  }
};
