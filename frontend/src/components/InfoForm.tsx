import { useState, type FormEvent } from "react";
import { createParticipant, type Condition, type EnglishLevel } from "../lib/api";

interface Props {
  onSubmitted: (participantId: number, condition: Condition) => void;
}

export default function InfoForm({ onSubmitted }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const condition = fd.get("condition") as Condition;
    const payload = {
      code: String(fd.get("code") ?? "").trim(),
      age: parseInt(String(fd.get("age") ?? ""), 10),
      gender: String(fd.get("gender") ?? ""),
      english_level: parseInt(String(fd.get("english_level") ?? ""), 10) as EnglishLevel,
      music_habit: String(fd.get("music_habit") ?? "").trim(),
    };
    setSubmitting(true);
    try {
      const resp = await createParticipant(payload);
      onSubmitted(resp.participant_id, condition);
    } catch (err) {
      setError("提交失败：" + (err instanceof Error ? err.message : String(err)));
      setSubmitting(false);
    }
  }

  return (
    <section className="bg-white rounded-lg shadow-sm p-8">
      <h1 className="text-2xl font-bold tracking-wide text-center mb-1">
        Verbal Memory 实验
      </h1>
      <p className="text-sm text-gray-500 text-center mb-6">请填写信息后开始</p>

      <form onSubmit={handleSubmit} autoComplete="off" className="flex flex-col gap-4">
        <Field label="被试编号">
          <input name="code" required maxLength={32} placeholder="例 P001" className={inputCls} />
        </Field>
        <Field label="年龄">
          <input type="number" name="age" required min={10} max={100} className={inputCls} />
        </Field>
        <Field label="性别">
          <select name="gender" required defaultValue="" className={inputCls}>
            <option value="" disabled>请选择</option>
            <option value="男">男</option>
            <option value="女">女</option>
            <option value="其他">其他</option>
          </select>
        </Field>
        <Field label="英语水平自评（1=弱 / 2=中 / 3=强）">
          <select name="english_level" required defaultValue="" className={inputCls}>
            <option value="" disabled>请选择</option>
            <option value="1">1 — 弱（基本英语，专四以下）</option>
            <option value="2">2 — 中（专四 / CET-6 通过）</option>
            <option value="3">3 — 强（专八 / 海外背景 / 母语水平）</option>
          </select>
        </Field>
        <Field label="日常听音乐习惯">
          <input
            name="music_habit"
            required
            maxLength={64}
            placeholder="例 每天 1 小时，流行/古典"
            className={inputCls}
          />
        </Field>
        <Field label="实验条件">
          <select name="condition" required defaultValue="" className={inputCls}>
            <option value="" disabled>请选择</option>
            <option value="no_music">不听音乐</option>
            <option value="music">听音乐</option>
          </select>
        </Field>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-md bg-brand text-white font-semibold py-3 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? "提交中…" : "下一步"}
        </button>
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </form>
    </section>
  );
}

const inputCls =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:border-brand focus:ring-2 focus:ring-blue-200";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-gray-600">
      <span>{label}</span>
      {children}
    </label>
  );
}
