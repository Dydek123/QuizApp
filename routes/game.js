const gameRoute = app =>{
    let goodAnswers = 0;
    let gameOver = false;
    let callToAFriendUsed = false;
    let questionToTheCrowdUsed = false;
    let halfOnHalfUsed = false;

    // const questions = [
    //     {question: 'Jaki jest najlepszy język programowania', answers:['C++','Fortran','JS','Java'], correctAnswer:2},
    //     {question: 'Czy ten kurs jest fajny', answers:['Nie wiem','Nie','Tak','Może'], correctAnswer:2},
    //     {question: 'Czy chcesz zjeść pizze', answers:['Nie wiem','Nie','Tak','Może'], correctAnswer:2},
    //     {question: 'Jaki kolor jest najszybszy', answers:['Czerwony','Zielony','Niebieski','Różowy'], correctAnswer:0}
    // ]

    let questions= [];
    const fs = require('fs')
    fs.readFile('./resources/questions.json','utf-8',(err,data) => {
        if (err)
            return console.log(err);
        questions = JSON.parse(data);
    })

    app.get('/question', (req, res) => {
        if(goodAnswers === questions.length){
            res.json({
                winner: true,
            });
        }else if(gameOver){
            res.json({
                loser:true,
            })
        } else {
            const nextQuestion = questions[goodAnswers];
            const {question, answers} = nextQuestion;
            res.json({
                question, answers,
            })
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
        }

        res.json({
            correct : currentQuestion.correctAnswer === Number(index),
            goodAnswers,
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