import * as Yup from 'yup';
import httpCode from 'http-status-codes';
import errorMessage from '../messages/error';
import Student from '../models/Student';

class StudentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      age: Yup.number()
        .integer()
        .positive()
        .required(),
      height: Yup.number()
        .positive()
        .required(),
      weight: Yup.number()
        .positive()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res
        .status(httpCode.BAD_REQUEST)
        .json({ error: errorMessage.VALIDATION });
    }

    const { id, name, email, age, height, weight } = await Student.create(
      req.body
    );
    return res.json({
      id,
      name,
      email,
      age,
      height,
      weight,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number()
        .integer()
        .positive()
        .required(),
      name: Yup.string(),
      email: Yup.string().email(),
      age: Yup.number()
        .integer()
        .positive(),
      height: Yup.number().positive(),
      weight: Yup.number().positive(),
    });

    if (!(await schema.isValid(req.body))) {
      return res
        .status(httpCode.BAD_REQUEST)
        .json({ error: errorMessage.VALIDATION });
    }

    const student = await Student.findByPk(req.body.id);
    if (!student) {
      return res
        .status(httpCode.BAD_REQUEST)
        .json({ error: errorMessage.STUDENT_NOT_FOUND });
    }
    const { name, email, age, height, weight } = await student.update(req.body);

    return res.json({
      name,
      email,
      age,
      height,
      weight,
    });
  }
}

export default new StudentController();
