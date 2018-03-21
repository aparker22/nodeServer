var http = require ('http')
var contacts = [
    {"first":"Ashley","last":"Parker","Number":"904","id":1},
    {"first":"Ava","last":"Parker","Number":"912","id":2},
    {"first":"Brandon","last":"Parker","Number":"770","id":3},
    {"first":"Calli","last":"Parker","Number":"428","id":4}
]
var contactID = contacts.length + 1;

var getContactListFromServer = function(request, callback) {
    var body = ''
    request.on('data', function(chunk) {
        body += chunk.toString();
    });
    request.on('end', function() {
        callback(body)
})
};

var getContacts = function (request, response) {
    response.end(JSON.stringify(contacts)); 
};

var postContact = function (request, response) {
    getContactListFromServer(request, function(body) {
        var contact = JSON.parse(body);
        contact.id = ++contactID;
        contacts.push(contact);
        response.end('Entry Added');
    });
};

var getSingleContact = function (request, response) {
    var urlID = findContactID(request.url);
    contacts.forEach(function(entry) {
        if (entry.id === urlID) {
            response.end(JSON.stringify(entry));
        }
    })
};

var updateContact = function (request, response) {
    var urlID = findContactID(request.url);
    getContactListFromServer(request, function(body) {
        var updateContact = JSON.parse(body);
        contacts.forEach(function(entry, i) {
            if (entry.id === urlID) {
                contacts.splice(i, 1, updateContact)
                response.end('Entry Updated');
        }
        });
    })
};

var deleteContact = function(request, response) {
    var urlID = findContactID(request.url);
    contacts.forEach(function(entry, i) {
        if (entry.id === urlID) {
            contacts.splice(i, 1)
            response.end('Entry Deleted')
        }
    })
};

var findContactID = function(url) {
    return parseInt(url.split('/contacts/')[1], 10)
}

var findIfPathIncludesID = function(url) {
    var id = findContactID(url);
    var path = '';
    if (id) {
        path = `/contacts/`
    } else {
        path = '/contacts'
    }
    return path;
}

var findRoute = function(method, url) {
    var foundRoute;
    var path = findIfPathIncludesID(url);
    routes.forEach(function(route) {
        if (route.method === method && route.path === path) {
            foundRoute = route;            
        }
    })
    return foundRoute;
}

var routes = [
    { method: 'GET', path: '/contacts/', handler: getSingleContact},   
    { method: 'PUT', path: '/contacts/', handler: updateContact},
    { method: 'DELETE', path:'/contacts/', handler: deleteContact},
    { method: 'GET', path: '/contacts', handler: getContacts},
    { method: 'POST', path: '/contacts', handler: postContact}
]

var server = http.createServer(function(request, response) {
    var route = findRoute(request.method, request.url);
    if (route) {
        route.handler(request, response);
    }else {
        response.end('Unable to communicate')
    }
});

module.exports = server
