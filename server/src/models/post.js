import mongoose from 'mongoose';
import slugify from 'slugify';

const commentSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  commenter: {
    type: String,
    required: true,
    trim: true
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  commentedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const postSchema = new mongoose.Schema({
  
  slug: {
    type: String,
    unique: true
  },

  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
    required: [
      function () {
        return this.status === 'publish';
      },
      'A post must have a title when publishing'
    ]
  },

  content: {
    type: String,
    validate: {
      validator: function (val) {
        if (this.status === 'publish') {
          return val && val.length >= 100;
        }
        return true;
      },
      message: 'Content must be at least 100 characters to publish'
    },
    required: [
      function () {
        return this.status === 'publish';
      },
      'Post content is required when publishing'
    ]
  },

  excerpt: {
    type: String,
    trim: true,
    validate: {
      validator: function (val) {
        if (this.status === 'publish') {
          return val && val.length >= 100;
        }
        return true;
      },
      message: 'Post excerpt must be less than 100 characters to publish'
    },
    required: [
      function () {
        return this.status === 'publish';
      },
      'Post excerpt is required when publishing'
    ]
  },

  // Media
  featuredImage: {
    url: String,
    credit: {
      type: String,
      trim: true
    }
  },

  // Authorship
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Categorization
  categories: [{
    type: String,
    enum: ['Technology', 'Travel', 'Food', 'Lifestyle', 'Business'],
    trim: true
  }],

  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],

  // Status & Visibility
  status: {
    type: String,
    enum: ['draft', 'publish', 'archive', 'schedule'],
    default: 'publish'
  },
  publishedAt: {
    type: Date,
    default: null
  },
  scheduledAt: {
    type: Date,
    default: null
  },
  visibility: {
    type: String,
    enum: ['public', 'members-only'],
    default: 'public'
  },

  // SEO
  metaTitle: {
    type: String,
    trim: true
  },
  metaDescription: {
    type: String,
    trim: true
  },

  isCommentable: {
    type: Boolean,
    default: true
  },

  views: {
    type: Number,
    default: 0
  },

  comments: [commentSchema]

 }, 
 { timestamps: true }
); 


// Pre-save slug generation (unchanged)
postSchema.pre('save', async function(next) {
  if (this.isModified('title')) {
    let slug = slugify(this.title, { 
      lower: true, 
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
    
    const slugRegEx = new RegExp(`^${slug}((-[0-9]+)?)$`, 'i');
    const postsWithSlug = await this.constructor.find({ slug: slugRegEx });
    
    if (postsWithSlug.length > 0) {
      slug = `${slug}-${postsWithSlug.length + 1}`;
    }
    
    this.slug = slug;
  }
  next();
});

const Post = mongoose.model("Post", postSchema);
export default Post;