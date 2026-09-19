const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";

let csrfToken = "";
let csrfHeader = "X-CSRF-TOKEN";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

function requestInit(init: RequestInit = {}): RequestInit {
  const headers = new Headers(init.headers);
  const method = (init.method ?? "GET").toUpperCase();
  if (csrfToken && !["GET", "HEAD", "OPTIONS"].includes(method)) {
    headers.set(csrfHeader, csrfToken);
  }
  return { ...init, headers, credentials: "include" };
}

async function requireOk(res: Response, label: string) {
  if (!res.ok) throw new ApiError(`${label} failed: HTTP ${res.status}`, res.status);
}

export type Condition = "no_music" | "music";

export interface ParticipantInfo {
  code: string;
  age: number;
  gender: string;
  music_habit: string;
}

export interface CreateParticipantResponse {
  participant_id: number;
}

export interface RecordSubmission {
  participant_id: number;
  condition: Condition;
  score: number;
  duration_ms: number;
}

export interface CreateRecordResponse {
  record_id: number;
}

export interface RecordView {
  id: number;
  participant_id: number;
  code: string;
  age: number | null;
  gender: string | null;
  music_habit: string | null;
  condition: Condition;
  score: number;
  duration_ms: number;
  created_at: string;
}

export interface LeaderboardEntry {
  id: number;
  code: string;
  condition: Condition;
  score: number;
  duration_ms: number;
}

export interface AdminSession {
  authenticated: boolean;
  username: string | null;
  csrf_token: string;
  csrf_header: string;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(API_BASE + path, requestInit({
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }));
  await requireOk(res, path);
  return (await res.json()) as T;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(API_BASE + path, requestInit());
  await requireOk(res, path);
  return (await res.json()) as T;
}

export function createParticipant(info: ParticipantInfo) {
  return postJson<CreateParticipantResponse>("/api/participants", info);
}

export function submitRecord(record: RecordSubmission) {
  return postJson<CreateRecordResponse>("/api/records", record);
}

export function listRecords() {
  return getJson<RecordView[]>("/api/records");
}

export function listLeaderboard() {
  return getJson<LeaderboardEntry[]>("/api/records/leaderboard");
}

export async function getAdminSession() {
  const session = await getJson<AdminSession>("/api/admin/session");
  csrfToken = session.csrf_token;
  csrfHeader = session.csrf_header;
  return session;
}

export async function adminLogin(username: string, password: string) {
  const res = await fetch(API_BASE + "/api/admin/login", requestInit({
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  }));
  await requireOk(res, "/api/admin/login");
  return getAdminSession();
}

export async function adminLogout() {
  const res = await fetch(API_BASE + "/api/admin/logout", requestInit({ method: "POST" }));
  await requireOk(res, "/api/admin/logout");
  csrfToken = "";
}

export async function downloadRecordsCsv() {
  const res = await fetch(API_BASE + "/api/records/export", requestInit());
  await requireOk(res, "/api/records/export");
  const disposition = res.headers.get("Content-Disposition") ?? "";
  const filename = disposition.match(/filename="?([^";]+)"?/i)?.[1] ?? "verbal_test_records.csv";
  const url = URL.createObjectURL(await res.blob());
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function deleteRecord(id: number) {
  const res = await fetch(`${API_BASE}/api/records/${id}`, requestInit({ method: "DELETE" }));
  await requireOk(res, `delete ${id}`);
}

export async function batchDeleteRecords(ids: number[]) {
  const res = await fetch(`${API_BASE}/api/records/batch-delete`, requestInit({
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ids),
  }));
  await requireOk(res, "batch delete");
  return (await res.json()) as number;
}
