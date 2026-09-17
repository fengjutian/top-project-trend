// Manages the dashboard data: every article across all sections plus the
// link-audit and media-manifest reports.

import {useCallback, useState} from 'react';
import {BRANCH, github, listMarkdownFiles, loadReport, decodeBase64} from '../lib/github';
import {SECTIONS, parseArticle} from '../lib/article';

export function useOperations(token) {
  const [globalArticles, setGlobalArticles] = useState([]);
  const [linkReport, setLinkReport] = useState(null);
  const [mediaReport, setMediaReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async (authToken = token) => {
    if (!authToken) return;
    setLoading(true);
    try {
      const filesBySection = await Promise.all(SECTIONS.map(async ([sectionName]) => {
        const files = await listMarkdownFiles(`content/${sectionName}`, authToken);
        return files.map((file) => ({...file, section: sectionName}));
      }));
      const entries = await Promise.all(filesBySection.flat().map(async (file) => {
        const data = await github(`contents/${file.path}?ref=${BRANCH}`, authToken);
        return {...parseArticle(decodeBase64(data.content)), path: file.path, sha: data.sha, filename: file.name, section: file.section};
      }));
      entries.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      setGlobalArticles(entries);
      const [links, mediaManifest] = await Promise.all([
        loadReport('static/reports/link-report.json', authToken),
        loadReport('static/media-manifest.json', authToken),
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