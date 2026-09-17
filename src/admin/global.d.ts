// Ambient declarations for CSS module imports inside src/admin/.

declare module '*.module.css' {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}

declare module '*.css' {
  const content: string;
  export default content;
}

// Docusaurus theme aliases (no first-party types in Docusaurus 2.0.1).
declare module '@theme/MDXComponents' {
  const components: Record<string, React.ComponentType<unknown>>;
  export default components;
}