const postService = require('../services/postService');

const allowedFields = [
  'title',
  'content',
  'excerpt',
  'author',
  'categories',
  'tags',
  'featuredImage',
  'featuredImageAlt',
  'seoTitle',
  'seoDescription',
  'status',
];

const getPostData = (body = {}) => Object.fromEntries(
  allowedFields
    .filter((field) => Object.prototype.hasOwnProperty.call(body, field))
    .map((field) => [field, body[field]])
);

const validatePostData = (data, partial = false) => {
  if (!partial && (!data.title || typeof data.title !== 'string' || !data.title.trim())) {
    return 'Title is required';
  }
  if (!partial && (!data.content || typeof data.content !== 'string' || !data.content.trim())) {
    return 'Content is required';
  }
  if (data.title !== undefined && (typeof data.title !== 'string' || !data.title.trim())) {
    return 'Title must be a non-empty string';
  }
  if (data.content !== undefined && (typeof data.content !== 'string' || !data.content.trim())) {
    return 'Content must be a non-empty string';
  }
  if (data.status !== undefined && !['draft', 'published'].includes(data.status)) {
    return 'Status must be draft or published';
  }
  for (const field of ['categories', 'tags']) {
    if (data[field] !== undefined && !Array.isArray(data[field])) {
      return `${field} must be an array`;
    }
    if (Array.isArray(data[field]) && data[field].some((item) => typeof item !== 'string')) {
      return `${field} must contain only strings`;
    }
  }
  for (const field of ['author', 'featuredImage', 'excerpt', 'featuredImageAlt', 'seoTitle', 'seoDescription']) {
    if (data[field] !== undefined && data[field] !== null && typeof data[field] !== 'string') {
      return `${field} must be a string`;
    }
  }
  if (data.excerpt && data.excerpt.length > 320) {
    return 'Excerpt must be 320 characters or fewer';
  }
  if (data.seoTitle && data.seoTitle.length > 70) {
    return 'SEO title must be 70 characters or fewer';
  }
  if (data.seoDescription && data.seoDescription.length > 160) {
    return 'SEO description must be 160 characters or fewer';
  }
  if (data.featuredImageAlt && data.featuredImageAlt.length > 200) {
    return 'Featured image alt text must be 200 characters or fewer';
  }
  return null;
};

const createPost = async (req, res) => {
  const data = getPostData(req.body);
  const validationError = validatePostData(data);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const post = await postService.createPost(data);
  return res.status(201).json(post);
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getAllPosts = async (req, res) => {
  const search = req.query.search ?? req.query.q;
  if (search !== undefined && typeof search !== 'string') {
    return res.status(400).json({ error: 'Search query must be a string' });
  }
  if (search && search.trim().length > 100) {
    return res.status(400).json({ error: 'Search query must be 100 characters or fewer' });
  }

  const filter = req.adminId ? {} : { status: 'published' };
  const term = search?.trim();
  if (term) {
    filter.title = new RegExp(escapeRegex(term), 'i');
  }
  const posts = await postService.getAllPosts(filter);
  return res.json(posts);
};

const getPostById = async (req, res) => {
  const post = req.adminId
    ? await postService.getPostById(req.params.id)
    : await postService.getPublishedPostById(req.params.id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  return res.json(post);
};

const getPostBySlug = async (req, res) => {
  const post = await postService.getPostBySlug(req.params.slug);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  return res.json(post);
};

const updatePost = async (req, res) => {
  const data = getPostData(req.body);
  const validationError = validatePostData(data, true);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: 'At least one post field is required' });
  }
  const post = await postService.updatePost(req.params.id, data);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  return res.json(post);
};

const deletePost = async (req, res) => {
  const post = await postService.deletePost(req.params.id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  return res.json({ message: 'Post deleted' });
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  getPostBySlug,
  updatePost,
  deletePost,
};
