import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AnemometerComponent } from './anemometer/anemometer';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider, User } from 'firebase/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AnemometerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App implements OnInit {
  public readonly currentUser = signal<User | null>(null);
  public readonly authLoading = signal<boolean>(true);
  public readonly isAuthorized = signal<boolean>(false);
  
  private auth: any;

  private readonly ALLOWED_EMAILS = [
    'czcollier@gmail.com',
    'czc@google.com'
  ];

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

  ngOnInit(): void {
    const appInstance = initializeApp(this.firebaseConfig);
    this.auth = getAuth(appInstance);

    onAuthStateChanged(this.auth, (user) => {
      this.currentUser.set(user);
      if (user) {
        const email = user.email || '';
        const authorized = this.ALLOWED_EMAILS.includes(email.toLowerCase());
        this.isAuthorized.set(authorized);
      } else {
        this.isAuthorized.set(false);
      }
      this.authLoading.set(false);
    });
  }

  public loginWithGoogle(): void {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    this.authLoading.set(true);
    signInWithPopup(this.auth, provider)
      .catch((error) => {
        console.error("Google sign-in failed:", error);
        this.authLoading.set(false);
      });
  }

  public logout(): void {
    this.authLoading.set(true);
    signOut(this.auth)
      .catch((error) => {
        console.error("Sign-out failed:", error);
        this.authLoading.set(false);
      });
  }
}
