is24hrTime = function (time) {
    if (!time) {
        return true;
    }
    return /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
};

/**
 * List of validator functions and their fail-case response strings
 * @date 22/12/2023 - 02:15:56
 *
 * @type {[{validator:function, message:string}]} List of Objects
 */
let timeValidators = [
    {
        validator: is24hrTime,
        message: (props) => `${props.value} is not valid 24hr time!`,
    },
];
module.exports = {
    timeValidators,
};
