import * as Yup from 'yup';
import httpCode from 'http-status-codes';
import { addMonths, parseISO } from 'date-fns';
import errorMessage from '../messages/error';
import Subscription from '../models/Subscription';
import Student from '../models/Student';
import Plan from '../models/Plan';

class SubscriptionController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const plans = await Subscription.findAll({
      attributes: ['id', 'start_date', 'end_date', 'price'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name'],
        },
      ],
    });

    return res.json(plans);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number()
        .integer()
        .positive()
        .required(),
      plan_id: Yup.number()
        .integer()
        .positive()
        .required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res
        .status(httpCode.BAD_REQUEST)
        .json({ error: errorMessage.VALIDATION });
    }

    const { plan_id, student_id, start_date } = req.body;

    const plan = await Plan.findAll({
      where: {
        id: plan_id,
      },
    });

    if (!plan) {
      return res
        .status(httpCode.BAD_REQUEST)
        .json({ error: errorMessage.PLAN_NOT_FOUND });
    }

    const student = await Student.findAll({
      where: {
        id: student_id,
      },
    });

    if (!student) {
      return res
        .status(httpCode.BAD_REQUEST)
        .json({ error: errorMessage.STUDENT_NOT_FOUND });
    }

    const parsedStartDate = parseISO(start_date);
    const endDate = addMonths(start_date, plan.duration);
    const price = plan.price * plan.duration;

    const subscription = await Subscription.create({
      student_id,
      plan_id,
      price,
      start_date: parsedStartDate,
      end_date: endDate,
    });

    return res.json({ subscription });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number()
        .integer()
        .positive()
        .required(),
      student_id: Yup.number()
        .integer()
        .positive(),
      plan_id: Yup.number()
        .integer()
        .positive(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res
        .status(httpCode.BAD_REQUEST)
        .json({ error: errorMessage.VALIDATION });
    }

    const { plan_id, student_id } = req.body;

    if (plan_id) {
      const plan = await Plan.findAll({
        where: {
          id: plan_id,
        },
      });

      if (!plan) {
        return res
          .status(httpCode.BAD_REQUEST)
          .json({ error: errorMessage.PLAN_NOT_FOUND });
      }
    }

    if (student_id) {
      const student = await Student.findAll({
        where: {
          id: student_id,
        },
      });

      if (!student) {
        return res
          .status(httpCode.BAD_REQUEST)
          .json({ error: errorMessage.STUDENT_NOT_FOUND });
      }
    }

    const subscription = await Subscription.update(req.body);

    return res.json({ subscription });
  }

  async delete(req, res) {
    const subscription = await Subscription.findByPk(req.params.id);

    if (!subscription) {
      return res
        .status(httpCode.BAD_REQUEST)
        .json({ error: errorMessage.PLAN_NOT_FOUND });
    }

    await subscription.delete();

    return res.status(httpCode.OK);
  }
}

export default new SubscriptionController();
