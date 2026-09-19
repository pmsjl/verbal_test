import { useEffect, useState, useCallback } from "react";
import {
  adminLogin,
  adminLogout,
  ApiError,
  batchDeleteRecords,
  deleteRecord,
  downloadRecordsCsv,
  getAdminSession,
  listRecords,
  type RecordView,
} from "../lib/api";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [records, setRecords] = useState<RecordView[] | null>(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [confirm, setConfirm] = useState<{ kind: "single"; id: number } | { kind: "batch"; ids: number[] } | null>(null);

  async function refresh() {
    setError("");
    try {
      const data = await listRecords();
      setRecords(data);
      setSelected(new Set());
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setAuthenticated(false);
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  useEffect(() => {
    getAdminSession()
      .then((session) => {
        setAuthenticated(session.authenticated);
        if (session.authenticated) return refresh();
      })
      .catch((err) => {
        setAuthenticated(false);
        setError(err instanceof Error ? err.message : String(err));
      });
  }, []);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setAuthBusy(true);
    setError("");
    try {
      await adminLogin(username, password);
      setPassword("");
      setAuthenticated(true);
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError && err.status === 401
        ? "用户名或密码错误"
        : err instanceof Error ? err.message : String(err));
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleLogout() {
    setAuthBusy(true);
    setError("");
    try {
      await adminLogout();
      setRecords(null);
      setAuthenticated(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    setError("");
    try {
      await downloadRecordsCsv();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setAuthenticated(false);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setExporting(false);
    }
  }

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

  if (authenticated === null) {
    return <div className="min-h-full flex items-center justify-center text-sm text-gray-500">验证登录状态…</div>;
  }

  if (!authenticated) {
    return (
      <div className="min-h-full flex items-center justify-center px-4 py-8">
        <form onSubmit={handleLogin} className="w-full max-w-sm rounded-2xl bg-white border border-gray-100 shadow-xl px-8 py-8">
          <h1 className="text-xl font-bold text-gray-800 mb-1">实验员登录</h1>
          <p className="text-sm text-gray-400 mb-6">登录后可查看、导出和删除测试记录</p>
          {error && <div className="mb-4 rounded-md border border-red-300 bg-red-50 text-red-700 px-4 py-2 text-sm">{error}</div>}
          <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="admin-username">用户名</label>
          <input
            id="admin-username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="admin-password">密码</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            autoFocus
            className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <button
            type="submit"
            disabled={authBusy}
            className="w-full rounded-lg bg-brand text-white font-semibold py-2.5 hover:bg-indigo-700 disabled:bg-gray-300 transition-colors"
          >
            {authBusy ? "登录中…" : "登录"}
          </button>
        </form>
      </div>
    );
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
            <button
              onClick={handleExport}
              disabled={exporting}
              className="rounded-md bg-brand text-white font-semibold py-2 px-4 hover:bg-indigo-700 transition-colors text-sm"
            >
              {exporting ? "导出中…" : "导出 CSV"}
            </button>
            <button
              onClick={handleLogout}
              disabled={authBusy}
              className="rounded-md border border-gray-300 bg-white py-2 px-4 hover:bg-gray-100 transition-colors text-sm"
            >
              退出登录
            </button>
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
