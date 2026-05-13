import { useEffect, useState, useCallback } from "react";
import { listRecords, deleteRecord, batchDeleteRecords, exportCsvUrl, type EnglishLevel, type RecordView } from "../lib/api";

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
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState<{ kind: "single"; id: number } | { kind: "batch"; ids: number[] } | null>(null);

  async function refresh() {
    setError("");
    try {
      const data = await listRecords();
      setRecords(data);
      setSelected(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const toggle = useCallback((id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (!records) return;
    setSelected((prev) => {
      if (prev.size === records.length) return new Set();
      return new Set(records.map((r) => r.id));
    });
  }, [records]);

  async function handleConfirm() {
    if (!confirm) return;
    setDeleting(true);
    try {
      if (confirm.kind === "single") {
        await deleteRecord(confirm.id);
      } else {
        await batchDeleteRecords(confirm.ids);
      }
      setConfirm(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-full px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">实验员管理页 — 测试记录</h1>
          <div className="flex gap-3">
            <button
              onClick={refresh}
              className="rounded-md border border-gray-300 bg-white py-2 px-4 hover:bg-gray-100 transition-colors text-sm"
            >
              刷新
            </button>
            <a
              href={exportCsvUrl()}
              className="rounded-md bg-brand text-white font-semibold py-2 px-4 hover:bg-indigo-700 transition-colors text-sm"
            >
              导出 CSV
            </a>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-300 bg-red-50 text-red-700 px-4 py-2 text-sm">
            {error}
          </div>
        )}

        {records !== null && records.length > 0 && selected.size > 0 && (
          <div className="mb-3 flex items-center gap-3">
            <span className="text-sm text-gray-500">已选 {selected.size} 条</span>
            <button
              onClick={() => setConfirm({ kind: "batch", ids: Array.from(selected) })}
              className="rounded-md border border-red-300 bg-white text-red-600 py-1.5 px-4 text-sm hover:bg-red-50 transition-colors"
            >
              删除选中
            </button>
          </div>
        )}

        {records === null && !error && (
          <p className="text-gray-500">加载中…</p>
        )}

        {records !== null && records.length === 0 && (
          <p className="text-gray-500">暂无记录</p>
        )}

        {records !== null && records.length > 0 && (
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-100">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <Th>
                    <input
                      type="checkbox"
                      checked={selected.size === records.length}
                      onChange={toggleAll}
                      className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand"
                    />
                  </Th>
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
                  <Th>操作</Th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <Td>
                      <input
                        type="checkbox"
                        checked={selected.has(r.id)}
                        onChange={() => toggle(r.id)}
                        className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand"
                      />
                    </Td>
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
                            ? "inline-block rounded bg-indigo-100 text-indigo-700 px-2 py-0.5"
                            : "inline-block rounded bg-gray-100 text-gray-700 px-2 py-0.5"
                        }
                      >
                        {r.condition === "music" ? "听音乐" : "不听音乐"}
                      </span>
                    </Td>
                    <Td>{r.score}</Td>
                    <Td>{r.duration_ms}</Td>
                    <Td>{r.created_at}</Td>
                    <Td>
                      <button
                        onClick={() => setConfirm({ kind: "single", id: r.id })}
                        className="text-red-500 hover:text-red-700 text-xs font-medium transition-colors"
                      >
                        删除
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 确认弹窗 */}
        {confirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30" onClick={() => setConfirm(null)} />
            <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 px-8 py-6 max-w-sm w-full mx-4 animate-scale-in">
              <p className="text-gray-800 font-semibold mb-1">确认删除</p>
              <p className="text-sm text-gray-500 mb-6">
                {confirm.kind === "single"
                  ? `确定要删除记录 #${confirm.id} 吗？`
                  : `确定要删除选中的 ${confirm.ids.length} 条记录吗？`}
                <br />
                此操作不可撤销。
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirm(null)}
                  disabled={deleting}
                  className="rounded-lg border border-gray-300 bg-white py-2 px-5 text-sm hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={deleting}
                  className="rounded-lg bg-red-600 text-white py-2 px-5 text-sm font-medium hover:bg-red-700 disabled:bg-gray-300 transition-colors"
                >
                  {deleting ? "删除中…" : "确定删除"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left font-semibold px-3 py-2 whitespace-nowrap">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2 whitespace-nowrap">{children}</td>;
}
