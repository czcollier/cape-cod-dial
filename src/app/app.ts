import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AnemometerComponent } from './anemometer/anemometer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AnemometerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('myapp');
}
