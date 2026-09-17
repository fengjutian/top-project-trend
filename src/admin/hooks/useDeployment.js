// Tracks the latest GitHub Actions workflow run for the configured branch.
// `refresh(token?)` re-fetches; pass an override token after auth changes.

import {useCallback, useState} from 'react';
import {loadDeployment as fetchDeployment} from '../lib/github';

export function useDeployment(token) {
  const [deployment, setDeployment] = useState(null);
  const refresh = useCallback(async (authToken = token) => {
    setDeployment(await fetchDeployment(authToken));
  }, [token]);
  return [deployment, refresh];
}