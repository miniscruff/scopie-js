/**
 * Validate if our actor is allowed to perform the action based on the required scope.
 * @param {object} vars - User variables that are replacable in scopes
 * @param {string} requiredScopes - Required actor scopes
 * @param {string} actorScopes - What scopes our actor has
 */
export function isAllowed(vars: object, requiredScopes: string, actorScopes: string): boolean;
/**
 * TODO
 * @param {string} scope
 */
export function validateScope(scope: string): Error;
export const scopeSeperator: ",";
export const arraySeperator: "|";
export const blockSeperator: "/";
export const wildcard: "*";
export const varPrefix: "@";
export type CompareFrom = {
    /**
     * - next a index
     */
    a: int;
    /**
     * - next b index
     */
    b: int;
    /**
     * - whether or noti there was a match
     */
    match: bool;
};
//# sourceMappingURL=scopie.d.ts.map