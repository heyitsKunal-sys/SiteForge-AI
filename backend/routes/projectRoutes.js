import express from 'express';
import { requireAuth } from '../middleware/auth';
import { create, generate, get, list, remove, update } from '../controllers/projectsController.js';




const projectRouter = expressRouter();

projectRouter.get('/', requireAuth , list);
projectRouter.post('/', requireAuth , create);

projectRouter.get('/:id' , requireAuth , get);
projectRouter.patch('/:id' , requireAuth , update);

projectRouter.delete('/:id', requireAuth , remove);
projectRouter.post('/:id/generate' , requireAuth , generate);

// to deploy the project 