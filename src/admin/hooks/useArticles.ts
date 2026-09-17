// Manages the article list for the current section.
// `refresh(section?, token?)` re-fetches; pass overrides after section/token changes.

import type {Dispatch, SetStateAction} from 'react';
import {useCallback, useState} from 'react';
import {BRANCH, github, listMarkdownFiles, decodeBase64, type GitHubContent} from '../lib/github';
import {Article, emptyArticle, parseArticle} from '../lib/article';

export interface ArticleEntry extends Article {
  path: string;
  sha: string;
  filename: string;
}

export interface UseArticlesResult {
  articles: ArticleEntry[];
  setArticles: Dispatch<SetStateAction<ArticleEntry[]>>;
  loading: boolean;
  refresh: (nextSection?: string, authToken?: string) => Promise<ArticleEntry[]>;
  empty: typeof emptyArticle;
}

export function useArticles(section: string, token: string): UseArticlesResult {
  const [articles, setArticles] = useState<ArticleEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async (nextSection = section, authToken = token): Promise<ArticleEntry[]> => {
    if (!authToken) return [];
    setLoading(true);
    try {
      const markdownFiles = await listMarkdownFiles(`content/${nextSection}`, authToken);
      const entries = await Promise.all(markdownFiles.map(async (file): Promise<ArticleEntry> => {
        const data = await github<GitHubContent>(`contents/${file.path}?ref=${BRANCH}`, authToken);
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