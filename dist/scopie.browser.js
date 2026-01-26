export const arraySeparator = "|";
export const blockSeparator = "/";
export const wildcard = "*";
export const varPrefix = "@";
export const allowGrant = "allow";
export const denyGrant = "deny";
function isValidLiteral(char) {
  if (char >= "a" && char <= "z") {
    return true;
  }
  if (char >= "A" && char <= "Z") {
    return true;
  }
  if (char >= "0" && char <= "9") {
    return true;
  }
  return char === "_" || char === "-";
}
function isValidCharacter(char) {
  return isValidLiteral(char) || char === varPrefix || char === wildcard;
}
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
    return 5;
  }
  if (value.startsWith(allowGrant)) {
    return 6;
  }
  throw new Error("scopie-107: permission does not start with a grant");
}
function endOfBlock(category, value, start) {
  for (let i = start; i < value.length; i += 1) {
    if (value[i] === blockSeparator) {
      return i;
    }
    if (value[i] === arraySeparator) {
      continue;
    } else if (!isValidCharacter(value[i])) {
      throw new Error(`scopie-100 in ${category}: invalid character '${value[i]}'`);
    }
  }
  return value.length;
}
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
    for (; permissionLeft < permissionSlider; ) {
      const arrayRight = endOfArrayElement(permission, permissionLeft);
      if (permission[permissionLeft] === varPrefix) {
        throw new Error(`scopie-101: variable '${permission.substring(permissionLeft + 1, arrayRight)}' found in array block`);
      }
      if (permission[permissionLeft] === wildcard) {
        if (arrayRight - permissionLeft > 1 && permission[permissionLeft + 1] === wildcard) {
          throw new Error("scopie-103: super wildcard found in array block");
        }
        throw new Error("scopie-102: wildcard found in array block");
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
function compareActionToPermission(action, permission, vars) {
  let permissionLeft = skipGrant(permission);
  let actionLeft = 0;
  let permissionSlider = 0;
  let actionSlider = 0;
  for (; permissionLeft < permission.length || actionLeft < action.length; ) {
    if (permissionLeft < permission.length !== actionLeft < action.length) {
      return false;
    }
    actionSlider = endOfBlock("action", action, actionLeft);
    permissionSlider = endOfBlock("permission", permission, permissionLeft);
    if (permissionSlider - permissionLeft === 2 && permission[permissionLeft] === wildcard && permission[permissionLeft + 1] === wildcard) {
      if (permission.length > permissionSlider) {
        throw new Error("scopie-105: super wildcard not in the last block");
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
      vars
    )) {
      return false;
    }
    actionLeft = actionSlider + 1;
    permissionLeft = permissionSlider + 1;
  }
  return true;
}
export function isAllowed(actions, permissions, vars) {
  if (permissions.length === 0) {
    return false;
  }
  if (actions.length === 0) {
    throw new Error("scopie-106 in action: actions was empty");
  }
  let varMap;
  if (vars) {
    varMap = new Map(Object.entries(vars));
  }
  let hasBeenAllowed = false;
  for (let permissionIndex = 0; permissionIndex < permissions.length; permissionIndex += 1) {
    const permission = permissions[permissionIndex];
    if (permission.length === 0) {
      throw new Error("scopie-106 in permission: permission was empty");
    }
    const isAllowBlock = permission[0] === "a";
    if (isAllowBlock && hasBeenAllowed) {
      continue;
    }
    for (let actionIndex = 0; actionIndex < actions.length; actionIndex += 1) {
      const action = actions[actionIndex];
      if (action.length === 0) {
        throw new Error("scopie-106 in action: action was empty");
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
export function validateActions(actions) {
  if (actions.length === 0) {
    return new Error("scopie-106: action array was empty");
  }
  for (let action of actions) {
    if (action.length === 0) {
      return new Error("scopie-106: action was empty");
    }
    for (let i = 0; i < action.length; i += 1) {
      if (!isValidLiteral(action[i]) && action[i] !== blockSeparator) {
        return new Error(`scopie-100: invalid character '${action[i]}'`);
      }
    }
  }
  return void 0;
}
export function validatePermissions(permissions) {
  if (permissions.length === 0) {
    return new Error("scopie-106: permission array was empty");
  }
  for (let permission of permissions) {
    if (permission.length === 0) {
      return new Error("scopie-106: permission was empty");
    }
    let inArray = false;
    let i = 0;
    try {
      i = skipGrant(permission);
    } catch (e) {
      return e;
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
          return new Error("scopie-103: super wildcard found in array block");
        }
        if (permission[i] === wildcard) {
          return new Error("scopie-102: wildcard found in array block");
        }
        if (permission[i] === varPrefix) {
          const end = endOfArrayElement(permission, i);
          return new Error(`scopie-101: variable '${permission.substring(i + 1, end)}' found in array block`);
        }
      }
      if (!isValidCharacter(permission[i])) {
        return new Error(`scopie-100: invalid character '${permission[i]}'`);
      }
      if (permission[i] === wildcard && i < permission.length - 1 && permission[i + 1] === wildcard && i < permission.length - 2) {
        return new Error("scopie-105: super wildcard not in the last block");
      }
    }
  }
  return void 0;
}
//# sourceMappingURL=scopie.browser.js.map
