const histogram = (data, key, transform) => {
    res = [];
    temp = {};

    data.forEach((obj) => {
        const transformed = transform(obj[key]);

        if (transformed in temp) {
            temp[transformed] += 1;
        }
        else {
            temp[transformed] = 1;
        }
    });

    Object.keys(temp).forEach((key) => {
        res.push({
            key: key,
            count: temp.key,
        });
    })

    return res;
}
