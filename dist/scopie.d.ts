/**
 * Validate if our user is allowed to perform the action based on their rules and the required scopes.
 * @param {string[]} scopes - Required scopes
 * @param {string[]} rules - What rules our user has
 * @param {object} vars - User variables that are replacable in scopes
 */
export function isAllowed(scopes: string[], rules: string[], vars: object): boolean;
/**
 * Determines whether or not the scopes or rules are valid according to scopie rules.
 * @param {string[]} scopeOrRules - Scope or rules to check
 * @returns {Error|undefined} If the scope is invalid, the validation error is returned,
 * otherwise undefined is returned.
 */
export function validateScopes(scopeOrRules: string[]): Error | undefined;
export const arraySeperator: "|";
export const blockSeperator: "/";
export const wildcard: "*";
export const varPrefix: "@";
export const allowPermission: "allow";
export const denyPermission: "deny";
//# sourceMappingURL=scopie.d.ts.map