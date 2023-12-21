let invalidEmailAddress = function (email) {
    if (!email) {
        return true;
    }
    return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);
};

let notTooLong = function (username) {
    if (!username) {
        return true;
    }
    return username.length <= 16;
};

let noWhiteSpace = function (username) {
    console.log("running whitespace test");
    console.log("username: " + username + "|");
    console.log("test result" + /\s/g.test(username));
    return !/\s/g.test(username);
};

var usernameValidators = [
    {
        validator: notTooLong,
        message: `Usernames can be a max of 16 characters`,
    },
    {
        validator: noWhiteSpace,
        message: `Usernames cannot contain whitespace`,
    },
];

var emailValidators = [
    {
        validator: invalidEmailAddress,
        message: (props) => `${props.value} is not a valid email address`,
    },
    {
        validator: noWhiteSpace,
        message: `Emails cannot contain whitespace`,
    },
];

module.exports = {
    invalidEmailAddress,
    notTooLong,
    noWhiteSpace,
    usernameValidators,
    emailValidators,
};
