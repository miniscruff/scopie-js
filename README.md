# Scopie

[![NPM Version](https://img.shields.io/npm/v/scopie.svg)](https://www.npmjs.com/package/scopie)
[![NPM Downloads](https://img.shields.io/npm/dw/scopie)](https://www.npmjs.com/package/scopie)

Javascript implementation of [scopie](https://github.com/miniscruff/scopie).

## Example

```js
import { isAllowed } from "scopie";

const users = {
    elsa: {
        rules: ["allow/blog/create|update"],
    },
    bella: {
        rules: ["allow/blog/create"],
    },
]
const blogPosts = {}

function createBlog(username, blogSlug, blogContent) {
    const user = users[username]
    if (isAllowed(["blog/create"], user.rules)) {
        blogPosts[blogSlug] = {
            author: user,
            content: blogContent,
        }
    }
}

function updateBlog(username, blogSlug, blogContent) {
    const user = users[username]
    if (isAllowed(["blog/update"], user.rules)) {
        blogPosts[blogSlug] = {
            author: user,
            content: blogContent,
        }
    }
}
```

```typescript
import { isAllowed } from "scopie";

type User = {
    rules: Array<string>;
};

type BlogPost = {
    author: User;
    content: string;
}

type UserStore = {
    [key: string]: User
}

type BlogStore = {
    [key: string]: BlogPost
}

const users: UserStore = {
    elsa: {
        rules: ["allow/blog/create|update"],
    },
    bella: {
        rules: ["allow/blog/create"],
    },
}

const blogPosts: BlogStore = {}

function createBlog(username: string, blogSlug: string, blogContent: string) {
    const user = users[username]
    if (isAllowed(["blog/create"], user.rules)) {
        blogPosts[blogSlug] = {
            author: user,
            content: blogContent,
        }
    }
}

function updateBlog(username: string, blogSlug: string, blogContent: string) {
    const user = users[username]
    if (isAllowed(["blog/update"], user.rules)) {
        blogPosts[blogSlug] = {
            author: user,
            content: blogContent,
        }
    }
}
```
