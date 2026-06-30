import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createCourse, getCourseById, updateCourse, createModule, createLesson } from '../api/courseApi';
import toast from 'react-hot-toast';
import { CATEGORIES, DIFFICULTIES, STRUCTURE_TYPES } from '../utils/constants';
import './CourseCreate.css';

const CourseCreate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    title: '',
    description: '',
    shortDescription: '',
    category: 'web-development',
    difficulty: 'beginner',
    structureType: 'topic-based',
    price: 0,
    estimatedDuration: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState([]);
  const [newModTitle, setNewModTitle] = useState('');
  
  // Lesson outline states
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    type: 'video',
    videoUrl: '',
    content: '',
  });

  const handleAddLesson = async (e, moduleId) => {
    e.preventDefault();
    if (!lessonForm.title.trim()) return;
    try {
      const res = await createLesson(moduleId, { ...lessonForm, courseId: id });
      
      // Update modules state list
      const updated = modules.map(m => {
        if (m._id === moduleId) {
          return { ...m, lessons: [...(m.lessons || []), res.data.data] };
        }
        return m;
      });
      setModules(updated);
      
      // Reset form
      setLessonForm({ title: '', type: 'video', videoUrl: '', content: '' });
      setActiveModuleId(null);
      toast.success('Lesson successfully added!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to add lesson to module');
    }
  };

  useEffect(() => {
    if (isEdit) {
      const loadCourse = async () => {
        try {
          const res = await getCourseById(id);
          const c = res.data.data;
          setForm({
            title: c.title,
            description: c.description,
            shortDescription: c.shortDescription || '',
            category: c.category,
            difficulty: c.difficulty,
            structureType: c.structureType,
            price: c.price || 0,
            estimatedDuration: c.estimatedDuration || '',
          });
          setModules(c.modules || []);
        } catch {
          toast.error('Failed to load course for editing');
        }
      };
      loadCourse();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => formData.append(key, form[key]));
      if (imageFile) formData.append('thumbnail', imageFile);

      if (isEdit) {
        await updateCourse(id, formData);
        toast.success('Course updated successfully!');
      } else {
        const res = await createCourse(form); // API logic supports JSON body for simple creator
        toast.success('Course created successfully!');
        navigate(`/course/${res.data.data._id}/edit`);
      }
    } catch {
      toast.error('Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!newModTitle.trim() || !id) return;
    try {
      const res = await createModule(id, { title: newModTitle.trim() });
      setModules([...modules, res.data.data]);
      setNewModTitle('');
      toast.success('Module added!');
    } catch {
      toast.error('Failed to add module');
    }
  };

  return (
    <div className="create-course-page animate-page-enter">
      <h1 className={`text-4xl font-bold font-heading text-slate-900 dark:text-white ${!isEdit ? 'text-center' : ''}`}>{isEdit ? 'Edit' : 'Create'} <span className="gradient-text">Course</span></h1>
      
      <div className={`create-course-layout animate-slide-up delay-1 ${isEdit ? 'is-edit' : 'is-create'}`}>
        <form onSubmit={handleSubmit} className="create-course-form glass-card" id="course-create-form">
          <div className="input-group">
            <label htmlFor="course-title">Course Title</label>
            <input id="course-title" type="text" className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>

          <div className="input-group">
            <label htmlFor="course-short-desc">Short Description</label>
            <input id="course-short-desc" type="text" className="input-field" placeholder="Brief summary of the course..." value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
          </div>

          <div className="input-group">
            <label htmlFor="course-description">Full Description</label>
            <textarea id="course-description" className="input-field" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>

          <div className="grid grid-2">
            <div className="input-group">
              <label htmlFor="course-category">Category</label>
              <select id="course-category" className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label htmlFor="course-diff">Difficulty Level</label>
              <select id="course-diff" className="input-field" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                {DIFFICULTIES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-3">
            <div className="input-group">
              <label htmlFor="course-structure">Structure Mode</label>
              <select id="course-structure" className="input-field" value={form.structureType} onChange={(e) => setForm({ ...form, structureType: e.target.value })} disabled={isEdit}>
                {STRUCTURE_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label htmlFor="course-price">Price ($)</label>
              <input id="course-price" type="number" min="0" className="input-field" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="input-group">
              <label htmlFor="course-duration">Est. Duration</label>
              <input id="course-duration" type="text" placeholder="e.g. 4 weeks, 20 hours" className="input-field" value={form.estimatedDuration} onChange={(e) => setForm({ ...form, estimatedDuration: e.target.value })} />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="course-thumbnail">Thumbnail Image</label>
            <input id="course-thumbnail" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Saving...' : 'Save Course'}
          </button>
        </form>

        {isEdit && (
          <div className="create-course-outline glass-card">
            <h3>Course Curriculum Outline</h3>
            
            <form onSubmit={handleAddModule} className="add-module-form" id="add-module-form">
              <input type="text" className="input-field" placeholder="New Module Title..." value={newModTitle} onChange={(e) => setNewModTitle(e.target.value)} required />
              <button type="submit" className="btn btn-accent btn-sm">Add Module</button>
            </form>

            <div className="outline-modules-list">
              {modules.map((mod, i) => (
                <div key={mod._id} className="outline-module-container">
                  <div className="outline-module-header">
                    <span>{i + 1}. {mod.title}</span>
                    <div className="outline-module-actions">
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setActiveModuleId(activeModuleId === mod._id ? null : mod._id)}>
                        {activeModuleId === mod._id ? 'Cancel' : '+ Add Lesson'}
                      </button>
                      <Link to={`/exams/${id}/create`} className="btn btn-ghost btn-sm">Add Exam</Link>
                    </div>
                  </div>

                  {/* Lessons in this module */}
                  {mod.lessons && mod.lessons.length > 0 && (
                    <div className="outline-lessons-list">
                      {mod.lessons.map((les, idx) => (
                        <div key={les._id} className="outline-lesson-item">
                          <span>📄 {idx + 1}. {les.title} <span className="badge badge-primary">{les.type}</span></span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Lesson Form */}
                  {activeModuleId === mod._id && (
                    <div className="add-lesson-box glass-card">
                      <h4>New Lesson Details</h4>
                      <div className="input-group">
                        <label>Title</label>
                        <input type="text" className="input-field" value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} required />
                      </div>
                      <div className="input-group">
                        <label>Material Type</label>
                        <select className="input-field" value={lessonForm.type} onChange={(e) => setLessonForm({ ...lessonForm, type: e.target.value })}>
                          <option value="video">Video Embed URL Link</option>
                          <option value="document">Text Material / Document</option>
                        </select>
                      </div>
                      {lessonForm.type === 'video' && (
                        <div className="input-group">
                          <label>Video URL (YouTube or Vimeo link)</label>
                          <input type="url" className="input-field" placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..." value={lessonForm.videoUrl} onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })} required />
                        </div>
                      )}
                      <div className="input-group">
                        <label>Text Content / Summary</label>
                        <textarea className="input-field" placeholder="Optional description..." value={lessonForm.content} onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })} />
                      </div>
                      <button type="button" className="btn btn-accent btn-sm" onClick={(e) => handleAddLesson(e, mod._id)}>
                        Add Lesson
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCreate;
