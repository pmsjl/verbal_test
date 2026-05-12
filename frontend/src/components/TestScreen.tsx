import { useEffect, useRef, useState } from "react";
import { createVerbalTest, type Answer, type VerbalTest } from "../lib/verbalTest";
import { WORDLIST } from "../data/wordlist";
import type { Condition } from "../lib/api";

interface Props {
  condition: Condition;
  onGameOver: (result: { score: number; duration_ms: number }) => void;
}

type Flash = "correct" | "wrong" | null;

// Vite 构建/dev 时扫描 src/assets/audio/，自动取第一个音频文件。
// 实验员只需把文件丢进去即可，无需改任何配置或 env。
const audioModules = import.meta.glob(
  "../assets/audio/*.{mp3,m4a,aac,wav,ogg,opus,flac}",
  { eager: true, query: "?url", import: "default" },
) as Record<string, string>;

const audioPaths = Object.keys(audioModules).sort();
const AUDIO_SRC: string | null =
  audioPaths.length > 0 ? audioModules[audioPaths[0]] : null;

if (audioPaths.length > 1) {
  console.warn(
    `src/assets/audio/ 下有 ${audioPaths.length} 个音频文件，将使用第一个：${audioPaths[0]}。请只保留一个文件。`,
  );
}

export default function TestScreen({ condition, onGameOver }: Props) {
  const [word, setWord] = useState("—");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [flash, setFlash] = useState<Flash>(null);

  const testRef = useRef<VerbalTest | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const test = createVerbalTest({
      wordlist: WORDLIST,
      onTurn: ({ word, score, lives }) => {
        setWord(word);
        setScore(score);
        setLives(lives);
      },
      onGameOver: (result) => {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        onGameOver(result);
      },
    });
    testRef.current = test;

    if (condition === "music" && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((e) => {
        console.warn("audio play failed:", e);
      });
    }

    test.start();

    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, [condition, onGameOver]);

  function answer(choice: Answer) {
    const t = testRef.current;
    if (!t) return;
    const result = t.answer(choice);
    if (!result) return;
    setFlash(result.correct ? "correct" : "wrong");
    window.setTimeout(() => setFlash(null), 200);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "s" || e.key === "S") answer("SEEN");
      if (e.key === "n" || e.key === "N") answer("NEW");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const flashCls =
    flash === "correct"
      ? "animate-flash-correct"
      : flash === "wrong"
        ? "animate-flash-wrong"
        : "";

  return (
    <section className="flex flex-col items-center py-6">
      <div className="flex gap-8 mb-12 text-gray-600">
        <div>
          得分 <span className="text-gray-900 font-bold ml-1.5">{score}</span>
        </div>
        <div>
          生命 <span className="text-gray-900 font-bold ml-1.5">{"♥".repeat(lives)}</span>
        </div>
      </div>

      <div
        className={`text-5xl sm:text-6xl font-semibold tracking-wider my-8 min-h-[80px] select-none px-6 py-2 rounded ${flashCls}`}
      >
        {word}
      </div>

      <div className="flex gap-6 mt-12">
        <AnswerButton onClick={() => answer("SEEN")} label="SEEN" hint="(S)" />
        <AnswerButton onClick={() => answer("NEW")} label="NEW" hint="(N)" />
      </div>

      {AUDIO_SRC && <audio ref={audioRef} src={AUDIO_SRC} preload="auto" />}
    </section>
  );
}

function AnswerButton({
  onClick,
  label,
  hint,
}: {
  onClick: () => void;
  label: string;
  hint: string;
}) {
  return (
    <button
      onClick={onClick}
      className="min-w-[140px] py-4 px-8 border-2 border-gray-300 bg-white rounded-lg font-semibold text-lg hover:bg-gray-100 hover:border-gray-500 active:scale-95 transition-all"
    >
      {label}
      <br />
      <small className="text-xs text-gray-500 font-normal">{hint}</small>
    </button>
  );
}
