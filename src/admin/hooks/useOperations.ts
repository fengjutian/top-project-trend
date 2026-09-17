// Manages the dashboard data: every article across all sections plus the
// link-audit and media-manifest reports.

import type {Dispatch, SetStateAction} from 'react';
import {useCallback, useState} from 'react';
import {BRANCH, github, listMarkdownFiles, loadReport, decodeBase64, type GitHubContent} from '../lib/github';
import {Article, SECTIONS, parseArticle} from '../lib/article';

export interface DashboardArticle extends Article {
  path: string;
  sha: string;
  filename: string;
  section: string;
}

export interface LinkReport {
  generatedAt?: string;
  total: number;
  healthy: number;
  broken: number;
  links: Array<{url: string; ok: boolean; status?: number; error?: string}>;
}

export interface MediaManifestEntry {
  path: string;
  size: number;
  referenced: boolean;
}

export interface MediaReport {
  generatedAt?: string;
  summary: {
    total: number;
    unreferenced: number;
    duplicateGroups: number;
    size: number;
  };
  media: MediaManifestEntry[];
  duplicates: string[][];
}

export interface UseOperationsResult {
  globalArticles: DashboardArticle[];
  setGlobalArticles: Dispatch<SetStateAction<DashboardArticle[]>>;
  linkReport: LinkReport | null;
  setLinkReport: Dispatch<SetStateAction<LinkReport | null>>;
  mediaReport: MediaReport | null;
  setMediaReport: Dispatch<SetStateAction<MediaReport | null>>;
  loading: boolean;
  refresh: (authToken?: string) => Promise<void>;
}

export function useOperations(token: string): UseOperationsResult {
  const [globalArticles, setGlobalArticles] = useState<DashboardArticle[]>([]);
  const [linkReport, setLinkReport] = useState<LinkReport | null>(null);
  const [mediaReport, setMediaReport] = useState<MediaReport | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async (authToken = token): Promise<void> => {
    if (!authToken) return;
    setLoading(true);
    try {
      const filesBySection = await Promise.all(SECTIONS.map(async ([sectionName]) => {
        const files = await listMarkdownFiles(`content/${sectionName}`, authToken);
        return files.map((file) => ({...file, section: sectionName}));
      }));
      const entries = await Promise.all(filesBySection.flat().map(async (file): Promise<DashboardArticle> => {
        const data = await github<GitHubContent>(`contents/${file.path}?ref=${BRANCH}`, authToken);
        return {...parseArticle(decodeBase64(data.content)), path: file.path, sha: data.sha, filename: file.name, section: file.section};
      }));
      entries.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      setGlobalArticles(entries);
      const [links, mediaManifest] = await Promise.all([
        loadReport<LinkReport>('static/reports/link-report.json', authToken),
        loadReport<MediaReport>('static/media-manifest.json', authToken),
      ]);
      setLinkReport(links);
      setMediaReport(mediaManifest);
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    globalArticles, setGlobalArticles,
    linkReport, setLinkReport,
    mediaReport, setMediaReport,
    loading, refresh,
  };
}