import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import BlogSidebar from '@theme/BlogSidebar';
import styles from './styles.module.css';

export default function BlogLayout({sidebar, toc, children, ...layoutProps}) {
  return (
    <Layout {...layoutProps}>
      <div className={styles.blogPage}>
        <BlogSidebar sidebar={sidebar} />

        <main
          className={styles.blogMain}
          itemScope
          itemType="http://schema.org/Blog">
          <div className={clsx('container', 'padding-top--md', 'padding-bottom--lg', styles.blogContent)}>
            <div className="row">
              <div className={clsx('col', toc ? 'col--10' : 'col--12')}>
                {children}
              </div>
              {toc && <div className="col col--2">{toc}</div>}
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
