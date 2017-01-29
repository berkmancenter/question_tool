# JavaScript Style Guide

- We use [ESLint](http://eslint.org/) to lint our code, with most of the rules except:
  - Unary operators (++, --) are ok.
  - String concatenation (instead of using [template literals](http://eslint.org/docs/rules/prefer-template)) is ok.
  - [Underscore dangles](http://eslint.org/docs/rules/no-underscore-dangle) are only ok when referring to `_id`.
  - In case of event handlers, not explicitly putting in `return true;` when there's an exception/if statement with a `return false;` is ok.
  - Re-assigning parameters is ok only if really needed.
  - Keeping lines under 100 chars is not mandatory, but definitely recommended.
  - Mixing operators (having more than one type of operator in one equation/inequality) is ok only when those operators are of the same "level" - for example + and -, * and / - so they're easy to read/debug.
- General guidelines:
  - Use soft tabs only, with 1 tab = 2 spaces.
  - Keep variable names readable, meaningful, and distinguishable.
