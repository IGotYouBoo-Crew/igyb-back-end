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
- "test"
    - NODE_ENV=test jest --runInBand --detectOpenHandles
    - Runs tests in test suite in order, flags any open connections at the end
       - runs in test environment
- "seed-and-test"
    - NODE_ENV=test node src/seed.js && jest --runInBand
    - In test environment, seeds db with seed data, and then runs tests in order
- "reseed-and-test"
    - NODE_ENV=test WIPE=true node src/seed.js && jest --runInBand
    - Wipes test database and reseeds it with fresh data, then runs tests in test environment
- "seed-prod" 
    - NODE_ENV=production node src/seed.js
    - Seeds prod db
- "start"
    - NODE_ENV=production node src/index.js
    - Runs backend in prod environment

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
    - POST "/newUser"
        - Request body:
            - JSON of user details according to User model (TBD)
            - JWT
        - expected result:
        `{ data: { userObject }, JWT: jwt }`
    - POST "/signIn"
        - request body:
            - `{ username: "username", password: "password" }`
            - Username has to exist in DB
            - Password must match stored password for the user
        - Expected response:
            - a cookie :cookie: containing JWT
            - `{ done: jwt }`
    - GET "/" 
        - expected result:
        `{ data: [list of all users] }`
    - GET "/:username" 
        - expected result:
        `{ data: user with username: ':username' }`
    - PATCH "/:userId"
        - Protections:
            - only signed in user who owns account, or user with Admin role can access
        - Request body: 
            - `{ attributeToBeUpdated: newValue, attr2: newValue2 }`
        - expected response:
            `{ message: updatedUserObject }`
    - DELETE "/:userId"
        - expected response: 
        `{ message: "deleted user: ${username}" }`
    - POST "/someOtherProtectedRoute"
        - protections:
            - user must be signed in with valid cookie
        - expected response:
            - error if not signed in
             ```js
            {
                refreshedJWT: jwt,
                userRole: userRole._id,
                userId: user._id
            }
            ```
- "/posts"
    - GET "/" 
        - expected result:
        `{ data: [list of all posts] }`
    - GET "/:postId" 
        - expected result:
        `{ data: post with _id: 'postId' }`
    - POST "/newPost"
        - Request body:
            - JSON of post details according to Post model (TBD)
        - expected result:
        `{ data: { postObject } }`
    - PATCH "/:postId"
        - Request body: 
            - `{ attributeToBeUpdated: newValue, attr2: newValue2 }`
        - expected response:
            `{ message: updatedPostObject }`
    - DELETE "/:postId"
        - expected response: 
        `{ message: "deleted post: ${post.title}" }`
- "/events"
    - GET "/" 
        - expected result:
        `{ data: [list of all events] }`
    - GET "/:eventId" 
        - expected result:
        `{ data: event with _id_: 'eventId' }`
    - POST "/newUser"
        - Request body:
            - JSON of event details according to User model (TBD)
        - expected result:
        `{ data: { eventObject } }`
    - PATCH "/:eventId"
        - Request body: 
            - `{ attributeToBeUpdated: newValue, attr2: newValue2 }`
        - expected response:
            `{ message: updatedUserObject }`
    - DELETE "/:eventId"
        - expected response: 
        `{ message: "deleted event: ${event.title}" }`