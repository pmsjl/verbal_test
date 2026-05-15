import { useEffect, useRef, useState } from "react";
import { createVerbalTest, type Answer, type VerbalTest } from "../lib/verbalTest";
import { WORDLIST } from "../data/wordlist";
import type { Condition } from "../lib/api";

interface Props {
  condition: Condition;
  onGameOver: (result: { score: number; duration_ms: number }) => void;
}

type Flash = "correct" | "wrong" | null;

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
  const [lives, setLives] = useState(1);
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
    window.setTimeout(() => setFlash(null), 250);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "s" || e.key === "S") answer("SEEN");
      if (e.key === "n" || e.key === "N") answer("NEW");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const wordBgCls =
    flash === "correct"
      ? "bg-emerald-100"
      : flash === "wrong"
        ? "animate-flash-wrong"
        : "";

  return (
    <section className="flex flex-col items-center py-6 animate-fade-in">
      {/* 状态栏 */}
      <div className="flex gap-10 mb-14">
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-gray-400 uppercase tracking-wider">得分</span>
          <span className="text-3xl font-mono font-bold text-brand tabular-nums">
            {score}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-gray-400 uppercase tracking-wider">生命</span>
          <span className="flex gap-1 text-2xl">
            {[1].map((i) => (
              <span
                key={i}
                className={`transition-all duration-300 ${
                  i <= lives
                    ? "text-red-500 scale-110"
                    : "text-gray-300 scale-90"
                }`}
              >
                ♥
              </span>
            ))}
          </span>
        </div>
      </div>

      {/* 单词展示 */}
      <div
        className={`text-5xl sm:text-6xl font-semibold tracking-wider my-8 min-h-[80px] select-none px-8 py-4 rounded-xl transition-colors duration-150 ${wordBgCls}`}
        key={word}
      >
        {word}
      </div>

      {/* 按钮 */}
      <div className="flex gap-6 mt-12">
        <button
          onClick={() => answer("SEEN")}
          className="min-w-[160px] py-5 px-8 rounded-2xl bg-brand text-white font-bold text-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-md hover:shadow-lg"
        >
          SEEN
          <br />
          <span className="text-xs text-blue-100 font-normal">按 S</span>
        </button>
        <button
          onClick={() => answer("NEW")}
          className="min-w-[160px] py-5 px-8 rounded-2xl bg-emerald-500 text-white font-bold text-lg hover:bg-emerald-600 active:scale-95 transition-all shadow-md hover:shadow-lg"
        >
          NEW
          <br />
          <span className="text-xs text-emerald-100 font-normal">按 N</span>
        </button>
      </div>

      {AUDIO_SRC && <audio ref={audioRef} src={AUDIO_SRC} preload="auto" loop />}
    </section>
  );
}
