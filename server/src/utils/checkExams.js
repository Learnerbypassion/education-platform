const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectDB = require('../config/db');
const Exam = require('../models/Exam');
const Course = require('../models/Course');
const Question = require('../models/Question');
const User = require('../models/User');

const checkExams = async () => {
  try {
    await connectDB();
    const exams = await Exam.find().populate('courseId').populate('createdBy');
    console.log(`Total Exams: ${exams.length}`);
    for (const ex of exams) {
      const qCount = await Question.countDocuments({ examId: ex._id });
      console.log({
        id: ex._id,
        title: ex.title,
        courseTitle: ex.courseId?.title,
        isPublished: ex.isPublished,
        createdBy: ex.createdBy?.name,
        questionCount: qCount,
        maxAttempts: ex.maxAttempts,
        startDate: ex.startDate,
        endDate: ex.endDate,
      });
    }
    process.exit(0);
  } catch (err) {
    console.error('Error checking exams:', err);
    process.exit(1);
  }
};

checkExams();
