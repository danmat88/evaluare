import { useEffect } from 'react';
import useExerciseStore from '../store/exerciseStore';

const useExercises = (chapter = null) => {
  const {
    exercises,
    currentExercise,
    showSolution,
    userAnswer,
    answered,
    correct,
    loading,
    loadChapter,
    loadAll,
    setCurrentExercise,
    setUserAnswer,
    submitAnswer,
    revealSolution,
    reset,
  } = useExerciseStore();

  useEffect(() => {
    if (chapter) loadChapter(chapter);
    else loadAll();
  }, [chapter]);

  return {
    exercises,
    currentExercise,
    showSolution,
    userAnswer,
    answered,
    correct,
    loading,
    setCurrentExercise,
    setUserAnswer,
    submitAnswer,
    revealSolution,
    reset,
  };
};

export default useExercises;
