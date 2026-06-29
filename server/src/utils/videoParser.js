/**
 * Parse video URLs from YouTube and Vimeo to extract embed-ready data.
 */

const parseYouTubeUrl = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        platform: 'youtube',
        videoId: match[1],
        embedUrl: `https://www.youtube.com/embed/${match[1]}`,
        thumbnailUrl: `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`,
      };
    }
  }
  return null;
};

const parseVimeoUrl = (url) => {
  const pattern = /vimeo\.com\/(\d+)/;
  const match = url.match(pattern);

  if (match) {
    return {
      platform: 'vimeo',
      videoId: match[1],
      embedUrl: `https://player.vimeo.com/video/${match[1]}`,
      thumbnailUrl: null, // Vimeo thumbnails require API call
    };
  }
  return null;
};

const parseVideoUrl = (url) => {
  if (!url) return null;

  const youtube = parseYouTubeUrl(url);
  if (youtube) return youtube;

  const vimeo = parseVimeoUrl(url);
  if (vimeo) return vimeo;

  // Assume self-hosted if no match
  return {
    platform: 'self-hosted',
    videoId: null,
    embedUrl: url,
    thumbnailUrl: null,
  };
};

module.exports = { parseVideoUrl, parseYouTubeUrl, parseVimeoUrl };
