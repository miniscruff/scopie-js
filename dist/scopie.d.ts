/**
 * Validate if our actor is allowed to perform the action based on the required scope.
 * @param {string[]} actionScopes - Required actor scopes
 * @param {string[]} actorRules - What scopes our actor has
 * @param {object} vars - User variables that are replacable in scopes
 */
export function isAllowed(actionScopes: string[], actorRules: string[], vars: object): boolean;
/**
 * Determines whether or not the scope is valid according to scopie rules.
 * @param {string} scope - Scope to check
 * @returns {Error|undefined} If the scope is invalid, the validation error is returned,
 * otherwise undefined is returned.
 */
export function validateScope(scope: string): Error | undefined;
export const arraySeperator: "|";
export const blockSeperator: "/";
export const wildcard: "*";
export const varPrefix: "@";
//# sourceMappingURL=scopie.d.ts.map