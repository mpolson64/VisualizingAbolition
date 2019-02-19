const histogram = (data, key) => {
    res = {};

    data.forEach((obj) => {
        if (obj[key] in res) {
            res[obj[key]] += 1;
        }
        else {
            res[obj[key]] = 1;
        }
    });

    return res;
}
