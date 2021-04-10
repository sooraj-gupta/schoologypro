
document.querySelector( '#center-top' ).innerHTML +=
`
<span>Current Semester: </span><input id = "thecurrentsem" type = "number" value = "${1}" min = "1" max = "3">
`

document.querySelector("#main-content-wrapper").style.width = "calc( 90% - 200px )"

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
var id = 0;
let courseNum = 0;
const processCourse = ( element ) =>
{
    var courseName = element.querySelector( '.sExtlink-processed' ).innerText;

    return (( el ) => {
        cats = [];
        var course = {
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
            el.setAttribute( "schoology-pro-id", id++ )
            if( el.classList.contains( 'category-row' ) )
            {
                addCat( el, periodNum, catNum );
                catNum++;
            }
            else if( el.classList.contains( 'item-row' ) )
            {
                let max = el.querySelector( '.grade-column .max-grade');
                let awarded = el.querySelector( '.grade-column .awarded-grade');
                if( max != null && awarded != null )
                {
                    maxPoints += parseFloat(max.innerText.replace(/[^0-9\.]+/g,""));
                    awardedPoints += parseFloat(awarded.innerText.replace(/[^0-9\.]+/g,""))
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
            letterAndNum = '–' 
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
            el.style.color = ( letterAndNum === "–" ? "" : letters[idx].color )
            element.querySelector( ".gradebook-course-title" ).appendChild( el );
        }
        index++;
    })
}

document.querySelector( "#thecurrentsem").onchange = ( ) =>
{
    setSemesterGrade( document.querySelector( "#thecurrentsem").value );
}

var courseslist = document.querySelectorAll( ".gradebook-course" );
courseslist.forEach(
    ( element ) => {
        var course = processCourse( element )
        let grades = []
        for( var c = 0; c < course.periods.length; c++ )
        {
            grades.push( course.periods[c].grade );
        }
        allCourses.push( course );
        courseNum++;
    }
)
courseNum = 0;

chrome.storage.sync.get(['cursem'], r => { 
    setSemesterGrade( r.cursem );
    document.querySelector( "#thecurrentsem" ).value = r.cursem 
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
            console.log( el.getAttribute('schoology-pro-ref').includes("n") );

            let addition = el.getAttribute('schoology-pro-ref').includes("n") ?  0 : period.addedCats

            let idx = parseInt(cat.getAttribute('cat-num')) + parseInt(addition)

            cats[ idx ].weightage = el.value;
            

            let totalWeight = 0;
            let weightedGrade = 0;


            for( c = 0; c < cats.length; c++ )
            {
                idx = parseInt(c) + parseInt(addition)
                if( cats[idx].weightage != -1 )
                {
                    let dec = cats[idx].weightage/100;
                    if( cats[c].maxPoints > 0 )
                    {
                        totalWeight += dec;
                        weightedGrade += cats[idx].percentage * dec;
                        console.log( totalWeight + " " + weightedGrade );
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
                        <img src="/sites/all/themes/schoology_theme/images/expandable-sprite.png" class="expandable-icon-grading-report" alt="">
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