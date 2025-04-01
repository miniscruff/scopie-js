## Functions

<dl>
<dt><a href="#isValidCharacter">isValidCharacter(char)</a> ⇒ <code>boolean</code></dt>
<dd><p>Checks character validity</p>
</dd>
<dt><a href="#endOfArrayElement">endOfArrayElement(value, start)</a> ⇒ <code>number</code></dt>
<dd><p>Calculates the end of an array element</p>
</dd>
<dt><a href="#endOfBlock">endOfBlock(category, value, start)</a> ⇒ <code>number</code></dt>
<dd><p>Calculates the end of a scope block</p>
</dd>
<dt><a href="#compareBlock">compareBlock(rule, ruleLeft, ruleSlider, scope, scopeLeft, scopeSlider, vars)</a> ⇒ <code>boolean</code></dt>
<dd><p>Compares two strings with respect to variables and wildcards.</p>
</dd>
<dt><a href="#compareScopeToRule">compareScopeToRule(scope, rule, vars)</a> ⇒ <code>boolean</code></dt>
<dd><p>Determines if an rule matches a scope</p>
</dd>
<dt><a href="#isAllowed">isAllowed(scopes, rules, vars)</a></dt>
<dd><p>Validate if our user is allowed to perform the action based on their rules and the required scopes.</p>
</dd>
<dt><a href="#validateScopes">validateScopes(scopeOrRules)</a> ⇒ <code>Error</code> | <code>undefined</code></dt>
<dd><p>Determines whether or not the scopes or rules are valid according to scopie rules.</p>
</dd>
</dl>

<a name="isValidCharacter"></a>

## isValidCharacter(char) ⇒ <code>boolean</code>
Checks character validity

**Kind**: global function
**Returns**: <code>boolean</code> - whether or not the character is valid within a scope.

| Param | Type | Description |
| --- | --- | --- |
| char | <code>character</code> | Single character to check |

<a name="endOfArrayElement"></a>

## endOfArrayElement(value, start) ⇒ <code>number</code>
Calculates the end of an array element

**Kind**: global function
**Returns**: <code>number</code> - index at the end of the array element

| Param | Type | Description |
| --- | --- | --- |
| value | <code>string</code> | Value of our scope we are traversing |
| start | <code>number</code> | Index to start searching from |

<a name="endOfBlock"></a>

## endOfBlock(category, value, start) ⇒ <code>number</code>
Calculates the end of a scope block

**Kind**: global function
**Returns**: <code>number</code> - index at the end of the scope block

| Param | Type | Description |
| --- | --- | --- |
| category | <code>string</code> | Value to use when returning an error for our category |
| value | <code>string</code> | Value of our scope we are traversing |
| start | <code>number</code> | Index to start searching from |

<a name="compareBlock"></a>

## compareBlock(rule, ruleLeft, ruleSlider, scope, scopeLeft, scopeSlider, vars) ⇒ <code>boolean</code>
Compares two strings with respect to variables and wildcards.

**Kind**: global function
**Returns**: <code>boolean</code> - Whether or not our rule block matches the scope block

| Param | Type |
| --- | --- |
| rule | <code>string</code> |
| ruleLeft | <code>int</code> |
| ruleSlider | <code>int</code> |
| scope | <code>string</code> |
| scopeLeft | <code>int</code> |
| scopeSlider | <code>int</code> |
| vars | <code>Map.&lt;string, string&gt;</code> |

<a name="compareScopeToRule"></a>

## compareScopeToRule(scope, rule, vars) ⇒ <code>boolean</code>
Determines if an rule matches a scope

**Kind**: global function
**Returns**: <code>boolean</code> - Whether or not the scope matches the rule

| Param | Type | Description |
| --- | --- | --- |
| scope | <code>string</code> |  |
| rule | <code>string</code> |  |
| vars | <code>Map.&lt;string, string&gt;</code> | Variables for translations |

<a name="isAllowed"></a>

## isAllowed(scopes, rules, vars)
Validate if our user is allowed to perform the action based on their rules and the required scopes.

**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| scopes | <code>Array.&lt;string&gt;</code> | Required scopes |
| rules | <code>Array.&lt;string&gt;</code> | What rules our user has |
| vars | <code>object</code> | User variables that are replacable in scopes |

<a name="validateScopes"></a>

## validateScopes(scopeOrRules) ⇒ <code>Error</code> \| <code>undefined</code>
Determines whether or not the scopes or rules are valid according to scopie rules.

**Kind**: global function
**Returns**: <code>Error</code> \| <code>undefined</code> - If the scope is invalid, the validation error is returned,
otherwise undefined is returned.

| Param | Type | Description |
| --- | --- | --- |
| scopeOrRules | <code>Array.&lt;string&gt;</code> | Scope or rules to check |

