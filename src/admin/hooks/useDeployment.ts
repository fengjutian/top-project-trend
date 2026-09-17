// Tracks the latest GitHub Actions workflow run for the configured branch.
// `refresh(token?)` re-fetches; pass an override token after auth changes.

import {useCallback, useState} from 'react';
import {loadDeployment as fetchDeployment, type WorkflowRun} from '../lib/github';

export type DeploymentRefresh = (authToken?: string) => Promise<void>;

export function useDeployment(token: string): [WorkflowRun | null, DeploymentRefresh] {
  const [deployment, setDeployment] = useState<WorkflowRun | null>(null);
  const refresh = useCallback<DeploymentRefresh>(async (authToken = token) => {
    setDeployment(await fetchDeployment(authToken));
  }, [token]);
  return [deployment, refresh];
}