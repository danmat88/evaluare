import { saveExerciseResult, saveTestResult } from '../firebase/results';
import {
  STORAGE_KEYS,
  getStorageScope,
  readScopedJSON,
  writeScopedJSON,
} from './storage';

const normalizeQueue = (value) =>
  Array.isArray(value) ? value.filter((entry) => entry && typeof entry === 'object' && entry.attemptId) : [];

const readQueue = (key, scope) =>
  normalizeQueue(readScopedJSON(key, getStorageScope(scope), []));

const writeQueue = (key, scope, entries) =>
  writeScopedJSON(key, getStorageScope(scope), normalizeQueue(entries));

export const readPendingExerciseResults = (scope = null) =>
  readQueue(STORAGE_KEYS.pendingExerciseResults, scope);

export const queuePendingExerciseResult = (scope, entry) => {
  const queue = readPendingExerciseResults(scope);
  const nextQueue = [
    ...queue.filter((item) => item.attemptId !== entry.attemptId),
    { ...entry, queuedAt: Date.now() },
  ];
  writeQueue(STORAGE_KEYS.pendingExerciseResults, scope, nextQueue);
  return nextQueue;
};

export const readPendingTestResults = (scope = null) =>
  readQueue(STORAGE_KEYS.pendingTestResults, scope);

export const queuePendingTestResult = (scope, entry) => {
  const queue = readPendingTestResults(scope);
  const nextQueue = [
    ...queue.filter((item) => item.attemptId !== entry.attemptId),
    { ...entry, queuedAt: Date.now() },
  ];
  writeQueue(STORAGE_KEYS.pendingTestResults, scope, nextQueue);
  return nextQueue;
};

export const hasPendingResultWrites = (scope = null) =>
  readPendingExerciseResults(scope).length > 0 || readPendingTestResults(scope).length > 0;

export const flushPendingResultWrites = async (uid, scope = null) => {
  const storageScope = getStorageScope(scope ?? uid);
  const pendingExercises = readPendingExerciseResults(storageScope);
  const pendingTests = readPendingTestResults(storageScope);

  const remainingExercises = [];
  for (const entry of pendingExercises) {
    try {
      await saveExerciseResult(uid, entry);
    } catch {
      remainingExercises.push(entry);
    }
  }

  const remainingTests = [];
  for (const entry of pendingTests) {
    try {
      await saveTestResult(uid, entry);
    } catch {
      remainingTests.push(entry);
    }
  }

  writeQueue(STORAGE_KEYS.pendingExerciseResults, storageScope, remainingExercises);
  writeQueue(STORAGE_KEYS.pendingTestResults, storageScope, remainingTests);

  return {
    pendingExerciseCount: remainingExercises.length,
    pendingTestCount: remainingTests.length,
  };
};
