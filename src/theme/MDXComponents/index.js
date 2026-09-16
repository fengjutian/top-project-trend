import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';

function LazyImage({loading, decoding, ...props}) {
  return (
    <img
      {...props}
      loading={loading ?? 'lazy'}
      decoding={decoding ?? 'async'}
    />
  );
}

export default {
  ...MDXComponents,
  img: LazyImage,
};
