import { useEffect, useState } from "react";
import { listRecords, type RecordView } from "../lib/api";

const medal = (rank: number): string | null => {
  if (rank === 0) return "🥇";
  if (rank === 1) return "🥈";
  if (rank === 2) return "🥉";
  return null;
};

export default function Leaderboard() {
  const [records, setRecords] = useState<RecordView[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    listRecords()
      .then((data) => setRecords(data.sort((a, b) => b.score - a.score)))
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, []);

  if (error) {
    return (
      <section className="animate-fade-in bg-white rounded-2xl shadow-xl border border-gray-100 px-8 py-8 text-center">
        <p className="text-sm text-red-500">{error}</p>
      </section>
    );
  }

  if (records === null) {
    return (
      <section className="animate-fade-in bg-white rounded-2xl shadow-xl border border-gray-100 px-8 py-8 text-center">
        <p className="text-gray-400 text-sm">加载中…</p>
      </section>
    );
  }

  const music = records.filter((r) => r.condition === "music").slice(0, 10);
  const noMusic = records.filter((r) => r.condition === "no_music").slice(0, 10);

  return (
    <section className="animate-fade-in">
      <h2 className="text-xl font-bold text-gray-800 text-center mb-1">排行榜</h2>
      <p className="text-sm text-gray-400 text-center mb-6">各组前十名</p>

      {records.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 px-8 py-8 text-center">
          <p className="text-gray-400 text-sm">暂无记录</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GroupCard title="听音乐组" records={music} />
          <GroupCard title="不听音乐组" records={noMusic} />
        </div>
      )}
    </section>
  );
}

function GroupCard({
  title,
  records,
}: {
  title: string;
  records: RecordView[];
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <span className="text-xs text-gray-400">{records.length} 人</span>
      </div>

      {records.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-gray-300">暂无数据</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/50 text-gray-400 text-xs">
              <th className="text-center font-medium px-4 py-2.5 w-10">#</th>
              <th className="text-left font-medium px-3 py-2.5">昵称</th>
              <th className="text-right font-medium px-3 py-2.5">得分</th>
              <th className="text-right font-medium px-4 py-2.5">用时</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr
                key={r.id}
                className={`border-t border-gray-50 transition-colors ${
                  i < 3 ? "bg-amber-50/40" : "hover:bg-gray-50"
                }`}
              >
                <td className="text-center px-3 py-2.5">
                  {medal(i) ?? <span className="text-gray-300 text-xs font-medium">{i + 1}</span>}
                </td>
                <td className="px-3 py-2.5 font-medium text-gray-700 truncate">
                  {r.code}
                </td>
                <td className="text-right px-3 py-2.5 font-mono font-bold text-brand tabular-nums">
                  {r.score}
                </td>
                <td className="text-right px-4 py-2.5 text-gray-400 tabular-nums">
                  {(r.duration_ms / 1000).toFixed(1)}s
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
