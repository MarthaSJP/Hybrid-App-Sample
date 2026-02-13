import { Component } from "@angular/core";

@Component({
  selector: "app-home-page",
  standalone: true,
  template: `
    <h2>Route View: Home</h2>
    <p>Hybridアプリのトップ画面です。</p>
    <p class="path">path: <code>/</code></p>
  `
})
export class HomePageComponent {}
