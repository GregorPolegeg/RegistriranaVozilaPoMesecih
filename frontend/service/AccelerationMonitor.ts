// AccelerationMonitor.ts
import { Accelerometer } from 'expo-sensors';
import { Subscription } from 'expo-modules-core';
import { useAuth } from '../AuthContext';
import { API_URL } from '@env';

class AccelerationMonitor {
  private threshold: number;
  private subscription: Subscription | null = null;

  constructor(threshold: number) {
    this.threshold = threshold;
    this.startMonitoring();
  }

  startMonitoring(): void {
    this.subscription = Accelerometer.addListener(({ x, y, z }) => {
      const acceleration = Math.sqrt(x * x + y * y + z * z);
      if (acceleration > this.threshold) {
        this.postAccelerationData(acceleration);
      }
    });
    Accelerometer.setUpdateInterval(100);
  }

  postAccelerationData(acceleration: number): void {
    const {vehicleId}  = useAuth();
    fetch(`${API_URL}/accelerations/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ acceleration, vehicleId:vehicleId }),
    })
      .then(response => response.json())
      .then(data => console.log('Success:', data))
      .catch(error => console.error('Error:', error));
  }

  stopMonitoring(): void {
    if (this.subscription) {
      this.subscription.remove();
    }
  }
}

export default AccelerationMonitor;
