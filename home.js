
document.body.onload = function()
{
    var notifContainer = document.createElement( "div" );
    notifContainer.className = "pro-notif-container";
    document.body.appendChild( notifContainer );

    const pushNotif = ( title, message, timeout ) =>
    {
        var notif = document.createElement( "div" )
        notif.className = "pro-notif";
        notif.innerHTML = `
        <div class = "pro-icon-container">
            <img src = "https://i.imgur.com/XrB6ETj.png" class = "pro-icon">
        </div>
        <div>
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
    }


    let storage = window.localStorage;

    assignmentSettings = storage.getItem( "assignmentSettings" );
    assignmentSettings = assignmentSettings == null ? {} : JSON.parse( assignmentSettings );

    document.querySelectorAll( ".splus-completed-check-indicator" ).forEach( el => { 
        el.remove();
       clearInterval( scpcheckinterval );
   })

    var scpcheckinterval = setInterval( () =>
    {
        document.querySelectorAll( ".splus-completed-check-indicator" ).forEach( el => { 
             el.remove();
            clearInterval( scpcheckinterval );
        })
    }, 3000 )

    const updateLocalStorage = ()=>
    {
        localStorage.setItem( "assignmentSettings", JSON.stringify( assignmentSettings ) ) 
    }

    const checkAssignment = ( el, href, id, toggle ) =>
    {
        if( href.href.includes( "assignment" ) )
        {  
        
            if( assignmentSettings[id] == undefined ) 
            {
                assignmentSettings[id] = {};
            }

            let strike = assignmentSettings[id].strike;

            if( toggle )
            {
                assignmentSettings[id].strike = strike == undefined ? true : !strike;
                href.classList.toggle( 'strikethroughtext' )
                el.classList.toggle( 'translucent')
            }
            else if( strike != undefined && strike )
            {
                href.classList.toggle( 'strikethroughtext' )
                el.classList.toggle( 'translucent')
            }
            updateLocalStorage();
            return strike;
        }
    }


    let overdueHead = document.querySelector( "#overdue-submissions .h3-med");
    if( overdueHead != null )
    {
        document.querySelector( "#overdue-submissions .h3-med").style.height = "30px"

        var revealAll = document.createElement( 'button' );
        revealAll.className = "soorajbutton";
        revealAll.innerHTML = "Reveal All";
        revealAll.style.float = "right"
        revealAll.onclick = function()
        {
            document.querySelectorAll( "#overdue-submissions .upcoming-list .revealable" ).forEach( el =>
            {
                el.classList.remove( 'hidden' );
                el.classList.remove( 'revealable' ); 
                if( !el.classList.contains('date-header' ) )
                {        
                    let href = el.querySelector( ".infotip a").href;
                    let id = href.slice( href.lastIndexOf("/") + 1);  
                    if( assignmentSettings[id] == undefined ) 
                    {
                        assignmentSettings[id] = {};
                    }   
                    assignmentSettings[id].hidden = false;
                }
            })
            updateLocalStorage();
        }
        document.querySelector( "#overdue-submissions .h3-med").appendChild( revealAll );
    }

    document.querySelectorAll( "#overdue-submissions .upcoming-list .upcoming-event" ).forEach( el =>{
        if( !el.classList.contains( "hidden") )
        {   
            let href = el.querySelector( ".infotip a").href;
            let id = href.slice( href.lastIndexOf("/") + 1);       
            if( id in assignmentSettings )
            {
                if( assignmentSettings[id].hidden )
                {
                    el.classList.add( "hidden" );
                    el.classList.add( "revealable" );
                    if( el.previousElementSibling.classList.contains( "date-header" ) )
                    {
                        el.previousElementSibling.classList.add( "hidden" );
                        el.previousElementSibling.classList.add( "revealable" );
                    }
                        
                }
            } 

            el.style.position = "relative";
            var cross = document.createElement( "button" );
            cross.className = "crossoverdue"
            cross.innerHTML = "&#10060;"
            cross.style.position = "absolute";
            cross.style.top = "0"
            cross.style.right= "0"
            cross.onclick = function()
            {
                el.classList.add( "hidden" );
                el.classList.add( "revealable" );
                if( el.previousElementSibling.classList.contains( "date-header" ) )
                {
                    el.previousElementSibling.classList.add( "hidden" );
                    el.previousElementSibling.classList.add( "revealable" );
                }
        
                assignmentSettings[id].hidden = true;

                updateLocalStorage();
            }
            
            el.appendChild( cross );
        }
    })


    document.querySelectorAll( ".upcoming-events .upcoming-list .upcoming-event, #course-events .upcoming-list .upcoming-event" ).forEach( el =>{
        // console.log( el )
        var href = el.querySelector( ".infotip a");
        if( href.href.includes( "assignment" ) ) {
            let id = href.href.slice( href.href.lastIndexOf("/") + 1);

            el.querySelector( ".infotip").style.position = "relative";
            var check = document.createElement( "input" );
            check.type = "checkbox";
            check.style.position = "absolute";
            check.style.top = "0"
            check.style.right= "0"
            check.checked = checkAssignment( el, href, id, false );

            check.onchange = function()
            {
                checkAssignment( el, href, id, true );
            }
            el.querySelector( ".infotip").appendChild( check );
        }
    });



}