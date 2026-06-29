import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses } from '../store/slices/courseSlice';
import CourseCard from '../components/course/CourseCard';
import Loader from '../components/common/Loader';
import { CATEGORIES, DIFFICULTIES } from '../utils/constants';
import { HiOutlineSearch, HiOutlineAdjustments } from 'react-icons/hi';
import { useDebounce } from '../hooks/useDebounce';
import './CourseExplore.css';

const CourseExplore = () => {
  const dispatch = useDispatch();
  const { list: courses, loading, pagination } = useSelector((s) => s.courses);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    dispatch(fetchCourses({ search: debouncedSearch, category, difficulty, page, limit: 12 }));
  }, [dispatch, debouncedSearch, category, difficulty, page]);

  return (
    <div className="explore-page">
      <div className="container">
        <div className="explore-header animate-fade-in-up">
          <h1 className="section-title">Explore <span className="gradient-text">Courses</span></h1>
          <p className="section-subtitle">Discover courses from expert instructors worldwide</p>
        </div>

        {/* Filters */}
        <div className="explore-filters glass-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="explore-search">
            <HiOutlineSearch className="explore-search-icon" />
            <input type="text" className="input-field" placeholder="Search courses..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} id="course-search" />
          </div>
          <select className="input-field" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} id="category-filter">
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <select className="input-field" value={difficulty} onChange={(e) => { setDifficulty(e.target.value); setPage(1); }} id="difficulty-filter">
            <option value="">All Levels</option>
            {DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>

        {/* Results */}
        {loading ? (
          <Loader text="Loading courses..." />
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <HiOutlineAdjustments size={48} />
            <h3>No courses found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-3 explore-grid">
              {courses.map((course) => <CourseCard key={course._id} course={course} />)}
            </div>
            {pagination && pagination.pages > 1 && (
              <div className="explore-pagination">
                {Array.from({ length: pagination.pages }, (_, i) => (
                  <button key={i} className={`btn ${page === i + 1 ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setPage(i + 1)}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CourseExplore;
