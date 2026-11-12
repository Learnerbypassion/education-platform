import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineArrowRight, HiOutlineClock } from 'react-icons/hi';
import { getCategoryLabel, truncateText, getInitials, getCourseThumbnail } from '../../utils/helpers';
import './CourseCard.css';

const CourseCard = ({ course }) => {
  const creator = course?.creatorId || {};
  const [imageError, setImageError] = useState(false);

  const thumbnailSrc = imageError ? getCourseThumbnail({ ...course, thumbnail: null }) : getCourseThumbnail(course);

  return (
    <Link to={`/courses/${course?._id}`} className="premium-course-card group" id={`course-${course?._id}`}>
      {/* Thumbnail area */}
      <div className="course-card-image-container">
        <img 
          src={thumbnailSrc} 
          alt={course?.title || 'Course'} 
          className="course-card-img" 
          onError={() => setImageError(true)}
        />
      </div>

      <div className="course-card-body-content">
        <div className="course-card-meta-row">
          <span className="course-card-category-badge">{getCategoryLabel(course?.category)}</span>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 capitalize">
            {course?.difficulty || 'All Levels'}
          </span>
          {course?.isPublished === false && (
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              Draft
            </span>
          )}
        </div>

        <h3 className="course-card-heading text-slate-900 dark:text-white">
          {truncateText(course?.title, 64)}
        </h3>
        
        <p className="course-card-paragraph text-slate-600 dark:text-slate-400">
          {truncateText(course?.shortDescription || course?.description, 90)}
        </p>

        {/* Footer Area with Author & Module/Duration Details */}
        <div className="course-card-footer-info pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="course-card-instructor-info">
            <div className="course-card-instructor-avatar">
              {creator.profileImage ? (
                <img src={creator.profileImage} alt={creator.name} className="h-full w-full rounded-full object-cover" />
              ) : (
                getInitials(creator.name)
              )}
            </div>
            <span className="course-card-instructor-name text-slate-700 dark:text-slate-300">
              {creator.name || 'Faculty Instructor'}
            </span>
          </div>

          <div className="course-card-link-action text-xs font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center gap-1 transition-colors">
            <span>View Course</span>
            <HiOutlineArrowRight size={13} className="transform group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
