const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: 320,
      default: '',
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    author: {
      type: String,
      default: 'Anonymous',
    },
    categories: [{
      type: String,
      trim: true,
    }],
    tags: [{
      type: String,
      trim: true,
    }],
    featuredImage: {
      type: String,
      default: null,
    },
    featuredImageAlt: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },
    seoTitle: {
      type: String,
      trim: true,
      maxlength: 70,
      default: '',
    },
    seoDescription: {
      type: String,
      trim: true,
      maxlength: 160,
      default: '',
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Blog', blogSchema);
