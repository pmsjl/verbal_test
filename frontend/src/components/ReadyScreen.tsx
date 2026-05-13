import type { Condition } from "../lib/api";

interface Props {
  condition: Condition;
  onStart: () => void;
}

export default function ReadyScreen({ condition, onStart }: Props) {
  return (
    <section className="animate-fade-in bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden text-center">
      <div className="px-8 py-8">
        <h2 className="text-xl font-bold text-gray-800 text-center mb-2">准备开始</h2>

        {/* 实验简介 */}
        <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
          这是一个英语单词记忆测试，用于研究音乐对短时记忆的影响。
          <br />
          测试约持续 2-5 分钟，请保持专注。
        </p>

        {/* 规则区 */}
        <div className="mb-6 rounded-2xl bg-gray-50 px-5 py-4 text-center">
          <p className="text-sm font-semibold text-gray-700 mb-3">测试规则</p>
          <div className="text-sm text-gray-500 space-y-2 leading-relaxed">
            <p>
              屏幕逐一显示英文单词，你需要判断每个词是<strong className="text-gray-700">第一次出现（NEW）</strong>还是<strong className="text-gray-700">已经出现过（SEEN）</strong>
            </p>
            <p>
              初始有 <strong className="text-gray-700">3 条命</strong>，答错扣 1 命，全部扣完则测试结束
            </p>
            <p>
              答对得分 +1；随着测试推进，记忆难度逐渐增加
            </p>
          </div>
        </div>

        {/* NEW / SEEN 色块 */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-center">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3">
            <p className="text-emerald-600 font-semibold text-sm mb-1">NEW — 没见过</p>
            <p className="text-gray-500 text-xs">
              该词在本轮测试中第一次出现，选择 NEW
            </p>
          </div>
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 px-4 py-3">
            <p className="text-indigo-600 font-semibold text-sm mb-1">SEEN — 见过</p>
            <p className="text-gray-500 text-xs">
              该词在本轮中已经出现过，选择 SEEN
            </p>
          </div>
        </div>

        {/* 键盘提示 */}
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          可以使用键盘快捷键快速作答：
          <br />
          <Kbd>N</Kbd> = NEW　　<Kbd>S</Kbd> = SEEN
          <br />
          <span className="text-xs text-gray-400">（也可以点击下方按钮）</span>
        </p>

        {/* 条件 */}
        <div className="mb-8">
          {condition === "music" ? (
            <span className="inline-flex items-center rounded-lg bg-indigo-50 text-indigo-600 text-sm font-medium px-4 py-2 border border-indigo-200">
              听音乐组 · 开始后将自动播放实验音频
            </span>
          ) : (
            <span className="inline-flex items-center rounded-lg bg-gray-50 text-gray-500 text-sm font-medium px-4 py-2 border border-gray-200">
              不听音乐组 · 全程静音
            </span>
          )}
        </div>

        <button
          onClick={onStart}
          className="animate-pulse-once rounded-xl bg-brand text-white font-semibold py-4 px-12 text-lg hover:bg-indigo-700 transition-colors"
        >
          开始测试
        </button>
      </div>
    </section>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-block bg-gray-600 text-white rounded-md px-2 py-0.5 font-mono text-xs font-semibold">
      {children}
    </kbd>
  );
}
