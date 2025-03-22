export const arraySeperator = '|';
export const blockSeperator = '/';
export const wildcard = '*';
export const varPrefix = '@';

export const allowPermission = "allow";
export const denyPermission = "deny";

/** Checks character validity
 * @param {character} char - Single character to check
 * @returns {boolean} whether or not the character is valid within a scope.
 */
function isValidCharacter(char) {
  if (char >= 'a' && char <= 'z') {
    return true;
  }

  if (char >= 'A' && char <= 'Z') {
    return true;
  }

  if (char >= '0' && char <= '9') {
    return true;
  }

  return char === '_' || char === '-' || char === varPrefix || char === wildcard;
}

/** Calculates the end of an array element
 * @param {string} value - Value of our scope we are traversing
 * @param {number} start - Index to start searching from
 * @returns {number} index at the end of the array element
 */
function endOfArrayElement(value, start) {
  for (let i = start + 1; i < value.length; i += 1) {
    if (value[i] === blockSeperator || value[i] === arraySeperator) {
      return i;
    }
  }

  return value.length;
}

/** Calculates the end of a scope block
 * @param {string} category - Value to use when returning an error for our category
 * @param {string} value - Value of our scope we are traversing
 * @param {number} start - Index to start searching from
 * @returns {number} index at the end of the scope block
 */
function endOfBlock(category, value, start) {
  for (let i = start; i < value.length; i += 1) {
    if (value[i] === blockSeperator) {
      return i;
    } if (value[i] === arraySeperator) {
      continue;
    } else if (!isValidCharacter(value[i])) {
      throw new Error(`scopie-100 in ${category}: invalid character '${value[i]}'`);
    }
  }

  return value.length;
}

/** Compares two strings with respect to variables and wildcards.
 * @param {string} rule
 * @param {int} ruleLeft
 * @param {int} ruleSlider
 * @param {string} scope
 * @param {int} scopeLeft
 * @param {int} scopeSlider
 * @param {Map<string,string>} vars
 * @returns {boolean} Whether or not our rule block matches the scope block
 */
function compareBlock(rule, ruleLeft, ruleSlider, scope, scopeLeft, scopeSlider, vars) {
  if (rule[ruleLeft] === varPrefix) {
    const key = rule.substring(ruleLeft + 1, ruleSlider);
    if (!vars.has(key)) {
      throw new Error(`scopie-104: variable '${key}' not found`);
    }

    const varValue = vars.get(key);
    return varValue === scope.substring(scopeLeft, scopeSlider);
  }

  if (ruleSlider - ruleLeft === 1 && rule[ruleLeft] === wildcard) {
    return true;
  }

  if (rule.substring(ruleLeft, ruleSlider).indexOf(arraySeperator) >= 0) {
    for (; ruleLeft < ruleSlider;) {
      const arrayRight = endOfArrayElement(rule, ruleLeft);

      if (rule[ruleLeft] === varPrefix) {
        throw new Error(`scopie-101: variable '${rule.substring(ruleLeft + 1, arrayRight)}' found in array block`);
      }

      if (rule[ruleLeft] === wildcard) {
        if (arrayRight - ruleLeft > 1 && rule[ruleLeft + 1] === wildcard) {
          throw new Error('scopie-103: super wildcard found in array block');
        }

        throw new Error('scopie-102: wildcard found in array block');
      }

      if (rule.substring(ruleLeft, arrayRight) === scope.substring(scopeLeft, scopeSlider)) {
        return true;
      }

      ruleLeft = arrayRight + 1;
    }

    return false;
  }

  return rule.substring(ruleLeft, ruleSlider) === scope.substring(scopeLeft, scopeSlider);
}

/** Determines if an rule matches a scope
 * @param {string} scope
 * @param {string} rule
 * @param {Map<string,string>} vars - Variables for translations
 * @returns {boolean} Whether or not the scope matches the rule
 */
function compareScopeToRule(scope, rule, vars) {
  // Skip the allow and deny prefix for rules
  let ruleLeft = endOfBlock('rule', rule, 0) + 1;
  let scopeLeft = 0;
  let ruleSlider = 0;
  let scopeSlider = 0;

  for (; ruleLeft < rule.length || scopeLeft < scope.length;) {
    // In case one is longer then the other
    if ((ruleLeft < rule.length) !== (scopeLeft < scope.length)) {
      return false;
    }

    scopeSlider = endOfBlock('scope', scope, scopeLeft);
    ruleSlider = endOfBlock('rule', rule, ruleLeft);

    // Super wildcards are checked here as it skips the who rest of the checks.
    if (
      ruleSlider - ruleLeft === 2
      && rule[ruleLeft] === wildcard
      && rule[ruleLeft + 1] === wildcard
    ) {
      if (rule.length > ruleSlider) {
        throw new Error('scopie-105: super wildcard not in the last block');
      }

      return true;
    }
    if (!compareBlock(
      rule,
      ruleLeft,
      ruleSlider,
      scope,
      scopeLeft,
      scopeSlider,
      vars,
    )) {
      return false;
    }

    scopeLeft = scopeSlider + 1;
    ruleLeft = ruleSlider + 1;
  }

  return true;
}

/**
 * Validate if our user is allowed to perform the action based on their rules and the required scopes.
 * @param {string[]} scopes - Required scopes
 * @param {string[]} rules - What rules our user has
 * @param {object} vars - User variables that are replacable in scopes
 */
export function isAllowed(scopes, rules, vars) {
  if (rules.length === 0) {
    return false;
  }

  if (scopes.length === 0) {
    throw new Error('scopie-106 in scope: scopes was empty');
  }

  let varMap;
  if (vars) {
    varMap = new Map(Object.entries(vars));
  }

  let hasBeenAllowed = false;

  for (let ruleIndex = 0; ruleIndex < rules.length; ruleIndex += 1) {
    const rule = rules[ruleIndex];
    if (rule.length === 0) {
      throw new Error('scopie-106 in rule: rule was empty');
    }

    const isAllowBlock = rule[0] === 'a';
    if (isAllowBlock && hasBeenAllowed) {
      continue;
    }

    for (let scopeIndex = 0; scopeIndex < scopes.length; scopeIndex += 1) {
      const scope = scopes[scopeIndex];
      if (scope.length === 0) {
        throw new Error('scopie-106 in scope: scope was empty');
      }

      const match = compareScopeToRule(scope, rule, varMap);
      if (match && isAllowBlock) {
        hasBeenAllowed = true;
      } else if (match && !isAllowBlock) {
        return false;
      }
    }
  }

  return hasBeenAllowed;
}

/**
 * Determines whether or not the scopes or rules are valid according to scopie rules.
 * @param {string[]} scopeOrRules - Scope or rules to check
 * @returns {Error|undefined} If the scope is invalid, the validation error is returned,
 * otherwise undefined is returned.
 */
export function validateScopes(scopeOrRules) {
  if (scopeOrRules.length === 0) {
    return new Error('scopie-106: scopes are empty');
  }

  const isRules = scopeOrRules[0].startsWith(allowPermission) ||
    scopeOrRules[0].startsWith(denyPermission)

  for (let scope of scopeOrRules) {
    if (scope.length === 0) {
      return new Error('scopie-106: scope or rule was empty');
    }

    const isScopeRules = scope.startsWith(allowPermission) ||
      scope.startsWith(denyPermission)
    if (isRules != isScopeRules) {
      return new Error('scopie-107: inconsistent array of scopes and rules');
    }

    let inArray = false;

    for (let i = 0; i < scope.length; i += 1) {
      if (scope[i] === blockSeperator) {
        inArray = false;
        continue;
      }

      if (scope[i] === arraySeperator) {
        inArray = true;
        continue;
      }

      if (inArray) {
        if (scope[i] === wildcard && i < scope.length - 1 && scope[i + 1] === wildcard) {
          return new Error('scopie-103: super wildcard found in array block');
        }

        if (scope[i] === wildcard) {
          return new Error('scopie-102: wildcard found in array block');
        }

        if (scope[i] === varPrefix) {
          const end = endOfArrayElement(scope, i);
          return new Error(`scopie-101: variable '${scope.substring(i + 1, end)}' found in array block`);
        }
      }

      if (!isValidCharacter(scope[i])) {
        return new Error(`scopie-100: invalid character '${scope[i]}'`);
      }

      if (scope[i] === wildcard && i < scope.length - 1 && scope[i + 1] === wildcard
        && i < scope.length - 2) {
        return new Error('scopie-105: super wildcard not in the last block');
      }
    }
  }

  return undefined;
}
