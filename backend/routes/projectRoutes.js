import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { create, generate, get, list, loadOwnedProjects, remove, update } from '../controllers/projectsController.js';
import { githubRoute, vercelRoute } from './projectDeploy.js';




const projectRouter = express.Router();

projectRouter.get('/', requireAuth , list);
projectRouter.post('/', requireAuth , create);

projectRouter.get('/:id' , requireAuth , get);
projectRouter.patch('/:id' , requireAuth , update);

projectRouter.delete('/:id', requireAuth , remove);
projectRouter.post('/:id/generate' , requireAuth , generate);

// to deploy the project  on vercel and create a repo on github:
projectRouter.post('/:id/github' , requireAuth , githubRoute(loadOwnedProjects));
projectRouter.post('/:id/deploy' , requireAuth , vercelRoute(loadOwnedProjects));

export default projectRouter;