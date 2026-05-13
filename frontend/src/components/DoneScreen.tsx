import { useEffect, useRef, useState } from "react";
import { submitRecord, type Condition } from "../lib/api";

interface Props {
  participantId: number;
  condition: Condition;
  score: number;
  durationMs: number;
  onViewLeaderboard: () => void;
}

type Status =
  | { kind: "submitting" }
  | { kind: "ok" }
  | { kind: "fail"; message: string };

export default function DoneScreen({ participantId, condition, score, durationMs, onViewLeaderboard }: Props) {
  const [status, setStatus] = useState<Status>({ kind: "submitting" });
  const submittedRef = useRef(false);

  useEffect(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    submitRecord({
      participant_id: participantId,
      condition,
      score,
      duration_ms: durationMs,
    })
      .then(() => setStatus({ kind: "ok" }))
      .catch((err) =>
        setStatus({
          kind: "fail",
          message: err instanceof Error ? err.message : String(err),
        }),
      );
  }, [participantId, condition, score, durationMs]);

  return (
    <section className="animate-fade-in bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden text-center">
      <div className="px-8 py-10">
        <h2 className="text-xl font-bold text-gray-800 mb-8">测试完成，感谢参与</h2>

        <div className="flex justify-center gap-5 mb-8">
          <div className="rounded-2xl bg-gray-50 px-8 py-6 min-w-[160px]">
            <p className="text-xs text-gray-400 mb-2">最终得分</p>
            <p className="text-5xl font-bold text-brand">{score}</p>
          </div>
          <div className="rounded-2xl bg-gray-50 px-8 py-6 min-w-[160px]">
            <p className="text-xs text-gray-400 mb-2">用时</p>
            <p className="text-2xl font-bold text-gray-700">
              {(durationMs / 1000).toFixed(1)}
              <span className="text-sm font-normal text-gray-400 ml-0.5">秒</span>
            </p>
          </div>
        </div>

        <SubmitStatus
          status={status}
          fallback={`participant_id=${participantId}, condition=${condition}, score=${score}, duration_ms=${durationMs}`}
        />

        {status.kind === "ok" && (
          <button
            onClick={onViewLeaderboard}
            className="mt-8 rounded-xl border border-gray-200 bg-white text-gray-600 font-medium py-2.5 px-6 text-sm hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            查看排行榜 →
          </button>
        )}
      </div>
    </section>
  );
}

function SubmitStatus({ status, fallback }: { status: Status; fallback: string }) {
  if (status.kind === "submitting") {
    return (
      <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
        <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-brand rounded-full animate-spin" />
        正在提交…
      </div>
    );
  }
  if (status.kind === "ok") {
    return (
      <div className="flex items-center justify-center gap-1.5 text-sm text-emerald-600 font-medium">
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M3 8l3.5 3.5L13 5" />
        </svg>
        结果已保存
      </div>
    );
  }
  return (
    <p className="text-sm text-red-500">
      提交失败：{status.message}
      <br />
      <span className="text-gray-400">请将下面数据手动报告给实验员：{fallback}</span>
    </p>
  );
}
