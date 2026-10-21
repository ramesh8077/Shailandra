import mongoose from 'mongoose';
const {
  Schema
} = mongoose;
const options = {
  timestamps: true,
  optimisticConcurrency: true
};
export const User = mongoose.model('User', new Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  name: String,
  passwordHash: {
    type: String,
    select: false
  },
  role: {
    type: String,
    enum: ['administrator', 'editor'],
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  sessionVersion: {
    type: Number,
    default: 0
  }
}, options));
const content = new Schema({
  kind: {
    type: String,
    enum: ['post', 'page', 'journey', 'settings'],
    required: true
  },
  key: {
    type: String,
    required: true,
    unique: true
  },
  draft: {
    type: Schema.Types.Mixed,
    required: true
  },
  published: Schema.Types.Mixed,
  draftMedia: [{type:String}],
  publishedMedia: [{type:String}],
  publishedAt: Date,
  trashed: {
    type: Boolean,
    default: false
  },
  revision: {
    type: Number,
    default: 0
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, options);
content.index({draftMedia:1});
content.index({publishedMedia:1,trashed:1});
content.index({kind:1,trashed:1,updatedAt:-1});
content.index({kind:1,'published.locale':1,'published.category':1,publishedAt:-1});
content.index({
  kind: 1,
  trashed: 1,
  publishedAt: -1
});
content.index({
  'published.slug': 1
}, {
  unique: true,
  partialFilterExpression: {
    kind: 'post',
    'published.slug': {
      $type: 'string'
    }
  }
});
content.index({
  'draft.slug': 1
}, {
  unique: true,
  partialFilterExpression: {
    kind: 'post',
    'draft.slug': {
      $type: 'string'
    }
  }
});
content.index({
  kind: 1,
  'published.type': 1,
  publishedAt: -1
});
content.index({
  kind: 1,
  'published.order': 1
});
export const Content = mongoose.model('Content', content);
export const Media = mongoose.model('Media', new Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: String,
  mime: String,
  size: Number,
  width: Number,
  height: Number,
  alt: {
    type: String,
    default: ''
  },
  legacyKey: {
    type: String,
    unique: true,
    sparse: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, options));
Media.schema.index({
  createdAt: -1
});
export const Activity = mongoose.model('Activity', new Schema({
  actor: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  action: String,
  target: String
}, {
  timestamps: true
}));
Activity.schema.index({
  createdAt: -1
});
