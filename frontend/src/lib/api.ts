const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";

export type Condition = "no_music" | "music";

/** 1=弱 / 2=中 / 3=强（自评，前端表单只允许 1/2/3）。 */
export type EnglishLevel = 1 | 2 | 3;

export interface ParticipantInfo {
  code: string;
  age: number;
  gender: string;
  english_level: EnglishLevel;
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
  english_level: EnglishLevel | null;
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
