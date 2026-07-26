export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

export const formatDuration = (minutes) => {
  if (!minutes) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

export const getCategoryLabel = (value) => {
  const map = {
    'web-development': 'Web Dev', 'mobile-development': 'Mobile',
    'data-science': 'Data Science', 'machine-learning': 'ML/AI',
    'devops': 'DevOps', 'cybersecurity': 'Security',
    'cloud-computing': 'Cloud', 'programming-languages': 'Programming',
    'database': 'Database', 'software-engineering': 'Software Eng',
    'ui-ux-design': 'UI/UX', 'digital-marketing': 'Marketing',
    'business': 'Business', 'other': 'Other',
  };
  return map[value] || value;
};

export const getDifficultyColor = (level) => {
  const map = {
    beginner: '#55efc4', intermediate: '#74b9ff',
    advanced: '#fdcb6e', expert: '#e94560',
  };
  return map[level] || '#a0a0c0';
};

export const getCourseThumbnail = (course) => {
  if (!course) return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';

  if (course.thumbnail) {
    if (course.thumbnail.startsWith('http://') || course.thumbnail.startsWith('https://')) {
      return course.thumbnail;
    }
    const apiURL = import.meta.env.VITE_API_URL || '';
    const baseURL = apiURL.replace(/\/api\/?$/, '').replace(/\/$/, '');
    const cleanPath = course.thumbnail.startsWith('/') ? course.thumbnail : `/${course.thumbnail}`;
    return `${baseURL}${cleanPath}`;
  }

  const title = (course.title || '').toLowerCase();
  const category = (course.category || '').toLowerCase();

  // Web Dev / Frontend / React / HTML / Bootcamp
  if (category.includes('web') || title.includes('web') || title.includes('react') || title.includes('javascript') || title.includes('html') || title.includes('css') || title.includes('bootcamp')) {
    return 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=800&q=80';
  }
  
  // UI / UX / Design
  if (category.includes('ui') || category.includes('ux') || category.includes('design') || title.includes('ui') || title.includes('ux') || title.includes('design')) {
    return 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=800&q=80';
  }

  // Data Science / ML / AI / Python
  if (category.includes('data') || category.includes('machine') || category.includes('ml') || title.includes('python') || title.includes('data') || title.includes('ai')) {
    return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80';
  }

  // Mobile Dev
  if (category.includes('mobile') || title.includes('mobile') || title.includes('flutter') || title.includes('android') || title.includes('ios')) {
    return 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80';
  }

  // DevOps / Cloud / Server / IoT
  if (category.includes('cloud') || category.includes('devops') || title.includes('iot') || title.includes('docker') || title.includes('aws') || title.includes('cloud')) {
    return 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80';
  }

  // Cybersecurity / Security
  if (category.includes('sec') || title.includes('security') || title.includes('cyber') || title.includes('hack')) {
    return 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80';
  }

  // Default fallback image
  return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';
};

