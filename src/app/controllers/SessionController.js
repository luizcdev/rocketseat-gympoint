import jwt from 'jsonwebtoken';
import * as Yup from 'yup';
import httpCode from 'http-status-codes';
import authConfig from '../../config/auth';
import errorMessage from '../messages/error';
import User from '../models/User';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res
        .status(httpCode.BAD_REQUEST)
        .json({ error: errorMessage.VALIDATION });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(httpCode.UNAUTHORIZED)
        .json({ error: errorMessage.USER_NOT_FOUND });
    }

    if (!(await user.checkPassword(password))) {
      return res
        .status(httpCode.UNAUTHORIZED)
        .json({ error: errorMessage.INVALID_PASSWORD });
    }

    const { id, name } = user;
    return res.json({
      user: {
        id,
        name,
        email,
      },

      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
