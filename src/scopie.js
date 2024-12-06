export const arraySeperator = '|';
export const blockSeperator = '/';
export const wildcard = '*';
export const varPrefix = '@';

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

function jumpEndOfArrayElement(value, start) {
  for (let i = start + 1; i < value.length; i += 1) {
    if (value[i] === blockSeperator
      || value[i] === arraySeperator) {
      return i;
    }
  }

  return value.length;
}

function endOfBlock(value, start) {
  for (let i = start + 1; i < value.length; i += 1) {
    if (value[i] === blockSeperator) {
      return i;
    }
  }

  return value.length;
}


function compareActorToAction(actor, action, vars) {
	// Skip the allow and deny prefix for actors
	actor = endOfBlock(actor, 0)

	actorLeft += 1 // don't forget to skip the slash
	actionLeft := 0

	for (;actorLeft < actor.length || actionLeft < action.length) {
		// In case one is longer then the other
		if ((actorLeft < actor.length) != (actionLeft < action.length)) {
			return false
		}

		actionSlider = endOfBlock(action, actionLeft)
		if err != nil {
			return false
		}

		actorSlider = endOfBlock(actor, actorLeft)
		if err != nil {
			return false
		}

		// Super wildcards are checked here as it skips the who rest of the checks.
		if actorSlider-actorLeft == 2 && actor[actorLeft] == wildcard && actor[actorLeft+1] == wildcard {
			if len(*actor) > actorSlider {
        // todo: throw error
				// return false, errAllowedSuperNotLast
			}

			return true
		} else {
			match, err := compareBlock(actor, actorLeft, actorSlider/*, actorArray*/, action, actionLeft, actionSlider, vars)
			if err != nil {
				return false, err
			}

			if !match {
				return false, nil
			}
		}

		actionLeft = actionSlider + 1
		actorLeft = actorSlider + 1
	}

	return true, nil
}

/** Compares two strings with respect to variables and wildcards.
 * @param {string} aValue
 * @param {int} aLeft
 * @param {int} aSlider
 * @param {string} bValue
 * @param {int} bLeft
 * @param {int} bSlider
 * @param {Map<string,string>} vars
 */
function compareBlock(aValue, aLeft, aSlider, bValue, bLeft, bSlider, vars) {
  if (aValue[aLeft] === varPrefix) {
    const key = aValue.substring(aLeft + 1, aSlider);
    if (!vars.has(key)) {
      throw new Error(`scopie-104 in actor@${aLeft}: variable '${key}' not found`);
    }

    const varValue = vars.get(key);
    return varValue === bValue.substring(bLeft, bSlider);
  }

  if (aSlider - aLeft !== bSlider - bLeft) {
    return false;
  }

  return aValue.substring(aLeft, aSlider) === bValue.substring(bLeft, bSlider);
}

/**
 * Validate if our actor is allowed to perform the action based on the required scope.
 * @param {string[]} actionScopes - Required actor scopes
 * @param {string[]} actorRules - What scopes our actor has
 * @param {object} vars - User variables that are replacable in scopes
 */
export function isAllowed(actionScopes, actorRules, vars) {
  let varMap;
  if (vars) {
    varMap = new Map(Object.entries(vars));
  }

  if (actionScopes.length === 0) {
    throw new Error('scopie-106: action scope was empty');
  }

  if (actorRules.length === 0) {
    throw new Error('scopie-106: actor rule was empty');
  }

  let hasBeenAllowed = false;

  for (let ruleIndex = 0; ruleIndex < actorRules.length; ruleIndex++) {
    const actorRule = actorRules[ruleIndex]

    const isAllowBlock = actorRule === 'a';
    if (isAllowBlock && hasBeenAllowed) {
      continue;
    }

    let ruleLeft = endOfBlock(actorRules, actorLeft);
    actorIndex = actorLeft;
    let ruleLeft = 0;

    for (let actionIndex = 0; actionIndex < actionScopes.length; actionIndex++) {
      const match = compareBlock(actorRules, actorLeft, actionScopes, ruleLeft, varMap);
			if (match && isAllowBlock) {
				hasBeenAllowed = true
			} else if (match && !isAllowBlock) {
				return false
			}
    }
  }

  return hasBeenAllowed;
}

/**
 * TODO
 * @param {string} scope
 */
export function validateScope(scope) {
  if (scope === '') {
    return new Error('scopie-106: scope was empty');
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
        return new Error(`scopie-103: super wildcard found in array block`);
      }

      if (scope[i] === wildcard) {
        return new Error(`scopie-102: wildcard found in array block`);
      }

      if (scope[i] === varPrefix) {
        const end = jumpEndOfArrayElement(scope, i);
        return new Error(`scopie-101: variable '${scope.substring(i + 1, end)}' found in array block`);
      }
    }

    if (!isValidCharacter(scope[i])) {
      return new Error(`scopie-100: invalid character '${scope[i]}'`);
    }

    if (scope[i] === wildcard && i < scope.length - 1 && scope[i + 1] === wildcard
      && i < scope.length - 2) {
      return new Error(`scopie-105: super wildcard not in the last block`);
    }
  }

  return undefined;
}
