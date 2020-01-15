import * as Yup from 'yup';
import httpCode from 'http-status-codes';
import errorMessage from '../messages/error';
import Plan from '../models/Plan';

class PlanController {
  async index(req, res) {
    const plans = await Plan.findAll({
      attributes: ['id', 'title', 'duration', 'price'],
    });

    return res.json(plans);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number()
        .integer()
        .positive()
        .required(),
      price: Yup.number()
        .positive()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res
        .status(httpCode.BAD_REQUEST)
        .json({ error: errorMessage.VALIDATION });
    }

    const { id, title, duration, price } = await Plan.create(req.body);

    return res.json({
      id,
      title,
      duration,
      price,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number()
        .integer()
        .positive()
        .required(),
      title: Yup.string(),
      duration: Yup.number()
        .integer()
        .positive(),
      price: Yup.number().positive(),
    });

    if (!(await schema.isValid(req.body))) {
      return res
        .status(httpCode.BAD_REQUEST)
        .json({ error: errorMessage.VALIDATION });
    }

    const plan = await Plan.findByPk(req.body.id);
    if (!plan) {
      return res
        .status(httpCode.BAD_REQUEST)
        .json({ error: errorMessage.PLAN_NOT_FOUND });
    }

    const { title, duration, price } = await plan.update(req.body);

    return res.json({
      title,
      duration,
      price,
    });
  }

  async delete(req, res) {
    const plan = await Plan.findByPk(req.params.id);

    if (!plan) {
      return res
        .status(httpCode.BAD_REQUEST)
        .json({ error: errorMessage.PLAN_NOT_FOUND });
    }

    await plan.delete();

    return res.status(httpCode.OK);
  }
}

export default new PlanController();
