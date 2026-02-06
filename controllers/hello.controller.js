exports.sayHello = (req, res) => {
    res.send("Hello world");
};

exports.sayOk = (req, res) => {
    res.send(`Ok ${Date()}`);
};