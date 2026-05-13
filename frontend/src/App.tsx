import { useMemo, useState } from "react";
import InfoForm from "./components/InfoForm";
import ReadyScreen from "./components/ReadyScreen";
import TestScreen from "./components/TestScreen";
import DoneScreen from "./components/DoneScreen";
import AdminPage from "./components/AdminPage";
import type { Condition } from "./lib/api";

type Phase = "info" | "ready" | "test" | "done";

interface Result {
  score: number;
  duration_ms: number;
}

export default function App() {
  const isAdmin = useMemo(
    () => new URLSearchParams(window.location.search).has("admin"),
    [],
  );

  const [phase, setPhase] = useState<Phase>("info");
  const [participantId, setParticipantId] = useState<number | null>(null);
  const [condition, setCondition] = useState<Condition | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  if (isAdmin) return <AdminPage />;

  return (
    <div className="min-h-full flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl" key={phase}>
        {phase === "info" && (
          <InfoForm
            onSubmitted={(id, c) => {
              setParticipantId(id);
              setCondition(c);
              setPhase("ready");
            }}
          />
        )}
        {phase === "ready" && condition && (
          <ReadyScreen condition={condition} onStart={() => setPhase("test")} />
        )}
        {phase === "test" && condition && (
          <TestScreen
            condition={condition}
            onGameOver={(r) => {
              setResult(r);
              setPhase("done");
            }}
          />
        )}
        {phase === "done" && result && condition && participantId !== null && (
          <DoneScreen
            participantId={participantId}
            condition={condition}
            score={result.score}
            durationMs={result.duration_ms}
          />
        )}
      </div>
    </div>
  );
}
