const fs = require('fs');
const prepareQuestions = require('../resources/prepareQuestions');

const shuffle = array => {
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

const replaceBadString = (data) => {
    data = data.split("&quot;").join("'")
    data = data.split("&#039;").join("'")
    return data;
}

const gameRoute = app =>{
    let goodAnswers = 0;
    let publicAnswer = {};
    let gameOver = false;
    let callToAFriendUsed = false;
    let questionToTheCrowdUsed = false;
    let halfOnHalfUsed = false;

    let questions= [];

    fs.readFile('./resources/questions.json','utf-8',(err,data) => {
        if (err)
            return console.log(err);
        let arr = [];
        data = replaceBadString(data);
        const apiQuestions = JSON.parse(data);
        // const {category, type, difficulty, question, correct_answer, incorrect_answers} = questions.results[0]
        for (const question of apiQuestions.results) {
            let answers = question.incorrect_answers;
            answers.push(question.correct_answer);
            arr.push({"category": question.category ,
                "question": question.question,
                "answers": shuffle(answers),
                "correctAnswer" : answers.indexOf(question.correct_answer)
            })
        }
        questions = arr
    })

    app.get('/reset', (req, res) => {
        goodAnswers = 0 ;
        res.redirect('/')
    })

    app.get('/start', (req, res) => {
        prepareQuestions();
        res.redirect('/')
    })

    app.get('/question', (req, res) => {
        if(goodAnswers === questions.length){
            res.json({
                winner: true,
            });
        }else if(gameOver){
            prepareQuestions();
            res.json({
                loser:true,
                publicAnswer,
                goodAnswers,
            })
        } else {
            if (goodAnswers!==0) {
                setTimeout(() => {
                    const nextQuestion = questions[goodAnswers];
                    const {question, answers, category} = nextQuestion;
                    res.json({
                        question, answers, category,
                    })
                }, 1000)
            } else {
                const nextQuestion = questions[goodAnswers];
                const {question, answers, category} = nextQuestion;
                res.json({
                    question, answers, category,
                })
            }
        }
    });

    app.post('/answer/:index', (req,res) =>{
        if (gameOver)
            return res.json({loser:true});

        const {index} = req.params;
        const currentQuestion = questions[goodAnswers];
        const correctAnswer = currentQuestion.correctAnswer === Number(index);
        if (correctAnswer){
            goodAnswers++;
        } else{
            gameOver = true;
            publicAnswer = {correctAnswer: currentQuestion.correctAnswer, playerAnswer:Number(index)};
        }
        res.json({
            correct : currentQuestion.correctAnswer === Number(index),
            goodAnswers
        })
    })

    app.get('/help/friend', (req,res) =>{
        if(callToAFriendUsed){
            return res.json({
                text: 'To koło ratunkowe zostało już wykorzystane',
            })
        }
        callToAFriendUsed = true;
        const doesFriendKnowAnswer = Math.random() < 0.5;
        const question = questions[goodAnswers];
        res.json({
            text: doesFriendKnowAnswer?`Wydaję mi się, że odpowiedź to ${question.answers[question.correctAnswer]}` : `Niestety nie wiem`
        })
    });

    app.get('/help/halfOnHalf', (req, res) => {
        if (halfOnHalfUsed){
            return res.json({
                text: 'To koło ratunkowe zostało już wykorzystane',
            })
        }
        halfOnHalfUsed = true;
        const question = questions[goodAnswers];
        let secondOption = Math.floor(Math.random() * 4)
        while (secondOption === Number(question.correctAnswer)){
            secondOption = Math.floor(Math.random() * 4)
        }
        res.json({
            index1 : question.correctAnswer,
            index2 : secondOption
        })
    })

    app.get('/help/questionToTheCrowd', (req, res) => {
        if (questionToTheCrowdUsed){
            return res.json({
                text: 'To koło ratunkowe zostało już wykorzystane',
            })
        }
        questionToTheCrowdUsed = true;
        const chart = [10, 20, 30, 40];

        for (let i = chart.length-1 ; i>0 ; i--){
            const changeRate = Math.floor(Math.random()*20 - 10);
            chart[i] += changeRate;
            chart[i - 1] -= changeRate;
        };

        const question = questions[goodAnswers];
        const {correctAnswer} = question;

        [chart[3], chart[correctAnswer]] = [chart[correctAnswer], chart[3]];

        res.json({
            chart,
        });
    })
}

module.exports = gameRoute;