import { Link } from 'react-router-dom';
import { HiOutlineUsers, HiOutlineClock, HiOutlineStar } from 'react-icons/hi';
import { getCategoryLabel, getDifficultyColor, truncateText, getInitials } from '../../utils/helpers';
import './CourseCard.css';

const CourseCard = ({ course }) => {
  const creator = course.creatorId || {};

  return (
    <Link to={`/courses/${course._id}`} className="course-card glass-card animate-fade-in-up" id={`course-${course._id}`}>
      <div className="course-card-thumb">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} />
        ) : (
          <div className="course-card-thumb-placeholder">
            <span>{getCategoryLabel(course.category)}</span>
          </div>
        )}
        <span className="course-card-difficulty" style={{ '--diff-color': getDifficultyColor(course.difficulty) }}>
          {course.difficulty}
        </span>
      </div>
      <div className="course-card-body">
        <span className="course-card-category badge badge-primary">{getCategoryLabel(course.category)}</span>
        <h3 className="course-card-title">{truncateText(course.title, 60)}</h3>
        <p className="course-card-desc">{truncateText(course.shortDescription || course.description, 80)}</p>
        <div className="course-card-footer">
          <div className="course-card-instructor">
            {creator.profileImage ? (
              <img src={creator.profileImage} alt={creator.name} className="avatar avatar-sm" />
            ) : (
              <div className="avatar avatar-sm avatar-placeholder">{getInitials(creator.name)}</div>
            )}
            <span>{creator.name || 'Instructor'}</span>
          </div>
          <div className="course-card-stats">
            <span><HiOutlineUsers /> {course.enrollmentCount || 0}</span>
            {course.rating?.average > 0 && (
              <span><HiOutlineStar /> {course.rating.average.toFixed(1)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
