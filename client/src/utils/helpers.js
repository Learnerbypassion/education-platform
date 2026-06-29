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
