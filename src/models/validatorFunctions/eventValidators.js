is24hrTime = function (time) {
    if (!time) {
        return true;
    }
    return /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
};

let timeValidators = [
    {
        validator: is24hrTime,
        message: (props) => `${props.value} is not valid 24hr time!`,
    },
];
module.exports = {
    timeValidators,
};
