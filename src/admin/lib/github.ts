// GitHub data layer for the Content Studio admin.
// Pure functions, no React. Safe to import from client-only code paths.
// Lives outside src/pages/ to avoid Docusaurus auto-routing.

export const OWNER = 'fengjutian';
export const REPO = 'top-project-trend';
export const BRANCH = 'main';

const API_BASE = `https://api.github.com/repos/${OWNER}/${REPO}`;
const RAW_BASE = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}`;

// --- GitHub API response shapes (subset; expand as needed) ---

export interface GitHubEntry {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: 'file' | 'dir' | 'symlink' | 'submodule';
  download_url?: string | null;
}

export interface GitHubContent extends GitHubEntry {
  type: 'file';
  content: string;
  encoding: 'base64';
}

export type WorkflowRunStatus = 'queued' | 'in_progress' | 'completed';
export type WorkflowRunConclusion =
  | 'success' | 'failure' | 'neutral' | 'cancelled'
  | 'skipped' | 'timed_out' | 'action_required' | null;

export interface WorkflowRun {
  id: number;
  status: WorkflowRunStatus;
  conclusion: WorkflowRunConclusion;
  html_url: string;
}

export interface WorkflowRunsResponse {
  workflow_runs: WorkflowRun[];
  total_count: number;
}

// --- Public API ---

export function decodeBase64(value: string): string {
  const bytes = Uint8Array.from(atob(value.replace(/\n/g, '')), (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export async function github<T = unknown>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}/${path}`, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    },
  });
  if (!response.ok) {
    const detail = await response.json().catch(() => ({} as {message?: string}));
    throw new Error(detail.message || `GitHub 请求失败（${response.status}）`);
  }
  return response.json();
}

export async function loadDeployment(token: string): Promise<WorkflowRun | null> {
  try {
    const result = await github<WorkflowRunsResponse>(`actions/runs?branch=${BRANCH}&per_page=1`, token);
    return result.workflow_runs?.[0] || null;
  } catch {
    return null;
  }
}

export async function loadReport<T = unknown>(path: string, token: string): Promise<T | null> {
  try {
    const data = await github<GitHubContent>(`contents/${path}?ref=${BRANCH}`, token);
    return JSON.parse(decodeBase64(data.content)) as T;
  } catch {
    return null;
  }
}

// Recursively lists every .md/.mdx file under a directory in the repo.
export async function listMarkdownFiles(directory: string, token: string): Promise<GitHubEntry[]> {
  const entries = await github<GitHubEntry[]>(`contents/${directory}?ref=${BRANCH}`, token);
  const nested = await Promise.all(entries.map(async (entry) => {
    if (entry.type === 'dir') return listMarkdownFiles(entry.path, token);
    return entry.type === 'file' && /\.mdx?$/.test(entry.name) ? [entry] : [];
  }));
  return nested.flat();
}

// Recursively lists every file under a directory matching the supplied predicate.
export async function listFiles(directory: string, token: string, matcher: (entry: GitHubEntry) => boolean): Promise<GitHubEntry[]> {
  const entries = await github<GitHubEntry[]>(`contents/${directory}?ref=${BRANCH}`, token);
  const nested = await Promise.all(entries.map(async (entry) => {
    if (entry.type === 'dir') return listFiles(entry.path, token, matcher);
    return entry.type === 'file' && matcher(entry) ? [entry] : [];
  }));
  return nested.flat();
}

// Rewrites relative/absolute MDX references so that the in-browser preview
// points at the real raw.githubusercontent.com URLs for the current branch.
export function previewSource(source: string, articlePath?: string): string {
  const directory = articlePath ? articlePath.slice(0, articlePath.lastIndexOf('/')) : 'content/blog';
  const raw = (relativePath: string): string => {
    const cleaned = relativePath.replace(/^\.\//, '');
    return `${RAW_BASE}/${directory}/${cleaned}`;
  };
  return source
    .replace(/require\((['"])(\.\/[^'"]+)\1\)\.default/g, (_match, _quote, p) => JSON.stringify(raw(p)))
    .replace(/\]\((?![a-z]+:|\/|#)([^)]+)\)/gi, (_match, p) => `](${raw(p)})`)
    .replace(/(src|href)=(['"])(?![a-z]+:|\/|#)([^'"]+)\2/gi, (_match, attr, quote, p) => `${attr}=${quote}${raw(p)}${quote}`)
    .replace(/\]\(\/media\//g, '](/top-project-trend/media/')
    .replace(/(src|href)=(['"])\/media\//g, '$1=$2/top-project-trend/media/');
}