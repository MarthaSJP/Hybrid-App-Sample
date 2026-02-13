import { Routes } from "@angular/router";
import { CheckoutPageComponent } from "./pages/checkout-page.component";
import { HomePageComponent } from "./pages/home-page.component";
import { ProductsPageComponent } from "./pages/products-page.component";

export const routes: Routes = [
  { path: "", component: HomePageComponent, title: "Home" },
  { path: "products", component: ProductsPageComponent, title: "Products" },
  { path: "checkout", component: CheckoutPageComponent, title: "Checkout" },
  { path: "**", redirectTo: "" }
];
