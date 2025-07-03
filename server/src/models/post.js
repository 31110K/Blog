import mongoose from 'mongoose';
import slugify from 'slugify';

const commentSchema = new mongoose.Schema({
  commenter_name: {
    type: String,
    required: true,
    trim: true
  },
  commenter_email:{
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function (v) {
        return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
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
  minlength: [5, 'Title must be at least 5 characters'],
},

  content: {
  type: String,
  trim: true,
  validate: [
    {
      validator: function (val) {
        // If publishing or scheduling, content must exist
        if (this.status === 'publish' || this.status === 'schedule') {
          return typeof val === 'string' && val.trim().length > 0;
        }
        return true;
      },
      message: 'Post content is required when publishing'
    },
    {
      validator: function (val) {
        // If publishing or scheduling, content must be at least 100 characters
        if (this.status === 'publish' || this.status === 'schedule') {
          return typeof val === 'string' && val.trim().length >= 100;
        }
        return true;
      },
      message: 'Post content must be at least 100 characters to publish'
    }
  ]
},


  excerpt: {
  type: String,
  trim: true,
  validate: {
    validator: function (val) {
      if (this.status === 'publish' || this.status === 'schedule') {
        return typeof val === 'string' && val.trim().length <= 400;
      }
      return true;
    },
    message: function (props) {
      if (!props.value || props.value.trim().length === 0) {
        return 'Post excerpt is required when publishing';
      }
      return 'Post excerpt must be at most 400 characters to publish';
    }
  }
  },

  featuredImage: {
    url: String,
    credit: {
      type: String,
      trim: true
    }
  },

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },

  categories: [{
    type: String,
    enum: ['Technology', 'Travel', 'Food', 'Lifestyle', 'Business' ,"ArtDesign"],
    trim: true
  }],

  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],

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

}, { timestamps: true });

postSchema.pre('save', async function (next) {
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
  
});

const Post = mongoose.model('Post', postSchema);
export default Post;
