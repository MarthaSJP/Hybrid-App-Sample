import UIKit

final class AppCatalogViewController: UIViewController {
    private let apps: [WebAppDefinition]

    private lazy var collectionView: UICollectionView = {
        let layout = UICollectionViewCompositionalLayout { _, environment in
            let isWide = environment.container.effectiveContentSize.width >= 680
            let columns = isWide ? 2 : 1

            let item = NSCollectionLayoutItem(
                layoutSize: .init(
                    widthDimension: .fractionalWidth(1.0),
                    heightDimension: .estimated(170)
                )
            )
            item.contentInsets = NSDirectionalEdgeInsets(top: 8, leading: 8, bottom: 8, trailing: 8)

            let group = NSCollectionLayoutGroup.horizontal(
                layoutSize: .init(widthDimension: .fractionalWidth(1.0), heightDimension: .estimated(170)),
                subitem: item,
                count: columns
            )

            let section = NSCollectionLayoutSection(group: group)
            section.contentInsets = NSDirectionalEdgeInsets(top: 8, leading: 14, bottom: 12, trailing: 14)
            return section
        }

        let view = UICollectionView(frame: .zero, collectionViewLayout: layout)
        view.translatesAutoresizingMaskIntoConstraints = false
        view.backgroundColor = .systemGroupedBackground
        view.register(AppTileCell.self, forCellWithReuseIdentifier: AppTileCell.reuseIdentifier)
        view.dataSource = self
        view.delegate = self
        return view
    }()

    init(apps: [WebAppDefinition] = AppConfig.catalog) {
        self.apps = apps
        super.init(nibName: nil, bundle: nil)
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        title = "Web Apps"
        view.backgroundColor = .systemGroupedBackground

        let headerLabel = UILabel()
        headerLabel.translatesAutoresizingMaskIntoConstraints = false
        headerLabel.font = .preferredFont(forTextStyle: .subheadline)
        headerLabel.textColor = .secondaryLabel
        headerLabel.text = "Launch a web app"

        view.addSubview(headerLabel)
        view.addSubview(collectionView)
        NSLayoutConstraint.activate([
            headerLabel.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 8),
            headerLabel.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 22),
            headerLabel.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -22),

            collectionView.topAnchor.constraint(equalTo: headerLabel.bottomAnchor, constant: 4),
            collectionView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            collectionView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            collectionView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])
    }
}

extension AppCatalogViewController: UICollectionViewDataSource {
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        apps.count
    }

    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        guard let cell = collectionView.dequeueReusableCell(withReuseIdentifier: AppTileCell.reuseIdentifier, for: indexPath) as? AppTileCell else {
            return UICollectionViewCell()
        }

        cell.configure(with: apps[indexPath.item])
        return cell
    }
}

extension AppCatalogViewController: UICollectionViewDelegate {
    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        collectionView.deselectItem(at: indexPath, animated: true)
        let selected = apps[indexPath.item]
        let viewController = WebViewController(config: selected.appConfig)
        viewController.title = selected.title
        navigationController?.pushViewController(viewController, animated: true)
    }
}

private final class AppTileCell: UICollectionViewCell {
    static let reuseIdentifier = "AppTileCell"

    private let cardView = UIView()
    private let iconContainer = UIView()
    private let iconView = UIImageView()
    private let titleLabel = UILabel()
    private let subtitleLabel = UILabel()
    private let urlLabel = UILabel()
    private let badgeLabel = UILabel()
    private let chevronView = UIImageView(image: UIImage(systemName: "chevron.right"))

    override init(frame: CGRect) {
        super.init(frame: frame)

        contentView.backgroundColor = .clear

        cardView.translatesAutoresizingMaskIntoConstraints = false
        cardView.backgroundColor = .secondarySystemGroupedBackground
        cardView.layer.cornerRadius = 18
        cardView.layer.borderWidth = 1
        cardView.layer.borderColor = UIColor.separator.withAlphaComponent(0.3).cgColor
        cardView.layer.shadowColor = UIColor.black.cgColor
        cardView.layer.shadowOpacity = 0.08
        cardView.layer.shadowOffset = CGSize(width: 0, height: 8)
        cardView.layer.shadowRadius = 14

        iconContainer.translatesAutoresizingMaskIntoConstraints = false
        iconContainer.layer.cornerRadius = 14
        iconContainer.layer.masksToBounds = true

        iconView.translatesAutoresizingMaskIntoConstraints = false
        iconView.tintColor = .white
        iconView.contentMode = .scaleAspectFit

        titleLabel.font = .preferredFont(forTextStyle: .headline)
        subtitleLabel.font = .preferredFont(forTextStyle: .subheadline)
        subtitleLabel.textColor = .secondaryLabel

        urlLabel.font = .preferredFont(forTextStyle: .footnote)
        urlLabel.textColor = .tertiaryLabel
        urlLabel.lineBreakMode = .byTruncatingMiddle

        badgeLabel.font = .preferredFont(forTextStyle: .caption1)
        badgeLabel.textColor = .white
        badgeLabel.backgroundColor = .black.withAlphaComponent(0.2)
        badgeLabel.layer.cornerRadius = 9
        badgeLabel.layer.masksToBounds = true
        badgeLabel.textAlignment = .center
        badgeLabel.translatesAutoresizingMaskIntoConstraints = false

        chevronView.translatesAutoresizingMaskIntoConstraints = false
        chevronView.tintColor = .tertiaryLabel

        let textStack = UIStackView(arrangedSubviews: [titleLabel, subtitleLabel, urlLabel])
        textStack.axis = .vertical
        textStack.spacing = 4
        textStack.translatesAutoresizingMaskIntoConstraints = false

        contentView.addSubview(cardView)
        cardView.addSubview(iconContainer)
        iconContainer.addSubview(iconView)
        cardView.addSubview(textStack)
        cardView.addSubview(badgeLabel)
        cardView.addSubview(chevronView)

        NSLayoutConstraint.activate([
            cardView.topAnchor.constraint(equalTo: contentView.topAnchor),
            cardView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor),
            cardView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor),
            cardView.bottomAnchor.constraint(equalTo: contentView.bottomAnchor),

            iconContainer.leadingAnchor.constraint(equalTo: cardView.leadingAnchor, constant: 14),
            iconContainer.centerYAnchor.constraint(equalTo: cardView.centerYAnchor),
            iconContainer.widthAnchor.constraint(equalToConstant: 56),
            iconContainer.heightAnchor.constraint(equalToConstant: 56),

            iconView.centerXAnchor.constraint(equalTo: iconContainer.centerXAnchor),
            iconView.centerYAnchor.constraint(equalTo: iconContainer.centerYAnchor),
            iconView.widthAnchor.constraint(equalToConstant: 26),
            iconView.heightAnchor.constraint(equalToConstant: 26),

            textStack.leadingAnchor.constraint(equalTo: iconContainer.trailingAnchor, constant: 14),
            textStack.topAnchor.constraint(equalTo: cardView.topAnchor, constant: 16),
            textStack.trailingAnchor.constraint(lessThanOrEqualTo: chevronView.leadingAnchor, constant: -8),
            textStack.bottomAnchor.constraint(equalTo: cardView.bottomAnchor, constant: -16),

            badgeLabel.topAnchor.constraint(equalTo: cardView.topAnchor, constant: 12),
            badgeLabel.trailingAnchor.constraint(equalTo: chevronView.leadingAnchor, constant: -8),
            badgeLabel.heightAnchor.constraint(equalToConstant: 18),
            badgeLabel.widthAnchor.constraint(greaterThanOrEqualToConstant: 46),

            chevronView.trailingAnchor.constraint(equalTo: cardView.trailingAnchor, constant: -14),
            chevronView.centerYAnchor.constraint(equalTo: cardView.centerYAnchor),
            chevronView.widthAnchor.constraint(equalToConstant: 12),
            chevronView.heightAnchor.constraint(equalToConstant: 14)
        ])
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    func configure(with app: WebAppDefinition) {
        titleLabel.text = app.title
        subtitleLabel.text = app.subtitle
        urlLabel.text = app.url.absoluteString

        iconView.image = UIImage(systemName: app.iconSymbolName)
        applyGradient(primaryHex: app.accentColorHex, secondaryHex: app.accentColorHexSecondary)

        let badge = app.badgeText?.trimmingCharacters(in: .whitespacesAndNewlines)
        badgeLabel.text = badge.map { "  \($0)  " }
        badgeLabel.isHidden = (badge?.isEmpty ?? true)
    }

    override func prepareForReuse() {
        super.prepareForReuse()
        iconContainer.layer.sublayers?.removeAll(where: { $0.name == "tileGradient" })
    }

    private func applyGradient(primaryHex: String, secondaryHex: String) {
        let gradient = CAGradientLayer()
        gradient.name = "tileGradient"
        gradient.frame = CGRect(origin: .zero, size: CGSize(width: 56, height: 56))
        gradient.colors = [
            UIColor(hex: primaryHex).cgColor,
            UIColor(hex: secondaryHex).cgColor
        ]
        gradient.startPoint = CGPoint(x: 0, y: 0)
        gradient.endPoint = CGPoint(x: 1, y: 1)
        iconContainer.layer.insertSublayer(gradient, at: 0)
    }
}

private extension UIColor {
    convenience init(hex: String) {
        let cleaned = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: cleaned).scanHexInt64(&int)

        let r, g, b: UInt64
        switch cleaned.count {
        case 3:
            (r, g, b) = ((int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (r, g, b) = (int >> 16, int >> 8 & 0xFF, int & 0xFF)
        default:
            (r, g, b) = (59, 130, 246)
        }

        self.init(
            red: CGFloat(r) / 255,
            green: CGFloat(g) / 255,
            blue: CGFloat(b) / 255,
            alpha: 1
        )
    }
}
