import { Component } from "@angular/core";

@Component({
  selector: "app-products-page",
  standalone: true,
  template: `
    <h2>Route View: Products</h2>
    <p>商品一覧画面を想定しています。</p>
    <p class="path">path: <code>/products</code></p>
  `
})
export class ProductsPageComponent {}
