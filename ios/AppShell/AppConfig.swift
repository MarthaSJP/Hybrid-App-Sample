import Foundation

struct AppConfig {
    let initialURL: URL
    let allowedHosts: [String]
    let allowHTTPInDebug: Bool

    static var catalog: [WebAppDefinition] {
        if let configured = configuredCatalog(), !configured.isEmpty {
            return configured
        }

        return [
            WebAppDefinition(
                id: "default",
                title: "Hybrid Web Demo",
                subtitle: "Local Angular App",
                url: URL(string: "http://localhost:4200")!,
                allowedHosts: ["localhost", "127.0.0.1"]
            )
        ]
    }

    private static func configuredCatalog() -> [WebAppDefinition]? {
        guard let webApps = Bundle.main.object(forInfoDictionaryKey: "WEB_APPS") as? [[String: Any]] else {
            return nil
        }

        return webApps.compactMap(WebAppDefinition.init(dictionary:))
    }

    static var allowHTTPInDebug: Bool {
        #if DEBUG
        true
        #else
        false
        #endif
    }
}

struct WebAppDefinition: Hashable {
    let id: String
    let title: String
    let subtitle: String
    let url: URL
    let allowedHosts: [String]
    let iconSymbolName: String
    let accentColorHex: String
    let accentColorHexSecondary: String
    let badgeText: String?

    var appConfig: AppConfig {
        AppConfig(initialURL: url, allowedHosts: allowedHosts, allowHTTPInDebug: AppConfig.allowHTTPInDebug)
    }

    init(
        id: String,
        title: String,
        subtitle: String,
        url: URL,
        allowedHosts: [String],
        iconSymbolName: String = "globe",
        accentColorHex: String = "#3B82F6",
        accentColorHexSecondary: String = "#06B6D4",
        badgeText: String? = nil
    ) {
        self.id = id
        self.title = title
        self.subtitle = subtitle
        self.url = url
        self.allowedHosts = allowedHosts
        self.iconSymbolName = iconSymbolName
        self.accentColorHex = accentColorHex
        self.accentColorHexSecondary = accentColorHexSecondary
        self.badgeText = badgeText
    }

    init?(dictionary: [String: Any]) {
        guard let id = dictionary["id"] as? String,
              let title = dictionary["title"] as? String,
              let subtitle = dictionary["subtitle"] as? String,
              let urlString = dictionary["url"] as? String,
              let url = URL(string: urlString),
              let hosts = dictionary["allowedHosts"] as? [String],
              !hosts.isEmpty
        else {
            return nil
        }

        let iconSymbolName = dictionary["iconSymbolName"] as? String ?? "globe"
        let accentColorHex = dictionary["accentColorHex"] as? String ?? "#3B82F6"
        let accentColorHexSecondary = dictionary["accentColorHexSecondary"] as? String ?? "#06B6D4"
        let badgeText = dictionary["badgeText"] as? String

        self.init(
            id: id,
            title: title,
            subtitle: subtitle,
            url: url,
            allowedHosts: hosts,
            iconSymbolName: iconSymbolName,
            accentColorHex: accentColorHex,
            accentColorHexSecondary: accentColorHexSecondary,
            badgeText: badgeText
        )
    }
}
