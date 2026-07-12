const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Submission = require('../models/Submission');
const ApiError = require('../utils/ApiError');
const { createNotification } = require('../utils/notificationHelper');

class ExamService {
  /**
   * Create an exam with questions.
   */
  async createExam(examData, questions, createdBy) {
    let totalMarks = 0;
    if (questions && questions.length > 0) {
      totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);
    } else {
      totalMarks = Number(examData.totalMarks) || 0;
    }

    if (Number(examData.passingMarks) > totalMarks) {
      throw ApiError.badRequest(`Passing marks (${examData.passingMarks}) cannot be greater than the total marks of the questions (${totalMarks})`);
    }

    const exam = await Exam.create({ ...examData, totalMarks, createdBy });

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
   * Recalculate exam total marks based on its questions.
   */
  async recalculateTotalMarks(examId) {
    const questions = await Question.find({ examId });
    const totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);
    await Exam.findByIdAndUpdate(examId, { totalMarks });
    return totalMarks;
  }

  /**
   * Get exam with questions (for taking).
   * Checks enrollment, publish status, dates, and attempts.
   * Removes correct answers from questions.
   */
  async getExamForStudent(examId, studentId) {
    const exam = await Exam.findById(examId);
    if (!exam) throw ApiError.notFound('Exam not found');

    // Check if exam is published
    if (!exam.isPublished) {
      throw ApiError.badRequest('This exam is not yet published');
    }

    // Check date constraints (only if dates exist)
    const now = new Date();
    if (exam.startDate && now < exam.startDate) {
      throw ApiError.badRequest(`This exam starts on ${exam.startDate.toLocaleDateString()}`);
    }
    if (exam.endDate && now > exam.endDate) {
      throw ApiError.badRequest('This exam has expired');
    }

    // Check enrollment
    const Enrollment = require('../models/Enrollment');
    const enrollment = await Enrollment.findOne({ studentId, courseId: exam.courseId });
    if (!enrollment) {
      throw ApiError.forbidden('You must be enrolled in this course to take this exam');
    }

    // Check max attempts before loading exam
    const status = await this.getAttemptStatus(examId, studentId);
    if (status.attemptsLeft <= 0) {
      throw ApiError.badRequest('Maximum attempts reached for this exam', [], {
        attemptsUsed: status.attemptsUsed,
        totalAllowedAttempts: status.totalAllowedAttempts,
        attemptsLeft: status.attemptsLeft,
        canRequestAttempt: !status.hasPendingRequest,
        requestStatus: status.requestStatus,
      });
    }

    let questions = await Question.find({ examId }).sort({ order: 1 });

    // Randomize if enabled
    if (exam.isRandomized) {
      questions = this.shuffleArray([...questions]);
    }

    // Remove correct answers — never expose to frontend
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

    // Check if exam is published
    if (!exam.isPublished) {
      throw ApiError.badRequest('This exam is not yet published');
    }

    // Check date constraints (only if dates exist)
    const now = new Date();
    if (exam.startDate && now < exam.startDate) {
      throw ApiError.badRequest(`This exam starts on ${exam.startDate.toLocaleDateString()}`);
    }
    if (exam.endDate && now > exam.endDate) {
      throw ApiError.badRequest('This exam has expired');
    }

    // Check enrollment
    const Enrollment = require('../models/Enrollment');
    const enrollment = await Enrollment.findOne({ studentId, courseId: exam.courseId });
    if (!enrollment) {
      throw ApiError.forbidden('You must be enrolled in this course to submit this exam');
    }

    // Check max attempts
    const status = await this.getAttemptStatus(examId, studentId);
    if (status.attemptsLeft <= 0) {
      throw ApiError.badRequest('Maximum attempts reached for this exam', [], {
        attemptsUsed: status.attemptsUsed,
        totalAllowedAttempts: status.totalAllowedAttempts,
        attemptsLeft: status.attemptsLeft,
        canRequestAttempt: !status.hasPendingRequest,
        requestStatus: status.requestStatus,
      });
    }

    // Fetch questions
    const mongoose = require('mongoose');
    const questions = await Question.find({ examId });
    const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));

    // Grade answers
    let score = 0;
    const gradedAnswers = [];

    if (!Array.isArray(answers)) {
      throw ApiError.badRequest('Answers must be an array');
    }

    if (answers.length > questions.length) {
      throw ApiError.badRequest('Number of answers exceeds number of questions');
    }

    const questionIds = answers.map((a) => String(a.questionId));
    if (new Set(questionIds).size !== questionIds.length) {
      throw ApiError.badRequest('Duplicate question answers are not allowed');
    }

    for (const answer of answers) {
      if (!answer.questionId || !mongoose.Types.ObjectId.isValid(answer.questionId)) {
        throw ApiError.badRequest('Invalid question ID');
      }

      const question = questionMap.get(String(answer.questionId));
      if (!question) {
        throw ApiError.badRequest(`Question ${answer.questionId} does not belong to this exam`);
      }

      let isCorrect = false;

      switch (question.type) {
        case 'mcq': {
          if (!answer.selectedOption || typeof answer.selectedOption !== 'string') {
            throw ApiError.badRequest(`Invalid answer payload for question ${question._id}`);
          }
          const optionExists = question.options.some((o) => o.text === answer.selectedOption);
          if (!optionExists) {
             throw ApiError.badRequest(`Invalid option submitted for question ${question._id}`);
          }
          const correctOption = question.options.find((o) => o.isCorrect);
          isCorrect = correctOption && answer.selectedOption === correctOption.text;
          gradedAnswers.push({ questionId: answer.questionId, selectedOption: answer.selectedOption, isCorrect });
          break;
        }
        case 'multiple-correct': {
          if (!Array.isArray(answer.selectedOptions)) {
            throw ApiError.badRequest(`Invalid answer payload for question ${question._id}`);
          }
          const allOptionsValid = answer.selectedOptions.every(opt => question.options.some((o) => o.text === opt));
          if (!allOptionsValid) {
            throw ApiError.badRequest(`Invalid options submitted for question ${question._id}`);
          }
          const correctTexts = [...new Set(question.options.filter((o) => o.isCorrect).map((o) => o.text))].sort();
          const selectedTexts = [...new Set(answer.selectedOptions)].sort();
          isCorrect =
            correctTexts.length === selectedTexts.length &&
            correctTexts.every((t, i) => t === selectedTexts[i]);
          gradedAnswers.push({ questionId: answer.questionId, selectedOptions: answer.selectedOptions, isCorrect });
          break;
        }
        case 'true-false': {
          if (!answer.selectedOption || typeof answer.selectedOption !== 'string') {
            throw ApiError.badRequest(`Invalid answer payload for question ${question._id}`);
          }
          const submittedVal = answer.selectedOption.toLowerCase();
          if (submittedVal !== 'true' && submittedVal !== 'false') {
             throw ApiError.badRequest(`Invalid option submitted for question ${question._id}`);
          }
          isCorrect = submittedVal === question.correctAnswer?.toLowerCase();
          gradedAnswers.push({ questionId: answer.questionId, selectedOption: answer.selectedOption, isCorrect });
          break;
        }
        case 'fill-in-the-blank': {
          if (typeof answer.textAnswer !== 'string') {
            throw ApiError.badRequest(`Invalid answer payload for question ${question._id}`);
          }
          isCorrect = answer.textAnswer.trim().toLowerCase() === question.correctAnswer?.trim().toLowerCase();
          gradedAnswers.push({ questionId: answer.questionId, textAnswer: answer.textAnswer, isCorrect });
          break;
        }
        default:
          isCorrect = false;
          gradedAnswers.push({ questionId: answer.questionId, isCorrect: false });
      }

      if (isCorrect) {
        score += Number(question.marks) || 1;
      }
    }

    score = Math.min(score, exam.totalMarks);

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
      attemptNumber: status.attemptsUsed + 1,
      timeSpent,
      submittedAt: new Date(),
      gradedAt: new Date(),
    });

    // Create notification for student
    createNotification(
      studentId,
      'exam-schedule',
      'Exam Graded 📝',
      `Your exam "${exam.title}" has been graded. Result: ${isPassed ? 'PASSED' : 'FAILED'}. Score: ${score}/${exam.totalMarks}.`,
      `/exams/${examId}/results`
    ).catch(console.error);

    return submission;
  }

  /**
   * Helper to retrieve attempt statistics and request statuses for a student
   */
  async getAttemptStatus(examId, studentId) {
    const exam = await Exam.findById(examId);
    if (!exam) throw ApiError.notFound('Exam not found');

    const attemptsUsed = await Submission.countDocuments({
      examId,
      studentId,
      type: 'exam',
    });

    const ExamAttemptRequest = require('../models/ExamAttemptRequest');

    const approvedRequests = await ExamAttemptRequest.find({
      examId,
      studentId,
      status: 'approved',
    });

    const extraAttempts = approvedRequests.reduce(
      (sum, r) => sum + (r.grantedAttempts || 0),
      0
    );

    const pendingRequest = await ExamAttemptRequest.findOne({
      examId,
      studentId,
      status: 'pending',
    });

    const latestRejectedRequest = await ExamAttemptRequest.findOne({
      examId,
      studentId,
      status: 'rejected',
    }).sort({ updatedAt: -1 });

    const totalAllowedAttempts = exam.maxAttempts + extraAttempts;
    const attemptsLeft = Math.max(totalAllowedAttempts - attemptsUsed, 0);

    return {
      attemptsUsed,
      baseMaxAttempts: exam.maxAttempts,
      extraAttempts,
      totalAllowedAttempts,
      attemptsLeft,
      hasPendingRequest: Boolean(pendingRequest),
      requestStatus: pendingRequest
        ? 'pending'
        : latestRejectedRequest
        ? 'rejected'
        : null,
    };
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
