import UIKit
import NewRelic

@main
final class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
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
        guard let appToken = AppConfig.newRelicAppToken else {
            return
        }

        NewRelic.start(withApplicationToken: appToken)
    }
}
