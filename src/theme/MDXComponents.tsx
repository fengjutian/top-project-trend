import React, {type CSSProperties, type ImgHTMLAttributes, type VideoHTMLAttributes} from 'react';
import MDXComponents from '@theme-original/MDXComponents';
import {useMDXComponents} from '@mdx-js/react';

type LazyImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  loading?: 'eager' | 'lazy';
  decoding?: 'auto' | 'sync' | 'async';
  style?: CSSProperties;
};

function LazyImage({loading, decoding, style, ...props}: LazyImageProps) {
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

type OptimizedVideoProps = VideoHTMLAttributes<HTMLVideoElement> & {
  src: string;
};

function OptimizedVideo({src, ...props}: OptimizedVideoProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = React.useState<boolean>(false);

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

// MDX 3: register custom components via useMDXComponents.
// We merge over the original Default export for compatibility.
const customComponents = {
  ...MDXComponents,
  img: LazyImage,
  OptimizedVideo,
} as const;

export default function ThemeMDXComponents(): typeof customComponents {
  useMDXComponents(customComponents);
  return customComponents;
}
