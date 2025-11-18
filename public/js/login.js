document.querySelector('form').addEventListener('submit', async (event) => {
    event.preventDefault()
    try {
        const r = await axios.post('/login', {
            username: event.target.username.value,
            password: event.target.password.value
        })
        localStorage.setItem('token', r.data)
        window.location.href = 'http://localhost:1000/home'
    }
    catch (e) {
        console.log(e)
        if (e.status == 404 || e.status == 400) alert(e.response.data.message)
        console.log(e)
    }
})