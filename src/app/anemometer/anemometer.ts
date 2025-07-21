// anemometer.component.ts
import { Component, OnInit } from '@angular/core';
// Import Firebase SDK functions
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

@Component({
  selector: 'app-anemometer',
  templateUrl: './anemometer.html',
  styleUrls: ['./anemometer.css']
})
export class AnemometerComponent implements OnInit {

  // Component properties to hold the dynamic values for the view
  public speedValue: string = '--';
  public needleRotation: number = 0;
  public coilRotation: number = 0;
  public connectionStatus: string = 'Initializing...';
  
  // --- IMPORTANT: PASTE YOUR FIREBASE CONFIGURATION HERE ---
  // This is safe to have in the frontend code for public, read-only data.
  private firebaseConfig = {
      databaseURL: "https://pound-weather-default-rtdb.firebaseio.com/", // Make sure this is your Realtime Database URL
      appId: "pound-weather"
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
      // Initialize Firebase
      const app = initializeApp(this.firebaseConfig);
      const database = getDatabase(app);

      // Define the path to your wind speed data in the Realtime Database
      const windSpeedRef = ref(database, 'sensors/wind_speed');

      this.connectionStatus = 'Connecting to Firebase...';

      // Set up the listener for real-time data
      onValue(windSpeedRef, (snapshot) => {
          const data = snapshot.val();
          if (data !== null) {
              this.connectionStatus = 'Live';
              this.updateGauge(parseFloat(data));
          } else {
              this.connectionStatus = 'Waiting for data...';
              this.speedValue = '--';
          }
      }, (error) => {
          console.error("Firebase read failed:", error);
          this.connectionStatus = 'Firebase connection error.';
      });

    } catch (error) {
        console.error("Firebase initialization failed:", error);
        this.connectionStatus = 'Firebase init failed. Check config.';
    }
  }

  /**
   * Updates the needle and coil rotation based on the given speed.
   * @param {number} speed - The wind speed value.
   */
  private updateGauge(speed: number): void {
    const clampedSpeed = Math.max(this.MIN_SPEED, Math.min(this.MAX_SPEED, speed));
    const rotation = this.START_ANGLE + (clampedSpeed / this.MAX_SPEED) * this.ANGLE_RANGE;
    
    this.needleRotation = rotation;
    this.coilRotation = rotation;
    this.speedValue = clampedSpeed.toFixed(1);
  }
}
