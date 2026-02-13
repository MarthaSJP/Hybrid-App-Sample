import { Component } from "@angular/core";

@Component({
  selector: "app-checkout-page",
  standalone: true,
  template: `
    <h2>Route View: Checkout</h2>
    <p>購入確認画面を想定しています。</p>
    <p class="path">path: <code>/checkout</code></p>
  `
})
export class CheckoutPageComponent {}
