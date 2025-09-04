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
  externals: $ => [$._indent, $._dedent, $._newline, ":", $._colon_end, $._ws, $.comment, $.opening_bracket, $.closing_bracket, $.opening_quote, $.closing_quote, $.string_body],

  // extras: $ => [/[\s]/],
  // extras: $ => [" ", "\t"],
  extras: $ => [$._ws, $.comment],
  // inline: $ => [$.ledger],
  conflicts: $ => [[$.account_map], [$.ledger], [$.budget]],

  rules: {
    // TODO: add the actual grammar rules
    // source_file: $ =>
    //   seq(
    //     list($, $.statement),
    //     repeat($.section)
    //   ),
    source_file: $ => seq(optional($.ledger), $.section, repeat(seq($._newline, $.section))),

    section: $ => choice(
      seq(alias($.account_map_heading, $.section_heading), $._newline, $.account_map),
      seq(alias($.ledger_heading, $.section_heading), $._newline, $.ledger),
      seq(alias($.budget_heading, $.section_heading), $._newline, $.budget)
    ),

    account_map: $ => list2($, alias($.top_level_account, $.account)),
    account_map_heading: $ => seq("§", alias(token(prec(1, new RustRegex("(?i)tilikartta"))), $.section_name)),

    budget: $ => list2($, $.entry),
    budget_heading: $ => seq("§", alias(token(prec(1, new RustRegex("(?i)talousarvio|budjetti"))), $.section_name)),

    top_level_account: $ => seq(
      optional(
        choice(
          "+", alias($.minus, "-")
        )
      ),
      $.string,
      optional($.accounts)
    ),

    accounts: $ => block($, optional($.account_list)),
    account_list: $ => list2($, $.account),

    account: $ => seq(
      optional($.number),
      $.string,
      optional($.accounts)
    ),

    ledger: $ => list2($, $.statement),
    ledger_heading: $ => seq("§", alias($.identifier, $.section_name)),

    statement_0: $ => choice(
      $.transaction,
      $.date_block,
      $.alias
    ),
    statement: $ => choice(
      $.statement_0,
      alias($.dummy_block, $.scope),
      $.auto_block
    ),

    statement_D: $ => choice(
      $.statement_0,
      alias($.dateless_transaction, $.transaction),
      alias($.dummy_block_D, $.scope),
      alias($.auto_block_D, $.auto_block)
    ),

    dummy_block: $ => block($, optional($.statement_list)),
    statement_list: $ => list2($, $.statement),

    dummy_block_D: $ => block($, optional($.statement_list_D)),
    statement_list_D: $ => list2($, $.statement_D),

    date_block: $ => seq($.date_block_header, $.date_block_body),
    date_block_header: $ => $.date,
    date_block_body: $ => block($, optional($.statement_list_D)),

    auto_block: $ => seq($.auto_block_header, $.auto_block_body),
    auto_block_header: $ => seq($.auto, choice($.identifier, $.number)),
    auto_block_body: $ => block($, optional($.statement_list)),
    auto_block_D: $ => seq($.auto_block_header, $.auto_block_body_D),
    auto_block_body_D: $ => block($, optional($.statement_list_D)),

    transaction: $ => seq($.transaction_header, $.transaction_body),
    transaction_header: $ => choice(
      seq($.date, $.string, optional($._document)),
      seq($._document, $.date, $.string),
    ),
    dateless_transaction: $ => seq($.dateless_transaction_header, $.transaction_body),
    dateless_transaction_header: $ => choice(
      seq($.string, optional($._document)),
      seq($._document, $.string),
    ),

    transaction_body: $ => block($, optional($.entries)),

    entries: $ => list2($, $.entry),
    entry: $ => seq($.entry_header, $.entry_body),
    entry_header: $ => choice($.number, $.identifier),
    entry_body: $ => block($, optional($.amounts)),

    amounts: $ => list2($, $.amount),
    // amount: $=> alias(seq(optional($.minus), $.number), $.number),
    //
    alias: $ => seq($.identifier, "=", choice($.number, $.string)),

    _document: $ => alias($.identifier, $.document),

    _separator: $ => choice(";", $._newline),

    date: $ => /\d{1,2}\.\d{1,2}\.(\d\d(\d\d)?)?/,

    number: $ => /\d+([.,]\d+)?/,
    _negative_number: $ => seq($.minus, $.number),
    _dr_cr_number: $ => choice(seq($._dr_cr, $.number), seq($.number, $._dr_cr)),
    minus: $ => /* new RustRegex("[-\\u{2212}]"), */ choice("-", "\u2212"),
    amount: $ => choice($.number, $._negative_number, $._dr_cr_number, $.auto),
    identifier: $ => new RustRegex("\\p{Alphabetic}[\\p{Alphabetic}\\p{Nd}\\p{Nl}\\p{No}_]*"),
    auto: $ => "AUTO",
    debit: $ => choice("D", "DR", "Dr", "dr.", "DEBIT", "DEBET"),
    credit: $ => choice("C", "CR", "Cr", "cr.", "CREDIT", "KREDIT"),
    _dr_cr: $ => choice($.debit, $.credit),

    // comment: $ => /--.*\n/,

    string: $ => seq($.opening_quote, optional($.string_body), $.closing_quote),
    // string: $ => new RustRegex(
    //   "\"[^\"]*\"|'[^']*'|\\u{00AB}[^\\u{00AB}]*\\u{00AB}|\\u{2018}[^\\u{2018}]*\\u{2018}|\\u{201B}[^\\u{201B}]*\\u{201B}|\\u{201C}[^\\u{201C}]*\\u{201C}|\\u{201F}[^\\u{201F}]*\\u{201F}|\\u{2039}[^\\u{2039}]*\\u{2039}|\\u{2E02}[^\\u{2E02}]*\\u{2E02}|\\u{2E04}[^\\u{2E04}]*\\u{2E04}|\\u{2E09}[^\\u{2E09}]*\\u{2E09}|\\u{2E0C}[^\\u{2E0C}]*\\u{2E0C}|\\u{2E1C}[^\\u{2E1C}]*\\u{2E1C}|\\u{2E20}[^\\u{2E20}]*\\u{2E20}|\\u{00BB}[^\\u{00BB}]*\\u{00BB}|\\u{2019}[^\\u{2019}]*\\u{2019}|\\u{201D}[^\\u{201D}]*\\u{201D}|\\u{203A}[^\\u{203A}]*\\u{203A}|\\u{2E03}[^\\u{2E03}]*\\u{2E03}|\\u{2E05}[^\\u{2E05}]*\\u{2E05}|\\u{2E0A}[^\\u{2E0A}]*\\u{2E0A}|\\u{2E0D}[^\\u{2E0D}]*\\u{2E0D}|\\u{2E1D}[^\\u{2E1D}]*\\u{2E1D}|\\u{2E21}[^\\u{2E21}]*\\u{2E21}"
    // ),
  }
});



function block($, b) {
  /*  const block_delimeters = ["()", "[]", "{}", /*
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
  const block_delimiters = [[$.opening_bracket, $.closing_bracket], [$._indent, $._dedent], [":", $._colon_end]];
  const bodies = block_delimiters.map(d => seq(d[0], b, d[1]));
  return choice(...bodies)
}

function list2($, e) {
  return choice(
    seq(repeat($._separator), e, repeat(seq($._separator, optional(e)))),
    //repeat1($._separator)
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
