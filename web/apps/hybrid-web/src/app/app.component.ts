import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit, signal } from "@angular/core";
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { filter, Subscription } from "rxjs";
import { NativeBridgeClient } from "@internal/native-bridge-sdk";

type DomStressItem = {
  key: string;
  name: string;
  status: "ok" | "warn" | "error";
  amount: number;
  updatedAt: string;
};

type CardsApiResponse = {
  revision: number;
  count: number;
  cards: DomStressItem[];
};

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: "./app.component.html"
})
export class AppComponent implements OnInit, OnDestroy {
  private bridge = new NativeBridgeClient();
  private subs = new Subscription();
  private handleWindowError = (event: ErrorEvent) => {
    this.pushEvent(`javascriptError: ${event.message}`);
    this.showErrorDialog("JavaScript Error", event.message || "Unknown JavaScript error");
    event.preventDefault();
  };
  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason instanceof Error ? event.reason.message : String(event.reason);
    this.pushEvent(`unhandledRejection: ${reason}`);
    this.showErrorDialog("Unhandled Rejection", reason);
    event.preventDefault();
  };

  readonly output = signal("Waiting for action...");
  readonly eventLogs = signal<string[]>([]);
  readonly domItems = signal<DomStressItem[]>([]);
  readonly domItemCount = signal(1200);
  readonly domRevision = signal(0);
  readonly errorDialogVisible = signal(false);
  readonly errorDialogTitle = signal("Error");
  readonly errorDialogMessage = signal("");

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.subs.add(
      this.router.events
        .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
        .subscribe((event) => {
          this.pushEvent(`routeChange: ${event.urlAfterRedirects}`);
          this.pushEvent(`viewRendered: ${event.urlAfterRedirects}`);
        })
    );

    window.addEventListener("error", this.handleWindowError);
    window.addEventListener("unhandledrejection", this.handleUnhandledRejection);

    this.pushEvent(`viewRendered: ${this.router.url || "/"}`);
    void this.runInitialAjaxCheck();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    window.removeEventListener("error", this.handleWindowError);
    window.removeEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  async fetchSuccess(): Promise<void> {
    try {
      const response = await fetch(`/api/cards?count=8&revision=${this.domRevision() + 1}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} (${response.url})`);
      }
      const json = await response.json();
      this.output.set(JSON.stringify(json, null, 2));
      this.pushEvent("ajaxSuccess: /api/cards");
    } catch (error) {
      this.handleError("ajaxError", error);
    }
  }

  async fetch404(): Promise<void> {
    try {
      const response = await fetch(`/api/not-found?t=${Date.now()}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} (${response.url})`);
      }
    } catch (error) {
      this.handleError("ajax404", error);
    }
  }

  async fetchAbort(): Promise<void> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 100);
    try {
      await fetch(`/api/slow?delayMs=2000&slow=${Date.now()}`, { signal: controller.signal });
      this.output.set("Abort前に完了しました。");
      this.pushEvent("ajaxAbort: request completed before abort");
    } catch (error) {
      this.handleError("ajaxAbort", error);
    } finally {
      clearTimeout(timer);
    }
  }

  throwError(): void {
    setTimeout(() => {
      (window as unknown as { notExistingFunction: () => void }).notExistingFunction();
    }, 0);
  }

  triggerUnhandledRejection(): void {
    Promise.reject(new Error("Intentional unhandled rejection for monitoring demo"));
  }

  async getDeviceInfo(): Promise<void> {
    try {
      const info = await this.bridge.getDeviceInfo();
      this.output.set(JSON.stringify(info, null, 2));
      this.pushEvent("nativeSuccess: getDeviceInfo");
    } catch (error) {
      this.handleError("nativeError", error);
    }
  }

  async triggerHaptic(): Promise<void> {
    try {
      await this.bridge.triggerHaptic("light");
      this.output.set("triggerHaptic(light) success");
      this.pushEvent("nativeSuccess: triggerHaptic(light)");
    } catch (error) {
      this.handleError("nativeError", error);
    }
  }

  setDomItemCount(value: string): void {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return;
    }
    this.domItemCount.set(parsed);
  }

  async generateDomDataset(): Promise<void> {
    const start = performance.now();
    const count = this.domItemCount();
    const revision = this.domRevision() + 1;
    try {
      const cards = await this.fetchCardsFromApi(count, revision);
      this.domRevision.set(revision);
      this.domItems.set(cards);
      this.reportDomPerf("domGenerate", start, count);
    } catch (error) {
      this.handleError("domGenerateError", error);
    }
  }

  async forceFullDomRerender(): Promise<void> {
    const start = performance.now();
    const revision = this.domRevision() + 1;
    const count = this.domItems().length > 0 ? this.domItems().length : this.domItemCount();
    try {
      const rerendered = await this.fetchCardsFromApi(count, revision);
      this.domRevision.set(revision);
      this.domItems.set(rerendered);
      this.reportDomPerf("domFullRerender", start, rerendered.length);
    } catch (error) {
      this.handleError("domRerenderError", error);
    }
  }

  async runRouteChangeWithDomRerender(): Promise<void> {
    const nextPath = this.nextRoutePath(this.router.url || "/");
    const start = performance.now();
    const beforeCount = this.domItems().length;

    try {
      const routePromise = this.router.navigateByUrl(nextPath);
      const domPromise = beforeCount > 0 ? this.forceFullDomRerender() : this.generateDomDataset();
      const [navigated] = await Promise.all([routePromise, domPromise]);
      if (!navigated) {
        throw new Error(`Route navigation cancelled: ${nextPath}`);
      }

      const elapsed = Math.round((performance.now() - start) * 100) / 100;
      this.pushEvent(`route+dom: navigated to ${nextPath} with ${this.domItems().length} items in ${elapsed}ms`);
    } catch (error) {
      this.handleError("routeDomError", error);
    }
  }

  shuffleDomItems(): void {
    const start = performance.now();
    const shuffled = [...this.domItems()];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    this.domItems.set(shuffled);
    this.reportDomPerf("domShuffle", start, shuffled.length);
  }

  clearDomItems(): void {
    const start = performance.now();
    const previousCount = this.domItems().length;
    this.domItems.set([]);
    this.reportDomPerf("domClear", start, previousCount);
  }

  private handleError(kind: string, error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    this.output.set(message);
    this.pushEvent(`${kind}: ${message}`);
    this.showErrorDialog(kind, message);
  }

  private async runInitialAjaxCheck(): Promise<void> {
    try {
      const response = await fetch(`/api/cards?count=1&revision=${this.domRevision() + 1}&source=initial-load`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} (${response.url})`);
      }
      this.pushEvent("ajaxOnLoad: /api/cards");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.pushEvent(`ajaxOnLoadError: ${message}`);
    }
  }

  private async fetchCardsFromApi(count: number, revision: number): Promise<DomStressItem[]> {
    const response = await fetch(`/api/cards?count=${count}&revision=${revision}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} (${response.url})`);
    }

    const payload = (await response.json()) as CardsApiResponse;
    if (!payload || !Array.isArray(payload.cards)) {
      throw new Error("Invalid API response for /api/cards");
    }

    return payload.cards;
  }

  private reportDomPerf(kind: string, start: number, count: number): void {
    const elapsed = Math.round((performance.now() - start) * 100) / 100;
    const message = `${kind}: ${count} nodes (data) updated in ${elapsed}ms`;
    this.output.set(message);
    this.pushEvent(message);
  }

  private nextRoutePath(currentUrl: string): string {
    const current = currentUrl.split("?")[0];
    const sequence = ["/", "/products", "/checkout"];
    const index = sequence.indexOf(current);
    if (index < 0) {
      return "/";
    }
    return sequence[(index + 1) % sequence.length];
  }

  private pushEvent(message: string): void {
    const now = new Date().toLocaleTimeString("ja-JP", { hour12: false });
    this.eventLogs.update((list) => [`[${now}] ${message}`, ...list].slice(0, 200));
  }

  closeErrorDialog(): void {
    this.errorDialogVisible.set(false);
  }

  private showErrorDialog(title: string, message: string): void {
    this.errorDialogTitle.set(title);
    this.errorDialogMessage.set(message);
    this.errorDialogVisible.set(true);
  }
}
