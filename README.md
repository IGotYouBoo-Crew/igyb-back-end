# I Got You Boo - Backend
This is the backend for I Got You Boo, a collaborative work for T3A2-B

Currently, this is a skeleton of the eventual backend.

## .env requirements:
.env file is required for this to run correctly. An example .env file is included with the required values replaced with placeholders.

## Available scripts:
- "start-dev"
    - NODE_ENV:development nodemon src/index.js
    - starts API through nodemon in development mode
- "dev-clean-seed"
    - NODE_ENV=development WIPE=true node src/seed.js
    - Wipes development database and reseeds it with fresh data

## Available endpoints:
- "/"
    - expected response: "Hello World!"
- "/databasehealth"
    - expected response: 
    ```js
    {
        readyState: databaseState,
        dbName: databaseName,
        dbModels: databaseModels,
        dbHost: databaseHost,
    }
    ```
- "/roles"
    - "/"
        - expected result: 
        `{ data: [list of all roles] }`
    - "/:roleName"
        - expected result:
        `{ data: [list of users with :roleName role] }`
- "/account"
    - "/" 
        - expected result:
        `{ data: [list of all users] }`
    - "/:username" 
        - expected result:
        `{ data: user with username: ':username' }`
- "/posts"
    - "/" 
        - expected result:
        `{ data: [list of all posts] }`
    - "/:postId" 
        - expected result:
        `{ data: post with id: ':postId' }`
- "/events"
    - "/" 
        - expected result:
        `{ data: [list of all events] }`
    - "/:postId" 
        - expected result:
        `{ data: post with id: ':eventId' }`