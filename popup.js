let settings = JSON.parse( window.localStorage.getItem( "pro-settings" ) );
if( !settings ) 
    settings = {

    };

const setSettings = () =>
{
    window.localStorage.setItem( "pro-settings", JSON.stringify( settings ));
}

function $ ( query, source )
{
    if( source )
        return source.querySelector( query );
    return document.querySelector( query )
} 

function $$ ( query, source )
{
    if( source )
        return source.querySelectorAll( query );
    return document.querySelectorAll( query )
} 

let subdomain = window.localStorage.getItem( "pro-subdomain" );
if( subdomain !== undefined )
{
    document.querySelectorAll( '.canbehidden' ).forEach( el => el.classList.remove("hidden") );
    document.getElementById( 'subdomain' ).innerHTML = subdomain
}


const setSubdomian = ( elem ) =>
{
    if( elem.innerHTML )
    {
        subdomain = elem.innerHTML;
        document.querySelectorAll( '.canbehidden' ).forEach( el => el.classList.remove("hidden") );
        window.localStorage.setItem( "pro-subdomain", elem.innerHTML );
    }
    else
    {
        window.localStorage.setItem( "pro-subdomain", "" );
        document.querySelectorAll( '.canbehidden' ).forEach( el => el.classList.add("hidden") );
    }
}

$('#subdomain').addEventListener('keydown', (evt) => {
    if (evt.keyCode === 13) {
        evt.preventDefault();
    }
    setSubdomian( evt.target );
});

$( '#subdomain' ).addEventListener( "keyup", (evt) => {
    setSubdomian( evt.target );
})
$( '#subdomain' ).addEventListener( "mouseup",(evt) => {
    setSubdomian( evt.target );
})
$( '#subdomain' ).addEventListener( "copy" ,(evt) => {
    setSubdomian( evt.target );
})
$( '#subdomain' ).addEventListener( "paste" ,(evt) => {
    setSubdomian( evt.target );
})

$("#home").onclick = function()
{
    if( subdomain )
        chrome.tabs.create({'url': `https://${subdomain.trim()}.schoology.com`}, function(tab) {});
    else
        chrome.tabs.create({'url': `https://schoology.com`}, function(tab) {});
}

$("#grades").onclick = function()
{
    if( subdomain )
        chrome.tabs.create({'url': `https://${subdomain.trim()}.schoology.com/grades/grades`}, function(tab) {});
    else
        chrome.tabs.create({'url': `https://schoology.com`}, function(tab) {});
}
$("#lessgo").onclick = function()
{
    chrome.tabs.create({'url': `https://www.youtube.com/watch?v=KvuQNNVrbtM`}, function(tab) {});
  
}

$$('.check').forEach( el => {

    if( settings[el.id] )
    {
        if( settings[el.id].checked )
        {
            el.checked = true;
        }
        if( settings[el.id].checked && el.id === "dababy")
        {
            $$('.dababy' ).forEach( el => el.classList.remove("hidden") );
        }
    }
    
    el.onchange = function()
    {
        if ( !settings[el.id] )
        {
            settings[el.id] = {};
            settings[el.id].checked = true;
        }
        else
        {
            settings[el.id].checked = !settings[el.id].checked ;
        }
        if(el.id === "dababy" )
        {
            if ( settings[el.id].checked )
                $$('.dababy' ).forEach( el => el.classList.remove("hidden") );
            else 
                $$('.dababy' ).forEach( el => el.classList.add("hidden") );
        }
        setSettings();
    }
})