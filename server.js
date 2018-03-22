let http = require('http');
let fs = require('fs');

let contacts = [
    {"first":"Ashley","last":"Parker","number":"123-456-7890","id":1},
    {"first":"Ava","last":"Parker","number":"123-456-7890","id":2},
    {"first":"Brandon","last":"Parker","number":"123-456-7890","id":3},
    {"first":"Calli","last":"Parker","number":"123-456-7890","id":4}
];

let contactID = contacts.length;

let getContactListFromServer = (request, callback) => {
    let body = ''
    request.on('data', (chunk) => {
        body += chunk.toString();
    });
    request.on('end', () => {
        callback(body);
    });
};

let getContacts = (request, response) => {
    response.end(JSON.stringify(contacts)); 
};

let postContact = (request, response) => {
    getContactListFromServer(request, (body) => {
        let contact = JSON.parse(body);
        contact.id = ++contactID;
        contacts.push(contact);
        response.end('Entry Added');
        return contact;
    });
};

let getSingleContact = (request, response) => {
    let urlID = findContactID(request.url);
    let match;
    contacts.forEach((entry) => {
        if (entry.id === urlID) {
            match = JSON.stringify(entry);  
        } 
    });
    if (match) {
        response.end(JSON.stringify(match));
    } else {
        routeNotFound(request, response);
    }
};

let updateContact = (request, response) => {
    let urlID = findContactID(request.url);
    getContactListFromServer(request, (body) => {
        let updateContact = JSON.parse(body);
        updateContact.id = ++contactID;
        contacts.forEach((entry, i) => {
            if (entry.id === urlID) {
                contacts.splice(i, 1, updateContact);
                return response.end('Entry Updated');
            } 
        });
    });
};

let deleteContact = (request, response) => {
    let urlID = findContactID(request.url);
    contacts.forEach((entry, i) => {
        if (entry.id === urlID) {
            contacts.splice(i, 1)
            return response.end('Entry Deleted');
        } 
    });
};

let serveIndex = (request, response) => {
    if (request.url === '/') {
        fs.readFile(`static/index.html`, (err, data) => {
            if (err) {
                response.end('404, File Not Found')
            } else {
                response.end(data);
            }
        })
    };
};

let serveFile = (request, response) => {
    fs.readFile(`static/${request.url}`, (err, data) => {
        if (err) {
            response.end('404, File Not Found')
        } else {
            response.end(data);
        }
    })
};

let findContactID = (url) => {
    var id = (routes[0].path).exec(url)[1];
    return parseInt(id, 10)
}

let findRoute = (method, url) => {
    var foundRoute;
    routes.forEach((route) => {
        if (route.method === method) {
            if (route.path.exec(url)) {
                foundRoute = route;
            }
        }
    })        
    return foundRoute;
};

let routeNotFound = (request, response) => {
    response.statusCode = 404;
    response.end('Unable to communicate');
}

let routes = [
    { method: 'GET', path: /^\/contacts\/([0-9]+)\/?/, handler: getSingleContact},   
    { method: 'PUT', path: /^\/contacts\/([0-9]+)\/?/, handler: updateContact},
    { method: 'DELETE', path: /^\/contacts\/([0-9]+)\/?/, handler: deleteContact},
    { method: 'GET', path: /^\/contacts\/?$/, handler: getContacts},
    { method: 'POST', path: /^\/contacts\/?$/, handler: postContact},
    { method: 'GET', path: /^\/$/, handler: serveIndex },
    { method: 'GET', path: /^\/[0-9a-zA-Z -.]+\.[0-9a-zA-Z -.]+/, handler: serveFile }
];

let server = http.createServer( (request, response) => {
    let route = findRoute(request.method, request.url);
    if (route) {
        route.handler(request, response);
    } else {
        routeNotFound(request, response);
    };
});

module.exports = server;
