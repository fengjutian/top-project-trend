import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';

function LazyImage({loading, decoding, style, ...props}) {
  return (
    <img
      {...props}
      loading={loading ?? 'lazy'}
      decoding={decoding ?? 'async'}
      style={{
        ...style,
        display: 'block',
        width: '420px',
        height: '236px',
        maxWidth: '100%',
        objectFit: 'cover',
        objectPosition: 'center',
        marginRight: 'auto',
        marginLeft: 'auto',
      }}
    />
  );
}

function OptimizedVideo({src, ...props}) {
  const videoRef = React.useRef(null);
  const [shouldLoad, setShouldLoad] = React.useState(false);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || !('IntersectionObserver' in window)) {
      setShouldLoad(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {rootMargin: '300px'},
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      {...props}
      src={shouldLoad ? src : undefined}
      preload={shouldLoad ? 'metadata' : 'none'}
      autoPlay
      loop
      muted
      playsInline
      controls
      style={{maxWidth: '100%', height: 'auto'}}
    />
  );
}

export default {
  ...MDXComponents,
  img: LazyImage,
  OptimizedVideo,
};
