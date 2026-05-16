const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";

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

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(API_BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} failed: HTTP ${res.status}`);
  return (await res.json()) as T;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(API_BASE + path);
  if (!res.ok) throw new Error(`${path} failed: HTTP ${res.status}`);
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

export function exportCsvUrl() {
  return API_BASE + "/api/records/export";
}

export async function deleteRecord(id: number) {
  const res = await fetch(`${API_BASE}/api/records/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`delete ${id} failed: HTTP ${res.status}`);
}

export async function batchDeleteRecords(ids: number[]) {
  const res = await fetch(`${API_BASE}/api/records/batch-delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ids),
  });
  if (!res.ok) throw new Error(`batch delete failed: HTTP ${res.status}`);
  return (await res.json()) as number;
}
