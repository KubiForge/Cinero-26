import type { CrewDashboardData } from '../types/crew';

let crewToken: string | null = null;

export class CrewApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'CrewApiError';
    this.status = status;
  }
}

async function request<T>(
  action: 'login' | 'validate' | 'dashboard' | 'logout',
  data: Record<string, string> = {},
): Promise<T> {
  const response = await fetch('/api/crew', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({
      action,
      ...data,
      ...(action !== 'login' && crewToken ? { token: crewToken } : {}),
    }),
  });

  let result: unknown;
  try {
    result = await response.json();
  } catch {
    throw new CrewApiError('The crew service returned an invalid response.', response.status);
  }

  if (
    typeof result !== 'object' ||
    result === null ||
    !('success' in result) ||
    result.success !== true
  ) {
    const message = typeof result === 'object' &&
      result !== null &&
      'message' in result &&
      typeof result.message === 'string'
      ? result.message
      : 'The crew request could not be completed.';
    throw new CrewApiError(message, response.status);
  }

  return result as T;
}

export async function login(username: string, password: string): Promise<void> {
  const result = await request<{ success: true; token: string }>('login', { username, password });
  if (!result.token) {
    throw new CrewApiError('The crew service did not return a session.', 502);
  }
  crewToken = result.token;
}

export async function validateSession(): Promise<void> {
  await request<{ success: true }>('validate');
}

export async function fetchCrewDashboard(): Promise<CrewDashboardData> {
  const result = await request<{ success: true; dashboard: CrewDashboardData }>('dashboard');
  return result.dashboard;
}

export async function logout(): Promise<void> {
  await request<{ success: true }>('logout');
  crewToken = null;
}

export function clearCrewToken(): void {
  crewToken = null;
}
