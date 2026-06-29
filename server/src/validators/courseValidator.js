const Joi = require('joi');

const createCourseSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required(),
  description: Joi.string().min(10).max(5000).required(),
  shortDescription: Joi.string().max(300).allow(''),
  category: Joi.string()
    .valid(
      'web-development', 'mobile-development', 'data-science',
      'machine-learning', 'devops', 'cybersecurity', 'cloud-computing',
      'programming-languages', 'database', 'software-engineering',
      'ui-ux-design', 'digital-marketing', 'business', 'other'
    )
    .required(),
  structureType: Joi.string().valid('week-based', 'day-based', 'topic-based').required(),
  difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced', 'expert'),
  language: Joi.string().default('English'),
  tags: Joi.array().items(Joi.string().trim()),
  prerequisites: Joi.array().items(Joi.string()),
  learningOutcomes: Joi.array().items(Joi.string()),
  price: Joi.number().min(0),
  estimatedDuration: Joi.string().allow(''),
});

const updateCourseSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200),
  description: Joi.string().min(10).max(5000),
  shortDescription: Joi.string().max(300).allow(''),
  category: Joi.string().valid(
    'web-development', 'mobile-development', 'data-science',
    'machine-learning', 'devops', 'cybersecurity', 'cloud-computing',
    'programming-languages', 'database', 'software-engineering',
    'ui-ux-design', 'digital-marketing', 'business', 'other'
  ),
  structureType: Joi.string().valid('week-based', 'day-based', 'topic-based'),
  difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced', 'expert'),
  language: Joi.string(),
  tags: Joi.array().items(Joi.string().trim()),
  prerequisites: Joi.array().items(Joi.string()),
  learningOutcomes: Joi.array().items(Joi.string()),
  isPublished: Joi.boolean(),
  price: Joi.number().min(0),
  estimatedDuration: Joi.string().allow(''),
}).min(1);

const createModuleSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required(),
  description: Joi.string().max(1000).allow(''),
  order: Joi.number().integer().min(0),
  structureLabel: Joi.string().allow(''),
});

const createLessonSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required(),
  type: Joi.string().valid('video', 'document', 'resource', 'quiz').required(),
  content: Joi.string().allow(''),
  videoUrl: Joi.string().uri().allow(''),
  duration: Joi.number().min(0),
  order: Joi.number().integer().min(0),
  isFree: Joi.boolean(),
});

module.exports = {
  createCourseSchema,
  updateCourseSchema,
  createModuleSchema,
  createLessonSchema,
};
