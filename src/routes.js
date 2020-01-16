import { Router } from 'express';
import UserController from './app/controllers/UserController';
import StudentController from './app/controllers/StudentController';
import SessionController from './app/controllers/SessionController';
import PlanController from './app/controllers/PlanController';
import SubscriptionController from './app/controllers/SubscriptionController';
import authMiddleware from './app/middlewares/auth';
import managerMiddleware from './app/middlewares/manager';

const routes = new Router();

routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.post('/users', UserController.store);
routes.put('/users', UserController.update);

routes.post('/students', managerMiddleware, StudentController.store);
routes.put('/students', managerMiddleware, StudentController.update);

routes.get('/plans', managerMiddleware, PlanController.index);
routes.post('/plans', managerMiddleware, PlanController.store);
routes.put('/plans', managerMiddleware, PlanController.update);
routes.delete('/plans/:id', managerMiddleware, PlanController.delete);

routes.get('/subscriptions', managerMiddleware, SubscriptionController.index);
routes.post('/subscriptions', managerMiddleware, SubscriptionController.store);
routes.put('/subscriptions', managerMiddleware, SubscriptionController.update);
routes.delete(
  '/subscriptions/:id',
  managerMiddleware,
  SubscriptionController.delete
);

export default routes;
