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
 * @param {string} aValue
 * @param {int} aLeft
 * @param {int} aSlider
 * @param {string} bValue
 * @param {int} bLeft
 * @param {int} bSlider
 * @param {Map<string,string>} vars
 * @returns {boolean} Whether or not our actor matches the action block
 */
function compareBlock(aValue, aLeft, aSlider, bValue, bLeft, bSlider, vars) {
  let actorLeft = aLeft;

  if (aValue[actorLeft] === varPrefix) {
    const key = aValue.substring(actorLeft + 1, aSlider);
    if (!vars.has(key)) {
      throw new Error(`scopie-104: variable '${key}' not found`);
    }

    const varValue = vars.get(key);
    return varValue === bValue.substring(bLeft, bSlider);
  }

  if (aSlider - actorLeft === 1 && aValue[actorLeft] === wildcard) {
    return true;
  }

  if (aValue.substring(actorLeft, aSlider).indexOf(arraySeperator) >= 0) {
    for (; actorLeft < aSlider;) {
      const arrayRight = endOfArrayElement(aValue, actorLeft);

      if (aValue[actorLeft] === varPrefix) {
        throw new Error(`scopie-101: variable '${aValue.substring(actorLeft + 1, arrayRight)}' found in array block`);
      }

      if (aValue[actorLeft] === wildcard) {
        if (arrayRight - actorLeft > 1 && aValue[actorLeft + 1] === wildcard) {
          throw new Error('scopie-103: super wildcard found in array block');
        }

        throw new Error('scopie-102: wildcard found in array block');
      }

      if (aValue.substring(actorLeft, arrayRight) === bValue.substring(bLeft, bSlider)) {
        return true;
      }

      actorLeft = arrayRight + 1;
    }

    return false;
  }

  return aValue.substring(aLeft, aSlider) === bValue.substring(bLeft, bSlider);
}

/** Determines if an actor matches an action
 * @param {string} actor - Actor scope
 * @param {string} action - Action rule
 * @param {Map<string,string>} vars - Variables for translations
 * @returns {boolean} Whether or not the actor matches the rule
 */
function compareActorToAction(actor, action, vars) {
  // Skip the allow and deny prefix for actors
  let actorLeft = endOfBlock('actor', actor, 0) + 1;
  let actionLeft = 0;
  let actionSlider = 0;
  let actorSlider = 0;

  for (; actorLeft < actor.length || actionLeft < action.length;) {
    // In case one is longer then the other
    if ((actorLeft < actor.length) !== (actionLeft < action.length)) {
      return false;
    }

    actionSlider = endOfBlock('action', action, actionLeft);
    actorSlider = endOfBlock('actor', actor, actorLeft);

    // Super wildcards are checked here as it skips the who rest of the checks.
    if (
      actorSlider - actorLeft === 2
      && actor[actorLeft] === wildcard
      && actor[actorLeft + 1] === wildcard
    ) {
      if (actor.length > actorSlider) {
        throw new Error('scopie-105: super wildcard not in the last block');
      }

      return true;
    }
    if (!compareBlock(
      actor,
      actorLeft,
      actorSlider,
      action,
      actionLeft,
      actionSlider,
      vars,
    )) {
      return false;
    }

    actionLeft = actionSlider + 1;
    actorLeft = actorSlider + 1;
  }

  return true;
}

/**
 * Validate if our actor is allowed to perform the action based on the required scope.
 * @param {string[]} actionScopes - Required actor scopes
 * @param {string[]} actorRules - What scopes our actor has
 * @param {object} vars - User variables that are replacable in scopes
 */
export function isAllowed(actionScopes, actorRules, vars) {
  if (actorRules.length === 0) {
    return false;
  }

  if (actionScopes.length === 0) {
    throw new Error('scopie-106 in action: scopes was empty');
  }

  let varMap;
  if (vars) {
    varMap = new Map(Object.entries(vars));
  }

  let hasBeenAllowed = false;

  for (let ruleIndex = 0; ruleIndex < actorRules.length; ruleIndex += 1) {
    const actorRule = actorRules[ruleIndex];
    if (actorRule.length === 0) {
      throw new Error('scopie-106 in actor: rule was empty');
    }

    const isAllowBlock = actorRule[0] === 'a';
    if (isAllowBlock && hasBeenAllowed) {
      continue;
    }

    for (let actionIndex = 0; actionIndex < actionScopes.length; actionIndex += 1) {
      const actionScope = actionScopes[actionIndex];
      if (actionScope.length === 0) {
        throw new Error('scopie-106 in action: scope was empty');
      }

      const match = compareActorToAction(actorRule, actionScope, varMap);
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
