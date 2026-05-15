import { useState, type FormEvent } from "react";
import CustomSelect from "./CustomSelect";
import { createParticipant, type Condition, type EnglishLevel } from "../lib/api";

interface Props {
  onSubmitted: (participantId: number, condition: Condition) => void;
}

/* ---------- localStorage 缓存 ---------- */

const STORAGE_KEY = "verbal_participant_info";

interface CachedInfo {
  nickname: string;
  age: string;
  gender: string;
  englishLevel: string;
  musicHabit: string;
}

function loadCachedInfo(): CachedInfo | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.nickname === "string") return parsed as CachedInfo;
    return null;
  } catch {
    return null;
  }
}

function saveCachedInfo(info: CachedInfo) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
  } catch {
    // quota 满或隐私模式，静默忽略
  }
}

/* --------------------------------------- */

const GENDER_OPTIONS = [
  { value: "男", label: "男" },
  { value: "女", label: "女" },
];

const ENGLISH_OPTIONS = [
  { value: "1", label: "弱 — 基本英语，专四以下" },
  { value: "2", label: "中 — 专四 / CET-6 通过" },
  { value: "3", label: "强 — 专八 / 海外背景" },
];

export default function InfoForm({ onSubmitted }: Props) {
  const [cachedInfo] = useState(() => loadCachedInfo());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [hasCachedData, setHasCachedData] = useState(cachedInfo !== null);

  const [nickname, setNickname] = useState(cachedInfo?.nickname ?? "");
  const [age, setAge] = useState(cachedInfo?.age ?? "");
  const [gender, setGender] = useState(cachedInfo?.gender ?? "");
  const [englishLevel, setEnglishLevel] = useState(cachedInfo?.englishLevel ?? "");
  const [musicHabit, setMusicHabit] = useState(cachedInfo?.musicHabit ?? "");
  const [condition, setCondition] = useState<Condition | "">("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!nickname.trim() || !age || !gender || !englishLevel || !musicHabit.trim() || !condition) {
      setError("请填写所有必填项");
      return;
    }

    setSubmitting(true);
    try {
      const resp = await createParticipant({
        code: nickname.trim(),
        age: parseInt(age, 10),
        gender,
        english_level: parseInt(englishLevel, 10) as EnglishLevel,
        music_habit: musicHabit.trim(),
      });
      saveCachedInfo({
        nickname: nickname.trim(),
        age,
        gender,
        englishLevel,
        musicHabit: musicHabit.trim(),
      });
      onSubmitted(resp.participant_id, condition);
    } catch (err) {
      setError("提交失败：" + (err instanceof Error ? err.message : String(err)));
      setSubmitting(false);
    }
  }

  function handleClearCache() {
    localStorage.removeItem(STORAGE_KEY);
    setNickname("");
    setAge("");
    setGender("");
    setEnglishLevel("");
    setMusicHabit("");
    setHasCachedData(false);
  }

  return (
    <section className="animate-scale-in bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* 标题 */}
      <div className="px-8 pt-7 pb-5">
        <h1 className="text-2xl font-bold text-gray-800 text-center tracking-tight">
          Verbal Memory
        </h1>
        <p className="text-sm text-gray-400 text-center mt-1.5 leading-relaxed">
          一段简短的英文单词记忆测试
        </p>
      </div>

      <form onSubmit={handleSubmit} autoComplete="off" className="px-8 pb-8">
        {/* 欢迎回来提示 */}
        {hasCachedData && (
          <div className="mb-5 rounded-xl bg-indigo-50/50 border border-indigo-100 px-4 py-2.5 text-xs text-gray-500 flex items-center justify-between">
            <span>
              欢迎回来，<span className="font-medium text-gray-700">{cachedInfo?.nickname}</span>
              ！信息已自动填写，请选择本次实验条件。
            </span>
            <button
              type="button"
              onClick={handleClearCache}
              className="text-gray-400 hover:text-gray-600 underline underline-offset-2 ml-3 shrink-0"
            >
              清除记录
            </button>
          </div>
        )}

        {/* 个人信息区 */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              昵称
            </label>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={32}
              placeholder="你的昵称"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                年龄
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min={10}
                max={100}
                placeholder="18"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                性别
              </label>
              <CustomSelect
                options={GENDER_OPTIONS}
                value={gender}
                onChange={setGender}
                placeholder="请选择"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              英语水平
            </label>
            <CustomSelect
              options={ENGLISH_OPTIONS}
              value={englishLevel}
              onChange={setEnglishLevel}
              placeholder="请选择你的英语水平"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              日常听音乐习惯
            </label>
            <input
              value={musicHabit}
              onChange={(e) => setMusicHabit(e.target.value)}
              maxLength={64}
              placeholder="如：每天 1 小时，流行 / 古典"
              className={inputCls}
            />
          </div>
        </div>

        {/* 分割 */}
        <div className="my-7 flex items-center gap-3">
          <div className="flex-1 border-t border-gray-100" />
          <span className="text-xs text-gray-400 font-medium">实验设置</span>
          <div className="flex-1 border-t border-gray-100" />
        </div>

        {/* 参与说明 */}
        <div className="mb-5 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 text-xs text-gray-500 leading-relaxed">
          <p>为了数据的严谨性，希望你在「听音乐」和「不听音乐」两种条件下各完成一次</p>
          <p>如果对成绩不满意可以多来几次，多次参与时建议沿用同一个昵称，方便我们把你的成绩关联起来</p>
        </div>

        {/* 实验条件 — 两张选卡 */}
        <div className="mb-7">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            实验条件
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setCondition("no_music")}
              className={`rounded-2xl border-2 p-5 text-center transition-all ${condition === "no_music"
                ? "border-indigo-300 bg-indigo-50 shadow-sm"
                : "border-gray-150 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                }`}
            >
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2">
                  <path d="M18.36 6.64A9 9 0 0 1 20.77 15" />
                  <path d="M6.343 6.343a9 9 0 0 0 0 12.728" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-700">不听音乐</p>
              <p className="text-xs text-gray-400 mt-0.5">全程静音</p>
            </button>
            <button
              type="button"
              onClick={() => setCondition("music")}
              className={`rounded-2xl border-2 p-5 text-center transition-all ${condition === "music"
                ? "border-indigo-300 bg-indigo-50 shadow-sm"
                : "border-gray-150 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                }`}
            >
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-700">听音乐</p>
              <p className="text-xs text-gray-400 mt-0.5">播放实验音频</p>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-2xl bg-brand text-white font-semibold py-3.5 text-base hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {submitting ? "提交中…" : "开始实验"}
        </button>
        {error && <p className="text-sm text-rose-500 mt-3 text-center">{error}</p>}
      </form>
    </section>
  );
}

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 text-sm placeholder:text-gray-300 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all";
