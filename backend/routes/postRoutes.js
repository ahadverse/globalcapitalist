const express = require('express');
const postController = require('../controllers/postController');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/admin', authenticate, postController.getAllPosts);
router.get('/slug/:slug', postController.getPostBySlug);
router.post('/', authenticate, postController.createPost);
router.get('/', postController.getAllPosts);
router.get('/:id', optionalAuth, postController.getPostById);
router.put('/:id', authenticate, postController.updatePost);
router.delete('/:id', authenticate, postController.deletePost);

module.exports = router;
