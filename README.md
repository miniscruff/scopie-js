# Scopie

[![NPM Version](https://img.shields.io/npm/v/scopie.svg?style=for-the-badge&logoColor=white)](https://www.npmjs.com/package/scopie)
[![NPM Downloads](https://img.shields.io/npm/dw/scopie?style=for-the-badge&logoColor=white)](https://www.npmjs.com/package/scopie)

Javascript implementation of [scopie](https://github.com/miniscruff/scopie).

Generated documentation can be viewed at [DOCS.md](./DOCS.md).

## Example

```js
import { isAllowed } from "scopie";

const users = {
    elsa: {
        permissions: ["allow:blog/create|update"],
    },
    bella: {
        permissions: ["allow:blog/create"],
    },
]
const blogPosts = {}

function createBlog(username, blogSlug, blogContent) {
    const user = users[username]
    if (isAllowed(["blog/create"], user.permissions)) {
        blogPosts[blogSlug] = {
            author: user,
            content: blogContent,
        }
    }
}

function updateBlog(username, blogSlug, blogContent) {
    const user = users[username]
    if (isAllowed(["blog/update"], user.permissions)) {
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
    permissions: Array<string>;
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
        permissions: ["allow:blog/create|update"],
    },
    bella: {
        permissions: ["allow:blog/create"],
    },
}

const blogPosts: BlogStore = {}

function createBlog(username: string, blogSlug: string, blogContent: string) {
    const user = users[username]
    if (isAllowed(["blog/create"], user.permissions)) {
        blogPosts[blogSlug] = {
            author: user,
            content: blogContent,
        }
    }
}

function updateBlog(username: string, blogSlug: string, blogContent: string) {
    const user = users[username]
    if (isAllowed(["blog/update"], user.permissions)) {
        blogPosts[blogSlug] = {
            author: user,
            content: blogContent,
        }
    }
}
```
