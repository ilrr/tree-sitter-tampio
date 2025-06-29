package tree_sitter_tampio_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_tampio "github.com/tree-sitter/tree-sitter-tampio/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_tampio.Language())
	if language == nil {
		t.Errorf("Error loading Tampio grammar")
	}
}
