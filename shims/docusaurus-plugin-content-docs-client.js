'use strict';

// Stub for `@docusaurus/plugin-content-docs/client`.
// Docusaurus 3.10.2 removed `DocsPreferredVersionContextProvider` from this
// subpath, but `@easyops-cn/docusaurus-search-local@0.55.3` still imports it.
// We provide a no-op Provider so the SearchBar render tree keeps working.

const React = require('react');

function DocsPreferredVersionContextProvider({children}) {
  return React.createElement(React.Fragment, null, children);
}

module.exports = {
  DocsPreferredVersionContextProvider,
  __esModule: true,
  default: DocsPreferredVersionContextProvider,
};
