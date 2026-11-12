import type { QuizAnswerRecord, QuizQuestion } from '../model/types'
import { cn } from '../lib/format'

interface QuizProgressBarProps {
  questions: readonly QuizQuestion[]
  answers: readonly QuizAnswerRecord[]
  currentIndex: number
}

export function QuizProgressBar({
  questions,
  answers,
  currentIndex,
}: QuizProgressBarProps) {
  const answerByQuestion = new Map(
    answers.map((answer) => [answer.questionId, answer]),
  )

  return (
    <div
      className="flex gap-1.5 rounded-full overflow-hidden bg-zinc-950 dark:bg-neutral-950 apple:bg-white/10"
      role="progressbar"
      aria-label="Прогрес вікторини"
      aria-valuemin={1}
      aria-valuemax={Math.max(questions.length, 1)}
      aria-valuenow={Math.min(currentIndex + 1, Math.max(questions.length, 1))}
    >
      {questions.map((question, index) => {
        const answer = answerByQuestion.get(question.id)
        const stateClass = answer
          ? answer.isCorrect
            ? 'bg-emerald-500 dark:bg-emerald-400 apple:bg-emerald-400'
            : 'bg-rose-500 dark:bg-rose-400 apple:bg-rose-400'
          : index === currentIndex
            ? 'bg-yellow-400 dark:bg-white apple:bg-sky-400'
            : 'bg-transparent'

        return (
          <span
            key={question.id}
            className={cn('h-1.5 flex-1 rounded-full transition-colors', stateClass)}
          />
        )
      })}
    </div>
  )
}
