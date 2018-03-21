var fs = require('fs');
var request = require('request')
var promisify = require('util').promisify;
var readline = require('readline')
var http = require('http')
var url = 'http://localhost:3000/contacts'



var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var rlQuestion = function(question) {
    return new Promise(function(resolve) {
        rl.question(question, resolve);
    });
};

var readFile = promisify(fs.readFile);
var writeFile = promisify(fs.writeFile)
var appendFile = promisify(fs.appendFile)

var lookUpAnEntry = function() {
    var rawData = '';
    rlQuestion('Name: ')
    .then(function(name) {
        http.get(url, function(res) {
            res.setEncoding('utf8');
            res.on('data', function(chunk) {
                rawData += chunk;
            });
            res.on('end', function() {
                var contact = JSON.parse(rawData);
                contact.forEach(function(entry) {
                    if (entry.first === name) {
                        console.log(entry);
                        initiatePhonebook();
                    }
                })
            })        
        })    
    })
};

var addNewEntry = function() {
    var entry = '\n';
    rlQuestion('First Name: ')
    .then(function(firstName) {
        entry += `${firstName}`
        return rlQuestion('Last Name: ')
    })
    .then(function(lastName) {
        entry += ` ${lastName}`
        return rlQuestion('Phone Number: ')
    })
    .then(function(phoneNumber) {
        entry += ` ${phoneNumber}`
        return appendFile(phoneBook, entry)
    })
    .then(function() {
        console.log('Entry Saved')
    })
    .then(function() {
        initiatePhonebook();
    })
}   

var deleteAnEntry = function() {
    var phoneList;
    readFile(phoneBook)
    .then(function(data) {
        var stringData = data.toString(); 
        phoneList = stringData.split("\n")
        return phoneList;
    })
    .then(function() {
        return rlQuestion('Name: ')
    }) 
    .then(function(name){
        phoneList.forEach(function(entry, i) {
            if (entry.includes(name)) {
                phoneList.splice(i, 1);
                console.log('Entry Deleted')
            }  
    })
        return writeFile(phoneBook, '')
    })
    .then(function() {
        phoneList.forEach(function (entry) {
            appendFile('phonebook.txt', (entry + '\n'))
        })
    })
    .then(function(){
        initiatePhonebook();
    })
};

var listAllEntries = function() {
    var rawData;
    var contactList=[];
    http.get(url, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            rawData += chunk;
        });
        res.on('end', function() {
            var contact = rawData.split('undefined')[1];
            contactList.push(contact)
            var parsedList = JSON.parse(contactList)
            console.log(parsedList);
            initiatePhonebook();
        })
    })
}

var initiatePhonebook = function() {
    rl.question ('Choose an option: 1. Look up an entry, 2. Add new entry, 3. Delete an entry, 4. List all entries, 5. Quit  ', function(option) {
        var optionNum = Number(option)
        if (optionNum ===1) {
            lookUpAnEntry();
        } else if (optionNum === 2) {
            addNewEntry();
        } else if (optionNum ===3) {
            deleteAnEntry();
        } else if (optionNum ===4) {
            listAllEntries();
        } else if (optionNum === 5) {
            rl.close()
        }
    })
}

module.exports = initiatePhonebook;
