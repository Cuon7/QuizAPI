// TODO(you): Write the JavaScript necessary to complete the assignment.



let theQuiz = {}

function toggleVisibility(selectors = []) {
    selectors.forEach(sel => {
        try {
            document.querySelector(sel).classList.toggle('hidden')
        } catch (error) { }
    })
}


document.querySelector('.start-btn').addEventListener("click", () => {
    toggleVisibility(['#introduction'])
    fetch('https://wpr-quiz-api.herokuapp.com/attempts', {
        method: 'POST'
    }).then(r => r.json())
        .then(quiz => {
            theQuiz = quiz
            toggleVisibility(['.submit-outer'])
            const container = document.querySelector('#attempt-quiz')
            quiz.questions.forEach((q, i) => {
                let answersDiv = ""
                q.answers.forEach((a, i) => {
                    answersDiv += `
                        <label for="${q._id}_${i}" class="nut-radio-ctn">
                            <input class="nut-radio" type="radio" name="${q._id}" id=${q._id}_${i}>
                            <span>${a.replaceAll('<', '&#60').replaceAll('>', '&#62').replaceAll('/', '&#47')}</span>
                            <div class="hltr"></div>
                        </label><br>
                    `
                })

                container.innerHTML += `
                    <div class="question-ctn">
                        <h3 class="t">Question ${i + 1} of 10</h3>
                        <p>${q.text}</p>
                        <div class="ctn-tra-loi">
                            ${answersDiv}
                        </div>
                        </form>
                    </div>
                `
            })
        })
})


document.querySelector('.submit-btn').addEventListener('click', onSubmit)
function onSubmit() {
    if (!confirm("Finish attempt?")) {
        return
    }

    let selected = {}
    document.querySelectorAll('.ctn-tra-loi').forEach(q => {
        q.querySelectorAll('.nut-radio').forEach((option, i) => {
            if (option.checked) {
                selected[option.getAttribute("name")] = i
            }
        })
    })


    fetch(`https://wpr-quiz-api.herokuapp.com/attempts/${theQuiz._id}/submit`, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({ answers: selected })
    }).then(r => r.json())
        .then(res => {
            toggleVisibility(['.review-quiz', '.submit-outer'])
            document.querySelector('.counter').innerHTML = res.score
            document.querySelector('.percentage').innerHTML = res.score / res.questions.length * 100 + '%'
            document.querySelector('.feedback').innerHTML = res.scoreText

            for (const key in res.correctAnswers) {
                document.querySelectorAll(`[name="${key}"]`).forEach((c, i) => {
                    c.setAttribute("disabled", "")
                    if (res.correctAnswers[key] == i) {
                        let x = document.createElement('div')
                        x.classList.add("right")
                        x.innerHTML = "Correct Answer"
                        c.parentElement.style.background = '#d4edda'
                        c.parentElement.appendChild(x)
                    } else {
                        if (c.checked) {
                            let x = document.createElement('div')
                            x.classList.add("wrong")
                            x.innerHTML = "Wrong Answer"
                            c.parentElement.style.background = '#f8d7da'
                            c.parentElement.appendChild(x)
                        }
                    }
                })
            }
        })
}

