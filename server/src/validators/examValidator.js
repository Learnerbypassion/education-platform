const Joi = require('joi');

const createExamSchema = Joi.object({
  courseId: Joi.string().required(),
  title: Joi.string().trim().min(3).max(200).required(),
  description: Joi.string().allow(''),
  duration: Joi.number().integer().min(1).required(),
  passingMarks: Joi.number().integer().min(0).required(),
  totalMarks: Joi.number().integer().min(1).required(),
  maxAttempts: Joi.number().integer().min(1).default(1),
  isRandomized: Joi.boolean().default(true),
  showResults: Joi.boolean().default(true),
  instructions: Joi.string().allow(''),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso(),
});

const createQuestionSchema = Joi.object({
  type: Joi.string()
    .valid('mcq', 'multiple-correct', 'true-false', 'fill-in-the-blank', 'short-answer')
    .required(),
  text: Joi.string().required(),
  options: Joi.array().items(
    Joi.object({
      text: Joi.string().required(),
      isCorrect: Joi.boolean().default(false),
    })
  ),
  correctAnswer: Joi.string().allow(''),
  explanation: Joi.string().allow(''),
  marks: Joi.number().min(0).default(1),
  difficulty: Joi.string().valid('easy', 'medium', 'hard'),
  order: Joi.number().integer().min(0),
});

const submitExamSchema = Joi.object({
  answers: Joi.array()
    .items(
      Joi.object({
        questionId: Joi.string().required(),
        selectedOption: Joi.string().allow(''),
        selectedOptions: Joi.array().items(Joi.string()),
        textAnswer: Joi.string().allow(''),
      })
    )
    .required(),
  timeSpent: Joi.number().integer().min(0),
});

module.exports = {
  createExamSchema,
  createQuestionSchema,
  submitExamSchema,
};
