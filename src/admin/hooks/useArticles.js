// Manages the article list for the current section.
// `refresh(section?, token?)` re-fetches; pass overrides after section/token changes.

import {useCallback, useState} from 'react';
import {BRANCH, github, listMarkdownFiles, decodeBase64} from '../lib/github';
import {emptyArticle, parseArticle} from '../lib/article';

export function useArticles(section, token) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async (nextSection = section, authToken = token) => {
    if (!authToken) return [];
    setLoading(true);
    try {
      const markdownFiles = await listMarkdownFiles(`content/${nextSection}`, authToken);
      const entries = await Promise.all(markdownFiles.map(async (file) => {
        const data = await github(`contents/${file.path}?ref=${BRANCH}`, authToken);
        const parsed = parseArticle(decodeBase64(data.content));
        return {...parsed, path: file.path, sha: data.sha, filename: file.name};
      }));
      entries.sort((a, b) => (b.date || '').localeCompare(a.date || '') || a.title.localeCompare(b.title));
      setArticles(entries);
      return entries;
    } finally {
      setLoading(false);
    }
  }, [section, token]);

  return {articles, setArticles, loading, refresh, empty: emptyArticle};
}