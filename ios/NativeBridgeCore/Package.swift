// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "NativeBridgeCore",
    platforms: [
        .iOS(.v15),
        .macOS(.v12)
    ],
    products: [
        .library(name: "NativeBridgeCore", targets: ["NativeBridgeCore"])
    ],
    targets: [
        .target(name: "NativeBridgeCore"),
        .testTarget(name: "NativeBridgeCoreTests", dependencies: ["NativeBridgeCore"])
    ]
)
