// Article preview pane.
//
// History: this used to compile the article body through `mdx-runtime-compiler`
// (alias → `@mdx-js/mdx@2`) so the admin editor showed the exact JSX the
// production Docusaurus build would emit. `@mdx-js/mdx@3` removed the runtime
// `evaluate()` API and doing true MDX-JSX in the browser is no longer
// practical, so we render the (lightly normalized) Markdown source directly.
// The text is wrapped in a `<pre>` so block-level structure stays readable.

import React, {useMemo} from 'react';

interface Props {
  source: string;
  articlePath: string;
}

const preStyle: React.CSSProperties = {
  margin: 0,
  padding: '1rem 1.25rem',
  borderRadius: 8,
  background: 'var(--ifm-pre-background)',
  color: 'var(--ifm-pre-color)',
  fontSize: '0.85em',
  lineHeight: 1.55,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  maxHeight: '70vh',
  overflow: 'auto',
};

const noticeStyle: React.CSSProperties = {
  margin: '0 0 0.75rem',
  padding: '0.4rem 0.75rem',
  fontSize: '0.8em',
  color: 'var(--ifm-color-emphasis-700)',
  border: '1px dashed var(--ifm-color-emphasis-300)',
  borderRadius: 6,
};

export default function ExactMdxPreview({source}: Props) {
  const normalized = useMemo(() => source.replace(/\r\n/g, '\n').trimEnd(), [source]);
  return (
    <div>
      <p style={noticeStyle}>
        MDX 实时编译预览已下线（Docusaurus 3 ↔ MDX 3 不再支持浏览器端 runtime）。下面显示的是 Markdown 源码，渲染效果以最终构建产物为准。
      </p>
      <pre style={preStyle}>{normalized}</pre>
    </div>
  );
}
