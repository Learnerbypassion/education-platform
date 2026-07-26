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

const cleanAndPublishExams = async () => {
  try {
    await connectDB();
    const exams = await Exam.find();
    console.log(`Auditing ${exams.length} exams...`);

    for (const ex of exams) {
      const course = await Course.findById(ex.courseId);
      if (!course) {
        console.log(`Deleting orphan exam "${ex.title}" (ID: ${ex._id}) because course no longer exists.`);
        await Exam.findByIdAndDelete(ex._id);
      } else if (!ex.isPublished) {
        ex.isPublished = true;
        await ex.save();
        console.log(`Published exam "${ex.title}" for course "${course.title}"`);
      }
    }

    console.log('✅ Exam cleanup and publication complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error cleaning exams:', err);
    process.exit(1);
  }
};

cleanAndPublishExams();
