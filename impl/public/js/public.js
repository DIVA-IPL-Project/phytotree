window.onload = load

let data;

async function load() {
    let rad = document.querySelector('.radial-btn')
    rad.addEventListener('click', radial)

    let den = document.querySelector('.dendro-btn')
    den.addEventListener('click', dendro)

    let nwkBtn = document.getElementById('nwkBtn')
    nwkBtn.addEventListener('click', sendNwkData)

    let resp = await fetch('http://localhost:8000/api/data')

    if (resp.status !== 200) alertMsg(resp.statusText)
    else data = await resp.json()
}

function sendNwkData() {
    let nwk = document.getElementById('nwk').value
    let body = JSON.stringify({data: nwk})
    let headers = { 'Content-Type': 'application/json' }

    fetch('/api/data', {method: 'post', body: body, headers: headers})
        .then(async res => {
            if (res.status == 500) alertMsg('error')
            data = await res.json()
            console.log(data)
        })
        .catch(err => alertMsg(err))
}

function alertMsg(message, kind) {
    if (!kind) kind = 'danger'
    document
        .querySelector('.messages')
        .innerHTML =
        `<div class="alert alert-${kind} alert-dismissible" role="alert">
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                ${message}
            </div>`
}