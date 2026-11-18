import Foundation
import WebKit
import AppKit

let svgPath = "/Users/atharvajha/Desktop/Student-Management-DE/DE/02_er_diagram.svg"
let pngPath = "/Users/atharvajha/Desktop/Student-Management-DE/DE/02_er_diagram.png"

guard let svgData = try? Data(contentsOf: URL(fileURLWithPath: svgPath)),
      let image = NSImage(data: svgData) else {
    print("Failed to load SVG with NSImage")
    exit(1)
}

let rep = NSBitmapImageRep(
    bitmapDataPlanes: nil,
    pixelsWide: 2200,
    pixelsHigh: 1400,
    bitsPerSample: 8,
    samplesPerPixel: 4,
    hasAlpha: true,
    isPlanar: false,
    colorSpaceName: .deviceRGB,
    bytesPerRow: 0,
    bitsPerPixel: 0
)!
rep.size = NSSize(width: 1100, height: 700)

NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
image.draw(in: NSRect(x: 0, y: 0, width: 1100, height: 700))
NSGraphicsContext.restoreGraphicsState()

if let pngData = rep.representation(using: .png, properties: [:]) {
    try? pngData.write(to: URL(fileURLWithPath: pngPath))
    print("Successfully generated PNG: \(pngPath)")
} else {
    print("Failed to convert rep to PNG")
    exit(1)
}
