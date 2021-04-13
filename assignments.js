document.body.onload = function()
{
    var notifContainer = document.createElement( "div" );
    notifContainer.className = "pro-notif-container";
    document.body.appendChild( notifContainer );

    const pushNotif = ( title, message, timeout ) =>
    {
        const notifHeight = 100;
        setTimeout( () => { 
            var notif = document.createElement( "div" )
            notif.className = "pro-notif";
            notif.innerHTML = `
            <div class = "pro-icon-container" >
                <img src = "https://i.imgur.com/XrB6ETj.png" class = "pro-icon">
            </div>
            <div style = "width: 100%">
                <span class = 'pro-title'>${title}</span>
                <span class = 'pro-message'>${message}</span>
            </div>
            <span class = 'pro-closenotif'>&#x2715;</span>
            `
            notif.style.marginLeft = "400px"
            notifContainer.prepend( notif );
            notif.querySelector('.pro-closenotif').onclick = function( notif )
            {
                this.parentElement.style.marginLeft = "400px";
                setTimeout( () => {this.parentElement.remove()}, 500 );
            }
            if( timeout )
            {
                setTimeout( () =>{
                    notif.style.marginLeft = "400px";
                    setTimeout( () => {notif.remove()}, 500 );
                }, timeout );
            }
            setTimeout( () => {notif.style.marginLeft = "0px"}, 100 );
        }, 200 );
    }
    if( !document.querySelector( ".footer-text-enhanced-by" ) )
    {
        let storage = window.localStorage;
        assignmentSettings = storage.getItem( "assignmentSettings" );
        assignmentSettings = assignmentSettings == null ? {} : JSON.parse( assignmentSettings );
        const updateLocalStorage = () =>
        {
            localStorage.setItem( "assignmentSettings", JSON.stringify( assignmentSettings ) ) 
        }
        
        let firstSlash = window.location.pathname.indexOf( "/", 1 );
        let secondSlash = window.location.pathname.indexOf( "/", firstSlash + 1 );
        id = window.location.pathname.slice( firstSlash + 1, secondSlash );
        let checkForSubmission = setInterval( () => {
            if( document.querySelector( "#dropbox-revisions" ) )
            {
                if( !assignmentSettings[id] ) 
                {
                    assignmentSettings[id] = {}
                }
                assignmentSettings[id].strike = true;
                updateLocalStorage();
                clearInterval( checkForSubmission );
            }
        }, 500)
    }
    else
    {
        pushNotif( "Extension Conflict", "Please disable or remove any other Schoology related Chrome Extension to continue using Schoology Pro!", 6000 );
    }
}