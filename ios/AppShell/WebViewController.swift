import UIKit
import WebKit
import NativeBridgeCore

final class WebViewController: UIViewController, WKNavigationDelegate {
    private let config: AppConfig
    private var isPresentingErrorAlert = false
    private lazy var webView: WKWebView = {
        let contentController = WKUserContentController()
        let webConfig = WKWebViewConfiguration()
        webConfig.userContentController = contentController

        let view = WKWebView(frame: .zero, configuration: webConfig)
        view.navigationDelegate = self
        view.translatesAutoresizingMaskIntoConstraints = false
        return view
    }()

    private lazy var router: BridgeMessageRouter = {
        let dispatcher = CommandDispatcher(handlers: [
            GetDeviceInfoHandler(),
            TriggerHapticHandler(),
            GetMobileAgentContextHandler()
        ])

        return BridgeMessageRouter(dispatcher: dispatcher) { [weak self] response in
            self?.emitResponseToWeb(response)
        }
    }()

    init(config: AppConfig) {
        self.config = config
        super.init(nibName: nil, bundle: nil)
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func viewDidLoad() {
        super.viewDidLoad()

        view.backgroundColor = .systemBackground
        view.addSubview(webView)
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])

        webView.configuration.userContentController.add(router, name: "nativeBridge")
        loadInitialURL()
    }

    private func loadInitialURL() {
        if config.initialURL.scheme == "http", !config.allowHTTPInDebug {
            presentErrorDialog(
                title: "Invalid Configuration",
                message: "HTTP URL is not allowed in this build. Please use HTTPS in Release."
            )
            return
        }

        webView.load(URLRequest(url: config.initialURL))
    }

    private func emitResponseToWeb(_ response: CommandResponse) {
        guard let data = try? JSONSerialization.data(withJSONObject: response.asDictionary()),
              let json = String(data: data, encoding: .utf8)
        else {
            return
        }

        let script = "window.onNativeMessage && window.onNativeMessage(\(json));"
        DispatchQueue.main.async { [weak self] in
            self?.webView.evaluateJavaScript(script) { _, error in
                guard let error else { return }
                self?.presentErrorDialog(
                    title: "Bridge Error",
                    message: "Failed to deliver native message to WebView.\n\(error.localizedDescription)"
                )
            }
        }
    }

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url else {
            decisionHandler(.cancel)
            return
        }

        // Restrict only top-level web navigations. Subframe and non-http(s) URLs
        // can be used internally by browser tooling or JS SDKs.
        if navigationAction.targetFrame?.isMainFrame == false {
            decisionHandler(.allow)
            return
        }

        if let scheme = url.scheme?.lowercased(), scheme != "http", scheme != "https" {
            decisionHandler(.allow)
            return
        }

        if let host = url.host, config.allowedHosts.contains(host) {
            decisionHandler(.allow)
            return
        }

        notifyNavigationBlocked(for: url)
        presentErrorDialog(
            title: "Navigation Blocked",
            message: "Blocked navigation to an unapproved host.\nURL: \(url.absoluteString)"
        )
        decisionHandler(.cancel)
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        presentErrorDialog(
            title: "Load Failed",
            message: "The page failed to load.\n\(error.localizedDescription)"
        )
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        presentErrorDialog(
            title: "Connection Error",
            message: "Could not connect to the page.\n\(error.localizedDescription)"
        )
    }

    private func notifyNavigationBlocked(for url: URL) {
        let response = CommandResponse(
            id: UUID().uuidString,
            ok: false,
            error: BridgeError(code: "NAV_BLOCKED", message: "Blocked navigation to \(url.absoluteString)")
        )
        emitResponseToWeb(response)
    }

    private func presentErrorDialog(title: String, message: String) {
        DispatchQueue.main.async { [weak self] in
            guard let self else { return }
            guard !self.isPresentingErrorAlert else { return }
            self.isPresentingErrorAlert = true

            let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "OK", style: .default) { [weak self] _ in
                self?.isPresentingErrorAlert = false
            })
            self.present(alert, animated: true)
        }
    }
}
