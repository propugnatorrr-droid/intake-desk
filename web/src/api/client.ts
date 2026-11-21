import axios, { AxiosError } from 'axios';
import type { FieldErrors, Intake, IntakeFields, IntakeList, ListQuery, StatusValue } from '../types';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fields: FieldErrors = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const http = axios.create({
  baseURL: '/api',
  timeout: 10_000,
  headers: { Accept: 'application/json' },
});

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (error instanceof AxiosError) {
    if (error.response) {
      const body = error.response.data as { error?: { message?: string; fields?: FieldErrors } } | undefined;
      return new ApiError(
        body?.error?.message ?? 'The server could not complete that request.',
        error.response.status,
        body?.error?.fields ?? {},
      );
    }
    if (error.code === 'ECONNABORTED') {
      return new ApiError('The server took too long to answer. Try again.', 0);
    }
    return new ApiError('We could not reach the server. Check your connection and try again.', 0);
  }

  return new ApiError('Something unexpected went wrong.', 0);
}

async function request<T>(run: () => Promise<{ data: T }>): Promise<T> {
  try {
    return (await run()).data;
  } catch (error) {
    // A cancelled request is the router moving on, not a failure the user should see.
    if (axios.isCancel(error)) throw error;
    throw toApiError(error);
  }
}

export async function listIntakes(query: ListQuery, signal?: AbortSignal): Promise<IntakeList> {
  const params: Record<string, string> = { sort: query.sort };
  if (query.status) params.status = query.status;
  if (query.q.trim()) params.q = query.q.trim();

  const body = await request<{ data: Intake[]; meta: { total: number; counts: IntakeList['counts'] } }>(() =>
    http.get('/intakes', { params, signal }),
  );

  return { items: body.data, total: body.meta.total, counts: body.meta.counts };
}

export async function getIntake(id: number, signal?: AbortSignal): Promise<Intake> {
  const body = await request<{ data: Intake }>(() => http.get(`/intakes/${id}`, { signal }));
  return body.data;
}

export async function createIntake(fields: IntakeFields): Promise<Intake> {
  const body = await request<{ data: Intake }>(() => http.post('/intakes', fields));
  return body.data;
}

export async function updateIntake(id: number, changes: Partial<IntakeFields> & { status?: StatusValue }): Promise<Intake> {
  const body = await request<{ data: Intake }>(() => http.patch(`/intakes/${id}`, changes));
  return body.data;
}
