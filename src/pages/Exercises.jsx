import ExerciseList from '../components/exercises/ExerciseList';
import AchievementToast from '../components/ui/AchievementToast';
import Layout from '../components/layout/Layout';
import useExercises from '../hooks/useExercises';
import styles from './Exercises.module.css';

const Exercises = () => {
  const { exercises, loading } = useExercises();
  return (
    <Layout>
      <div className={styles.page}>
        <ExerciseList exercises={exercises} loading={loading} />
      </div>
      <AchievementToast />
    </Layout>
  );
};

export default Exercises;
