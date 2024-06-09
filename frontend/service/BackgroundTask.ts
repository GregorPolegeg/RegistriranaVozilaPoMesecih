// BackgroundTask.ts
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import AccelerationMonitor from './AccelerationMonitor';

const BACKGROUND_FETCH_TASK = 'background-fetch-task';
const THRESHOLD = 2.0;

let monitor: AccelerationMonitor | null = null;

TaskManager.defineTask(BACKGROUND_FETCH_TASK, () => {
  try {
    if (!monitor) {
      monitor = new AccelerationMonitor(THRESHOLD);
    } else {
      monitor.startMonitoring();
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error(error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

const registerBackgroundTask = async () => {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 15 * 60, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log('Background fetch task registered');
  } catch (err) {
    console.log('Error registering background task', err);
  }
};

export default registerBackgroundTask;
