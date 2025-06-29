/**
 * @file Tampio grammar for tree-sitter
 * @author ilari
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "tampio",

  // externals: $ => [$.block_start, $.block_end],
  externals: $ => [$._indent, $._dedent, $._newline, ":", $._colon_end, $._ws],

  // extras: $ => [/[\s]/],
  // extras: $ => [" ", "\t"],
  extras: $ => [$._ws],
  // inline: $ => [$.ledger],

  rules: {
    // TODO: add the actual grammar rules
    // source_file: $ =>
    //   seq(
    //     list($, $._statement),
    //     repeat($.section)
    //   ),
    source_file: $ => list2($, $.section),

    section: $ => choice(
      seq(alias(seq("§", new RustRegex("(?i)tilikartta")), $.section_heading), $._newline, $.account_map),
      $.ledger
    ),

    account_map: $ => block($, optional(list2($, $.top_level_account))),

    top_level_account: $ => seq(
      optional(
        choice(
          "+", alias($.minus, "-")
        )
      ),
      $.string,
      optional(list($, $.account))
    ),

    accounts: $ => block($, optional($.account_list)),
    account_list: $ => list2($, $.account),

    account: $ => seq(
      optional($.number),
      $.string,
      optional($.accounts)
    ),

    ledger: $ => seq(alias(seq("§", $.identifier), $.section_heading), $._newline, list($, $._statement)),
    // ledger: $ => list($, $._statement),

    _statement_0: $ => choice(
      $.transaction,
      $.date_block,
      $.alias
    ),
    _statement: $ => choice(
      $._statement_0,
      $.dummy_block,
      $.auto_block,
    ),

    _statement_D: $ => choice(
      $._statement_0,
      $.dummy_block_D,
      $.auto_block_D,
      alias($.dateless_transaction, $.transaction)
    ),

    alias: $ => seq($.identifier, "=", $.number),

    dummy_block: $ => list_body($, $._statement),
    dummy_block_D: $ => list_body($, $._statement_D),

    auto_block: $ => list_block($, $.auto_header, $._statement),
    auto_block_D: $ => list_block($, $.auto_header, $._statement_D),
    auto_header: $ => seq($.auto, choice($.identifier, $.number)),

    date_block: $ => list_block($,
      $.date,
      $._statement_D
    ),

    transaction: $ => seq($.transaction_header, $.transaction_body),
    dateless_transaction: $ => choice(
      seq($.string, optional($._document), $.transaction_body),
      seq($._document, $.string, $.transaction_body)
    ),

    transaction_header: $ => choice(
      seq($.date, $.string, optional($._document)),
      seq($._document, $.date, $.string),
    ),

    _document: $ => alias($.identifier, $.document),

    transaction_body: $ => body($, list($, $.entry)),

    entry: $ => seq($.entry_header, $.entry_body),
    entry_header: $ => choice($.number, $.identifier),
    entry_body: $ => list_body($, $.amount),


    // TODO REPLACE LATER
    // indent: $ => ">", dedent: $ => "<", 
    _separator: $ => choice(";", $._newline),


    date: $ => /\d{1,2}\.\d{1,2}\.(\d\d(\d\d)?)?/,

    number: $ => /\d+([.,]\d+)?/,
    minus: $ => choice("-", "\u2212"),
    amount: $ => choice($.number, seq($.minus, $.number), $.auto),
    identifier: $ => new RustRegex("\\p{Alphabetic}[\\p{Alphabetic}\\p{Nd}\\p{Nl}\\p{No}_]*"),
    auto: $ => "AUTO",

    string: $ => new RustRegex(
      "\"[^\"]*\"|'[^']*'|\\u{00AB}[^\\u{00AB}]*\\u{00AB}|\\u{2018}[^\\u{2018}]*\\u{2018}|\\u{201B}[^\\u{201B}]*\\u{201B}|\\u{201C}[^\\u{201C}]*\\u{201C}|\\u{201F}[^\\u{201F}]*\\u{201F}|\\u{2039}[^\\u{2039}]*\\u{2039}|\\u{2E02}[^\\u{2E02}]*\\u{2E02}|\\u{2E04}[^\\u{2E04}]*\\u{2E04}|\\u{2E09}[^\\u{2E09}]*\\u{2E09}|\\u{2E0C}[^\\u{2E0C}]*\\u{2E0C}|\\u{2E1C}[^\\u{2E1C}]*\\u{2E1C}|\\u{2E20}[^\\u{2E20}]*\\u{2E20}|\\u{00BB}[^\\u{00BB}]*\\u{00BB}|\\u{2019}[^\\u{2019}]*\\u{2019}|\\u{201D}[^\\u{201D}]*\\u{201D}|\\u{203A}[^\\u{203A}]*\\u{203A}|\\u{2E03}[^\\u{2E03}]*\\u{2E03}|\\u{2E05}[^\\u{2E05}]*\\u{2E05}|\\u{2E0A}[^\\u{2E0A}]*\\u{2E0A}|\\u{2E0D}[^\\u{2E0D}]*\\u{2E0D}|\\u{2E1D}[^\\u{2E1D}]*\\u{2E1D}|\\u{2E21}[^\\u{2E21}]*\\u{2E21}"
    ),
    string2: $ => choice(
      /"[^"]*"/,
      /'[^']*'/,
      new RustRegex("\\u{00AB}[^\\u{00AB}]*\\u{00AB}"),
      new RustRegex("\\u{2018}[^\\u{2018}]*\\u{2018}"),
      new RustRegex("\\u{201B}[^\\u{201B}]*\\u{201B}"),
      new RustRegex("\\u{201C}[^\\u{201C}]*\\u{201C}"),
      new RustRegex("\\u{201F}[^\\u{201F}]*\\u{201F}"),
      new RustRegex("\\u{2039}[^\\u{2039}]*\\u{2039}"),
      new RustRegex("\\u{2E02}[^\\u{2E02}]*\\u{2E02}"),
      new RustRegex("\\u{2E04}[^\\u{2E04}]*\\u{2E04}"),
      new RustRegex("\\u{2E09}[^\\u{2E09}]*\\u{2E09}"),
      new RustRegex("\\u{2E0C}[^\\u{2E0C}]*\\u{2E0C}"),
      new RustRegex("\\u{2E1C}[^\\u{2E1C}]*\\u{2E1C}"),
      new RustRegex("\\u{2E20}[^\\u{2E20}]*\\u{2E20}"),
      new RustRegex("\\u{00BB}[^\\u{00BB}]*\\u{00BB}"),
      new RustRegex("\\u{2019}[^\\u{2019}]*\\u{2019}"),
      new RustRegex("\\u{201D}[^\\u{201D}]*\\u{201D}"),
      new RustRegex("\\u{203A}[^\\u{203A}]*\\u{203A}"),
      new RustRegex("\\u{2E03}[^\\u{2E03}]*\\u{2E03}"),
      new RustRegex("\\u{2E05}[^\\u{2E05}]*\\u{2E05}"),
      new RustRegex("\\u{2E0A}[^\\u{2E0A}]*\\u{2E0A}"),
      new RustRegex("\\u{2E0D}[^\\u{2E0D}]*\\u{2E0D}"),
      new RustRegex("\\u{2E1D}[^\\u{2E1D}]*\\u{2E1D}"),
      new RustRegex("\\u{2E21}[^\\u{2E21}]*\\u{2E21}"),
    ),
  }
});


function block($, h, b) {
  return seq(h, body($, b))
}

function list_body($, e) {
  return body($, list($, e))
};

function list_block($, h, e) {
  return block($, h, list($, e))
}

function body($, b) {
  const block_delimeters = ["()", "[]", "{}", /*
    "\u0F3A\u0F3B", "\u0F3C\u0F3D", "\u169B\u169C",
    "\u2045\u2046", "\u2768\u2769", "\u276A\u276B",
    "\u276C\u276D", "\u276E\u276F", "\u2770\u2771",
    "\u2772\u2773", "\u2774\u2775", "\u27E6\u27E7",
    "\u27E8\u27E9", "\u27EA\u27EB", "\u2983\u2984",
    "\u2985\u2986", "\u2987\u2988", "\u2989\u298A",
    "\u298B\u298C", "\u298D\u298E", "\u298F\u2990",
    "\u2991\u2992", "\u2993\u2994", "\u2995\u2996",
    "\u2997\u2998", "\u29D8\u29D9", "\u29DA\u29DB",
    "\u29FC\u29FD", "\u2E22\u2E23", "\u2E24\u2E25",
    "\u2E26\u2E27", "\u2E28\u2E29", "\u3008\u3009",
    "\u300A\u300B", "\u300C\u300D", "\u300E\u300F",
    "\u3010\u3011", "\u3014\u3015", "\u3016\u3017",
    "\u3018\u3019", "\u301A\u301B", */
    [$._indent, $._dedent], [":", $._colon_end]];
  const bodies = block_delimeters.map(d => seq(d[0], b, d[1]));
  return choice(...bodies)
}

function list2($, e) {
  return choice(
    seq(e, repeat(seq($._separator, optional(e)))),
    repeat1($._separator)
  )
}

function list($, e) {
  return optional(
    seq(
      optional(e),
      optional(
        repeat(
          seq(
            $._separator,
            optional(e)
          )
        )
      )
    )
  )
}

function list_a($, e) {
  return alias(list($, e), $.list)
}
