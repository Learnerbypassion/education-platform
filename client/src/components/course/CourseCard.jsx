import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineUsers, HiOutlineStar, HiOutlineArrowRight } from 'react-icons/hi';
import { getCategoryLabel, getDifficultyColor, truncateText, getInitials, getCourseThumbnail } from '../../utils/helpers';
import './CourseCard.css';

const CourseCard = ({ course }) => {
  const creator = course?.creatorId || {};
  const [imageError, setImageError] = useState(false);

  const thumbnailSrc = imageError ? getCourseThumbnail({ ...course, thumbnail: null }) : getCourseThumbnail(course);

  // Map difficulty levels to premium visual dot colors
  const getDifficultyDotClass = (diff) => {
    if (!diff) return 'bg-slate-400';
    const d = diff.toLowerCase();
    if (d.includes('begin')) return 'bg-emerald-500 dark:bg-emerald-400';
    if (d.includes('inter')) return 'bg-amber-500 dark:bg-amber-400';
    if (d.includes('adv') || d.includes('expert')) return 'bg-rose-500 dark:bg-rose-400';
    return 'bg-indigo-500 dark:bg-indigo-400';
  };

  return (
    <Link to={`/courses/${course?._id}`} className="premium-course-card group" id={`course-${course?._id}`}>
      {/* Dynamic light reflecting glow layer */}
      <div className="course-card-glow-reflection" />
      
      {/* Thumbnail area with bottom gradient mask */}
      <div className="course-card-image-container">
        <img 
          src={thumbnailSrc} 
          alt={course?.title || 'Course'} 
          className="course-card-img" 
          onError={() => setImageError(true)}
        />
        <div className="course-card-image-overlay" />
      </div>

      <div className="course-card-body-content">
        <div className="course-card-meta-row">
          <span className="course-card-category-badge">{getCategoryLabel(course.category)}</span>
          <span className="course-card-difficulty-badge">
            <span className={`difficulty-indicator-dot ${getDifficultyDotClass(course.difficulty)}`} />
            <span style={{ color: getDifficultyColor(course.difficulty) }} className="capitalize font-semibold text-[11px]">
              {course.difficulty}
            </span>
          </span>
          {course?.isPublished === false && (
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              Draft
            </span>
          )}
        </div>

        <h3 className="course-card-heading text-slate-900 dark:text-white">
          {truncateText(course.title, 60)}
        </h3>
        
        <p className="course-card-paragraph text-slate-600 dark:text-slate-300">
          {truncateText(course.shortDescription || course.description, 80)}
        </p>

        {/* Separator Line */}
        <div className="course-card-separator" />

        {/* Footer Area with Instructor & Stats */}
        <div className="course-card-footer-info">
          <div className="course-card-instructor-info">
            <div className="course-card-instructor-avatar">
              {creator.profileImage ? (
                <img src={creator.profileImage} alt={creator.name} className="h-full w-full rounded-full object-cover" />
              ) : (
                getInitials(creator.name)
              )}
            </div>
            <span className="course-card-instructor-name text-slate-700 dark:text-slate-300">
              {creator.name || 'Instructor'}
            </span>
          </div>
          
          <div className="course-card-stats-info text-slate-600 dark:text-slate-400">
            <span className="course-stat-item">
              <HiOutlineUsers className="text-[13px] opacity-80" /> 
              <span>{course.enrollmentCount || 0}</span>
            </span>
            {course.rating?.average > 0 && (
              <>
                <div className="course-card-stat-divider" />
                <span className="course-stat-item">
                  <HiOutlineStar className="text-amber-500 text-[13px]" /> 
                  <span className="font-bold text-slate-900 dark:text-white">{course.rating.average.toFixed(1)}</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Premium CTA slide-up reveal button */}
        <div className="course-card-cta-row">
          <span className="course-cta-text">Explore Course</span>
          <HiOutlineArrowRight className="course-cta-arrow" />
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
