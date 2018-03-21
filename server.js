let http = require ('http')

let contacts = [
    {"first":"Ashley","last":"Parker","Number":"904","id":1},
    {"first":"Ava","last":"Parker","Number":"912","id":2},
    {"first":"Brandon","last":"Parker","Number":"770","id":3},
    {"first":"Calli","last":"Parker","Number":"428","id":4}
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
    });
};

let getSingleContact = (request, response) => {
    let urlID = findContactID(request.url);
    contacts.forEach((entry) => {
        if (entry.id === urlID) {
            response.end(JSON.stringify(entry));
        } else {
            response.end('Unable to find entry');
        };
    });
};

let updateContact = (request, response) => {
    let urlID = findContactID(request.url);
    getContactListFromServer(request, (body) => {
        let updateContact = JSON.parse(body);
        contacts.forEach((entry, i) => {
            if (entry.id === urlID) {
                contacts.splice(i, 1, updateContact);
                response.end('Entry Updated');
            } else {
                response.end('Unable to find entry');
            };
        });
    });
};

let deleteContact = (request, response) => {
    let urlID = findContactID(request.url);
    contacts.forEach((entry, i) => {
        if (entry.id === urlID) {
            contacts.splice(i, 1)
            response.end('Entry Deleted');
        } else {
            response.end('Unable to find entry');
        };
    });
};

let findContactID = (url) => {
    return parseInt(url.split('/contacts/')[1], 10);
}



let findIfPathIncludesID = (url) => {
    let id = findContactID(url);
    let path = '';
    if (id) {
        path = `/contacts/`;
    } else {
        path = '/contacts';
    };
    return path;
};

let findPathIsValid = (url) => {
    if (url.includes('/contacts')) {
        var path = findIfPathIncludesID(url);
    } else {
        var path = url;
    };
    return path;  
};

let findRoute = (method, url) => {
    let foundRoute;
    let path = findPathIsValid(url);
    routes.forEach((route) => {
        if (route.method === method && route.path === path) {
            foundRoute = route;            
        };
    });
    return foundRoute;
};

let routes = [
    { method: 'GET', path: '/contacts/', handler: getSingleContact},   
    { method: 'PUT', path: '/contacts/', handler: updateContact},
    { method: 'DELETE', path:'/contacts/', handler: deleteContact},
    { method: 'GET', path: '/contacts', handler: getContacts},
    { method: 'POST', path: '/contacts', handler: postContact}
];

let server = http.createServer( (request, response) => {
    let route = findRoute(request.method, request.url);
    if (route) {
        route.handler(request, response);
    } else {
        response.statusCode = 404;
        response.end('Unable to communicate');
    };
});

module.exports = server;
