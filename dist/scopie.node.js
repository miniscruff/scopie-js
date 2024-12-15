var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/scopie.js
var scopie_exports = {};
__export(scopie_exports, {
  allowPermission: () => allowPermission,
  arraySeperator: () => arraySeperator,
  blockSeperator: () => blockSeperator,
  denyPermission: () => denyPermission,
  isAllowed: () => isAllowed,
  validateScopes: () => validateScopes,
  varPrefix: () => varPrefix,
  wildcard: () => wildcard
});
module.exports = __toCommonJS(scopie_exports);
var arraySeperator = "|";
var blockSeperator = "/";
var wildcard = "*";
var varPrefix = "@";
var allowPermission = "allow";
var denyPermission = "deny";
function isValidCharacter(char) {
  if (char >= "a" && char <= "z") {
    return true;
  }
  if (char >= "A" && char <= "Z") {
    return true;
  }
  if (char >= "0" && char <= "9") {
    return true;
  }
  return char === "_" || char === "-" || char === varPrefix || char === wildcard;
}
function endOfArrayElement(value, start) {
  for (let i = start + 1; i < value.length; i += 1) {
    if (value[i] === blockSeperator || value[i] === arraySeperator) {
      return i;
    }
  }
  return value.length;
}
function endOfBlock(category, value, start) {
  for (let i = start; i < value.length; i += 1) {
    if (value[i] === blockSeperator) {
      return i;
    }
    if (value[i] === arraySeperator) {
      continue;
    } else if (!isValidCharacter(value[i])) {
      throw new Error(`scopie-100 in ${category}: invalid character '${value[i]}'`);
    }
  }
  return value.length;
}
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
    for (; actorLeft < aSlider; ) {
      const arrayRight = endOfArrayElement(aValue, actorLeft);
      if (aValue[actorLeft] === varPrefix) {
        throw new Error(`scopie-101: variable '${aValue.substring(actorLeft + 1, arrayRight)}' found in array block`);
      }
      if (aValue[actorLeft] === wildcard) {
        if (arrayRight - actorLeft > 1 && aValue[actorLeft + 1] === wildcard) {
          throw new Error("scopie-103: super wildcard found in array block");
        }
        throw new Error("scopie-102: wildcard found in array block");
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
function compareActorToAction(actor, action, vars) {
  let actorLeft = endOfBlock("actor", actor, 0) + 1;
  let actionLeft = 0;
  let actionSlider = 0;
  let actorSlider = 0;
  for (; actorLeft < actor.length || actionLeft < action.length; ) {
    if (actorLeft < actor.length !== actionLeft < action.length) {
      return false;
    }
    actionSlider = endOfBlock("action", action, actionLeft);
    actorSlider = endOfBlock("actor", actor, actorLeft);
    if (actorSlider - actorLeft === 2 && actor[actorLeft] === wildcard && actor[actorLeft + 1] === wildcard) {
      if (actor.length > actorSlider) {
        throw new Error("scopie-105: super wildcard not in the last block");
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
      vars
    )) {
      return false;
    }
    actionLeft = actionSlider + 1;
    actorLeft = actorSlider + 1;
  }
  return true;
}
function isAllowed(actionScopes, actorRules, vars) {
  if (actorRules.length === 0) {
    return false;
  }
  if (actionScopes.length === 0) {
    throw new Error("scopie-106 in action: scopes was empty");
  }
  let varMap;
  if (vars) {
    varMap = new Map(Object.entries(vars));
  }
  let hasBeenAllowed = false;
  for (let ruleIndex = 0; ruleIndex < actorRules.length; ruleIndex += 1) {
    const actorRule = actorRules[ruleIndex];
    if (actorRule.length === 0) {
      throw new Error("scopie-106 in actor: rule was empty");
    }
    const isAllowBlock = actorRule[0] === "a";
    if (isAllowBlock && hasBeenAllowed) {
      continue;
    }
    for (let actionIndex = 0; actionIndex < actionScopes.length; actionIndex += 1) {
      const actionScope = actionScopes[actionIndex];
      if (actionScope.length === 0) {
        throw new Error("scopie-106 in action: scope was empty");
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
function validateScopes(scopeOrRules) {
  if (scopeOrRules.length === 0) {
    return new Error("scopie-106: scopes are empty");
  }
  const isRules = scopeOrRules[0].startsWith(allowPermission) || scopeOrRules[0].startsWith(denyPermission);
  for (let scope of scopeOrRules) {
    if (scope.length === 0) {
      return new Error("scopie-106: scope or rule was empty");
    }
    const isScopeRules = scope.startsWith(allowPermission) || scope.startsWith(denyPermission);
    if (isRules != isScopeRules) {
      return new Error("scopie-107: inconsistent array of scopes and rules");
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
          return new Error("scopie-103: super wildcard found in array block");
        }
        if (scope[i] === wildcard) {
          return new Error("scopie-102: wildcard found in array block");
        }
        if (scope[i] === varPrefix) {
          const end = endOfArrayElement(scope, i);
          return new Error(`scopie-101: variable '${scope.substring(i + 1, end)}' found in array block`);
        }
      }
      if (!isValidCharacter(scope[i])) {
        return new Error(`scopie-100: invalid character '${scope[i]}'`);
      }
      if (scope[i] === wildcard && i < scope.length - 1 && scope[i + 1] === wildcard && i < scope.length - 2) {
        return new Error("scopie-105: super wildcard not in the last block");
      }
    }
  }
  return void 0;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  allowPermission,
  arraySeperator,
  blockSeperator,
  denyPermission,
  isAllowed,
  validateScopes,
  varPrefix,
  wildcard
});
