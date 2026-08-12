import express from 'express';
import { optionalAuth } from '../middleware/auth.js';
import { get, list, toggleLike } from '../controllers/communityController.js';


const communityRouter = express.Router();


communityRouter.get('/', optionalAuth , list);
communityRouter.get('/:id' , optionalAuth , get);
communityRouter.post('/:id/like' , optionalAuth , toggleLike);

export default communityRouter;