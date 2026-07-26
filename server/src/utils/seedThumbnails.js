const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectDB = require('../config/db');
const Course = require('../models/Course');

const categoryImages = {
  'web-development': 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=800&q=80',
  'ui-ux-design': 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=800&q=80',
  'data-science': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
  'machine-learning': 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
  'mobile-development': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80',
  'devops': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
  'cybersecurity': 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
  'programming-languages': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
  'cloud-computing': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
  'other': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
};

const defaultImage = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';

const updateThumbnails = async () => {
  try {
    await connectDB();
    const courses = await Course.find();
    console.log(`Found ${courses.length} courses.`);

    for (const course of courses) {
      const titleLower = (course.title || '').toLowerCase();
      const catLower = (course.category || '').toLowerCase();

      let newImg = categoryImages[course.category] || defaultImage;

      if (titleLower.includes('web') || titleLower.includes('bootcamp') || titleLower.includes('react') || titleLower.includes('javascript')) {
        newImg = categoryImages['web-development'];
      } else if (titleLower.includes('ui') || titleLower.includes('ux') || titleLower.includes('design') || titleLower.includes('figma')) {
        newImg = categoryImages['ui-ux-design'];
      } else if (titleLower.includes('python') || titleLower.includes('data')) {
        newImg = categoryImages['data-science'];
      }

      course.thumbnail = newImg;
      await course.save();
      console.log(`Updated course "${course.title}" with image: ${newImg}`);
    }

    console.log('✅ All course thumbnails updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating thumbnails:', err);
    process.exit(1);
  }
};

updateThumbnails();
