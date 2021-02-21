
const fs = require('fs');

const prepareQuestions = () => {
    const fetch = require("node-fetch");
    fetch('https://opentdb.com/api.php?amount=50&type=multiple')
        .then(res => res.json())
        .then(json => {
            fs.writeFile("./resources/questions.json", JSON.stringify(json), function(err) {
                if(err) {
                    return console.log(err);
                }
                return console.log('Succesfull');
            });
        });
}

module.exports = prepareQuestions;