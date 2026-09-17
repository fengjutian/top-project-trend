// Compiles MDX at runtime via mdx-runtime-compiler and renders the result with
// the site's MDXComponents so previews match production rendering.

import React, {useEffect, useMemo, useState} from 'react';
import {evaluate} from 'mdx-runtime-compiler';
import * as jsxRuntime from 'react/jsx-runtime';
import MDXComponents from '@theme/MDXComponents';
import styles from '../../pages/admin/styles.module.css';
import {previewSource} from '../lib/github';

class PreviewErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {error: null};
  }

  static getDerivedStateFromError(error) {
    return {error};
  }

  render() {
    if (this.state.error) return (
      <div className={styles.previewError}>
        <strong>MDX 无法渲染</strong>
        <p>{this.state.error.message}</p>
        <small>检查未闭合的 JSX 标签、花括号或代码块。</small>
      </div>
    );
    return this.props.children;
  }
}

export default function ExactMdxPreview({source, articlePath}) {
  const compiledSource = useMemo(() => previewSource(source, articlePath), [source, articlePath]);
  const [result, setResult] = useState({Content: null, error: null});

  useEffect(() => {
    let active = true;
    setResult({Content: null, error: null});
    evaluate(compiledSource, {...jsxRuntime, development: false})
      .then((module) => { if (active) setResult({Content: module.default, error: null}); })
      .catch((error) => { if (active) setResult({Content: null, error}); });
    return () => { active = false; };
  }, [compiledSource]);

  if (result.error) return (
    <div className={styles.previewError}>
      <strong>MDX 无法编译</strong>
      <p>{result.error.message}</p>
      <small>检查未闭合的 JSX 标签、花括号或代码块。</small>
    </div>
  );
  if (!result.Content) return <div className={styles.previewLoading}>正在编译真实 MDX 预览…</div>;
  const Content = result.Content;
  return (
    <PreviewErrorBoundary key={compiledSource} source={compiledSource}>
      <article className={`theme-doc-markdown markdown ${styles.previewBody}`}>
        <Content components={MDXComponents} />
      </article>
    </PreviewErrorBoundary>
  );
}