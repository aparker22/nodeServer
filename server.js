const http = require('http');
const fs = require('fs');
const pg = require('pg-promise')();

const dbconfig = 'postgres://Ashley@localhost/phonebook';
const db = pg(dbconfig);


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
    db.query('SELECT * FROM contacts')
    .then( (results) => {
        response.end(JSON.stringify(results))
    })
    .then ( () => {
        (pg.end);
    });     
};

let postContact = (request, response) => {
    getContactListFromServer(request, (body) => {
        let contact = JSON.parse(body);
        db.query(`INSERT INTO contacts (first, last, number) VALUES ('${contact.first}', '${contact.last}', '${contact.number}');`)
        .then( () => {
            response.end('Entry Added');
            (pg.end)
        })
    }) 
};

let getSingleContact = (request, response) => {
    let urlID = findContactID(request.url);
    
    db.query(`SELECT * FROM contacts WHERE id = '${urlID}';`)
    .then( (contact) => {
        response.end(JSON.stringify(contact))
    })
};

let updateContact = (request, response) => {
    let urlID = findContactID(request.url);
    getContactListFromServer(request, (body) => {
        let contact = JSON.parse(body);
        console.log(contact);
        
        db.query(`UPDATE contacts SET first = '${contact.first}', last = '${contact.last}', number = '${contact.number}' WHERE id = '${urlID}';`)
        .then( () => {
            response.end('Entry Updated');
            (pg.end);
        });
    });
};

let deleteContact = (request, response) => {
    let urlID = findContactID(request.url);
    db.query(`DELETE FROM contacts WHERE id = '${urlID}';`)
    .then( () => {
        response.end('Entry Deleted');
        (pg.end);
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
