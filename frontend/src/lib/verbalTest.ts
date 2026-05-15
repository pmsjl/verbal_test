// Verbal Memory 核心测试逻辑
// 前 2 轮必出 NEW，第 3 轮起 P(SEEN)=0.4 P(NEW)=0.6
// 同一词不连续出现，连续 5 次 NEW 后强制出 SEEN
// 纯 TS，不依赖 React，通过 onTurn / onGameOver 回调暴露状态变化

export type Answer = "SEEN" | "NEW";

export interface TurnState {
  word: string;
  score: number;
  lives: number;
}

export interface GameOverState {
  score: number;
  duration_ms: number;
}

export interface VerbalTestOptions {
  wordlist: readonly string[];
  onTurn: (state: TurnState) => void;
  onGameOver: (state: GameOverState) => void;
}

export interface VerbalTest {
  start: () => void;
  answer: (choice: Answer) => { correct: boolean; gameOver: boolean } | null;
}

function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const P_SEEN = 0.4;
const FORCE_SEEN_AFTER_NEW = 5;

export function createVerbalTest({ wordlist, onTurn, onGameOver }: VerbalTestOptions): VerbalTest {
  const pool: string[] = shuffle(wordlist);
  const seen: string[] = [];
  let score = 0;
  let lives = 1;
  let currentWord: string | null = null;
  let currentIsSeen = false;
  let startTime = 0;
  let finished = false;
  let consecutiveNew = 0;

  // 从已见词池选词，排除指定词（避免连续出现同一词）
  function pickSeen(exclude: string | null): string | null {
    const candidates = exclude != null ? seen.filter((w) => w !== exclude) : seen;
    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  function nextTurn() {
    if (finished) return;

    let showSeen: boolean;

    // 前 2 轮（seen 还没词）必出 NEW
    if (seen.length === 0) {
      showSeen = false;
    }
    // 连续 5 个 NEW 后强制出 SEEN
    else if (consecutiveNew >= FORCE_SEEN_AFTER_NEW) {
      showSeen = true;
    }
    // 正常概率：40% SEEN, 60% NEW
    else {
      showSeen = Math.random() < P_SEEN;
    }

    if (showSeen) {
      const word = pickSeen(currentWord);
      if (word === null) {
        // 排除当前词后无可选，降级出新词
        showSeen = false;
      } else {
        currentWord = word;
        currentIsSeen = true;
        consecutiveNew = 0;
      }
    }

    if (!showSeen) {
      const word = pool.pop() ?? null;
      if (word === null) {
        // 新词池耗尽，出已见词
        const fallback = pickSeen(currentWord);
        if (fallback === null) return; // 极端情况：没有任何可选词
        currentWord = fallback;
        currentIsSeen = true;
        consecutiveNew = 0;
      } else {
        currentWord = word;
        currentIsSeen = false;
        consecutiveNew += 1;
      }
    }

    if (currentWord === null) return;
    onTurn({ word: currentWord, score, lives });
  }

  function answer(choice: Answer) {
    if (finished || currentWord === null) return null;
    const correct =
      (choice === "SEEN" && currentIsSeen) ||
      (choice === "NEW" && !currentIsSeen);
    if (correct) {
      score += 1;
    } else {
      lives -= 1;
    }
    if (!currentIsSeen) {
      seen.push(currentWord);
    }
    if (lives <= 0) {
      finished = true;
      const endTime = performance.now();
      onGameOver({ score, duration_ms: Math.round(endTime - startTime) });
      return { correct, gameOver: true };
    }
    nextTurn();
    return { correct, gameOver: false };
  }

  function start() {
    startTime = performance.now();
    nextTurn();
  }

  return { start, answer };
}
