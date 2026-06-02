import { useState } from 'react';
import type { QuestionDTO, UserAnswerDTO } from '../../types';
import styles from './QuestionReview.module.css';

interface Props {
  questions: QuestionDTO[];
  answers: UserAnswerDTO[];
}

const COMP_LABELS: Record<string, string> = {
  LITERACY:       'Грамотность',
  COMMUNICATIONS: 'Коммуникации',
  SAFETY:         'Безопасность',
  CONSUMPTION:    'Потребление',
};

export default function QuestionReview({ questions, answers }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);

  const q          = questions[activeIdx];
  const answer     = answers.find((a) => a.questionDTO.id === q.id);
  const isCorrect  = answer?.isCorrect ?? false;
  const selectedIdx = answer?.selectedAnswerIndex ?? -1;
  const total      = questions.length;

  return (
    <div className={styles.wrap}>

      {/* ── Навигация ── */}
      <div className={styles.nav}>
        <div className={styles.navTitle}>Вопросы</div>
        <div className={styles.navGrid}>
          {questions.map((question, i) => {
            const ans     = answers.find((a) => a.questionDTO.id === question.id);
            const correct = ans?.isCorrect ?? false;
            const isActive = i === activeIdx;

            const btnClass = [
              styles.navBtn,
              correct ? styles.navBtnCorrect : styles.navBtnWrong,
              isActive ? styles.navBtnActive : '',
              isActive && correct  ? styles.navBtnCorrectActive : '',
              isActive && !correct ? styles.navBtnWrongActive   : '',
            ].filter(Boolean).join(' ');

            return (
              <button
                key={question.id}
                className={btnClass}
                onClick={() => setActiveIdx(i)}
                title={`Вопрос ${i + 1}: ${correct ? 'Правильно' : 'Неправильно'}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        <div className={styles.navLegend}>
          <div className={styles.legendItem}>
            <div className={`${styles.legendDot} ${styles.legendDotGreen}`} />
            Правильно ({answers.filter((a) => a.isCorrect).length})
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendDot} ${styles.legendDotRed}`} />
            Неправильно ({answers.filter((a) => !a.isCorrect).length})
          </div>
        </div>
      </div>

      {/* ── Активный вопрос ── */}
      <div className={styles.questionCard}>
        <div className={styles.questionTop}>
          <div className={styles.questionMeta}>
            <span className={styles.questionNum}>Вопрос {activeIdx + 1} из {total}</span>
            {q.type && (
              <span className={styles.questionComp}>
                {COMP_LABELS[q.type] ?? q.type}
              </span>
            )}
          </div>
          <span className={isCorrect ? styles.statusCorrect : styles.statusWrong}>
            {isCorrect ? '✓ Правильно' : '✗ Неправильно'}
          </span>
        </div>

        <p className={styles.questionText}>{q.question}</p>

        <div className={styles.options}>
          {q.answers.map((opt, idx) => {
            const isSelected    = idx === selectedIdx;
            const isRealCorrect = idx === q.correctAnswerIndex;

            let cls  = styles.option;
            let mark = '';

            if (isSelected && isRealCorrect) {
              cls  = `${styles.option} ${styles.optionBoth}`;
              mark = '✓ Ваш ответ';
            } else if (isRealCorrect) {
              cls  = `${styles.option} ${styles.optionCorrect}`;
              mark = '✓ Правильный';
            } else if (isSelected) {
              cls  = `${styles.option} ${styles.optionSelected}`;
              mark = '✗ Ваш ответ';
            }

            return (
              <div key={idx} className={cls}>
                <span>{opt}</span>
                {mark && <span className={styles.optionMark}>{mark}</span>}
              </div>
            );
          })}
        </div>

        <div className={styles.questionFooter}>
          <button
            className={styles.arrowBtn}
            onClick={() => setActiveIdx((i) => i - 1)}
            disabled={activeIdx === 0}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Назад
          </button>

          <span className={styles.questionCounter}>{activeIdx + 1} / {total}</span>

          <button
            className={styles.arrowBtn}
            onClick={() => setActiveIdx((i) => i + 1)}
            disabled={activeIdx === total - 1}
          >
            Вперёд
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

    </div>
  );
}
