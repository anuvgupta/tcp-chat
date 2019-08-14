const id_chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const name_chars = id_chars + "_-";
const util = {
    rand_int: (max) => {
        return Math.floor(Math.random() * Math.floor(max));
    },
    rand_id: (length = 10) => {
        var key = "";
        for (var i = 0; i < length; i++)
            key += id_chars[util.rand_int(id_chars.length)];
        return key;
    },
    lpad: (str, len, char = ' ') => {
        return str.length >= len ? str : ((new Array(len)).join(char) + str).slice(-len);
    },
    validate_name: (name) => {
        for (var n = 0; n < name.length; n++) {
            if (name_chars.indexOf(name[n]) == -1)
                return false;
        }
        return true;
    },
    nice_time: (timestamp) => {
        if (timestamp === undefined)
            timestamp = Date.now();
        var date = new Date(timestamp);
        return `${util.lpad(date.getHours(), 2, '0')}:${util.lpad(date.getMinutes(), 2, '0')}`;
    }
}

module.exports = util;