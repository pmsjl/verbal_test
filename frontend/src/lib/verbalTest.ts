// Verbal Memory 核心状态机：IDLE -> AWAITING_ANSWER -> FINISHED
// 每道题的刺激类型为 NEW 或 SEEN；前 2 题必为 NEW，之后目标比例为 40% SEEN。
// 同一词不连续出现，连续 5 次 NEW 后强制出 SEEN。

export type Answer = "SEEN" | "NEW";
export type TestPhase = "IDLE" | "AWAITING_ANSWER" | "FINISHED";

export interface TurnState {
  word: string;
  score: number;
  lives: number;
  questionNumber: number;
}

export interface GameOverState {
  score: number;
  duration_ms: number;
}

export interface TestSnapshot {
  phase: TestPhase;
  score: number;
  lives: number;
  questionCount: number;
  newCount: number;
  seenCount: number;
}

export interface VerbalTestOptions {
  wordlist: readonly string[];
  onTurn: (state: TurnState) => void;
  onGameOver: (state: GameOverState) => void;
  /** 测试注入点；生产环境使用 Math.random。 */
  random?: () => number;
  /** 测试注入点；生产环境使用 performance.now。 */
  now?: () => number;
}

export interface VerbalTest {
  start: () => void;
  answer: (choice: Answer) => { correct: boolean; gameOver: boolean } | null;
  getSnapshot: () => TestSnapshot;
}

const TARGET_SEEN_RATIO = 0.4;
const WARMUP_NEW_TURNS = 2;
const FORCE_SEEN_AFTER_NEW = 5;

function shuffle<T>(arr: readonly T[], random: () => number): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function createVerbalTest({
  wordlist,
  onTurn,
  onGameOver,
  random = Math.random,
  now = () => performance.now(),
}: VerbalTestOptions): VerbalTest {
  // Set 同时防止上游词表误含重复项，否则同一拼写可能被错判为 NEW。
  const uniqueWords = [...new Set(wordlist.map((word) => word.trim()).filter(Boolean))];
  if (uniqueWords.length < WARMUP_NEW_TURNS) {
    throw new Error(`Verbal test requires at least ${WARMUP_NEW_TURNS} unique words`);
  }

  const newPool = shuffle(uniqueWords, random);
  const appearedWords: string[] = [];
  let phase: TestPhase = "IDLE";
  let score = 0;
  let lives = 1;
  let currentWord: string | null = null;
  let expectedAnswer: Answer | null = null;
  let startTime = 0;
  let questionCount = 0;
  let newCount = 0;
  let seenCount = 0;
  let consecutiveNew = 0;

  function pickSeen(exclude: string | null): string | null {
    const candidates = appearedWords.filter((word) => word !== exclude);
    if (candidates.length === 0) return null;
    return candidates[Math.floor(random() * candidates.length)];
  }

  function emitNextTurn() {
    if (phase === "FINISHED") return;

    let nextType: Answer;
    if (questionCount < WARMUP_NEW_TURNS) {
      nextType = "NEW";
    } else if (newPool.length === 0 || consecutiveNew >= FORCE_SEEN_AFTER_NEW) {
      nextType = "SEEN";
    } else {
      nextType = random() < TARGET_SEEN_RATIO ? "SEEN" : "NEW";
    }

    let nextWord: string | null = null;
    if (nextType === "SEEN") {
      nextWord = pickSeen(currentWord);
      // 暖场后理论上已有两个候选；这里仍保留安全降级，避免状态机卡死。
      if (nextWord === null) nextType = "NEW";
    }

    if (nextType === "NEW") {
      nextWord = newPool.pop() ?? null;
      // 词库耗尽时仍可继续测，只展示已经出现且不与上一题相同的词。
      if (nextWord === null) {
        nextType = "SEEN";
        nextWord = pickSeen(currentWord);
      }
    }

    if (nextWord === null) {
      finish();
      return;
    }

    currentWord = nextWord;
    expectedAnswer = nextType;
    questionCount += 1;
    if (nextType === "NEW") {
      newCount += 1;
      consecutiveNew += 1;
    } else {
      seenCount += 1;
      consecutiveNew = 0;
    }
    phase = "AWAITING_ANSWER";
    onTurn({ word: currentWord, score, lives, questionNumber: questionCount });
  }

  function finish() {
    if (phase === "FINISHED") return;
    phase = "FINISHED";
    expectedAnswer = null;
    onGameOver({ score, duration_ms: Math.max(0, Math.round(now() - startTime)) });
  }

  function answer(choice: Answer) {
    if (phase !== "AWAITING_ANSWER" || currentWord === null || expectedAnswer === null) {
      return null;
    }

    // 先进入结算态；界面层另有短输入锁，用来合并同一帧内的重复事件。
    phase = "IDLE";
    const correct = choice === expectedAnswer;
    if (correct) score += 1;
    else lives -= 1;

    // “见过”以是否展示过为准，与用户本题答对/答错无关。
    if (expectedAnswer === "NEW") appearedWords.push(currentWord);

    if (lives <= 0) {
      finish();
      return { correct, gameOver: true };
    }

    emitNextTurn();
    return { correct, gameOver: false };
  }

  function start() {
    if (phase !== "IDLE" || questionCount > 0) return;
    startTime = now();
    emitNextTurn();
  }

  function getSnapshot(): TestSnapshot {
    return { phase, score, lives, questionCount, newCount, seenCount };
  }

  return { start, answer, getSnapshot };
}
