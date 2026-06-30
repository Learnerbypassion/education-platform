import { Link } from 'react-router-dom';
import { HiOutlineUsers, HiOutlineStar } from 'react-icons/hi';
import { getCategoryLabel, getDifficultyColor, truncateText, getInitials } from '../../utils/helpers';

const CourseCard = ({ course }) => {
  const creator = course.creatorId || {};

  return (
    <Link to={`/courses/${course._id}`} className="glass-card overflow-hidden hover-lift" id={`course-${course._id}`}>
      <div className="h-40 overflow-hidden bg-gradient-to-br from-brand-50 via-slate-50 to-brand-100 dark:from-slate-800 dark:via-slate-900 dark:to-brand-950/40">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
        ) : (
          <div className="flex h-full items-end bg-gradient-to-br from-brand-500/80 to-brand-700/80 p-4 text-sm font-semibold text-white">
            <span>{getCategoryLabel(course.category)}</span>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="badge badge-primary uppercase tracking-wide">{getCategoryLabel(course.category)}</span>
          <span className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold capitalize dark:border-slate-700" style={{ color: getDifficultyColor(course.difficulty) }}>
            {course.difficulty}
          </span>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{truncateText(course.title, 60)}</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{truncateText(course.shortDescription || course.description, 80)}</p>
        <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {creator.profileImage ? <img src={creator.profileImage} alt={creator.name} className="h-full w-full rounded-full object-cover" /> : getInitials(creator.name)}
            </div>
            <span>{creator.name || 'Instructor'}</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1"><HiOutlineUsers /> {course.enrollmentCount || 0}</span>
            {course.rating?.average > 0 && (
              <span className="flex items-center gap-1"><HiOutlineStar /> {course.rating.average.toFixed(1)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
