import type { Condition } from "../lib/api";

interface Props {
  condition: Condition;
  onStart: () => void;
}

export default function ReadyScreen({ condition, onStart }: Props) {
  return (
    <section className="bg-white rounded-lg shadow-sm p-8 text-center">
      <h2 className="text-xl font-bold mb-6">准备开始</h2>
      <p className="text-gray-600 leading-relaxed mb-4">
        屏幕会逐个显示英文单词，请判断该词在本轮中是否出现过：
        <br />
        <strong>NEW</strong> = 没见过　<strong>SEEN</strong> = 见过
        <br />
        键盘快捷键 <Kbd>N</Kbd> / <Kbd>S</Kbd>
        <br />
        初始 3 条命，答错一次扣 1 命，命扣完游戏结束。
      </p>
      <p className="text-brand font-semibold text-sm mb-8">
        {condition === "music"
          ? "实验条件：听音乐组 — 点击开始后会播放实验音频"
          : "实验条件：不听音乐组 — 全程静音"}
      </p>
      <button
        onClick={onStart}
        className="rounded-md bg-brand text-white font-semibold py-3 px-8 hover:bg-blue-600 transition-colors"
      >
        开始测试
      </button>
    </section>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-block bg-gray-100 border border-gray-300 rounded px-1.5 py-0.5 font-mono text-xs">
      {children}
    </kbd>
  );
}
