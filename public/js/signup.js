document.querySelector('form').addEventListener('submit', async (event) => {
    event.preventDefault()
    if (event.target.password.value != event.target.confirmpassword.value) {
        alert('Please enter same password in both fields')
        return 0
    }
    try {
        const r = await axios.post('/user/signup', {
            username: event.target.username.value,
            email: event.target.email.value,
            phone: event.target.phone.value,
            password: event.target.password.value
        })
        alert('Registered Successfully!')
        window.location.href = 'http://localhost:1000/';
    }
    catch (e) {
        if (e.response.data) alert('email already in use')
        console.log(e)
    }
})