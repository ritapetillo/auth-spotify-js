const loginBtn = document.getElementById('login-btn')
const client_id = 'e54184c2056e4fceba268bad7ae4175f';
const secret = '90bf6fe6367b4d92b75aa2bca47478f0'
let auth__ecripted = 'Basic ' + btoa(`${client_id}:${secret}`)
let access_token = ""
let refresh_token =""


//function to authenticate once I click on login button
const authentication = () => {
    
    const redirect_uri = `http%3A%2F%2F127.0.0.1%3A5500%2Fcallback.html`
    const scopes = 'user-read-private user-read-email user-top-read'
    window.location.href = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=code&redirect_uri=${redirect_uri}&scope=${scopes}&state=34fFs29kd09&show_dialog=true`
   
}

//fetch all generes - made it to test the access token
let fetchAllGeneres = () => {
    return fetch('https://api.spotify.com/v1/browse/categories',
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                "Authorization": "Bearer " + JSON.parse(localStorage.getItem('access_token'))
        
    }}).then(res=>res.json())
}


//on window load
window.onload = () => {
    

    //since the DOM loads any time the page is refreshed, I'm just going to refresh the token every time so that it never expires. An alternative and probalby better way would be to check every time if the token expires and if it's the case then refresh it. So there should be something like if(token epxpires){fetch...}
    if(JSON.parse(localStorage.getItem('refresh_token')) !== 'undefined')    
   { fetch(`https://accounts.spotify.com/api/token`,
        {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': auth__ecripted
        },
        body: `grant_type=refresh_token&refresh_token=${JSON.parse(localStorage.getItem('refresh_token'))}`
    }).then(res => res.json()).then(data => {
        localStorage.setItem('access_token', JSON.stringify(data.access_token))
        console.log(JSON.parse(localStorage.getItem('access_token')))
    })}


    //if there is no access token then take the user back to login
    if (localStorage.getItem('access_token') === 'undefined') {
        window.location.href = "login.html"
    }

    //if the user is in the login page
    //add event listener to button which let user authenticate. The auth process will generate a code which will be used to then retrive access token and refreah token. User gets sent to callback.html
    if (window.location.pathname == '/login.html') {
        loginBtn.addEventListener('click', authentication)
    }
    
    //the user is sent to callback page which is an intermediary page used to generate and save the access token and the refreh token
    if (window.location.pathname == '/callback.html') {
        //I get the code from the search string of the url
        let params = new URLSearchParams(document.location.search.substring(1));
        let code = params.get('code')
        // data to be sent to the POST request
        let _data = {
                grant_type: "authorization_code",
                code,
                redirect_uri:'http://127.0.0.1:5500/callback.html'
                    }
        //send a post request to https://accounts.spotify.com/api/token
        fetch(`https://accounts.spotify.com/api/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': auth__ecripted
            },
            body: `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(_data.redirect_uri)}`
        })
            .then(res => res.json())
            .then(data =>
            {
                //Once generated access token and refresh token I save it in the localstorage
                    access_token = localStorage.setItem('access_token', JSON.stringify(data.access_token))
                    refresh_token = localStorage.setItem('refresh_token', JSON.stringify(data.refresh_token))

                    }
        )
            //then I'm finally able to send the user to index.html
            .then(data => window.location.href = 'index.html')
        
    }

    //when the user goes to index
    if (window.location.pathname == '/index.html') { 
        fetchAllGeneres()
            .then(data => console.log(data)).catch(err => {
                if (err.status === 401) {
                    //this could be an alternative way to refreh token i guess, rather than just refreshing it on every window load so I could for example create a function refresh token which returns a promise and then when I get a new token and save it, I can try again to fetchAllGEneres.
                    
                }
            })
        
        //logout function
          let logoutBtn = document.getElementById('logout')
        logoutBtn.addEventListener('click', () => {
            localStorage.clear()
            window.location.href = "login.html"
        })
    }


}