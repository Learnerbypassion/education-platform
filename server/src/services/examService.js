const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Submission = require('../models/Submission');
const ApiError = require('../utils/ApiError');

class ExamService {
  /**
   * Create an exam with questions.
   */
  async createExam(examData, questions, createdBy) {
    const exam = await Exam.create({ ...examData, createdBy });

    if (questions && questions.length > 0) {
      const questionsWithExamId = questions.map((q, index) => ({
        ...q,
        examId: exam._id,
        order: index,
      }));
      await Question.insertMany(questionsWithExamId);
    }

    return exam;
  }

  /**
   * Get exam with questions (for taking).
   * Removes correct answers from questions.
   */
  async getExamForStudent(examId) {
    const exam = await Exam.findById(examId);
    if (!exam) throw ApiError.notFound('Exam not found');

    let questions = await Question.find({ examId }).sort({ order: 1 });

    // Randomize if enabled
    if (exam.isRandomized) {
      questions = this.shuffleArray([...questions]);
    }

    // Remove correct answers
    const sanitized = questions.map((q) => {
      const obj = q.toObject();
      delete obj.correctAnswer;
      if (obj.options) {
        obj.options = obj.options.map(({ text }) => ({ text }));
      }
      return obj;
    });

    return { exam, questions: sanitized };
  }

  /**
   * Submit and auto-grade an exam.
   */
  async submitExam(examId, studentId, courseId, answers, timeSpent) {
    const exam = await Exam.findById(examId);
    if (!exam) throw ApiError.notFound('Exam not found');

    // Check max attempts
    const attemptCount = await Submission.countDocuments({
      examId,
      studentId,
      type: 'exam',
    });

    if (attemptCount >= exam.maxAttempts) {
      throw ApiError.badRequest('Maximum attempts reached');
    }

    // Fetch questions
    const questions = await Question.find({ examId });
    const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));

    // Grade answers
    let score = 0;
    const gradedAnswers = answers.map((answer) => {
      const question = questionMap.get(answer.questionId);
      if (!question) return { ...answer, isCorrect: false };

      let isCorrect = false;

      switch (question.type) {
        case 'mcq': {
          const correctOption = question.options.find((o) => o.isCorrect);
          isCorrect = correctOption && answer.selectedOption === correctOption.text;
          break;
        }
        case 'multiple-correct': {
          const correctTexts = question.options
            .filter((o) => o.isCorrect)
            .map((o) => o.text)
            .sort();
          const selectedTexts = (answer.selectedOptions || []).sort();
          isCorrect =
            correctTexts.length === selectedTexts.length &&
            correctTexts.every((t, i) => t === selectedTexts[i]);
          break;
        }
        case 'true-false': {
          isCorrect =
            answer.selectedOption?.toLowerCase() ===
            question.correctAnswer?.toLowerCase();
          break;
        }
        case 'fill-in-the-blank': {
          isCorrect =
            answer.textAnswer?.trim().toLowerCase() ===
            question.correctAnswer?.trim().toLowerCase();
          break;
        }
        default:
          isCorrect = false;
      }

      if (isCorrect) score += question.marks;

      return { ...answer, isCorrect };
    });

    const percentage = exam.totalMarks > 0 ? (score / exam.totalMarks) * 100 : 0;
    const isPassed = score >= exam.passingMarks;

    const submission = await Submission.create({
      studentId,
      examId,
      courseId,
      type: 'exam',
      answers: gradedAnswers,
      score,
      totalMarks: exam.totalMarks,
      percentage: Math.round(percentage * 100) / 100,
      isPassed,
      attemptNumber: attemptCount + 1,
      timeSpent,
      submittedAt: new Date(),
      gradedAt: new Date(),
    });

    return submission;
  }

  /**
   * Shuffle array (Fisher-Yates).
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

module.exports = new ExamService();
