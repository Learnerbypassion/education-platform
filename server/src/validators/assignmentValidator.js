const Joi = require('joi');

const createAssignmentSchema = Joi.object({
  courseId: Joi.string().required(),
  moduleId: Joi.string().allow(''),
  title: Joi.string().trim().min(3).max(200).required(),
  description: Joi.string().allow(''),
  type: Joi.string().valid('mcq', 'file-submission', 'coding', 'github-project').required(),
  questions: Joi.array().items(
    Joi.object({
      questionText: Joi.string().required(),
      options: Joi.array().items(Joi.string()),
      correctAnswer: Joi.string(),
      marks: Joi.number().min(0),
    })
  ),
  totalMarks: Joi.number().min(0).default(100),
  passingMarks: Joi.number().min(0).default(40),
  dueDate: Joi.date().iso(),
  maxAttempts: Joi.number().integer().min(1).default(1),
  instructions: Joi.string().allow(''),
  isPublished: Joi.boolean().default(false),
});

const updateAssignmentSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200),
  description: Joi.string().allow(''),
  type: Joi.string().valid('mcq', 'file-submission', 'coding', 'github-project'),
  questions: Joi.array().items(
    Joi.object({
      questionText: Joi.string().required(),
      options: Joi.array().items(Joi.string()),
      correctAnswer: Joi.string(),
      marks: Joi.number().min(0),
    })
  ),
  totalMarks: Joi.number().min(0),
  passingMarks: Joi.number().min(0),
  dueDate: Joi.date().iso(),
  maxAttempts: Joi.number().integer().min(1),
  instructions: Joi.string().allow(''),
  isPublished: Joi.boolean(),
  moduleId: Joi.string().allow(''),
}).min(1);

const submitAssignmentSchema = Joi.object({
  answers: Joi.array().items(
    Joi.object({
      questionId: Joi.string(),
      selectedOption: Joi.string().allow(''),
      textAnswer: Joi.string().allow(''),
    })
  ),
  githubUrl: Joi.string().uri().allow(''),
});

module.exports = {
  createAssignmentSchema,
  updateAssignmentSchema,
  submitAssignmentSchema,
};
