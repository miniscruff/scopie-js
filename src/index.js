export const version = "0.1.0"

export const scopeSeperator = ',';
export const arraySeperator = '|';
export const blockSeperator = '/';
export const wildcard = '*';
export const varPrefix = '@';

/**
 * TODO
 * @param {object} vars
 * @param {string} requiredScopes
 * @param {string} actorScopes
 */
export function isAllowed(vars, requiredScopes, actorScopes) {
  let varMap;
  if (vars) {
    varMap = new Map(Object.entries(vars));
  }

  if (requiredScopes === "") {
    throw `scopie-106 in scopes@0: scope was empty`
  }

  if (actorScopes === "") {
    throw `scopie-106 in actor@0: scope was empty`
  }

  let hasBeenAllowed = false;
  let actorIndex = 0;
  let actorLeft = 0;

  for (; actorLeft < actorScopes.length;) {
    const isAllowBlock = actorScopes[actorLeft] === 'a'
    if (isAllowBlock && hasBeenAllowed) {
      actorLeft = jumpAfterSeperator(actorScopes, actorLeft, scopeSeperator)
      continue
    }

    actorLeft = jumpAfterSeperator(actorScopes, actorLeft, blockSeperator)
    actorIndex = actorLeft
    let ruleLeft = 0

    for (; ruleLeft < requiredScopes.length;) {
      const comp = compareFrom(actorScopes, actorLeft, requiredScopes, ruleLeft, varMap)
      if (comp.match) {
        actorLeft = comp.a
        ruleLeft = comp.b

        const endOfActor = actorLeft >= actorScopes.length || actorScopes[actorLeft - 1] === scopeSeperator;
        const endOfRequired = ruleLeft >= requiredScopes.length || requiredScopes[ruleLeft - 1] === scopeSeperator;

        // if we are at the end of the actor and of the required scope
        if (endOfActor && endOfRequired) {
          if (isAllowBlock) {
            hasBeenAllowed = true
            actorLeft = jumpAfterSeperator(actorScopes, actorLeft, scopeSeperator)
          } else {
            return false
          }

          break
        } else if (endOfActor !== endOfRequired) {
          break
        }
      } else {
        ruleLeft = jumpAfterSeperator(requiredScopes, ruleLeft, scopeSeperator)
        actorLeft = actorIndex
      }
    }

    actorLeft = jumpAfterSeperator(actorScopes, actorLeft, scopeSeperator)
  }

  return hasBeenAllowed;
}

/**
 * TODO
 * @param {string} scope
 */
export function validateScope(scope) {
  if (scope === "") {
    return new Error(`scopie-106@0: scope was empty`);
  }

  let inArray = false;

  for (let i = 0; i < scope.length; i++) {
    if (scope[i] === blockSeperator) {
      inArray = false
      continue
    }

    if (scope[i] === arraySeperator) {
      inArray = true
      continue
    }

    if (inArray) {
      if (scope[i] === wildcard && i < scope.length - 1 && scope[i + 1] === wildcard) {
        return new Error(`scopie-103@${i}: super wildcard found in array block`)
      }

      if (scope[i] === wildcard) {
        return new Error(`scopie-102@${i}: wildcard found in array block`)
      }

      if (scope[i] === varPrefix) {
        const end = jumpEndOfArrayElement(scope, i);
        return new Error(`scopie-101@${i}: variable '${scope.substring(i+1, end)}' found in array block`)
      }
    }

    if (!isValidCharacter(scope[i])) {
      return new Error(`scopie-100@${i}: invalid character '${scope[i]}'`)
    }

    if (scope[i] === wildcard && i < scope.length - 1 && scope[i + 1] === wildcard &&
      i < scope.length - 2 && scope[i + 2] != scopeSeperator) {
      return new Error(`scopie-105@${i}: super wildcard not in the last block`);
    }
  }
}

/**
  * @typedef {Object} CompareFrom
  * @property {int} a - next a index
  * @property {int} b - next b index
  * @property {bool} match - whether or noti there was a match
  */

/**
 * @param {string} aValue
 * @param {int} aIndex
 * @param {string} bValue
 * @param {int} bIndex
 * @param {Map<string,string>} vars
 * @returns {CompareFrom} Comparison result
 */
function compareFrom(
  aValue, aIndex, bValue, bIndex, vars,
) {
  // Super wildcard is just two wildcards
  if (aValue[aIndex] === wildcard && aIndex < aValue.length - 1 && aValue[aIndex + 1] === wildcard) {
    if (aIndex + 2 < aValue.length && aValue[aIndex + 2] != scopeSeperator) {
      throw `scopie-105 in actor@${aIndex}: super wildcard not in the last block`
    }

    return {
      a: jumpAfterSeperator(aValue, aIndex, scopeSeperator),
      b: jumpAfterSeperator(bValue, bIndex, scopeSeperator),
      match: true,
    }
  }

  if (aValue[aIndex] === wildcard) {
    return {
      a: jumpAfterSeperator(aValue, aIndex, blockSeperator),
      b: jumpAfterSeperator(bValue, bIndex, blockSeperator),
      match: true,
    }
  }

  let bSlider = bIndex;
  for (; bSlider < bValue.length; bSlider++) {
    if (bValue[bSlider] === blockSeperator || bValue[bSlider] === scopeSeperator) {
      break
    } else if (!isValidCharacter(bValue[bSlider])) {
      throw `scopie-100 in scopes@${bSlider}: invalid character '${bValue[bSlider]}'`
    }
  }

  let aLeft = aIndex;
  let aSlider = aIndex;
  let wasArray = false;

  for (; aSlider < aValue.length; aSlider++) {
    if (aValue[aSlider] === blockSeperator || aValue[aSlider] === scopeSeperator) {
      if (compareChunk(aValue, aLeft, aSlider, bValue, bIndex, bSlider, vars)) {
        return {
          a: aSlider + 1,
          b: bSlider + 1,
          match: true,
        }
      }

      return {
        a: aIndex,
        b: bIndex,
        match: false,
      }
    } else if (aValue[aSlider] === arraySeperator) {
      wasArray = true

      if (aValue[aLeft] === varPrefix) {
        throw `scopie-101 in actor@${aLeft}: variable '${aValue.substring(aLeft + 1, aSlider)}' found in array block`
      }

      if (aValue[aLeft] === wildcard) {
        if (aLeft < aValue.length - 1 && aValue[aLeft + 1] === wildcard) {
          throw `scopie-103 in actor@${aLeft}: super wildcard found in array block`
        }

        throw `scopie-102 in actor@${aLeft}: wildcard found in array block`
      }

      if (compareChunk(aValue, aLeft, aSlider, bValue, bIndex, bSlider, undefined)) {
        return {
          a: jumpBlockOrScopeSeperator(aValue, aSlider),
          b: bSlider + 1,
          match: true,
        }
      }

      // go to the next array value
      aLeft = aSlider + 1
      aSlider += 1
    } else if (!isValidCharacter(aValue[aSlider])) {
      throw `scopie-100 in actor@${aSlider}: invalid character '${aValue[aSlider]}'`
    }
  }

  if (wasArray) {
    if (aValue[aLeft] === varPrefix) {
      throw `scopie-101 in actor@${aLeft}: variable '${aValue.substring(aLeft + 1, aSlider)}' found in array block`
    }

    if (aValue[aLeft] === wildcard) {
      if (aLeft < aValue.length - 1 && aValue[aLeft + 1] === wildcard) {
        throw `scopie-103 in actor@${aLeft}: super wildcard found in array block`
      }

      throw `scopie-102 in actor@${aLeft}: wildcard found in array block`
    }
  }

  if (compareChunk(aValue, aLeft, aSlider, bValue, bIndex, bSlider, vars)) {
    return {
      a: aSlider + 1,
      b: bSlider + 1,
      match: true,
    }
  }

  return {
    a: aIndex,
    b: bIndex,
    match: false,
  }
}

/**
 * @param {string} aValue
 * @param {int} aLeft
 * @param {int} aSlider
 * @param {string} bValue
 * @param {int} bLeft
 * @param {int} bSlider
 * @param {Map<string,string>} vars
 */
function compareChunk(
  aValue, aLeft, aSlider,
  bValue, bLeft, bSlider,
  vars,
) {
  if (aValue[aLeft] === varPrefix) {
    const key = aValue.substring(aLeft + 1, aSlider)
    if (!vars.has(key)) {
      throw `scopie-104 in actor@${aLeft}: variable '${key}' not found`
    }

    const varValue = vars.get(key)
    return varValue === bValue.substring(bLeft, bSlider)
  }

  if (aSlider - aLeft != bSlider - bLeft) {
    return false
  }

  return aValue.substring(aLeft, aSlider) === bValue.substring(bLeft, bSlider)
}

function jumpEndOfArrayElement(value, start) {
  for (let i = start + 1; i < value.length; i++) {
    if (value[i] == blockSeperator ||
      value[i] == scopeSeperator ||
      value[i] == arraySeperator) {
      return i
    }
  }

  return value.length
}

function jumpAfterSeperator(value, start, sep) {
  for (let i = start + 1; i < value.length; i++) {
    if (value[i] === sep) {
      return i + 1
    }
  }

  return value.length
}

function jumpBlockOrScopeSeperator(value, start) {
  for (let i = start + 1; i < value.length; i++) {
    if (value[i] === blockSeperator || value[i] === scopeSeperator) {
      return i + 1
    }
  }

  return value.length
}

function isValidCharacter(char) {
  if (char >= 'a' && char <= 'z') {
    return true
  }

  if (char >= 'A' && char <= 'Z') {
    return true
  }

  if (char >= '0' && char <= '9') {
    return true
  }

  return char === '_' || char === '-' || char === varPrefix || char === wildcard
}

