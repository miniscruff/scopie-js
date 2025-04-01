## Constants

<dl>
<dt><a href="#arraySeperator">arraySeperator</a></dt>
<dd><p>arraySeperator is the character between array elements.
See <a href="https://scopie.dev/specification/terms/#block">block term</a> for how blocks are formatted.</p>
</dd>
<dt><a href="#blockSeperator">blockSeperator</a></dt>
<dd><p>blockSeperator is the character between blocks.
See <a href="https://scopie.dev/specification/terms/#block">block term</a> for how blocks are formatted.</p>
</dd>
<dt><a href="#wildcard">wildcard</a></dt>
<dd><p>wildcard is the character that matches any value in a block.
See <a href="https://scopie.dev/specification/terms/#block">block term</a> for how blocks are formatted.</p>
</dd>
<dt><a href="#varPrefix">varPrefix</a></dt>
<dd><p>varPrefix is the character that prefixes variables in blocks.
See <a href="https://scopie.dev/specification/terms/#block">block term</a> for how blocks are formatted.</p>
</dd>
<dt><a href="#allowPermission">allowPermission</a></dt>
<dd><p>allowPermission is the value used to denote an allowed rule.
See <a href="https://scopie.dev/specification/terms/#permisson">permission term</a> for how actions are checked.</p>
</dd>
<dt><a href="#denyPermission">denyPermission</a></dt>
<dd><p>denyPermission is the value used to denote a denied rule.
See <a href="https://scopie.dev/specification/terms/#permisson">permission term</a> for how actions are checked.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#isAllowed">isAllowed(scopes, rules, vars)</a> ⇒</dt>
<dd><p>Is Allowed determines whether or not the scopes are allowed with the given rules.</p>
</dd>
<dt><a href="#validateScopes">validateScopes(scopeOrRules)</a> ⇒ <code>Error</code> | <code>undefined</code></dt>
<dd><p>Determines whether or not the scopes or rules are valid according to scopie rules.</p>
</dd>
</dl>

<a name="arraySeperator"></a>

## arraySeperator
arraySeperator is the character between array elements.
See [block term](https://scopie.dev/specification/terms/#block) for how blocks are formatted.

**Kind**: global constant  
<a name="blockSeperator"></a>

## blockSeperator
blockSeperator is the character between blocks.
See [block term](https://scopie.dev/specification/terms/#block) for how blocks are formatted.

**Kind**: global constant  
<a name="wildcard"></a>

## wildcard
wildcard is the character that matches any value in a block.
See [block term](https://scopie.dev/specification/terms/#block) for how blocks are formatted.

**Kind**: global constant  
<a name="varPrefix"></a>

## varPrefix
varPrefix is the character that prefixes variables in blocks.
See [block term](https://scopie.dev/specification/terms/#block) for how blocks are formatted.

**Kind**: global constant  
<a name="allowPermission"></a>

## allowPermission
allowPermission is the value used to denote an allowed rule.
See [permission term](https://scopie.dev/specification/terms/#permisson) for how actions are checked.

**Kind**: global constant  
<a name="denyPermission"></a>

## denyPermission
denyPermission is the value used to denote a denied rule.
See [permission term](https://scopie.dev/specification/terms/#permisson) for how actions are checked.

**Kind**: global constant  
<a name="isAllowed"></a>

## isAllowed(scopes, rules, vars) ⇒
Is Allowed determines whether or not the scopes are allowed with the given rules.

**Kind**: global function  
**Returns**: boolean - Whether or not the scopes are allowed with the given rules.  
**Throws**:

- Any invalid scope or rule issues, see [scopie errors](https://scopie.dev/specification/errors/) for possible issues.


| Param | Type | Description |
| --- | --- | --- |
| scopes | <code>Array.&lt;string&gt;</code> | Scopes specifies one or more scopes our actor must match. When using more then one scope, they are treated as a series of OR conditions, and an actor will be allowed if they match any of the scopes. |
| rules | <code>Array.&lt;string&gt;</code> | Rules specifies one or more rules our requesting scopes has to have to be allowed access. |
| vars | <code>object</code> | An optional dictionary or map of variable to values. Variable keys should not start with `@` |

**Example**  
```js
// returns true
isAllowed(
  ["accounts/thor/edit"],         // scopes
  ["allow/accounts/@username/*"], // rules
  { "username": "thor" },         // vars
)
```
<a name="validateScopes"></a>

## validateScopes(scopeOrRules) ⇒ <code>Error</code> \| <code>undefined</code>
Determines whether or not the scopes or rules are valid according to scopie rules.

**Kind**: global function  
**Returns**: <code>Error</code> \| <code>undefined</code> - If the scope is invalid, the validation error is returned,
otherwise undefined is returned.  

| Param | Type | Description |
| --- | --- | --- |
| scopeOrRules | <code>Array.&lt;string&gt;</code> | Scope or rules to check |

**Example**  
```js
// returns undefined
validateScopes(["accounts/thor/edit"])
```
