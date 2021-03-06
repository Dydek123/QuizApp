const fs = require('fs');
const prepareQuestions = require('../resources/prepareQuestions');

const shuffle = array => {
    let currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

const drawQuestion = (questionsInCurrentGame) => {
    let {questionIndex, answer} = questionsInCurrentGame.pop() || {questionIndex:0,  answer:true};
    if(answer){
        questionIndex =  Math.floor(Math.random() * 51);
        while (questionsInCurrentGame.includes(questionIndex)){
            questionIndex =  Math.floor(Math.random() * 51)
        }
    }
    console.log(questionIndex)
    return questionIndex;
}

const replaceBadString = (data) => {
    data = data.split("&quot;").join("'")
    data = data.split("&#039;").join("'")
    data = data.split("&euml;").join("ë")
    data = data.split("&amp;").join("&")
    return data;
}

const gameRoute = app =>{
    let goodAnswers = 0;
    let publicAnswer = {};
    let questionsInCurrentGame = [];
    let questionIndex = 0;
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
        goodAnswers = 0;
        gameOver = false;
        callToAFriendUsed = false;
        questionToTheCrowdUsed = false;
        halfOnHalfUsed = false;
        questionsInCurrentGame.length = 0;
        questionIndex  = drawQuestion(questionsInCurrentGame);
        questionsInCurrentGame.push({questionIndex, answer:false});
        const nextQuestion = questions[questionIndex];
        const {question, answers, category} = nextQuestion;
        res.json({
            question, answers, category, goodAnswers, loser:false
        })
    })

    app.get('/start', (req, res) => {
        // prepareQuestions();
        res.redirect('/')
    })

    app.get('/question', (req, res) => {
        if(goodAnswers === 12){
            res.json({
                winner: true,
            });
        }else if(gameOver){
            res.json({
                loser:true,
                publicAnswer,
                goodAnswers,
            })
        } else {
            if (goodAnswers!==0) {
                setTimeout(() => {
                    questionIndex  = drawQuestion(questionsInCurrentGame);
                    const nextQuestion = questions[questionIndex];
                    questionsInCurrentGame.push({questionIndex, answer:false});
                    const {question, answers, category} = nextQuestion;
                    res.json({
                        question, answers, category, goodAnswers,
                    })
                }, 1000)
            } else {
                questionIndex  = drawQuestion(questionsInCurrentGame);
                const nextQuestion = questions[questionIndex];
                questionsInCurrentGame.push({questionIndex, answer:false});
                const {question, answers, category} = nextQuestion;
                res.json({
                    question, answers, category, goodAnswers,
                })
            }
            console.log(questionsInCurrentGame)
        }
    });

    app.post('/answer/:index', (req,res) =>{
        if (gameOver)
            return res.json({loser:true});

        const {index} = req.params;
        const currentQuestion = questions[questionIndex];
        const correctAnswer = currentQuestion.correctAnswer === Number(index);
        if (correctAnswer){
            goodAnswers++;
            let {questionIndex, answer} = questionsInCurrentGame.pop();
            answer = true;
            questionsInCurrentGame.push({questionIndex, answer});
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
                text: 'This lifeline has already been used',
            })
        }
        callToAFriendUsed = true;
        const doesFriendKnowAnswer = Math.random() < 0.5;
        const question = questions[questionIndex];
        // console.log(question)
        // console.log('index' + questionIndex)
        res.json({
            text: doesFriendKnowAnswer?`I think it is ${question.answers[question.correctAnswer]}` : `Unfortunately, I do not know`
        })
    });

    app.get('/help/halfOnHalf', (req, res) => {
        if (halfOnHalfUsed){
            return res.json({
                text: 'This lifeline has already been used',
            })
        }
        halfOnHalfUsed = true;
        const question = questions[questionIndex];
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

        const question = questions[questionIndex];
        const {correctAnswer} = question;

        [chart[3], chart[correctAnswer]] = [chart[correctAnswer], chart[3]];

        res.json({
            chart,
        });
    })
}

module.exports = gameRoute;