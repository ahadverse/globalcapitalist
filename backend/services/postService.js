const Blog = require('../models/Blog');
const { generateSlug } = require('../utils/generateSlug');

const createUniqueSlug = async (title, excludedId) => {
  const baseSlug = generateSlug(title);
  if (!baseSlug) {
    return '';
  }

  let slug = baseSlug;
  let suffix = 2;
  while (await Blog.exists({ slug, ...(excludedId ? { _id: { $ne: excludedId } } : {}) })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
};

const createPost = async (data) => {
  const slug = await createUniqueSlug(data.title);
  const post = new Blog({
    ...data,
    slug,
  });
  await post.save();
  return post;
};

const getAllPosts = async (filter = {}) => {
  return Blog.find(filter).sort({ createdAt: -1 });
};

const getPostById = async (id) => {
  return Blog.findById(id);
};

const getPublishedPostById = async (id) => {
  return Blog.findOne({ _id: id, status: 'published' });
};

const getPostBySlug = async (slug) => {
  return Blog.findOne({ slug, status: 'published' });
};

const updatePost = async (id, data) => {
  const update = { ...data };
  if (update.title) {
    update.slug = await createUniqueSlug(update.title, id);
  }
  return Blog.findByIdAndUpdate(id, update, { returnDocument: 'after', runValidators: true });
};

const deletePost = async (id) => {
  return Blog.findByIdAndDelete(id);
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  getPublishedPostById,
  getPostBySlug,
  updatePost,
  deletePost,
};
