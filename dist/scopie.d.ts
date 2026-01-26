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
 *   ["allow:accounts/@username/*"], // permissions
 *   { "username": "thor" },         // vars
 * )
 */
export function isAllowed(actions: string[], permissions: string[], vars: object): boolean;
/**
 * Determines whether or not the actions are valid according to scopie specifications.
 * @param {string[]} actions - action or permissions to check
 * @returns {Error|undefined} If the action are invalid, the validation error is returned,
 * otherwise undefined is returned.
 * @example
 * // returns undefined
 * validateActions(["accounts/thor/edit"])
 */
export function validateActions(actions: string[]): Error | undefined;
/**
 * Determines whether or not the permissions are valid according to scopie specifications.
 * @param {string[]} permissions - permissions to check
 * @returns {Error|undefined} If the permissions are invalid, the validation error is returned,
 * otherwise undefined is returned.
 * @example
 * // returns undefined
 * validatePermissions(["grant:accounts/thor/*"])
 */
export function validatePermissions(permissions: string[]): Error | undefined;
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
export const arraySeparator: "|";
/** blockSeparator is the character between blocks.
 * See {@link https://scopie.dev/specification/terms/#block block term} for how blocks are formatted.
 */
export const blockSeparator: "/";
/** wildcard is the character that matches any value in a block.
 * See {@link https://scopie.dev/specification/terms/#block block term} for how blocks are formatted.
 */
export const wildcard: "*";
/** varPrefix is the character that prefixes variables in blocks.
 * See {@link https://scopie.dev/specification/terms/#block block term} for how blocks are formatted.
 */
export const varPrefix: "@";
/** allowGrant is the value used to denote an allowed permission.
 * See {@link https://scopie.dev/specification/terms/#grant permission term} for how actions are checked.
 */
export const allowGrant: "allow";
/** denyGrant is the value used to denote a denied permission.
 * See {@link https://scopie.dev/specification/terms/#grant permission term} for how actions are checked.
 */
export const denyGrant: "deny";
//# sourceMappingURL=scopie.d.ts.map