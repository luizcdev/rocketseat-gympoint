import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import httpCode from 'http-status-codes';
import authConfig from '../../config/auth';
import errorMessage from '../messages/error';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authConfig) {
    return res
      .status(httpCode.UNAUTHORIZED)
      .json({ error: errorMessage.TOKEN_NOT_PROVIDED });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    req.userId = decoded.id;

    return next();
  } catch (error) {
    return res
      .status(httpCode.UNAUTHORIZED)
      .json({ error: errorMessage.INVALID_TOKEN });
  }
};
