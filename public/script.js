const question = document.querySelector('#question');
const answers = document.querySelectorAll('.answerButton');
const resetButton = document.querySelector('#reset');
const h2 = document.querySelector('h2');
const callFriend = document.querySelector('#callToFriend');
const halfOnHalf = document.querySelector('#halfOnHlf');
const questionToTheCrowd = document.querySelector('#questionToTheCrowd');
const prizeDivs = document.querySelectorAll('aside div');

const showNextQuestion = () => {
    fetch('/question', {
            method: 'GET',
        })
        .then(data => data.json())
        .then(data => {
            fillElements(data)
        });
}

const resetGame = (data) => {
    answers[data.publicAnswer.correctAnswer].classList.remove('correctAnswer');
    answers[data.publicAnswer.correctAnswer].classList.add('hoverButton');
    answers[data.publicAnswer.playerAnswer].classList.remove('wrongAnswer');
    answers[data.publicAnswer.playerAnswer].classList.add('hoverButton');
    h2.style.height = '85%';
    callFriend.disabled = false;
    questionToTheCrowd.disabled = false;
    halfOnHalf.disabled = false;
    resetButton.style.display = 'none';

    fetch('/reset', {
        method: 'GET',
    })
        .then(data => data.json())
        .then(data => {
            fillElements(data)
        });
}

const preparePrizeList = (questionIndex) => {
    const currentQuestion = prizeDivs.length;
    if (questionIndex>0) {
        prizeDivs[currentQuestion - questionIndex].classList.add('previous');
        prizeDivs[currentQuestion - questionIndex].classList.remove('current');
        if (currentQuestion > questionIndex)
            prizeDivs[currentQuestion - questionIndex -1].classList.add('current');
    }
}

const clearPrizeList = (questionIndex) => {
    const length = prizeDivs.length-1;
    prizeDivs[length - questionIndex].classList.remove('current');
    prizeDivs[length].classList.add('current');
    for(let i = length ; i>length-questionIndex ; i--)
        prizeDivs[i].classList.remove('previous')
}

const fillElements = (data) => {
    if (data.winner === true) {
        h2.innerText = 'You are MILIONAIRE';
        setTimeout(function(){ resetButton.style.display = 'flex' }, 2000);
        return;
    } else if (data.loser === true) {
        answers[data.publicAnswer.correctAnswer].classList.add('correctAnswer');
        answers[data.publicAnswer.correctAnswer].classList.remove('hoverButton');
        answers[data.publicAnswer.playerAnswer].classList.add('wrongAnswer');
        answers[data.publicAnswer.playerAnswer].classList.remove('hoverButton');
        resetButton.addEventListener('click', () => {
            clearPrizeList(data.goodAnswers)
            resetGame(data)
        })
        if (data.goodAnswers <2){
            h2.innerText = 'You won 0 €';
        }
        if (data.goodAnswers >= 2 && data.goodAnswers <7){
            h2.innerText = 'You won 1 000 €';
        }
        if(data.goodAnswers >= 7){
            h2.innerText = 'You won 40 000 €';
        }
        setTimeout(function(){ resetButton.style.display = 'flex' }, 2000);
        return;

    }
    for (const button of answers) {
        button.style.opacity = 1;
    }
    console.log(data)
    document.querySelector('#tip').innerText = '';
    question.innerText = data.question;
    document.querySelector('#category').innerText = data.category;
    for (const i in data.answers) {
        answers[i].innerText = data.answers[i];
    }
}
showNextQuestion();

// const goodAnswers = document.querySelector('#good-answers');
const handleAnswerFeedback = (data) => {
    // goodAnswers.innerText = data.goodAnswers;
    showNextQuestion();
};

const sendAnswer = (answerIndex) => {
    fetch(`/answer/${answerIndex}`, {
            method: 'POST',
        })
        .then(res => res.json())
        .then(data => {
            handleAnswerFeedback(data);
            preparePrizeList(data.goodAnswers);
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
    callFriend.disabled = true;

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
    halfOnHalf.disabled = true
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
        button.innerText += ` (${tip.chart[button.dataset.answer]}%)`
    }
    questionToTheCrowd.disabled = true;
}


callFriend.addEventListener('click', callToFriend);
halfOnHalf.addEventListener('click', halfOnHaldHelp);
questionToTheCrowd.addEventListener('click', questionToTheCrowdHelp)