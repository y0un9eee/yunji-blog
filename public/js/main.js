const API = {
    get(url){
        return $.ajax({ url, method: 'GET'});
    },
    post(url, data){
        return $.ajax({ url, method: 'POST', contentType: 'application/json', data: JSON.stringify(data)});
    },
    put(url, data){
        return $.ajax({ url, method: 'PUT', contentType: 'application/json', data: JSON.stringify(data)});
    },
    del(url){
        return $.ajax({ url, method: 'DELETE'});
    },
};

function showAlert(selector, message, type = 'error'){
    $(selector)
        .removeClass('alert-error alert-success')
        .addClass(`alert alert-${type}`)
        .text(message)
        .show();
}

function hideAlert(selector){
    $(selector).hide().text('');
}

function getPathId(){
    const parts = window.location.pathname.split('/');
    return parts[parts.length -1];
}

async function updateNav(){
    try{
        const data = await API.get('/api/auth/me');
        window.currentUser = data.user;
        $('#nav-login, #nav-register').hide();
        $('#nav-logout, #nav-username').show();
        $('#nav-username').text(data.user.username);
        if (data.user.role === 'admin'){
            $('#nav-admin, #nav-write').show();
        }
    }catch{
        window.currentUser=null;
        $('#nav-logout, #nav-username, #nav-admin, #nav-write').hide();
        $('#nav-login, #nav-register').show();
    }
}

$(document).ready(function (){
    updateNav();

    $('#nav-logout').on('click', async function (e) {
        e.preventDefault();
        await API.post('/adpi/auth/logout', {});
        window.location.href = '/';
    });
});