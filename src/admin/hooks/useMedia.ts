// Manages the media library list for the current section.

import type {Dispatch, SetStateAction} from 'react';
import {useCallback, useState} from 'react';
import {listFiles, type GitHubEntry} from '../lib/github';

export interface UseMediaResult {
  media: GitHubEntry[];
  setMedia: Dispatch<SetStateAction<GitHubEntry[]>>;
  refresh: (nextSection?: string, authToken?: string) => Promise<GitHubEntry[]>;
}

const MEDIA_EXTENSION = /\.(webp|png|jpe?g|gif|svg)$/i;

export function useMedia(section: string, token: string): UseMediaResult {
  const [media, setMedia] = useState<GitHubEntry[]>([]);

  const refresh = useCallback(async (nextSection = section, authToken = token): Promise<GitHubEntry[]> => {
    if (!authToken) return [];
    try {
      const files = await listFiles(`static/media/${nextSection}`, authToken, (entry) => MEDIA_EXTENSION.test(entry.name));
      files.sort((a, b) => b.path.localeCompare(a.path));
      setMedia(files);
      return files;
    } catch (error) {
      if (error instanceof Error && /404|Not Found/i.test(error.message)) {
        setMedia([]);
        return [];
      }
      throw error;
    }
  }, [section, token]);

  return {media, setMedia, refresh};
}