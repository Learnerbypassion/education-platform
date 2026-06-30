import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses } from '../store/slices/courseSlice';
import CourseCard from '../components/course/CourseCard';
import Loader from '../components/common/Loader';
import { CATEGORIES, DIFFICULTIES } from '../utils/constants';
import { HiOutlineSearch, HiOutlineAdjustments } from 'react-icons/hi';
import { useDebounce } from '../hooks/useDebounce';

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
    <div className="px-4 py-12 sm:px-6 lg:px-8 animate-page-enter">
      <div className="mx-auto max-w-7xl">
        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white font-heading">Explore <span className="gradient-text">courses</span></h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">Browse a thoughtful collection of courses from expert instructors.</p>
        </div>

        <div className="glass-card mt-10 grid gap-4 p-5 md:grid-cols-[1.3fr_0.7fr_0.7fr] animate-slide-up delay-1">
          <div className="relative hover-lift">
            <HiOutlineSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input type="text" className="input-field pl-12 h-12" placeholder="Search courses..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} id="course-search" />
          </div>
          <div className="hover-lift">
            <select className="input-field h-12" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} id="category-filter">
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="hover-lift">
            <select className="input-field h-12" value={difficulty} onChange={(e) => { setDifficulty(e.target.value); setPage(1); }} id="difficulty-filter">
              <option value="">All Levels</option>
              {DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="mt-16"><Loader text="Loading courses..." /></div>
        ) : courses.length === 0 ? (
          <div className="glass-card mt-12 flex flex-col items-center justify-center px-8 py-20 text-center animate-slide-up delay-2">
            <div className="rounded-full bg-brand-50 p-6 dark:bg-brand-900/40 text-brand-500 mb-6 shadow-glow">
              <HiOutlineAdjustments size={56} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">No courses found</h3>
            <p className="mt-2 text-slate-500">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3 animate-slide-up delay-2">
              {courses.map((course, idx) => (
                <div key={course._id} className={`hover-lift delay-${(idx % 4) + 1}`}>
                  <CourseCard course={course} />
                </div>
              ))}
            </div>
            {pagination && pagination.pages > 1 && (
              <div className="mt-12 flex flex-wrap justify-center gap-3 animate-slide-up delay-3">
                {Array.from({ length: pagination.pages }, (_, i) => (
                  <button key={i} className={`btn ${page === i + 1 ? 'btn-primary shadow-glow' : 'btn-outline'} btn-sm px-4`} onClick={() => setPage(i + 1)}>
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
