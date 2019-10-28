import * as Yup from 'yup';
import httpCode from 'http-status-codes';
import User from '../models/User';
import errorMessage from '../messages/error';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    if (!(await schema.isValid(req.body))) {
      return res
        .status(httpCode.BAD_REQUEST)
        .json({ error: errorMessage.VALIDATION });
    }

    const userExists = await User.findOne({ where: { email: req.body.email } });
    if (!userExists) {
      return res
        .status(httpCode.BAD_REQUEST)
        .json({ error: errorMessage.USER_EXISTS });
    }

    const { id, name, email, manager } = await User.create(req.body);
    return res.json({
      id,
      name,
      email,
      manager,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res
        .status(httpCode.BAD_REQUEST)
        .json({ error: errorMessage.VALIDATION });
    }

    const { email, oldPassword } = req.body;
    const user = await User.findByPk(req.userId);
    if (email !== user.email) {
      const userExists = await User.findOne({ where: email });
      if (userExists) {
        return res
          .json(httpCode.BAD_REQUEST)
          .json({ error: errorMessage.USER_EXISTS });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res
        .status(httpCode.UNAUTHORIZED)
        .json({ error: errorMessage.INVALID_PASSWORD });
    }

    const { id, name, manager } = await user.update(req.body);
    return res.json({
      id,
      name,
      manager,
    });
  }
}

export default new UserController();
