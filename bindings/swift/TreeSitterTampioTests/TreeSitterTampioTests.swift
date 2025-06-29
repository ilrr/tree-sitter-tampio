import XCTest
import SwiftTreeSitter
import TreeSitterTampio

final class TreeSitterTampioTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_tampio())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Tampio grammar")
    }
}
