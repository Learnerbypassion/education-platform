const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function check() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');

  const Exam = mongoose.model('Exam', new mongoose.Schema({}, { strict: false }));
  const Submission = mongoose.model('Submission', new mongoose.Schema({}, { strict: false }));
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

  console.log('--- Submissions for User 6a422c05ed0b2792f28eaf69 ---');
  const subs = await Submission.find({ studentId: new mongoose.Types.ObjectId('6a422c05ed0b2792f28eaf69') });
  subs.forEach(s => {
    console.log(`ID: ${s._id}, type: ${s.type}, examId: ${s.examId}, assignmentId: ${s.assignmentId}, score: ${s.score}, isPassed: ${s.isPassed}`);
  });

  console.log('\n--- Exams in DB ---');
  const exams = await Exam.find({});
  exams.forEach(e => {
    console.log(`ID: ${e._id}, Title: ${e.title}, Course: ${e.courseId}, isPublished: ${e.isPublished}`);
  });

  await mongoose.disconnect();
}

check().catch(console.error);
