// Manages the media library list for the current section.

import {useCallback, useState} from 'react';
import {listFiles} from '../lib/github';

const MEDIA_EXTENSION = /\.(webp|png|jpe?g|gif|svg)$/i;

export function useMedia(section, token) {
  const [media, setMedia] = useState([]);

  const refresh = useCallback(async (nextSection = section, authToken = token) => {
    if (!authToken) return [];
    try {
      const files = await listFiles(`static/media/${nextSection}`, authToken, (entry) => MEDIA_EXTENSION.test(entry.name));
      files.sort((a, b) => b.path.localeCompare(a.path));
      setMedia(files);
      return files;
    } catch (error) {
      if (/404|Not Found/i.test(error.message)) {
        setMedia([]);
        return [];
      }
      throw error;
    }
  }, [section, token]);

  return {media, setMedia, refresh};
}