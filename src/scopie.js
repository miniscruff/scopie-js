/**
 * Authorization engine for configuring per user per feature access control.
 * Access is configured via plain text and handled directly via code.
 * Configuration storage is controlled by you, scopie just handles the logic.
 *
 * See {@link https://scopie.dev Scopie Docs} for full specification.
 */


/** arraySeparator is the character between array elements.
 * See {@link https://scopie.dev/specification/terms/#block block term} for how blocks are formatted.
 */
export const arraySeparator = '|';

/** blockSeparator is the character between blocks.
 * See {@link https://scopie.dev/specification/terms/#block block term} for how blocks are formatted.
 */
export const blockSeparator = '/';

/** wildcard is the character that matches any value in a block.
 * See {@link https://scopie.dev/specification/terms/#block block term} for how blocks are formatted.
 */
export const wildcard = '*';

/** varPrefix is the character that prefixes variables in blocks.
 * See {@link https://scopie.dev/specification/terms/#block block term} for how blocks are formatted.
 */
export const varPrefix = '@';

/** allowGrant is the value used to denote an allowed permission.
 * See {@link https://scopie.dev/specification/terms/#grant permission term} for how actions are checked.
 */
export const allowGrant = "allow";

/** denyGrant is the value used to denote a denied permission.
 * See {@link https://scopie.dev/specification/terms/#grant permission term} for how actions are checked.
 */
export const denyGrant = "deny";

/** Checks character validity
 * @param {character} char - Single character to check
 * @returns {boolean} whether or not the character is valid within a literal block.
 * @access private
 */
function isValidLiteral(char) {
  if (char >= 'a' && char <= 'z') {
    return true;
  }

  if (char >= 'A' && char <= 'Z') {
    return true;
  }

  if (char >= '0' && char <= '9') {
    return true;
  }

  return char === '_' || char === '-';
}

/** Checks character validity
 * @param {character} char - Single character to check
 * @returns {boolean} whether or not the character is valid within a block.
 * @access private
 */
function isValidCharacter(char) {
  return isValidLiteral(char) || char === varPrefix || char === wildcard;
}

/** Calculates the end of an array element
 * @param {string} value - Value of our action we are traversing
 * @param {number} start - Index to start searching from
 * @returns {number} index at the end of the array element
 * @access private
 */
function endOfArrayElement(value, start) {
  for (let i = start + 1; i < value.length; i += 1) {
    if (value[i] === blockSeparator || value[i] === arraySeparator) {
      return i;
    }
  }

  return value.length;
}

function skipGrant(value) {
	if (value.startsWith(denyGrant)) {
		return 5
	}

	if (value.startsWith(allowGrant)) {
		return 6
	}

	throw new Error("scopie-107: permission does not start with a grant")
}

/** Calculates the end of a action block
 * @param {string} category - Value to use when returning an error for our category
 * @param {string} value - Value of our action we are traversing
 * @param {number} start - Index to start searching from
 * @returns {number} index at the end of the action block
 * @access private
 */
function endOfBlock(category, value, start) {
  for (let i = start; i < value.length; i += 1) {
    if (value[i] === blockSeparator) {
      return i;
    } if (value[i] === arraySeparator) {
      continue;
    } else if (!isValidCharacter(value[i])) {
      throw new Error(`scopie-100 in ${category}: invalid character '${value[i]}'`);
    }
  }

  return value.length;
}

/** Compares two strings with respect to variables and wildcards.
 * @param {string} permission
 * @param {int} permissionLeft
 * @param {int} permissionSlider
 * @param {string} action
 * @param {int} actionLeft
 * @param {int} actionSlider
 * @param {Map<string,string>} vars
 * @returns {boolean} Whether or not our permission block matches the action block
 * @access private
 */
function compareBlock(permission, permissionLeft, permissionSlider, action, actionLeft, actionSlider, vars) {
  if (permission[permissionLeft] === varPrefix) {
    const key = permission.substring(permissionLeft + 1, permissionSlider);
    if (!vars.has(key)) {
      throw new Error(`scopie-104: variable '${key}' not found`);
    }

    const varValue = vars.get(key);
    return varValue === action.substring(actionLeft, actionSlider);
  }

  if (permissionSlider - permissionLeft === 1 && permission[permissionLeft] === wildcard) {
    return true;
  }

  if (permission.substring(permissionLeft, permissionSlider).indexOf(arraySeparator) >= 0) {
    for (; permissionLeft < permissionSlider;) {
      const arrayRight = endOfArrayElement(permission, permissionLeft);

      if (permission[permissionLeft] === varPrefix) {
        throw new Error(`scopie-101: variable '${permission.substring(permissionLeft + 1, arrayRight)}' found in array block`);
      }

      if (permission[permissionLeft] === wildcard) {
        if (arrayRight - permissionLeft > 1 && permission[permissionLeft + 1] === wildcard) {
          throw new Error('scopie-103: super wildcard found in array block');
        }

        throw new Error('scopie-102: wildcard found in array block');
      }

      if (permission.substring(permissionLeft, arrayRight) === action.substring(actionLeft, actionSlider)) {
        return true;
      }

      permissionLeft = arrayRight + 1;
    }

    return false;
  }

  return permission.substring(permissionLeft, permissionSlider) === action.substring(actionLeft, actionSlider);
}

/** Determines if an permission matches a action
 * @param {string} action
 * @param {string} permission
 * @param {Map<string,string>} vars - Variables for translations
 * @returns {boolean} Whether or not the action matches the permission
 * @access private
 */
function compareActionToPermission(action, permission, vars) {
  // Skip the grant prefix for permissions
  let permissionLeft = skipGrant(permission);
  let actionLeft = 0;
  let permissionSlider = 0;
  let actionSlider = 0;

  for (; permissionLeft < permission.length || actionLeft < action.length;) {
    // In case one is longer then the other
    if ((permissionLeft < permission.length) !== (actionLeft < action.length)) {
      return false;
    }

    actionSlider = endOfBlock('action', action, actionLeft);
    permissionSlider = endOfBlock('permission', permission, permissionLeft);

    // Super wildcards are checked here as it skips the who rest of the checks.
    if (
      permissionSlider - permissionLeft === 2
      && permission[permissionLeft] === wildcard
      && permission[permissionLeft + 1] === wildcard
    ) {
      if (permission.length > permissionSlider) {
        throw new Error('scopie-105: super wildcard not in the last block');
      }

      return true;
    }
    if (!compareBlock(
      permission,
      permissionLeft,
      permissionSlider,
      action,
      actionLeft,
      actionSlider,
      vars,
    )) {
      return false;
    }

    actionLeft = actionSlider + 1;
    permissionLeft = permissionSlider + 1;
  }

  return true;
}

/**
 * Is Allowed determines whether or not the actions are allowed with the given permissions.
 * @param {string[]} actions - actions specifies one or more actions our user must match. When using more then one action, they are treated as a series of OR conditions, and an user will be allowed if they match any of the actions.
 * @param {string[]} permissions - permissions specifies one or more permissions our requesting actions has to have to be allowed access.
 * @param {object} vars - An optional dictionary or map of variable to values. Variable keys should not start with `@`
 * @returns boolean - Whether or not the actions are allowed with the given permissions.
 * @throws Any invalid action or permission issues, see {@link https://scopie.dev/specification/errors/ scopie errors} for possible issues.
 * @example
 * // returns true
 * isAllowed(
 *   ["accounts/thor/edit"],         // actions
 *   ["allow/accounts/@username/*"], // permissions
 *   { "username": "thor" },         // vars
 * )
 */
export function isAllowed(actions, permissions, vars) {
  if (permissions.length === 0) {
    return false;
  }

  if (actions.length === 0) {
    throw new Error('scopie-106 in action: actions was empty');
  }

  let varMap;
  if (vars) {
    varMap = new Map(Object.entries(vars));
  }

  let hasBeenAllowed = false;

  for (let permissionIndex = 0; permissionIndex < permissions.length; permissionIndex += 1) {
    const permission = permissions[permissionIndex];
    if (permission.length === 0) {
      throw new Error('scopie-106 in permission: permission was empty');
    }

    const isAllowBlock = permission[0] === 'a';
    if (isAllowBlock && hasBeenAllowed) {
      continue;
    }

    for (let actionIndex = 0; actionIndex < actions.length; actionIndex += 1) {
      const action = actions[actionIndex];
      if (action.length === 0) {
        throw new Error('scopie-106 in action: action was empty');
      }

      const match = compareActionToPermission(action, permission, varMap);
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
 * Determines whether or not the actions are valid according to scopie specifications.
 * @param {string[]} actions - action or permissions to check
 * @returns {Error|undefined} If the action are invalid, the validation error is returned,
 * otherwise undefined is returned.
 * @example
 * // returns undefined
 * validateActions(["accounts/thor/edit"])
 */
export function validateActions(actions) {
  if (actions.length === 0) {
    return new Error('scopie-106: action array was empty');
  }

  for (let action of actions) {
    if (action.length === 0) {
      return new Error('scopie-106: action was empty');
    }

    for (let i = 0; i < action.length; i += 1) {
      if (!isValidLiteral(action[i]) && action[i] !== blockSeparator) {
        return new Error(`scopie-100: invalid character '${action[i]}'`);
      }
    }
  }

  return undefined;
}

/**
 * Determines whether or not the permissions are valid according to scopie specifications.
 * @param {string[]} permissions - permissions to check
 * @returns {Error|undefined} If the permissions are invalid, the validation error is returned,
 * otherwise undefined is returned.
 * @example
 * // returns undefined
 * validatePermissions(["grant:accounts/thor/*"])
 */
export function validatePermissions(permissions) {
  if (permissions.length === 0) {
    return new Error('scopie-106: permission array was empty');
  }

  for (let permission of permissions) {
    if (permission.length === 0) {
      return new Error('scopie-106: permission was empty');
    }

    let inArray = false;
    let i = 0;

    try {
      i = skipGrant(permission)
    } catch(e) {
      return e
    }

    for (; i < permission.length; i += 1) {
      if (permission[i] === blockSeparator) {
        inArray = false;
        continue;
      }

      if (permission[i] === arraySeparator) {
        inArray = true;
        continue;
      }

      if (inArray) {
        if (permission[i] === wildcard && i < permission.length - 1 && permission[i + 1] === wildcard) {
          return new Error('scopie-103: super wildcard found in array block');
        }

        if (permission[i] === wildcard) {
          return new Error('scopie-102: wildcard found in array block');
        }

        if (permission[i] === varPrefix) {
          const end = endOfArrayElement(permission, i);
          return new Error(`scopie-101: variable '${permission.substring(i + 1, end)}' found in array block`);
        }
      }

      if (!isValidCharacter(permission[i])) {
        return new Error(`scopie-100: invalid character '${permission[i]}'`);
      }

      if (permission[i] === wildcard && i < permission.length - 1 && permission[i + 1] === wildcard
        && i < permission.length - 2) {
        return new Error('scopie-105: super wildcard not in the last block');
      }
    }
  }

  return undefined;
}
