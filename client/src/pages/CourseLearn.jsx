import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCourseById, updateProgress, getEnrolledCourses, getMySubmissions, startLesson } from '../api/courseApi';
import { getAssignments } from '../api/assignmentApi';
import { getExams, requestExamAttempt } from '../api/examApi';
import { generateCertificate } from '../api/certificateApi';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import { 
  HiOutlineBookOpen, 
  HiOutlineChevronRight, 
  HiOutlineChevronDown, 
  HiOutlinePlay, 
  HiOutlineDocumentText, 
  HiOutlineMenu, 
  HiOutlineX,
  HiOutlineArrowLeft,
  HiOutlineCloudDownload,
  HiOutlineAcademicCap,
  HiOutlineLightningBolt,
  HiOutlineExclamationCircle,
  HiOutlinePencilAlt,
  HiOutlineSparkles
} from 'react-icons/hi';
import './CourseLearn.css';
import DOMPurify from 'dompurify';

const CourseLearn = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [liveProgressMap, setLiveProgressMap] = useState({});
  const [submissions, setSubmissions] = useState([]);
  const [activeModule, setActiveModule] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [viewingAssessments, setViewingAssessments] = useState(false);
  const [certUrl, setCertUrl] = useState(null);
  const [generatingCert, setGeneratingCert] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedWeeks, setExpandedWeeks] = useState({ 1: true });

  // YouTube API Player Refs & States
  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const lastTimeRef = useRef(0);
  const watchedTimeRef = useRef(0);
  const [ytApiReady, setYtApiReady] = useState(false);

  // Modal State for Requesting Extra Attempts
  const [requestingExam, setRequestingExam] = useState(null);
  const [requestCategory, setRequestCategory] = useState('mastery');
  const [requestReasonText, setRequestReasonText] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const fetchCourseData = async () => {
    try {
      const courseRes = await getCourseById(id);
      const data = courseRes.data.data;
      setCourse(data);

      if (data.modules?.length > 0) {
        setActiveModule(data.modules[0]);
        setViewingAssessments(false);
      }

      // Fetch assignments, exams, and submissions
      const [assignmentsRes, examsRes, submissionsRes] = await Promise.all([
        getAssignments(id),
        getExams(id),
        getMySubmissions(),
      ]);
      setAssignments(assignmentsRes.data.data);
      setExams(examsRes.data.data);
      setSubmissions(submissionsRes.data.data);

      const enrolledRes = await getEnrolledCourses();
      const enrollmentObj = enrolledRes.data.data.find(e => e.courseId?._id === id);
      if (enrollmentObj) {
        setCompletedIds(new Set(enrollmentObj.completedLessons || []));
      }
    } catch (err) {
      console.error('Failed to load course contents:', err);
      toast.error(`Failed to load course contents: ${err.message || 'Unknown Error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  // Load YouTube IFrame Player API Script
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setYtApiReady(true);
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(tag, firstScript);
    } else {
      document.head.appendChild(tag);
    }

    const origCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (origCallback) origCallback();
      setYtApiReady(true);
    };
  }, []);

  const getYouTubeId = (lesson) => {
    if (!lesson) return null;
    let rawUrl = lesson.videoEmbedUrl || lesson.videoUrl || (lesson.title && lesson.title.trim().startsWith('http') ? lesson.title.trim() : null);

    if (!rawUrl && lesson.content) {
      const ytMatch = lesson.content.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
      if (ytMatch) return ytMatch[1];
    }

    if (rawUrl) {
      const ytMatch = rawUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
      if (ytMatch) return ytMatch[1];
    }

    if (['video', 'lecture', 'dpp-video'].includes(lesson.type)) {
      return 'g20aiS0Lpuk';
    }

    return null;
  };

  // YouTube Player Lifecycle & Anti-Skipping Progress Tracking
  useEffect(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    if (playerRef.current && typeof playerRef.current.destroy === 'function') {
      try {
        playerRef.current.destroy();
      } catch {
        // ignore cleanup error
      }
      playerRef.current = null;
    }

    lastTimeRef.current = 0;
    watchedTimeRef.current = 0;

    if (!activeLesson) return;
    const isVideo = ['video', 'lecture', 'dpp-video'].includes(activeLesson.type);
    if (!isVideo) return;

    const ytId = getYouTubeId(activeLesson);
    if (!ytId || !ytApiReady || !playerContainerRef.current) return;

    const updateCurrentProgress = () => {
      if (!playerRef.current || typeof playerRef.current.getCurrentTime !== 'function') return;
      try {
        const currentTime = playerRef.current.getCurrentTime() || 0;
        const duration = playerRef.current.getDuration() || 0;
        if (duration > 0) {
          const delta = currentTime - lastTimeRef.current;
          if (delta > 0 && delta <= 3.0) {
            watchedTimeRef.current = Math.min(duration, watchedTimeRef.current + delta);
          }
          lastTimeRef.current = currentTime;

          const watchedPct = Math.min(100, Math.round((watchedTimeRef.current / duration) * 100));
          const currentPct = Math.min(100, Math.round((currentTime / duration) * 100));
          const pct = Math.min(currentPct, watchedPct);

          setLiveProgressMap(prev => {
            if (prev[activeLesson._id] === pct) return prev;
            return { ...prev, [activeLesson._id]: pct };
          });

          if (pct >= 95 && !completedIds.has(activeLesson._id)) {
            updateProgress(activeLesson._id, { percentComplete: 100 }).catch(() => {});
            setCompletedIds(c => new Set([...c, activeLesson._id]));
          }
        }
      } catch {
        // player might be destroyed
      }
    };

    playerRef.current = new window.YT.Player(playerContainerRef.current, {
      videoId: ytId,
      playerVars: {
        autoplay: 1,
        enablejsapi: 1,
        rel: 0,
        modestbranding: 1
      },
      events: {
        onStateChange: (event) => {
          // YT.PlayerState.PLAYING = 1
          if (event.data === 1) {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = setInterval(updateCurrentProgress, 500);
          } else {
            // Paused (2), Ended (0), Buffering (3), Cued (5)
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = null;
            }
            updateCurrentProgress();
            if (event.data === 0 && watchedTimeRef.current / (playerRef.current?.getDuration() || 1) >= 0.90) {
              setLiveProgressMap(prev => ({ ...prev, [activeLesson._id]: 100 }));
              if (!completedIds.has(activeLesson._id)) {
                updateProgress(activeLesson._id, { percentComplete: 100 }).catch(() => {});
                setCompletedIds(c => new Set([...c, activeLesson._id]));
              }
            }
          }
        }
      }
    });

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore
        }
        playerRef.current = null;
      }
    };
  }, [activeLesson, ytApiReady]);

  // Handle real-time video progress tracking via iframe postMessage events (Fallback)
  useEffect(() => {
    if (!activeLesson || completedIds.has(activeLesson._id)) return;
    const isVideo = ['video', 'lecture', 'dpp-video'].includes(activeLesson.type);
    if (!isVideo) return;

    const handleMessage = (event) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (!data) return;

        let currentTime = null;
        let duration = null;

        // YouTube postMessage format (infoDelivery)
        if (data.event === 'infoDelivery' && data.info) {
          if (typeof data.info.currentTime === 'number' && typeof data.info.duration === 'number' && data.info.duration > 0) {
            currentTime = data.info.currentTime;
            duration = data.info.duration;
          }
        }

        // Vimeo postMessage format (timeupdate)
        if (data.event === 'timeupdate' && data.data) {
          if (typeof data.data.seconds === 'number' && typeof data.data.duration === 'number' && data.data.duration > 0) {
            currentTime = data.data.seconds;
            duration = data.data.duration;
          }
        }

        if (currentTime !== null && duration !== null && duration > 0) {
          const pct = Math.min(100, Math.round((currentTime / duration) * 100));
          setLiveProgressMap(prev => {
            if (prev[activeLesson._id] === pct) return prev;
            return { ...prev, [activeLesson._id]: pct };
          });

          if (pct >= 98 && !completedIds.has(activeLesson._id)) {
            updateProgress(activeLesson._id, { percentComplete: 100 }).catch(() => {});
            setCompletedIds(c => new Set([...c, activeLesson._id]));
          }
        }
      } catch {
        // non-JSON message ignored
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [activeLesson, completedIds]);

  const handleModuleSelect = (mod) => {
    setActiveModule(mod);
    setViewingAssessments(false);
    setActiveLesson(null);
    setActiveTab('All');
    setSidebarOpen(false);
  };

  const handleSelectAssessments = () => {
    setViewingAssessments(true);
    setActiveModule(null);
    setActiveLesson(null);
    setSidebarOpen(false);
  };

  const getFilteredLessons = () => {
    if (!activeModule || !activeModule.lessons) return [];
    const list = activeModule.lessons;
    switch (activeTab) {
      case 'Lectures':
        return list.filter(l => ['lecture', 'video'].includes(l.type));
      case 'DPPs':
        return list.filter(l => ['dpp', 'quiz'].includes(l.type));
      case 'Notes':
        return list.filter(l => ['notes', 'document'].includes(l.type));
      case 'DPP PDFs':
        return list.filter(l => l.type === 'dpp-pdf');
      case 'DPP Videos':
        return list.filter(l => l.type === 'dpp-video');
      default:
        return list; // 'All'
    }
  };

  const handleMarkComplete = async () => {
    if (!activeLesson) return;
    const isVideo = ['video', 'lecture', 'dpp-video'].includes(activeLesson.type);
    const currentProgress = liveProgressMap[activeLesson._id] || 0;

    if (isVideo && currentProgress < 95 && !completedIds.has(activeLesson._id)) {
      toast.error(`Please watch the full video without skipping to complete (Currently ${currentProgress}%)`);
      return;
    }

    try {
      await updateProgress(activeLesson._id, { percentComplete: 100 });
      setCompletedIds(prev => new Set([...prev, activeLesson._id]));
      setLiveProgressMap(prev => ({ ...prev, [activeLesson._id]: 100 }));
      toast.success('Lesson completed!');
    } catch {
      toast.error('Failed to mark lesson complete');
    }
  };

  const handleGenerateCertificate = async () => {
    setGeneratingCert(true);
    try {
      const res = await generateCertificate(id);
      setCertUrl(`/certificates/${res.data.data._id}`);
      toast.success('Certificate generated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Certificate eligibility verification failed. Complete all exams/assignments.');
    } finally {
      setGeneratingCert(false);
    }
  };

  const handleOpenRequestModal = (exam) => {
    setRequestingExam(exam);
    setRequestCategory('mastery');
    setRequestReasonText('[Self-Paced Mastery] Requesting an extra attempt to practice and improve my score.');
  };

  const handleConfirmSubmitRequest = async () => {
    if (!requestingExam) return;
    const trimmed = requestReasonText.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    if (words < 5) {
      toast.error('Please write a detailed reason (minimum 5 words)');
      return;
    }

    setSubmittingRequest(true);
    try {
      await requestExamAttempt(requestingExam._id, trimmed);
      toast.success('Extra attempt request submitted successfully!');
      setRequestingExam(null);
      fetchCourseData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleLessonSelect = async (lesson) => {
    setActiveLesson(lesson);
    setSidebarOpen(false);
    try {
      await startLesson(lesson._id);
    } catch (err) {
      console.error('Failed to start lesson', err);
    }
  };

  // Group modules by week and sort weeks
  const modulesByWeek = {};
  course?.modules?.forEach(mod => {
    const w = mod.week || 1;
    if (!modulesByWeek[w]) {
      modulesByWeek[w] = [];
    }
    modulesByWeek[w].push(mod);
  });
  const weeksList = Object.keys(modulesByWeek).map(Number).sort((a, b) => a - b);

  // Dynamic progress calculation helpers
  const getLessonProgress = (lessonId) => {
    if (completedIds.has(lessonId)) return 100;
    return liveProgressMap[lessonId] || 0;
  };

  const getModuleProgress = (mod) => {
    if (!mod.lessons || mod.lessons.length === 0) return 0;
    const total = mod.lessons.length * 100;
    const currentSum = mod.lessons.reduce((acc, l) => acc + getLessonProgress(l._id), 0);
    return Math.min(100, Math.round((currentSum / total) * 100));
  };

  const getWeekProgress = (weekNum) => {
    const weekMods = modulesByWeek[weekNum] || [];
    let totalLessons = 0;
    let currentSum = 0;
    weekMods.forEach(mod => {
      (mod.lessons || []).forEach(l => {
        totalLessons += 1;
        currentSum += getLessonProgress(l._id);
      });
    });
    return totalLessons > 0 ? Math.min(100, Math.round((currentSum / (totalLessons * 100)) * 100)) : 0;
  };

  const toggleWeek = (weekNum) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [weekNum]: !prev[weekNum]
    }));
  };

  const allLessons = course?.modules?.reduce((acc, mod) => [...acc, ...(mod.lessons || [])], []) || [];
  const totalCourseLessons = allLessons.length;
  const currentCourseSum = allLessons.reduce((acc, l) => acc + getLessonProgress(l._id), 0);
  const coursePercent = totalCourseLessons > 0 ? Math.min(100, (currentCourseSum / totalCourseLessons)).toFixed(1) : '0.0';

  const currentLessonIndex = activeLesson ? allLessons.findIndex(l => l._id === activeLesson._id) : -1;
  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;

  // Dynamic Color Phase Styles (0-29%: Red, 30-79%: Yellow, 80-100%: Green)
  const getProgressColorStyle = (percent) => {
    const p = Number(percent);
    if (p < 30) {
      return {
        glow: 'shadow-[0_0_12px_rgba(244,63,94,0.5)] animate-pulse',
        color: '#f43f5e',
        bg: 'rgba(244,63,94,0.12)',
        fillGradient: 'linear-gradient(90deg, #f43f5e, #fb7185)'
      };
    } else if (p < 80) {
      return {
        glow: 'shadow-[0_0_12px_rgba(245,158,11,0.5)]',
        color: '#f59e0b',
        bg: 'rgba(245,158,11,0.12)',
        fillGradient: 'linear-gradient(90deg, #f59e0b, #fbbf24)'
      };
    } else {
      return {
        glow: 'shadow-[0_0_15px_rgba(16,185,129,0.6)]',
        color: '#10b981',
        bg: 'rgba(16,185,129,0.12)',
        fillGradient: 'linear-gradient(90deg, #10b981, #34d399)'
      };
    }
  };

  const getEmbedUrl = (lesson) => {
    if (!lesson) return null;
    let rawUrl = lesson.videoEmbedUrl || lesson.videoUrl || (lesson.title && lesson.title.trim().startsWith('http') ? lesson.title.trim() : null);
    
    if (!rawUrl && lesson.content) {
      const ytMatch = lesson.content.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
      if (ytMatch) rawUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
    }

    if (!rawUrl && ['video', 'lecture', 'dpp-video'].includes(lesson.type)) {
      rawUrl = 'https://www.youtube.com/embed/g20aiS0Lpuk';
    }

    if (!rawUrl) return null;

    let embedUrl = rawUrl;
    const ytMatch = rawUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) {
      embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
    } else {
      const vimeoMatch = rawUrl.match(/vimeo\.com\/(\d+)/);
      if (vimeoMatch) {
        embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
      }
    }

    if (embedUrl.includes('youtube.com') || embedUrl.includes('vimeo.com')) {
      embedUrl += (embedUrl.includes('?') ? '&' : '?') + 'autoplay=1&enablejsapi=1';
    }

    return embedUrl;
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#06070c]"><Loader text="Entering classroom workspace..." /></div>;
  if (!course) return <div className="container" style={{ padding: '4rem 0' }}><h3>Workspace not found</h3></div>;

  const overallColor = getProgressColorStyle(coursePercent);
  const wordCount = requestReasonText.trim() ? requestReasonText.trim().split(/\s+/).length : 0;

  return (
    <div className="classroom-page">
      {/* Mobile sidebar outline toggle button */}
      <button
        className="classroom-mobile-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle course outline"
      >
        {sidebarOpen ? <HiOutlineX size={20} /> : <HiOutlineMenu size={20} />}
        <span>{sidebarOpen ? 'Close Drawer' : 'Course Outline'}</span>
      </button>

      {/* Mobile drawer backdrop overlay */}
      <div
        className={`classroom-overlay ${sidebarOpen ? 'classroom-overlay-active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className={`classroom-sidebar ${sidebarOpen ? 'classroom-sidebar-open' : ''}`}>
        <div className="classroom-sidebar-banner">
          <div className="classroom-banner-header">
            <h4>{course.title}</h4>
          </div>
          <div className="classroom-banner-progress-wrapper">
            <div className="classroom-banner-progress-text">
              <span>Overall Progress</span>
              <span style={{ color: overallColor.color }}>{coursePercent}%</span>
            </div>
            <div className="classroom-banner-progress-bar">
              <div 
                className="classroom-banner-progress-fill transition-all duration-500" 
                style={{ 
                  width: `${coursePercent}%`,
                  background: overallColor.fillGradient,
                  boxShadow: `0 0 10px ${overallColor.color}`
                }}
              />
            </div>
          </div>
        </div>

        <div className="classroom-modules-list">
          {weeksList.map((weekNum) => {
            const weekModules = modulesByWeek[weekNum] || [];
            const weekProgress = getWeekProgress(weekNum);
            const isExpanded = !!expandedWeeks[weekNum];
            const weekColor = getProgressColorStyle(weekProgress);

            return (
              <div key={weekNum} className="classroom-week-group">
                <button
                  type="button"
                  className={`classroom-week-header-btn ${isExpanded ? 'week-expanded' : ''}`}
                  onClick={() => toggleWeek(weekNum)}
                >
                  <div 
                    className={`classroom-progress-circle transition-all duration-500 ${weekColor.glow}`}
                    style={{
                      borderColor: weekColor.color,
                      color: weekColor.color,
                      background: weekColor.bg
                    }}
                  >
                    <span>{weekProgress}%</span>
                  </div>
                  <span className="classroom-week-title">Week {weekNum}</span>
                  <span className="classroom-accordion-indicator">
                    {isExpanded ? <HiOutlineChevronDown size={14} /> : <HiOutlineChevronRight size={14} />}
                  </span>
                </button>

                {isExpanded && (
                  <div className="classroom-week-modules-sublist">
                    {weekModules.map((mod) => {
                      const modProgress = getModuleProgress(mod);
                      const isActive = activeModule?._id === mod._id && !viewingAssessments;
                      const modColor = getProgressColorStyle(modProgress);

                      return (
                        <button
                          key={mod._id}
                          className={`classroom-chapter-btn ${isActive ? 'chapter-active' : ''}`}
                          onClick={() => handleModuleSelect(mod)}
                        >
                          <div 
                            className={`classroom-progress-circle-small transition-all duration-500 ${modColor.glow}`}
                            style={{
                              borderColor: modColor.color,
                              color: modColor.color,
                              background: modColor.bg
                            }}
                          >
                            <span>{modProgress}%</span>
                          </div>
                          <span className="chapter-title">{mod.title}</span>
                          <span className="classroom-accordion-indicator">
                            <HiOutlineChevronRight size={12} />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          
          {(exams.length > 0 || assignments.length > 0) && (
            <>
              <div className="classroom-sidebar-section-title">ASSESSMENTS</div>
              <button
                className={`classroom-chapter-btn ${viewingAssessments ? 'chapter-active' : ''}`}
                onClick={handleSelectAssessments}
              >
                <div className="classroom-progress-circle-small">
                  <span>📝</span>
                </div>
                <span className="chapter-title">Exams & Assignments</span>
              </button>
            </>
          )}
        </div>

        <div className="classroom-sidebar-footer">
          {certUrl ? (
            <Link to={certUrl} className="btn-detail-primary text-center block w-full py-3 font-extrabold shadow-lg">View Certificate 🏆</Link>
          ) : (
            <button onClick={handleGenerateCertificate} disabled={generatingCert} className="btn-detail-primary w-full py-3 font-extrabold shadow-lg">
              {generatingCert ? 'Checking Eligibility...' : 'Claim Certificate 🎓'}
            </button>
          )}
        </div>
      </div>

      <div className="classroom-main">
        {activeLesson ? (
          <div className="classroom-viewport animate-page-enter" key={activeLesson._id}>
            <div className="classroom-viewport-header-row">
              <button className="classroom-back-to-chapter-btn" onClick={() => setActiveLesson(null)}>
                <HiOutlineArrowLeft size={18} /> Back to Chapter Outline
              </button>
              
              {prevLesson && (
                <button className="classroom-prev-lesson-pill" onClick={() => handleLessonSelect(prevLesson)}>
                  ← Lesson {currentLessonIndex}: {prevLesson.title}
                </button>
              )}
            </div>

            <div className="classroom-lesson-details-header">
              <div className="classroom-lesson-counter">
                Lesson {currentLessonIndex + 1} of {allLessons.length}
              </div>
              <h2 className="classroom-lesson-title">{activeLesson.title}</h2>
              <div className="classroom-title-underline"></div>
            </div>
            
            {activeLesson.type === 'video' || activeLesson.type === 'lecture' || activeLesson.type === 'dpp-video' ? (
              (() => {
                const ytId = getYouTubeId(activeLesson);
                const embedUrl = getEmbedUrl(activeLesson);
                return ytId ? (
                  <div className="classroom-player-wrapper">
                    <div key={activeLesson._id} ref={playerContainerRef} className="yt-player-container w-full h-full" />
                  </div>
                ) : embedUrl ? (
                  <div className="classroom-player-wrapper">
                    <iframe src={embedUrl} title={activeLesson.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                  </div>
                ) : (
                  <div className="classroom-document-placeholder">
                    <span className="text-slate-400 dark:text-slate-500 font-bold text-sm">No video stream URL configured for this lesson.</span>
                  </div>
                );
              })()
            ) : (
              <div className="classroom-document-placeholder">
                <HiOutlineDocumentText size={56} className="text-indigo-500" />
                <span className="text-slate-900 dark:text-white text-base font-extrabold">Document Material & Learning Content</span>
                {activeLesson.attachments && activeLesson.attachments.length > 0 && (
                  <div className="classroom-attachment-downloads mt-2">
                    {activeLesson.attachments.map((file, fIdx) => (
                      <a key={fIdx} href={file.url} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-md transition-all duration-300">
                        <HiOutlineCloudDownload size={16} /> Download {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <div className="classroom-content-details">
              {activeLesson.content && <div className="classroom-markdown-content mt-2" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(activeLesson.content) }} />}
              
              <div className="classroom-action-row">
                {(() => {
                  const isCompleted = completedIds.has(activeLesson._id);
                  const isVideo = ['video', 'lecture', 'dpp-video'].includes(activeLesson.type);
                  const currentPct = liveProgressMap[activeLesson._id] || 0;
                  const canMarkComplete = !isVideo || currentPct >= 95 || isCompleted;

                  if (isCompleted) {
                    return (
                      <button disabled className="px-6 py-3 rounded-xl font-extrabold text-sm bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500 border border-slate-200 dark:border-white/5 cursor-not-allowed">
                        Completed ✓
                      </button>
                    );
                  }

                  if (!canMarkComplete) {
                    return (
                      <button 
                        onClick={handleMarkComplete}
                        className="px-6 py-3 rounded-xl font-extrabold text-sm bg-slate-800/60 text-slate-400 border border-slate-700/60 hover:border-amber-500/50 hover:text-amber-400 transition-all cursor-pointer shadow-md flex items-center gap-2"
                        title="Watch full video to unlock completion"
                      >
                        <span>Watch Video to Complete ({currentPct}%)</span>
                      </button>
                    );
                  }

                  return (
                    <button 
                      onClick={handleMarkComplete} 
                      className="px-6 py-3 rounded-xl font-extrabold text-sm transition-all duration-300 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-md active:scale-95 cursor-pointer"
                    >
                      Mark as Complete
                    </button>
                  );
                })()}
              </div>
            </div>
          </div>
        ) : viewingAssessments ? (
          <div className="classroom-chapter-outline-view animate-page-enter">
            <div className="classroom-chapter-header">
              <h2>Course Assessments</h2>
              <p>Practice tests, graded exams, and assignments for verification</p>
            </div>
            
            <div className="classroom-cards-list mt-8">
              {exams.map((ex) => {
                const examSubmission = submissions.find(s => s.examId?._id === ex._id);
                const hasAttemptsLeft = (ex.attemptsLeft === undefined) || (ex.attemptsLeft > 0);
                
                return (
                  <div key={ex._id} className="classroom-material-card">
                    {examSubmission && (
                      <div className="card-completed-badge">✓</div>
                    )}
                    <div className="material-card-left">
                      <div className="material-card-icon-box">
                        🏆
                      </div>
                    </div>
                    <div className="material-card-center">
                      <div className="material-meta">
                        <span className="material-type-tag">Exam Assessment</span>
                        {examSubmission && <span className="material-score">Score: {examSubmission.score} / {examSubmission.totalMarks} ({examSubmission.percentage}%)</span>}
                      </div>
                      <h4 className="material-title">{ex.title}</h4>
                      <p className="material-desc">
                        Duration: {ex.duration} mins • Passing Score: {ex.passingMarks} / {ex.totalMarks}
                        <span className="block text-[11px] text-slate-400 font-semibold mt-1">
                          Attempts: {ex.attemptsUsed ?? 0} / {ex.totalAllowedAttempts ?? ex.maxAttempts} used • {ex.attemptsLeft ?? ex.maxAttempts} left
                        </span>
                      </p>
                    </div>
                    <div className="material-card-right flex flex-col items-end gap-2">
                      {hasAttemptsLeft ? (
                        <Link to={`/exams/${ex._id}/take`} className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold transition-all duration-300 shadow-md active:scale-95">
                          {ex.attemptsUsed > 0 ? 'Retake Exam' : 'Start Exam'}
                        </Link>
                      ) : (
                        <>
                          {ex.requestStatus === 'pending' ? (
                            <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold">
                              Request Pending
                            </span>
                          ) : ex.requestStatus === 'rejected' ? (
                            <div className="flex flex-col items-end gap-1.5">
                              <span className="px-3 py-1 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs font-bold">
                                Request Rejected
                              </span>
                              <button
                                onClick={() => handleOpenRequestModal(ex)}
                                className="text-[11px] font-bold text-indigo-500 hover:text-indigo-400 underline cursor-pointer"
                              >
                                Re-request Attempts
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleOpenRequestModal(ex)}
                              className="px-4 py-2 border border-indigo-500/30 text-indigo-500 hover:bg-indigo-500/10 rounded-xl text-xs font-bold transition-all cursor-pointer"
                            >
                              Request Extra Attempts
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

              {assignments.map((ass) => {
                const assSubmission = submissions.find(s => s.assignmentId?._id === ass._id);
                return (
                  <div key={ass._id} className="classroom-material-card">
                    {assSubmission && (
                      <div className="card-completed-badge">✓</div>
                    )}
                    <div className="material-card-left">
                      <div className="material-card-icon-box">
                        📝
                      </div>
                    </div>
                    <div className="material-card-center">
                      <div className="material-meta">
                        <span className="material-type-tag">Assignment Worksheet</span>
                      </div>
                      <h4 className="material-title">{ass.title}</h4>
                      <p className="material-desc">Passing Marks: {ass.passingMarks} / {ass.totalMarks}</p>
                    </div>
                    <div className="material-card-right">
                      <Link to={`/assignments/${ass._id}/view`} className="px-5 py-2.5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl text-xs font-bold text-center block transition-all duration-300">
                        {assSubmission ? 'View Submission' : 'Submit Assignment'}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeModule ? (
          <div className="classroom-chapter-outline-view animate-page-enter">
            <div className="classroom-chapter-header">
              <h2>{activeModule.title}</h2>
              <p>Module Outline & Learning Materials</p>
            </div>

            <div className="classroom-tabs-bar">
              {['All', 'Lectures', 'DPPs', 'Notes', 'DPP PDFs', 'DPP Videos'].map((tabName) => (
                <button
                  key={tabName}
                  className={`classroom-tab-btn ${activeTab === tabName ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab(tabName)}
                >
                  {tabName}
                </button>
              ))}
            </div>

            <div className="classroom-cards-list mt-8">
              {getFilteredLessons().length === 0 ? (
                <div className="classroom-empty-materials text-center py-20 text-slate-400 dark:text-slate-500 font-medium">
                  <p>No materials available in this section under "{activeTab}"</p>
                </div>
              ) : (
                getFilteredLessons().map((les) => {
                  const isCompleted = completedIds.has(les._id);
                  const isVideoType = ['video', 'lecture', 'dpp-video'].includes(les.type);
                  return (
                    <div 
                      key={les._id} 
                      className="classroom-material-card group cursor-pointer"
                      onClick={() => handleLessonSelect(les)}
                    >
                      {isCompleted && (
                        <div className="card-completed-badge">✓</div>
                      )}
                      
                      <div className="material-card-left">
                        <button
                          type="button"
                          className="material-card-icon-box group-hover:scale-110 active:scale-95 transition-all duration-300 shadow-md cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLessonSelect(les);
                          }}
                          title={isVideoType ? "Play Lesson Video" : "Open Notes"}
                          aria-label={isVideoType ? "Play Lesson Video" : "Open Notes"}
                        >
                          {isVideoType ? (
                            <HiOutlinePlay className="ml-0.5 text-indigo-600 dark:text-indigo-400 group-hover:text-white transition-colors" />
                          ) : (
                            <HiOutlineDocumentText className="text-indigo-600 dark:text-indigo-400 group-hover:text-white transition-colors" />
                          )}
                        </button>
                      </div>
                      
                      <div className="material-card-center">
                        <div className="material-meta">
                          <span className="material-type-tag capitalize">{les.type.replace('-', ' ')}</span>
                          {les.createdAt && (
                            <span className="material-date">
                              • {new Date(les.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <h4 className="material-title group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{les.title}</h4>
                        {les.content && (
                          <p className="material-desc">
                            {les.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                          </p>
                        )}
                      </div>
                      
                      <div className="material-card-right flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                        {isVideoType ? (
                          <button 
                            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold transition-all duration-300 shadow-md hover:shadow-indigo-500/25 active:scale-95 flex items-center gap-1.5 cursor-pointer" 
                            onClick={() => handleLessonSelect(les)}
                          >
                            <HiOutlinePlay size={15} /> Watch Lesson
                          </button>
                        ) : (
                          <button 
                            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold transition-all duration-300 shadow-md hover:shadow-indigo-500/25 active:scale-95 cursor-pointer" 
                            onClick={() => handleLessonSelect(les)}
                          >
                            Open Notes
                          </button>
                        )}

                        {les.attachments && les.attachments.length > 0 && (
                          <a
                            href={les.attachments[0].url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 border border-slate-200/80 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[0.04] rounded-xl text-xs font-bold text-center transition-all duration-300"
                            onClick={(e) => e.stopPropagation()}
                          >
                            PDF Attachment
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <div className="classroom-empty">
            <HiOutlineBookOpen size={56} className="text-indigo-500 animate-bounce" />
            <p>Select a chapter from the outline drawer to begin learning</p>
          </div>
        )}
      </div>

      {/* Request Extra Attempts Modal - AI Futuristic Design */}
      {requestingExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070e]/85 backdrop-blur-xl animate-fade-in">
          
          {/* Ambient Background Glow Halo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-indigo-600/30 via-purple-600/30 to-pink-500/20 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-indigo-500/30 bg-[#0b0d18]/90 p-6 sm:p-8 shadow-[0_0_60px_rgba(99,102,241,0.2)] backdrop-blur-2xl space-y-6 animate-scale-up">
            
            {/* Top Futuristic Gradient Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800/80">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 shadow-inner">
                    <HiOutlineAcademicCap size={22} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black font-heading text-white tracking-wide">
                      Request Extra Attempt
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-400">
                      Exam: <span className="text-indigo-300 font-bold">{requestingExam.title}</span>
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setRequestingExam(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
              >
                <HiOutlineX size={18} />
              </button>
            </div>

            {/* Reason Category Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  Select Reason Category
                </label>
                <span className="text-[10px] font-extrabold text-indigo-400/80 uppercase tracking-widest">Step 1 of 2</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: 'mastery', icon: <HiOutlineSparkles size={16} />, label: 'Self-Paced Mastery', desc: 'Need retake for higher score/certificate' },
                  { id: 'tech', icon: <HiOutlineLightningBolt size={16} />, label: 'Technical Disconnection', desc: 'Network or browser issue during test' },
                  { id: 'emergency', icon: <HiOutlineExclamationCircle size={16} />, label: 'Unforeseen Emergency', desc: 'Urgent interruption while taking exam' },
                  { id: 'other', icon: <HiOutlinePencilAlt size={16} />, label: 'Custom Explanation', desc: 'Write detailed custom request notes' }
                ].map((cat) => {
                  const isSelected = requestCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setRequestCategory(cat.id);
                        if (cat.id === 'mastery') {
                          setRequestReasonText('[Self-Paced Mastery] Requesting an extra attempt to practice and improve my score.');
                        } else if (cat.id === 'tech') {
                          setRequestReasonText('[Technical Issue] Experienced network disconnection/browser issue during previous attempt.');
                        } else if (cat.id === 'emergency') {
                          setRequestReasonText('[Urgent Emergency] Interrupted due to an urgent emergency situation during test.');
                        } else if (cat.id === 'other') {
                          setRequestReasonText('');
                        }
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                        isSelected
                          ? 'border-indigo-500/80 bg-indigo-500/15 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.2)] scale-[1.02]'
                          : 'border-slate-800/80 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:bg-slate-900/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 font-extrabold text-xs">
                        <span className={`p-1.5 rounded-lg transition-colors ${
                          isSelected ? 'bg-indigo-500/30 text-indigo-200' : 'bg-slate-800/60 text-slate-400 group-hover:text-indigo-400'
                        }`}>
                          {cat.icon}
                        </span>
                        <span className="font-bold tracking-tight text-white">{cat.label}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 line-clamp-1 font-medium pl-0.5">
                        {cat.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detailed Explanation Textarea with Word Counter */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label htmlFor="request-explanation" className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                  Detailed Request Notes
                </label>
                <div className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black tracking-wider ${
                  wordCount < 5 
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                    : wordCount > 200 
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' 
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                }`}>
                  {wordCount} / 200 WORDS {wordCount < 5 && '(MIN 5)'}
                </div>
              </div>

              <div className="relative">
                <textarea
                  id="request-explanation"
                  rows={4}
                  className="w-full px-4 py-3.5 rounded-2xl border border-slate-800 bg-slate-950/70 text-xs font-medium text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/30 focus:shadow-[0_0_25px_rgba(99,102,241,0.15)] transition-all resize-none"
                  placeholder="Explain your situation in detail and how you plan to prepare for this attempt..."
                  value={requestReasonText}
                  onChange={(e) => setRequestReasonText(e.target.value)}
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setRequestingExam(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-900/60 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingRequest || wordCount < 5 || wordCount > 200}
                onClick={handleConfirmSubmitRequest}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-black text-xs tracking-wider uppercase shadow-[0_0_25px_rgba(99,102,241,0.35)] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 cursor-pointer flex items-center gap-2"
              >
                {submittingRequest ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <span>Submit Request</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default CourseLearn;
