// anemometer.component.ts
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
// Import Firebase SDK functions
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";

@Component({
  selector: 'app-anemometer',
  templateUrl: './anemometer.html',
  styleUrls: ['./anemometer.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnemometerComponent implements OnInit {

  // Component properties to hold the dynamic values for the view (Signals for OnPush)
  public readonly speedValue = signal<string>('--');
  public readonly needleRotation = signal<number>(0);
  public readonly coilRotation = signal<number>(0);
  public readonly connectionStatus = signal<string>('Initializing...');
  
  // Full Firebase Web App SDK configuration
  private readonly firebaseConfig = {
    projectId: "pound-weather",
    appId: "1:700016665928:web:373719ebd78265ddf0bf7d",
    databaseURL: "https://pound-weather-default-rtdb.firebaseio.com",
    storageBucket: "pound-weather.firebasestorage.app",
    apiKey: "AIzaSyADhppgF4iPru4MFHhTnOatsqAJsMSHzS8",
    authDomain: "pound-weather.firebaseapp.com",
    messagingSenderId: "700016665928",
    measurementId: "G-BQPX8N03ZH"
  };

  // Constants for gauge calculation
  private readonly MIN_SPEED = 0;
  private readonly MAX_SPEED = 100;
  private readonly START_ANGLE = -51;
  private readonly END_ANGLE = 51;
  private readonly ANGLE_RANGE = this.END_ANGLE - this.START_ANGLE;

  ngOnInit(): void {
    this.initializeFirebase();
    this.updateGauge(0); // Set initial position
  }

  private initializeFirebase(): void {
    try {
      // Initialize Firebase App
      const app = initializeApp(this.firebaseConfig);
      
      // Initialize Firebase Auth
      const auth = getAuth(app);
      
      this.connectionStatus.set('Checking credentials...');

      // Monitor Auth state changes
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.connectionStatus.set('Connecting database...');
          this.connectDatabase(app);
        } else {
          this.connectionStatus.set('Unauthorized. Please sign in.');
          this.speedValue.set('--');
        }
      });

    } catch (error) {
        console.error("Firebase initialization failed:", error);
        this.connectionStatus.set('Firebase init failed.');
    }
  }

  private connectDatabase(app: any): void {
    try {
      const database = getDatabase(app);
      const windSpeedRef = ref(database, 'sensors/wind_speed');

      onValue(windSpeedRef, (snapshot) => {
          const data = snapshot.val();
          if (data !== null) {
              this.connectionStatus.set('Live');
              this.updateGauge(parseFloat(data));
          } else {
              this.connectionStatus.set('Waiting for data...');
              this.speedValue.set('--');
          }
      }, (error) => {
          console.error("Firebase database read failed:", error);
          this.connectionStatus.set('Database read permission denied.');
      });
    } catch (error) {
      console.error("Database connection failed:", error);
      this.connectionStatus.set('Database connection failed.');
    }
  }

  /**
   * Updates the needle and coil rotation based on the given speed.
   * @param {number} speed - The wind speed value.
   */
  private updateGauge(speed: number): void {
    const clampedSpeed = Math.max(this.MIN_SPEED, Math.min(this.MAX_SPEED, speed));
    const rotation = this.START_ANGLE + (clampedSpeed / this.MAX_SPEED) * this.ANGLE_RANGE;
    
    this.needleRotation.set(rotation);
    this.coilRotation.set(rotation);
    this.speedValue.set(clampedSpeed.toFixed(1));
  }
}
