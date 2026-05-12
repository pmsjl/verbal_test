import { useEffect, useRef, useState } from "react";
import { submitRecord, type Condition } from "../lib/api";

interface Props {
  participantId: number;
  condition: Condition;
  score: number;
  durationMs: number;
}

type Status =
  | { kind: "submitting" }
  | { kind: "ok" }
  | { kind: "fail"; message: string };

export default function DoneScreen({ participantId, condition, score, durationMs }: Props) {
  const [status, setStatus] = useState<Status>({ kind: "submitting" });
  // 防止 React.StrictMode 在 dev 下 useEffect 双跑导致同一条结果被提交两次。
  // 注：组件展示这个结果时实验已结束，props 不会再变；用 ref 守卫一次即可。
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
    <section className="bg-white rounded-lg shadow-sm p-8 text-center">
      <h2 className="text-xl font-bold mb-6">测试完成，感谢参与</h2>
      <div className="flex flex-col gap-3 my-8 text-gray-600">
        <div>
          最终得分 <strong className="text-3xl text-brand ml-2">{score}</strong>
        </div>
        <div>
          用时 <strong className="text-3xl text-brand ml-2">{(durationMs / 1000).toFixed(1)}</strong> 秒
        </div>
      </div>
      <SubmitStatus
        status={status}
        fallback={`participant_id=${participantId}, condition=${condition}, score=${score}, duration_ms=${durationMs}`}
      />
    </section>
  );
}

function SubmitStatus({ status, fallback }: { status: Status; fallback: string }) {
  if (status.kind === "submitting") {
    return <p className="text-sm text-gray-500">正在提交…</p>;
  }
  if (status.kind === "ok") {
    return <p className="text-sm text-green-600">结果已提交，感谢配合</p>;
  }
  return (
    <p className="text-sm text-red-600">
      提交失败：{status.message}
      <br />
      <span className="text-gray-500">请将下面数据手动报告给实验员：{fallback}</span>
    </p>
  );
}
