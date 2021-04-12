
let completedMotivationalMessages = [
    {title: "Great Job!", message: "Great job on finishing all of your tasks!"},
    {title: "All done!", message: "You finished all your upcoming tasks. Amazing!"},
    {title: "You're done!", message: "You're done with your upcoming tasks. Great job!"},
    {title: "Lesss Gooo", message: "You just finished your tasks. HAAAH LESSS GOO "}
]



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

        chrome.storage.sync.get( "welcomed", r => {
            if(!r.welcomed )
            {
                pushNotif( "HAAAH LESS GOOO!", "Thank you for installing Schoology Pro by Sooraj Gupta. If you ever have any issues, questions, or concerns, please email soorajgupta04@gmail.com. Thank you!", 10000)
                chrome.storage.sync.set( { welcomed: true }, r=>{});
            }
        } )

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
                check.className = "pro-upcoming-checkbox"
                check.type = "checkbox";
                check.style.position = "absolute";
                check.style.top = "0"
                check.style.right= "0"
                check.checked = checkAssignment( el, href, id, false );

                check.onchange = function()
                {
                    checkAssignment( el, href, id, true );
                    let allChecked = true;
                    document.querySelectorAll( ".pro-upcoming-checkbox" ).forEach( el => {
                        if( !el.checked )
                            allChecked = false;
                    })
                    if( allChecked )
                    {
                        let motive = completedMotivationalMessages[ Math.floor( Math.random() * completedMotivationalMessages.length ) ];
                        pushNotif( motive.title, motive.message, 6000 );
                    }
                }
                el.querySelector( ".infotip").appendChild( check );
            }
        });

    }
    else
    {
        pushNotif( "Extension Conflict", "Please disable or remove any other Schoology related Chrome Extension to continue using Schoology Pro!", 6000 );
    }
}