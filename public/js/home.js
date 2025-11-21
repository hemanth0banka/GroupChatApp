let userId
let username
let email
let openRoom

const socket = io('http://localhost:1000/', {
    auth: {
        token: localStorage.getItem('token')
    }
})
socket.on('delete-message', (obj) => {
    const elements = document.getElementsByClassName(obj.msgId);
    if (elements.length > 0) {
        const ele = elements[0];
        document.querySelector('#messages').removeChild(ele);
    }
})
socket.on('new-message', (obj) => {
    if (obj.roomId === openRoom) {
        messages(obj)
    }
    else {
        document.getElementById(obj.roomId).style = 'background-color:lightgreen;'
    }
});

socket.on('join-room', (obj) => {
    openRoom = obj.roomId
    document.querySelector('#dashboard').innerHTML = ''
    const div = document.createElement('div')
    div.id = 'RommDetails'
    const arr = obj.roomname.split('-')
    for (let x of arr) {
        if (x != email) {
            div.innerHTML = x
            break;
        }
    }
    const ul = document.createElement('div')
    ul.id = 'messages'
    const tot = document.createElement('div')
    tot.id = 'tot'
    const ai = document.createElement('div')
    ai.id = 'ai'
    tot.appendChild(ai)
    const form = document.createElement('form')
    form.id = 'send'
    const input = document.createElement('input')
    input.type = 'text'
    input.name = 'msg'
    input.addEventListener('input', async () => {
        try {
            let a = await axios.post('/ai/ask', {
                prompt: `just stright answer . suggest me next word or sentence for this "${input.value}"`
            }, {
                headers: `Bearer ${localStorage.getItem('token')}`
            })
            ai.innerHTML = a.data
        }
        catch (e) {
            console.log(e)
        }
    })
    const but = document.createElement('button')
    but.type = 'button'
    but.id = 'my'
    but.innerHTML = '+'
    but.addEventListener('click', (event) => {
        event.preventDefault()
        if (input.type == 'text') {
            input.type = 'file'
        }
        else {
            input.type = 'text'
        }
    })
    const send = document.createElement('button')
    send.type = 'submit'
    send.id = 'submit'
    send.innerHTML = 'send'
    form.addEventListener('submit', (event) => {
        event.preventDefault()
        if (input.type == 'file') {
            const image = input.files[0]
            const arr = input.value?.split('\\')
            form.reset()
            socket.emit('new-image', {
                roomId: obj.roomId,
                image: image,
                filename: arr.pop()
            })
            return
        }
        const message = event.target.msg.value
        socket.emit('new-message', {
            roomId: obj.roomId,
            message: message
        })
        form.reset()
    })
    form.appendChild(but)
    form.appendChild(input)
    form.appendChild(send)
    tot.appendChild(form)
    document.querySelector('#dashboard').appendChild(div)
    document.querySelector('#dashboard').appendChild(ul)
    document.querySelector('#dashboard').appendChild(tot)

    for (let x of obj.messages) {
        messages(x)
    }
})

async function button(obj) {
    const button = document.createElement('button')
    button.id = obj.roomId
    const arr = obj.roomname.split('-')
    for (let x of arr) {
        if (x != email) {
            button.innerHTML = x
            break;
        }
    }
    button.addEventListener('click', (event) => {
        event.preventDefault()
        button.style = 'background-color:rgb(246, 246, 246);'
        socket.emit('join-room', { roomId: obj.roomId, roomname: obj.roomname, members: obj.members })
        openRoom = obj.roomId
    })
    document.querySelector('#chats').appendChild(button)
}

async function messages(obj) {
    const p = document.createElement('p')
    p.className = obj.id
    if (obj.userUserId == userId) {
        p.id = 'my'
        const txt = document.createElement('button')
        txt.innerHTML = 'x'
        txt.id = 'del'
        txt.addEventListener('click', async () => {
            try {
                socket.emit('delete-message', { id: obj.id, roomId: openRoom })
            }
            catch (e) {
                console.log(e)
            }
        })
        p.appendChild(txt)
    }
    else {
        p.id = 'group'
        const txt = document.createElement('p')
        txt.innerHTML = obj.user.username
        p.appendChild(txt)
    }

    if (obj.type == 'text') {
        const txt = document.createElement('p')
        txt.innerHTML = obj.message
        p.appendChild(txt)
    }
    else {
        const img = document.createElement('img')
        img.src = obj.message
        img.style = "width:300px;height:300px;"
        p.appendChild(img)
    }
    document.querySelector('#messages').appendChild(p)
    const messagesDiv = document.querySelector('#messages');
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

window.addEventListener('load', async () => {
    try {
        const r = await axios.get('/chats', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        email = r.data[0].email
        username = r.data[0].username
        userId = r.data[0].userId
        document.querySelector('#user').innerHTML = username
        for (let x of r.data[1]) {
            socket.emit('join-room', {
                roomId: x.roomId,
                roomname: x.roomname,
                members: x.members
            });
            button(x)
        }
    }
    catch (e) {
        console.log(e)
    }
})

document.querySelector('#search').addEventListener('submit', async (event) => {
    event.preventDefault()
    try {
        const name = event.target.name.value;
        const r = await axios.post('/check', {
            email: name
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        const roomId = [email, name].sort().join('-')
        const roomname = roomId
        const members = [email, name]
        socket.emit('join-room', { roomId, roomname, members })
        button({ roomId, roomname, members })
    }
    catch (e) {
        if (e.status === 404) alert(e.response.data.message)
        console.log(e)
    }
})

document.querySelector('#create').addEventListener('click', (event) => {
    event.preventDefault()
    const form = document.createElement('form')
    form.id = 'grouping'
    const label = document.createElement('label')
    label.innerHTML = 'Group Name'
    const input = document.createElement('input')
    input.type = 'text'
    input.name = 'name'
    const submit = document.createElement('button')
    submit.type = 'submit'
    submit.id = 'submit'
    submit.innerHTML = 'Create'
    const cancel = document.createElement('button')
    cancel.innerHTML = 'cancel'
    cancel.id = 'cancel'
    cancel.addEventListener('click', (event) => {
        event.preventDefault()
        document.querySelector('#dashboard').removeChild(form)
    })
    form.addEventListener('submit', (event) => {
        event.preventDefault()
        if (event.target.name.value == '') {
            alert('please enter Group Name')
            return 0
        }
        const roomname = event.target.name.value
        const members = [email]
        socket.emit('create-group', { roomname, members })
        document.querySelector('#dashboard').innerHTML = ''
        socket.once('join-group', (obj) => {
            alert(`This is your roomId : ${obj.roomId}`)
            button(obj)
        })
    })
    form.appendChild(label)
    form.appendChild(input)
    form.appendChild(submit)
    form.appendChild(cancel)
    document.querySelector('#dashboard').innerHTML = ''
    document.querySelector('#dashboard').appendChild(form)
})

document.querySelector('#join').addEventListener('click', (event) => {
    event.preventDefault()
    const form = document.createElement('form')
    form.id = 'grouping'
    const label = document.createElement('label')
    label.innerHTML = 'Group Id'
    const input = document.createElement('input')
    input.type = 'text'
    input.name = 'name'
    const submit = document.createElement('button')
    submit.type = 'submit'
    submit.id = 'submit'
    submit.innerHTML = 'Join'
    const cancel = document.createElement('button')
    cancel.innerHTML = 'cancel'
    cancel.id = 'cancel'
    cancel.addEventListener('click', (event) => {
        event.preventDefault()
        document.querySelector('#dashboard').removeChild(form)
    })
    form.addEventListener('submit', async (event) => {
        event.preventDefault()
        try {
            if (event.target.name.value === '') {
                alert('please enter group Id')
                return 0;
            }
            const roomId = event.target.name.value
            const r = await axios.get(`/check/${roomId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
            socket.emit('join-group', { roomId })
            document.querySelector('#dashboard').innerHTML = ''
            socket.once('join-group', (obj) => {
                button(obj)
            })
        }
        catch (e) {
            if (e.status === 404) {
                alert(e.response.data.message)
            }
            console.log(e)
        }
    })
    form.appendChild(label)
    form.appendChild(input)
    form.appendChild(submit)
    form.appendChild(cancel)
    document.querySelector('#dashboard').innerHTML = ''
    document.querySelector('#dashboard').appendChild(form)
})