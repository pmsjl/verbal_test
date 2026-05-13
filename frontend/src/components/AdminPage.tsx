import { useEffect, useState } from "react";
import { listRecords, exportCsvUrl, type EnglishLevel, type RecordView } from "../lib/api";

const ENGLISH_LABELS: Record<EnglishLevel, string> = {
  1: "弱",
  2: "中",
  3: "强",
};

function englishLabel(level: EnglishLevel | null): string {
  if (level === null) return "";
  return `${level} — ${ENGLISH_LABELS[level] ?? ""}`;
}

export default function AdminPage() {
  const [records, setRecords] = useState<RecordView[] | null>(null);
  const [error, setError] = useState("");

  async function refresh() {
    setError("");
    try {
      const data = await listRecords();
      setRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="min-h-full px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">实验员管理页 — 测试记录</h1>
          <div className="flex gap-3">
            <button
              onClick={refresh}
              className="rounded-md border border-gray-300 bg-white py-2 px-4 hover:bg-gray-100 transition-colors"
            >
              刷新
            </button>
            <a
              href={exportCsvUrl()}
              className="rounded-md bg-brand text-white font-semibold py-2 px-4 hover:bg-blue-600 transition-colors"
            >
              导出 CSV
            </a>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-300 bg-red-50 text-red-700 px-4 py-2 text-sm">
            加载失败：{error}
          </div>
        )}

        {records === null && !error && (
          <p className="text-gray-500">加载中…</p>
        )}

        {records !== null && records.length === 0 && (
          <p className="text-gray-500">暂无记录</p>
        )}

        {records !== null && records.length > 0 && (
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <Th>记录 ID</Th>
                  <Th>被试 ID</Th>
                  <Th>昵称</Th>
                  <Th>年龄</Th>
                  <Th>性别</Th>
                  <Th>英语水平</Th>
                  <Th>音乐习惯</Th>
                  <Th>条件</Th>
                  <Th>得分</Th>
                  <Th>用时 (ms)</Th>
                  <Th>测试时间</Th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <Td>{r.id}</Td>
                    <Td>{r.participant_id}</Td>
                    <Td>{r.code}</Td>
                    <Td>{r.age ?? ""}</Td>
                    <Td>{r.gender ?? ""}</Td>
                    <Td>{englishLabel(r.english_level)}</Td>
                    <Td>{r.music_habit ?? ""}</Td>
                    <Td>
                      <span
                        className={
                          r.condition === "music"
                            ? "inline-block rounded bg-blue-100 text-blue-700 px-2 py-0.5"
                            : "inline-block rounded bg-gray-100 text-gray-700 px-2 py-0.5"
                        }
                      >
                        {r.condition === "music" ? "听音乐" : "不听音乐"}
                      </span>
                    </Td>
                    <Td>{r.score}</Td>
                    <Td>{r.duration_ms}</Td>
                    <Td>{r.created_at}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left font-semibold px-4 py-2 whitespace-nowrap">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-2 whitespace-nowrap">{children}</td>;
}
