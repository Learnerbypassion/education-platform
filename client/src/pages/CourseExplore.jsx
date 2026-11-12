import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses } from '../store/slices/courseSlice';
import CourseCard from '../components/course/CourseCard';
import Loader from '../components/common/Loader';
import CustomSelect from '../components/common/CustomSelect';
import { CATEGORIES, DIFFICULTIES } from '../utils/constants';
import { HiOutlineSearch, HiOutlineAdjustments, HiOutlineTag, HiOutlineAcademicCap } from 'react-icons/hi';
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
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-white px-4 py-8 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="space-y-8">
        
        {/* Editorial Header */}
        <div className="space-y-2.5 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Curriculum Directory</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 dark:text-white">
            Course Catalog
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Browse structured courses with interactive modules, assignments, and examination pathways leading to verified credentials.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="explore-filter-bar grid gap-3 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <div className="explore-search-wrapper">
            <input 
              type="text" 
              className="explore-search-input" 
              placeholder="Search by course title or keyword..." 
              value={search} 
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
              id="course-search" 
            />
            <HiOutlineSearch className="explore-search-icon-pos" size={18} />
          </div>
          
          <div className="relative z-30">
            <CustomSelect
              id="category-filter"
              name="category"
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              options={[{ value: '', label: 'All Disciplines' }, ...CATEGORIES]}
              placeholder="All Disciplines"
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
          <div className="py-20 flex justify-center"><Loader text="Loading catalog..." /></div>
        ) : courses.length === 0 ? (
          <div className="empty-state-card py-16">
            <div className="empty-state-icon-box">
              <HiOutlineAdjustments size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No matching courses</h3>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 max-w-sm">
              Adjust your search keywords or filter criteria to discover available courses.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <div key={course._id}>
                  <CourseCard course={course} />
                </div>
              ))}
            </div>
            
            {pagination && pagination.pages > 1 && (
              <div className="mt-12 flex justify-center pt-6 border-t border-slate-200 dark:border-slate-800">
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
