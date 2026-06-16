// anemometer.component.ts
import { ChangeDetectionStrategy, Component, OnInit, signal, computed } from '@angular/core';
// Import Firebase SDK functions
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, update } from "firebase/database";
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
  public readonly dataSource = signal<string>('--');
  public readonly zipCode = signal<string>('--');

  // Mechanical Odometer properties
  public readonly drumChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-'];

  public readonly odometerDigits = computed(() => {
    const speedStr = this.speedValue();
    if (speedStr === '--') {
      return { hundreds: null, tens: null, ones: null, tenths: null };
    }
    const num = parseFloat(speedStr);
    if (isNaN(num)) {
      return { hundreds: null, tens: null, ones: null, tenths: null };
    }
    // Format to 1 decimal place, pad to e.g. "012.5" or "100.0" (5 chars: 3 int, 1 dot, 1 dec)
    const padded = num.toFixed(1).padStart(5, '0');
    return {
      hundreds: parseInt(padded[0], 10),
      tens: parseInt(padded[1], 10),
      ones: parseInt(padded[2], 10),
      tenths: parseInt(padded[4], 10)
    };
  });

  public getDrumTransform(digit: number | null): string {
    const index = digit === null ? 10 : digit; // index 10 corresponds to '-'
    return `translateY(${index * -38}px)`;
  }

  public toggleLocation(newZip: string): void {
    if (!this.database) {
      console.warn("Database connection not established yet.");
      return;
    }
    const configRef = ref(this.database, 'config');
    update(configRef, { zip_code: newZip })
      .then(() => {
        console.log(`ZIP code written to config: ${newZip}`);
      })
      .catch((error) => {
        console.error("Failed to update active zip code:", error);
      });
  }

  private database: any;
  
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
      this.database = getDatabase(app);
      const sensorsRef = ref(this.database, 'sensors');

      onValue(sensorsRef, (snapshot) => {
          const data = snapshot.val();
          if (data !== null) {
              this.connectionStatus.set('Online');
              const speed = parseFloat(data.wind_speed);
              this.updateGauge(isNaN(speed) ? 0 : speed);
              const src = data.source === 'fallback' ? 'Weather API (Fallback)' : 'Hardware Sensor (Primary)';
              this.dataSource.set(src);
          } else {
              this.connectionStatus.set('Waiting for data...');
              this.speedValue.set('--');
              this.dataSource.set('--');
          }
      }, (error) => {
          console.error("Firebase database read failed:", error);
          this.connectionStatus.set('Database read permission denied.');
      });

      // Listen to config node for zip_code
      const configRef = ref(this.database, 'config');
      onValue(configRef, (snapshot) => {
        const data = snapshot.val();
        if (data !== null && data.zip_code) {
          this.zipCode.set(String(data.zip_code));
        } else {
          this.zipCode.set('04576');
        }
      }, (error) => {
        console.error("Firebase config read failed:", error);
        this.zipCode.set('04576'); // Default fallback
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
