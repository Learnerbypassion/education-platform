import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses } from '../store/slices/courseSlice';
import CourseCard from '../components/course/CourseCard';
import Loader from '../components/common/Loader';
import CustomSelect from '../components/common/CustomSelect';
import { CATEGORIES, DIFFICULTIES } from '../utils/constants';
import { HiOutlineSearch, HiOutlineAdjustments, HiOutlineChevronDown, HiOutlineTag, HiOutlineAcademicCap, HiOutlineSparkles, HiOutlineCheckCircle } from 'react-icons/hi';
import { useDebounce } from '../hooks/useDebounce';
import './CourseExplore.css';

const CourseExplore = () => {
  const dispatch = useDispatch();
  const { list: courses = [], loading, pagination } = useSelector((s) => s.courses);
  
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    dispatch(fetchCourses({ search: debouncedSearch, category, difficulty, page, limit: 12 }));
  }, [dispatch, debouncedSearch, category, difficulty, page]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#030303] dark:text-white px-4 py-12 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-colors duration-300">
      <div className="mx-auto max-w-7xl space-y-10">
        
        <div className="text-center sm:text-left space-y-4 max-w-3xl">
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl font-heading text-slate-900 dark:text-white leading-[1.1]">
            Elevate Your Expertise.{' '}
            <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Build Without Limits.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            Discover expert-led courses designed for real-world impact. Learn step-by-step with video modules, hands-on assignments, and verifiable digital certifications.
          </p>

          <div className="flex flex-wrap items-center gap-5 pt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5"><HiOutlineCheckCircle className="text-emerald-500 text-base" /> Structured Modules</span>
            <span className="flex items-center gap-1.5"><HiOutlineCheckCircle className="text-emerald-500 text-base" /> Timed Assessments</span>
            <span className="flex items-center gap-1.5"><HiOutlineCheckCircle className="text-emerald-500 text-base" /> Public Credential Verification</span>
          </div>
        </div>

        <div className="explore-filter-bar grid gap-4 md:grid-cols-[1.3fr_0.7fr_0.7fr]">
          <div className="explore-search-wrapper">
            <input 
              type="text" 
              className="explore-search-input" 
              placeholder="Search courses..." 
              value={search} 
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
              id="course-search" 
            />
            <HiOutlineSearch className="explore-search-icon-pos" size={20} />
          </div>
          
          <div className="relative z-30">
            <CustomSelect
              id="category-filter"
              name="category"
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              options={[{ value: '', label: 'All Categories' }, ...CATEGORIES]}
              placeholder="All Categories"
              icon={HiOutlineTag}
              showSearch={true}
            />
          </div>
          
          <div className="relative z-20">
            <CustomSelect
              id="difficulty-filter"
              name="difficulty"
              value={difficulty}
              onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
              options={[{ value: '', label: 'All Levels' }, ...DIFFICULTIES]}
              placeholder="All Levels"
              icon={HiOutlineAcademicCap}
              showColorDot={true}
            />
          </div>
        </div>

        {loading ? (
          <div className="mt-16 flex justify-center"><Loader text="Loading courses..." /></div>
        ) : courses.length === 0 ? (
          <div className="empty-state-card animate-slide-up mt-12 relative z-1">
            <div className="empty-state-icon-box">
              <HiOutlineAdjustments size={36} />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">No courses found</h3>
            <p className="mt-2 text-sm text-slate-550 dark:text-slate-400 max-w-sm font-medium">Try adjusting your search or filters to find what you are looking for.</p>
          </div>
        ) : (
          <>
            <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3 relative z-1">
              {courses.map((course) => (
                <div key={course._id}>
                  <CourseCard course={course} />
                </div>
              ))}
            </div>
            
            {pagination && pagination.pages > 1 && (
              <div className="mt-12 flex flex-wrap justify-center gap-3 pt-6 border-t border-slate-200 dark:border-white/[0.06]">
                <div className="explore-pagination-capsule">
                  {Array.from({ length: pagination.pages }, (_, i) => (
                    <button 
                      key={i} 
                      className={`pagination-btn-premium ${page === i + 1 ? 'active' : 'inactive'}`} 
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CourseExplore;