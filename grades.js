var notifContainer = document.createElement( "div" );
notifContainer.className = "pro-notif-container";
document.body.appendChild( notifContainer );

const preventEnter = ( e ) =>
{
    console.log( e.keyCode );
    if( e.keyCode === 13 )
        e.preventDefault();   
}

const preventNonNumbers = ( e ) => 
{
    if( ( e.keyCode < 48 || e.keyCode > 57 ) && e.keyCode !== 8 && e.keyCode !== 39 && e.keyCode !== 37  )
        e.preventDefault();
}

const pushNotif = ( title, message, timeout ) =>
{
    const notifHeight = 100;
    setTimeout( () => { 
        var notif = document.createElement( "div" )
        notif.className = "pro-notif";
        notif.innerHTML = `
        <div class = "pro-icon-container">
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
            notifContainer.style.height = (notifContainer.style.height - notifHeight) + "px";
        }
        if( timeout )
        {
            setTimeout( () =>{
                notif.style.marginLeft = "400px";
                setTimeout( () => {notif.remove()}, 500 );
                notifContainer.style.height = (notifContainer.style.height - notifHeight) + "px";
            }, timeout );
        }
        setTimeout( () => {notif.style.marginLeft = "0px"}, 100 );
    }, 200 );
}


if( !document.querySelector( ".footer-text-enhanced-by" ) )
{
    document.querySelectorAll( ".expandable-icon-grading-report" ).forEach( el => { el.classList.add( "schoology-pro" ) } );


    document.querySelector( '#center-top' ).style.position = "relative";

    document.querySelector( '#center-top' ).innerHTML +=
    `<br>
    <span style = "padding-left: 29px; font-size: 12px">Current Semester: </span><input id = "thecurrentsem" class = "schoology-pro" type = "number" value = "${1}" min = "1" max = "3">
    <span class = "setting">
        <div class="cbx">
            <input id="compact" class = 'check' type="checkbox" />
            <label for="cbx"></label>
            <svg width="15" height="14" viewbox="0 0 15 14" fill="none">
                <path d="M2 8.36364L6.23077 12L13 2"></path>
            </svg>
        </div>
        Compact 
    </span>
    <span class = "setting">
        <div class="cbx">
            <input id="colorcode" class = 'check' type="checkbox" />
            <label for="cbx"></label>
            <svg width="15" height="14" viewbox="0 0 15 14" fill="none">
                <path d="M2 8.36364L6.23077 12L13 2"></path>
            </svg>
        </div>
        Color-code Grades 
    </span>
    `

    

    var revealAll = document.createElement( 'button' );
    revealAll.className = "soorajbutton";
    revealAll.innerHTML = "Reveal All";
    revealAll.style.position = "absolute";
    revealAll.style.bottom = "10px";
    revealAll.style.right = "0";
    revealAll.onclick = function()
    {
        document.querySelectorAll( ".revealablecourse" ).forEach( el => el.classList.remove( 'hidden' ) );
        deletedcourses = [];
        chrome.storage.sync.set( {"deletedcourses":deletedcourses}, r=>{});
    }
    document.querySelector( '#center-top' ).appendChild( revealAll );

    
    document.body.onclick = function()
    {
        document.querySelectorAll( ".courseoptions.show" ).forEach( el => el.classList.remove("show" ) );
    }

    document.querySelector("#main-content-wrapper").style.width = "calc( 100% - 300px )"
    document.querySelector("#main-content-wrapper").style.minHeight = "0px"
    document.querySelector("#container").style.display = "flex"
    document.querySelector("#container").style.justifyContent = "center"

    allCourses = []
    letters = [
        { letter: "A", color: "#11dd00"},
        { letter: "B", color: "#aacc00"},
        { letter: "C", color: "#ffff00"}, 
        { letter: "D", color: "#ffc100"}, 
        { letter: "F", color: "#ff0000"}
    ];


    const getOuterText = el =>
    {
        var child = el.firstChild, texts = [];
        while( child )
        {
            if( child.nodeType == 3 )
                texts.push( child.data )
            child = child.nextSibling
        }
        return texts.join("");
    }
    const getNonOuterText = el =>
    {
        var child = el.firstChild, texts = [];
        while( child )
        {
            if( child.nodeType != 3 )
            {
                return child;
            }
            child = child.nextSibling
        }
        // return texts.join("");
    }

    document.querySelector( "#compact" ).onchange = function()
    {
        chrome.storage.sync.set( {compact: this.checked }, r=>{} );
        document.body.classList.toggle( "compactgrades")
    }

    var id = 0;
    let courseNum = 0;
    const processCourse = ( element ) =>
    {
        var courseName = element.querySelector( '.sExtlink-processed' ).innerText;

        return (( el ) => {
            cats = [];
            var course = {
                name: courseName,
                periods:[],
            };

            el.querySelectorAll( ".period-row").forEach( per => {
                var period = {};
                period.element = ( per );
                period.name = getOuterText( per.querySelector( '.title-column .title' ) );
                var commentCol = per.querySelector( ".comment-column .td-content-wrapper" );
                var gradeCol = per.querySelector( ".grade-column .td-content-wrapper" );
                commentCol.innerHTML = ""
                gradeCol.innerHTML = "";
                commentCol.classList.add( 'grade-column');
                course.periods.push( period );
                per.querySelector('.comment-column').style.position = "relative";
            })

            var periodNum = 0;
            var catNum = 0;
            var currentCat = null
            var currentPer = null
            var maxPoints = 0;
            var awardedPoints = 0;
            var firstPer = true;
            var weighted = false;
            function addCat( cat, pNum, catNum )
            {
                if( currentCat != null )
                {
                    var weightage = -1;
                    if( currentCat.querySelector('.title-column .percentage-contrib') != null )
                    {
                        weightage = parseFloat( currentCat.querySelector('.title-column .percentage-contrib').innerText.slice( 1, -2 ) );
                        weighted = true;
                    }

                    var percentage = 0;
                    if ( maxPoints != 0 )
                        percentage = awardedPoints/maxPoints
                    cats.push({
                        name: getOuterText( currentCat.querySelector( '.title-column .title') ),
                        el: currentCat,
                        maxPoints: maxPoints,
                        awardedPoints: awardedPoints,
                        percentage: percentage,
                        weightage: weightage,
                        periodNum: pNum,
                        courseNum: courseNum,
                    });
                    currentCat.setAttribute( "cat-num", catNum - 1 )
                    currentCat.querySelector( ".grade-column .td-content-wrapper" ).innerHTML = `
                    <span class = "awarded-grade" >
                        <span class = "numeric-grade-value">${awardedPoints}</span>
                    </span>
                    <span class="max-grade"> / ${maxPoints}</span>
                    `;
                    let comment = currentCat.querySelector( ".comment-column .td-content-wrapper" );
                    comment.parentElement.classList.remove( 'comment-column' );
                    comment.parentElement.classList.add( 'grade-column' );
                    comment.innerHTML = `
                    <span class = "awarded-grade" style = "float:right" >
                        <span class = "numeric-grade-value">${parseInt( percentage * 10000 )/100}%</span>
                    </span>
                    `;
                }

                maxPoints = 0;
                awardedPoints = 0;
                currentCat = cat;

            }

            el.querySelectorAll( ".period-row, .category-row, .item-row" ).forEach( el =>
            {
                course.periods[periodNum].grades = []
                el.setAttribute( "schoology-pro-id", id )
                if( el.classList.contains( 'category-row' ) )
                {
                    addCat( el, periodNum, catNum );
                    catNum++;
                    let addItemRow = document.createElement( "tr" );
                    addItemRow.className = "report-row item-row pro-item-row"
                    addItemRow.setAttribute( "schoology-pro-id", "" );
                    addItemRow.setAttribute( "schoology-pro-ref", `${id}` );
                    addItemRow.innerHTML = `
                    <th scope="row" class="title-column clickable">
                        <div class = "reportSpacer-3">
                            <div class="td-content-wrapper">
                                <span class="title">
                                    <a class="sExtlink-processed pro-item">
                                        + Add Item
                                        <span class="visually-hidden">
                                            assignment
                                        </span>
                                    </a>
                                </span>
                            </div>
                        </div>
                    </th>
                    <td class="grade-column">
                            <div class="td-content-wrapper">
                            </div> 
                    </td>
                    <td class="comment-column">
                            <div class="td-content-wrapper">
                            </div>
                    </td>
                    `;
                    el.parentNode.insertBefore( addItemRow, el.nextSibling )
                    addItemRow.querySelector( ".pro-item" ).parentElement.parentElement.onclick = function()
                    {
                        console.log( allCourses ); 
                        let newItemRow = document.createElement( "tr" );
                        newItemRow.className = "report-row item-row pro-item-row"
                        newItemRow.setAttribute( "schoology-pro-id", "" );
                        newItemRow.setAttribute( "schoology-pro-ref", `${id}` );
                        newItemRow.innerHTML = `
                        <th scope="row" class="title-column pro-item-title-container">
                            <div class = "reportSpacer-3">
                                <div class="td-content-wrapper">
                                    <span class="title">
                                        <a class="sExtlink-processed pro-item-title" contenteditable style = "outline:none; border-bottom: 1px solid dodgerblue; padding: 0px 4px; text-decoration: none ">
                                            New Assignment
                                        </a>
                                    </span>
                                </div>
                            </div>
                        </th>
                        <td class="grade-column">
                            <div class="td-content-wrapper">
                                <span class="awarded-grade">
                                    <span class="numeric-grade-value">
                                        <span class="rounded-grade" contenteditable style = "border-bottom: 1px solid dodgerblue; padding: 0px 4px;" >0</span>
                                    </span>
                                </span>
                                <span class="max-grade"> 
                                     / <span class = "pro-max-grade" style = "border-bottom: 1px solid dodgerblue; padding: 0px 4px;" contenteditable>0</span>
                                </span>
                            </div>
                        </td>
                        <td class="comment-column">
                            <div class="td-content-wrapper">
                                <span class = "pro-removethis" style = "float:right">
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                        fill-rule="evenodd"
                                        clip-rule="evenodd"
                                        d="M17 5V4C17 2.89543 16.1046 2 15 2H9C7.89543 2 7 2.89543 7 4V5H4C3.44772 5 3 5.44772 3 6C3 6.55228 3.44772 7 4 7H5V18C5 19.6569 6.34315 21 8 21H16C17.6569 21 19 19.6569 19 18V7H20C20.5523 7 21 6.55228 21 6C21 5.44772 20.5523 5 20 5H17ZM15 4H9V5H15V4ZM17 7H7V18C7 18.5523 7.44772 19 8 19H16C16.5523 19 17 18.5523 17 18V7Z"
                                        fill="currentColor"
                                        />
                                        <path d="M9 9H11V17H9V9Z" fill="currentColor" />
                                        <path d="M13 9H15V17H13V9Z" fill="currentColor" />
                                    </svg>
                                </span>
                            </div>
                        </td>
                        `;
                        addItemRow.parentNode.insertBefore( newItemRow, addItemRow.nextSibling )

                        newItemRow.querySelector( ".rounded-grade" ).onkeydown = ( e ) => { preventEnter(e); preventNonNumbers(e); } 
                        newItemRow.querySelector( ".pro-max-grade" ).onkeydown = ( e ) => { preventEnter(e); preventNonNumbers(e); } 

                        newItemRow.querySelector( ".rounded-grade" ).oninput = () => 
                        {
                            console.log( courseNum );
                        }

                        newItemRow.querySelector( ".pro-item-title" ).onkeydown = ( e ) => { preventEnter(e); } 

                        newItemRow.querySelector( ".pro-removethis" ).onclick = ( el ) => { newItemRow.remove() };
                    }

                    if( el.classList.contains( "childrenCollapsed" ) || !el.classList.contains( "has-children" ) )
                        addItemRow.classList.add( "hidden" )
                    el.onclick = () => {
                        if( el.classList.contains( "childrenCollapsed" ) )
                            addItemRow.classList.add( "hidden" )
                        else
                            addItemRow.classList.remove( "hidden" )
                    }
                    
                }
                else if( el.classList.contains( 'item-row' ) )
                {
                    let max = el.querySelector( '.grade-column .max-grade');
                    let awarded = el.querySelector( '.grade-column .awarded-grade');
                    if( max != null && awarded != null )
                    {
                        maxPoints += parseFloat(max.innerText.replace(/[^0-9\.]+/g,""));
                        max.innerHTML += `<span class = "pro-max-grade" style = "border-bottom: 1px solid dodgerblue; padding: 0px 4px;" contenteditable>${max.innerText.slice( 2 ).trim()}</span>`;
                        let innerEl = getNonOuterText( max );
                        max.innerHTML = " /";
                        max.appendChild( innerEl ); 
                        let score = parseFloat(awarded.innerText.replace(/[^0-9\.]+/g,""));
                        awardedPoints += score
                        awarded.innerHTML = `<span class = "rounded-grade" style = "border-bottom: 1px solid dodgerblue; padding: 0px 4px;" contenteditable>${score}</span>`;

                        awarded.querySelector( ".rounded-grade" ).onkeydown = ( e ) => { preventEnter(e); preventNonNumbers(e); } 
                        max.querySelector( ".pro-max-grade" ).onkeydown = ( e ) => { preventEnter(e); preventNonNumbers(e); } 
                    }
                }
                else if( el.classList.contains( 'period-row' ) )
                {

                    if( !firstPer )
                    {
                        addCat( el, periodNum, catNum )
                        course.periods[periodNum].categories = cats.slice(0);
                        if( weighted )
                        {
                            var weightsGUI = document.createElement( "div" );
                            weightsGUI.className = "weightsguicontainer";
                            var totalWeight = 0;
                            var weightedGrade = 0;
                            for( var c = 0; c < cats.length; c++ )
                            {
                                if( cats[c].weightage != -1 )
                                {
                                    let container = document.createElement( "div");
                                    container.className = "container";
                                    container.innerHTML = `<span class = "name">${cats[c].name}</span>`
                                    let input = document.createElement( "input" );
                                    input.className = "changeweight"
                                    input.type = 'number'
                                    input.setAttribute( "value", `${cats[c].weightage}` )
                                    input.setAttribute("schoology-pro-ref", cats[c].el.getAttribute( 'schoology-pro-id' ))
                                    input.setAttribute("period-num", periodNum );
                                    input.setAttribute("course-num", courseNum );
                                    container.appendChild( input );
                                    container.innerHTML += "%";

                                    weightsGUI.appendChild( container );
                                    let dec = cats[c].weightage/100;
                                    if( cats[c].maxPoints > 0 )
                                    {
                                        totalWeight += dec;
                                        weightedGrade += cats[c].percentage * dec;
                                    }
                                }
                            }

                            weightsGUI.innerHTML = "<div class = 'weights'>" + weightsGUI.innerHTML + "</div>"

                            let container = document.createElement( "div");
                            container.className = "container";
                            let button = document.createElement( "button" );
                            button.className = "soorajbutton addcategory";
                            button.style.backgroundColor = "#fff";
                            button.innerHTML = "Add Category";
                            button.setAttribute("period-num", periodNum );
                            button.setAttribute("course-num", courseNum );
                            container.appendChild( button )
                            weightsGUI.appendChild( container )

                            // input.setAttribute("schoology-pro-ref", cats[c].el.getAttribute( 'schoology-pro-id' ))
                            // input.setAttribute("period-num", periodNum );
                            // input.setAttribute("course-num", courseNum );

                            weightsGUI.innerHTML = "<div class = 'weightsgui'>" + weightsGUI.innerHTML + "</div>"
                            currentPer.querySelector('.comment-column').appendChild( weightsGUI );

                            var perGrade = (() =>
                            {
                                if( totalWeight > 0 )
                                    return parseInt( ( weightedGrade / totalWeight ) * 10000 ) / 100
                                return 0;
                            })()

                            course.periods[periodNum].element.querySelector( ".comment-column .td-content-wrapper" ).innerHTML = perGrade + "%"
                            course.periods[periodNum].grade =  perGrade 
                            course.periods[periodNum].element.querySelector(".title-column .td-content-wrapper").innerHTML += `
                            <span class = 'purple'>WEIGHTED</span>
                            `
                        }
                        else
                        {
                            let awarded = 0;
                            let max = 0;
                            for( var c = 0; c < cats.length; c++ )
                            {
                                awarded += cats[c].awardedPoints;
                                max += cats[c].maxPoints;
                            }
                            var perGrade = (() =>
                            {
                                if( max > 0 )
                                    return parseInt( ( awarded / max ) * 10000 ) / 100
                                return 0;
                            })()
                            course.periods[periodNum].element.querySelector( ".comment-column .td-content-wrapper" ).innerHTML = perGrade + "%"
                            course.periods[periodNum].grade = perGrade
                        }
                        currentCat = null;
                        cats = []
                        catNum = 0;
                        periodNum++;
                    }
                    currentPer = el;
                    firstPer = false;
                }
                id++
            })
            addCat( el, periodNum, catNum )
            course.periods[periodNum].categories = cats
            return course;
        })( element.querySelector( '.gradebook-course-grades table tbody' ) )

    }

    function getSemesterGrade( gradeList, sem )
    {
        let semIdx = sem - 1;
        if( semIdx >= gradeList.length )
        {
            return gradeList[gradeList.length - 1];
        }
        if( semIdx < 0 )
        {
            return gradeList[ 0 ];
        }
        return gradeList[semIdx];
    }

    function setSemesterGrade( val )
    {
        chrome.storage.sync.set( { cursem: val }, r=>{})
        var index = 0;
        document.querySelectorAll( ".gradebook-course" ).forEach( ( element ) =>
        {   
            var len = allCourses[index].periods.length;
            grades = [];
            for( var i = 0; i < len; i++ ){
                
                grades.push( allCourses[index].periods[i].grade )
            }

            var courseGrade = getSemesterGrade( grades, parseInt(val) );

            var letterAndNum = "";
            var idx = 4;
            if( courseGrade == undefined ||courseGrade == 0 )  
            {
                letterAndNum = '???' 
            }
            else
            {
                if( courseGrade >= 98 ) 
                    letterAndNum += '&#128293; &nbsp;';
                if( courseGrade >= 90 )
                    idx = 0;
                if( courseGrade < 90 )
                    idx = 1;
                if( courseGrade < 80 )
                    idx = 2;
                if( courseGrade < 70 )
                    idx = 3
                if( courseGrade < 60 )
                    idx = 4
                letterAndNum += letters[idx].letter + " " + courseGrade + "%";
            }

            if( element.querySelector(".grade") != null  )
            {
                element.getElementsByClassName("grade")[0].innerHTML = `${letterAndNum}`;
            }
            else
            {
                var el = document.createElement("div");
                el.className = 'grade';
                el.innerHTML = `${letterAndNum}`;
                el.style.color = ( letterAndNum === "???" ? "" : letters[idx].color )
                el.style.marginRight = "20px";
                element.querySelector( ".gradebook-course-title" ).appendChild( el );
            }
            index++;
        })
    }

    document.querySelector( "#thecurrentsem").onchange = ( ) =>
    {
        pushNotif( "Semester Changed!", "Reload the page for color coding changes to take effect", 6000 )
        setSemesterGrade( document.querySelector( "#thecurrentsem").value );
    }

    function partial(func /*, 0..n args */) {
        var args = Array.prototype.slice.call(arguments, 1);
        return function() {
            var allArguments = args.concat(Array.prototype.slice.call(arguments));
            return func.apply(this, allArguments);
        };
    }

    var courseslist = document.querySelectorAll( ".gradebook-course" );
    let deletedcourses = [];
     courseslist.forEach(
        ( element ) => {

            element.style.position  = "relative";
            element.setAttribute( "courseID", `${courseNum }` );

            var div = document.createElement( "span" );
            div.className = "courseoptions schoology-pro"

            var options = [
                {
                    name: "Hide Course",
                    click: function( courseNum )
                    {
                        document.querySelector( `[courseID="${courseNum}"]`).classList.add( "hidden")
                        document.querySelector( `[courseID="${courseNum}"]`).classList.add( "revealablecourse")
                        key = "courseID"+courseNum;
                            deletedcourses.push( key );
                        chrome.storage.sync.set( {"deletedcourses":deletedcourses }, r=>{  })
                    }
                }
            ]

            for( var i = 0; i < options.length; i++ )
            {
                var option = document.createElement( "span" );
                option.className = "courseoption schoology-pro"
                option.onclick = partial( options[i].click, courseNum );
                option.innerHTML = `${options[i].name}`
                div.appendChild( option );
            }

            element.classList.add( "schoology-pro" );
            element.querySelector( ".gradebook-course-grades" ).classList.add( "schoology-pro" );
            var span = document.createElement( "span" )
            span.className = "courseoptionsbutton schoology-pro"
            span.innerHTML = "???";
            span.style.cssText += ";position: absolute; top: 0; right: 0; font-size: 20px; top: 49%; transform: translateY( -50% )";
            span.onclick = function( e )
            {
                document.querySelectorAll( ".courseoptions.show" ).forEach( el => el.classList.remove("show" ) );
                div.classList.toggle( "show" );
                e.stopPropagation();
            }
            element.querySelector( ".gradebook-course-title").style.position = "relative";
            element.querySelector( ".gradebook-course-title").appendChild( span );
            element.querySelector( ".gradebook-course-title").appendChild( div );


            var course = processCourse( element )
            allCourses.push( course );
            console.log( courseNum )
            courseNum++;
        }
    )

    let orderPopup = document.createElement( "div" );
    orderPopup.className = "pro-order-popup"
    for( let i = 0; i < allCourses.length; i++ )
    {
        let c = document.createElement( "div" );
        c.className = 'pro-order-popup-course';
        c.innerHTML = 
        `
        <div class = 'pro-arrows'>
            <span class = "up-arrow"></span>
            <span class = "down-arrow"></span>
        </div>
        <div class = 'pro-course-name'>${allCourses[i].name}</div>
        `;
        orderPopup.appendChild( c );
    }
    document.body.appendChild( orderPopup );
    var changeOrder = document.createElement( 'button' );
    changeOrder.className = "soorajbutton";
    changeOrder.innerHTML = "Change Course Order";
    changeOrder.style.position = "absolute";
    changeOrder.style.bottom = "10px";
    changeOrder.style.right = "75px";
    changeOrder.onclick = function()
    {
        
    }
    document.querySelector( '#center-top' ).appendChild( changeOrder );
    

    courseNum = 0;
    chrome.storage.sync.get( ['compact'], r=>{
        if( r.compact )
        {
            document.body.classList.add( "compactgrades")
            document.querySelector( "#compact" ).checked = true;
        }
    })
    chrome.storage.sync.get(['cursem'], r => { 
        setSemesterGrade( r.cursem );
        document.querySelector( "#thecurrentsem" ).value = r.cursem 
    })
    chrome.storage.sync.get( ['deletedcourses'], r=>{
        if( r.deletedcourses )
        {
            console.log( r )
            for( var i = 0; i < r.deletedcourses.length; i++ )
            {
                console.log( r.deletedcourses[i].slice(8) );
                let id = r.deletedcourses[i].slice(8);
                document.querySelector( `[courseID="${id}"]`).classList.add( "hidden")
                document.querySelector( `[courseID="${id}"]`).classList.add( "revealablecourse")
                deleted = r.deletedcourses;
            }
        }
    })


    const updateWeights = () => {

        document.querySelectorAll( ".changeweight").forEach( el => {
            el.onchange = function()
            {
                let cat = document.querySelector( `[schoology-pro-id="${el.getAttribute('schoology-pro-ref')}"]`)
                cat.querySelector( ".percentage-contrib").innerHTML = `(${el.value}%)`
                var period = allCourses[el.getAttribute('course-num')].periods[el.getAttribute('period-num')];
                period.addedCats = period.addedCats ? period.addedCats : 0;
                let cats = period.categories;

                let addition = el.getAttribute('schoology-pro-ref').includes("n") ?  0 : period.addedCats

                let idx = parseInt(cat.getAttribute('cat-num')) + parseInt(addition)

                cats[ idx ].weightage = el.value;
                

                let totalWeight = 0;
                let weightedGrade = 0;


                for( c = 0; c < cats.length; c++ )
                {
                    console.log( c );
                    if( cats[c].weightage != -1 )
                    {
                        let dec = cats[c].weightage/100;
                        if( cats[c].maxPoints > 0 )
                        {
                            totalWeight += dec;
                            weightedGrade += cats[c].percentage * dec;
                        }
                    }
                }
                var perGrade = (() =>
                {
                    if( totalWeight > 0 )
                        return parseInt( ( weightedGrade / totalWeight ) * 10000 ) / 100
                    return 0;
                })()
                period.element.querySelector( ".comment-column .td-content-wrapper" ).innerHTML = perGrade + "%"
                period.grade = perGrade 
            }
        })
    }
    updateWeights();

    let newId = 0;
    document.querySelectorAll( ".addcategory").forEach( el => {
        el.onclick = function()
        {
            let courseNum = el.getAttribute('course-num');
            let periodNum = el.getAttribute('period-num');
            var period = allCourses[courseNum].periods[periodNum];
            period.addedCats = period.addedCats ? period.addedCats + 1 : 1;
            console.log( period.addedCats );

            period.element.insertAdjacentHTML( "afterend", `
            <tr tabindex="0"  class="report-row category-row has-children" schoology-pro-id="n${newId}" cat-num="${0}">
                <th scope="row" class="title-column clickable" tabindex="0">
                    <div class="reportSpacer-2">
                        <div class="td-content-wrapper">
                            <img src="/sites/all/themes/schoology_theme/images/expandable-sprite.png" class="expandable-icon-grading-report schoology-pro" alt="">
                            <span class="title">New Category</span> 
                            <span class="percentage-contrib">(0%)</span>
                        </div>
                    </div>
                </th>
                <td class="grade-column">
                    <div class="td-content-wrapper">
                        <span class="awarded-grade">
                            <span class="numeric-grade-value">0</span>
                        </span>
                        <span class="max-grade"> / 0</span>
                    </div>
                </td>
                <td class="grade-column">
                    <div class="td-content-wrapper">
                        <span class="awarded-grade" style="float:right">
                            <span class="numeric-grade-value">0%</span>
                        </span>
                    </div>
                </td>
            </tr>`)

            let cats = period.categories;
            
            let cat = document.querySelector( `[schoology-pro-id="n${newId}"]`)


            var weightage = -1;
            if( cat.querySelector('.title-column .percentage-contrib') != null )
            {
                weightage = parseFloat( cat.querySelector('.title-column .percentage-contrib').innerText.slice( 1, -2 ) );
                weighted = true;
            }

            cats.unshift({
                name: getOuterText( cat.querySelector( '.title-column .title') ),
                el: cat,
                maxPoints: 0,
                awardedPoints: 0,
                percentage: 0,
                weightage: 0,
                periodNum: periodNum,
                courseNum: courseNum,
            });

            let container = document.createElement( "div");
            container.className = "container";
            container.innerHTML = `<input class = "newcatinput" value = "New Category" />`
            let input = document.createElement( "input" );
            input.className = "changeweight"
            input.type = 'number'
            input.setAttribute( "value", `0` )
            input.setAttribute("schoology-pro-ref", "n"+ newId)
            input.setAttribute("period-num", periodNum );
            input.setAttribute("course-num", courseNum );
            container.appendChild( input );
            container.innerHTML += "%";
            period.element.querySelector( '.weightsgui .weights' ).appendChild( container );
            updateWeights();
            newId++;
        }
})
}
else
{
    pushNotif( "Extension Conflict", "Please disable or remove any other Schoology related Chrome Extension to continue using Schoology Pro!", 6000 );
}
