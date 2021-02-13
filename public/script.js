const question = document.querySelector('#question');
const answers = document.querySelectorAll('.answerButton');
const gameBoard = document.querySelector('#gameboard');
const h2 = document.querySelector('h2');
const callFriend = document.querySelector('#callToFriend');
const halfOnHalf = document.querySelector('#halfOnHlf');
const questionToTheCrowd = document.querySelector('#questionToTheCrowd');

const showNextQuestion = () => {
    fetch('/question', {
            method: 'GET',
        })
        .then(data => data.json())
        .then(data => {
            fillElements(data)
        });
}

const fillElements = (data) => {
    if (data.winner === true) {
        gameBoard.style.display = 'none';
        h2.innerText = 'WYGRAŁAŚ/EŚ!!!'
        return;
    } else if (data.loser === true) {
        gameBoard.style.display = 'none';
        h2.innerText = 'Tym razem się nie udało, spróbuj ponownie'
        return;

    }
    for (const button of answers) {
        button.style.opacity = 1;
    }
    document.querySelector('#tip').innerText = '';
    question.innerText = data.question;
    document.querySelector('#category').innerText = data.category;
    for (const i in data.answers) {
        answers[i].innerText = data.answers[i];
    }
}
showNextQuestion();

const goodAnswers = document.querySelector('#good-answers');
const handleAnswerFeedback = (data) => {
    goodAnswers.innerText = data.goodAnswers;
    showNextQuestion();
};

const sendAnswer = (answerIndex) => {
    fetch(`/answer/${answerIndex}`, {
            method: 'POST',
        })
        .then(res => res.json())
        .then(data => {
            handleAnswerFeedback(data);
        })
}

for (const button of answers) {
    button.addEventListener('click', (event) => {
        const answerIndex = event.target.dataset.answer;
        sendAnswer(answerIndex);
    })
}

const callToFriend = () => {
    fetch(`/help/friend`, {
            method: 'GET',
        })
        .then(res => res.json())
        .then(data => {
            handleFriendAnswer(data)
        })
}

const handleFriendAnswer = (tip) => {
    document.querySelector('#tip').innerText = tip.text;
}

const halfOnHaldHelp = () => {
    fetch(`/help/halfOnHalf`, {
            method: 'GET',
        })
        .then(res => res.json())
        .then(data => {
            if (!data.text)
                handleHalfOnHalf(data)
            else
                document.querySelector('#tip').innerText = data.text;
        })
}

const handleHalfOnHalf = (tip) => {
    const { index1, index2 } = tip;
    for (const button of answers) {
        if (Number(button.dataset.answer) !== index1 && Number(button.dataset.answer) !== index2) {
            button.style.opacity = 0;
        }
    }
}

const questionToTheCrowdHelp = () => {
    fetch(`/help/questionToTheCrowd`, {
            method: 'GET',
        })
        .then(res => res.json())
        .then(data => {
            if (!data.text)
                handleQuestionToTheCrowd(data)
            else
                document.querySelector('#tip').innerText = data.text;
        })
}

const handleQuestionToTheCrowd = (tip) => {
    for (const button of answers) {
        button.innerText += ` ${tip.chart[button.dataset.answer]}%`
    }
}


callFriend.addEventListener('click', callToFriend);
halfOnHalf.addEventListener('click', halfOnHaldHelp);
questionToTheCrowd.addEventListener('click', questionToTheCrowdHelp)