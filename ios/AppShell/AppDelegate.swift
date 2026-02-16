import UIKit
import NewRelic

@main
final class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
        // アプリ起動直後にMobile Agentを開始し、以降の操作を計測対象にする。
        startNewRelicIfConfigured()

        let window = UIWindow(frame: UIScreen.main.bounds)
        let catalogViewController = AppCatalogViewController()
        let navigationController = UINavigationController(rootViewController: catalogViewController)
        window.rootViewController = navigationController
        window.makeKeyAndVisible()
        self.window = window
        return true
    }

    private func startNewRelicIfConfigured() {
        // トークン未設定（またはテンプレート値）の場合は計測を開始しない。
        guard let appToken = AppConfig.newRelicAppToken else {
            return
        }

        NewRelic.start(withApplicationToken: appToken)
    }
}
