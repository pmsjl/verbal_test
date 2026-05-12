// Verbal Memory 核心测试逻辑
// 状态机 + 出题概率 p_seen = n / (n + K)
// 纯 TS，不依赖 React，通过 onTurn / onGameOver 回调暴露状态变化

const K = 3;

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

export function createVerbalTest({ wordlist, onTurn, onGameOver }: VerbalTestOptions): VerbalTest {
  const pool: string[] = shuffle(wordlist);
  const seen: string[] = [];
  let score = 0;
  let lives = 3;
  let currentWord: string | null = null;
  let currentIsSeen = false;
  let startTime = 0;
  let finished = false;

  function nextTurn() {
    if (finished) return;
    const n = seen.length;
    const showSeen = n > 0 && (pool.length === 0 || Math.random() < n / (n + K));
    if (showSeen) {
      currentWord = seen[Math.floor(Math.random() * seen.length)];
      currentIsSeen = true;
    } else {
      currentWord = pool.pop() ?? null;
      currentIsSeen = false;
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
