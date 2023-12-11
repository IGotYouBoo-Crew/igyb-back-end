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
    - jest --runInBand --forceExit
    - Runs tests in test suite in order, then ends jest when completed
        - --forceExit avoids "open handle" error which is caused by supertest sometimes. It isn't actually an error, just a weird interaction between the jest and supertest when using async/await
- "reseed-and-test"
    - NODE_ENV=test WIPE=true node src/seed.js && jest --runInBand --forceExit
    - Wipes test database and reseeds it with fresh data, then runs tests in test suite

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
    - GET "/" 
        - expected result:
        `{ data: [list of all users] }`
    - GET "/:username" 
        - expected result:
        `{ data: user with username: ':username' }`
    - POST "/newUser"
        - Request body:
            - JSON of user details according to User model (TBD)
        - expected result:
        `{ data: { userObject } }`
    - PATCH "/:userId"
        - Request body: 
            - `{ attributeToBeUpdated: newValue, attr2: newValue2 }`
        - expected response:
            `{ message: updatedUserObject }`
    - DELETE "/:userId"
        - expected response: 
        `{ message: "deleted user: ${username}" }`
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