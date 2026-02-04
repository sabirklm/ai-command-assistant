const express = require('express');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3300;
const os = require('os');


function getLocalIPAddresses() {
    const interfaces = os.networkInterfaces();
    const ipAddresses = [];

    for (const interfaceName in interfaces) {
        for (const iface of interfaces[interfaceName]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                ipAddresses.push(iface.address);
            }
        }
    }

    return ipAddresses;
}


app.use(express.json());

app.get('/', (req, res) => {
    // res.send('Hello, world!');
    res.sendFile(__dirname + "/pages/index.html");
});


app.listen(port, () => {
    const ipAddresses = getLocalIPAddresses();

    console.log(`Server is running on:`);
    console.log(`- http://localhost:${port}`);
    ipAddresses.forEach(ip => {
        console.log(`- http://${ip}:${port}`);
    });
    console.log(`Server running at http://localhost:${port}`);
});
