// One-shot patch: replace the SearchBar wrapper in
// `@easyops-cn/docusaurus-search-local/dist/client/client/theme/SearchBar/index.jsx`
// because Docusaurus 3.10.2 dropped the `DocsPreferredVersionContextProvider`
// export from `@docusaurus/plugin-content-docs/client`. The wrapper just
// renders `children`, so a React.Fragment is functionally identical and
// removes the missing import.
//
// Idempotent: if the file already starts with the patched header, we no-op.

const fs = require('node:fs');
const path = require('node:path');

const candidates = [
  path.join(
    'D:',
    'github',
    'top-project-trend',
    'node_modules',
    '.pnpm',
    '@easyops-cn+docusaurus-search-local@0.55.3_@docusaurus+theme-common@3.10.2_@docusaurus+plugin_rsv4t5kfzqfpqohe4cwvy7is6i',
    'node_modules',
    '@easyops-cn',
    'docusaurus-search-local',
    'dist',
    'client',
    'client',
    'theme',
    'SearchBar',
    'index.jsx',
  ),
];

const MARKER = '/* patch-search-local: no-op Provider */';

let touched = 0;
for (const f of candidates) {
  if (!fs.existsSync(f)) continue;
  const src = fs.readFileSync(f, 'utf8');
  if (src.includes(MARKER)) continue;
  const patched = `${MARKER}
// Docusaurus 3.10 removed DocsPreferredVersionContextProvider from
// @docusaurus/plugin-content-docs/client. Wrapper is purely a passthrough,
// so replace with React.Fragment.
import React from 'react';
import "../../utils/proxiedGenerated";
import SearchBar from "./SearchBar";

export default function SearchBarWrapper(props) {
  return React.createElement(React.Fragment, null, React.createElement(SearchBar, props));
}
`;
  fs.writeFileSync(f, patched);
  touched++;
  console.log(`patched ${path.relative(path.join('D:', 'github', 'top-project-trend'), f)}`);
}
console.log(`updated ${touched} file(s)`);
