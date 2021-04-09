
document.querySelector( '#center-top' ).innerHTML +=
`
<span>Current Semester: </span><input id = "thecurrentsem" type = "number" value = "${1}" min = "1" max = "3">
`

allCoursesGrades = []
letters = [
    { letter: "A", color: "#11dd00"},
    { letter: "B", color: "#aacc00"},
    { letter: "C", color: "	#ffff00"}, 
    { letter: "D", color: "	#ffc100"}, 
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

const processCourse = ( element ) =>
{
    var courseName = element.querySelector( '.sExtlink-processed' ).innerText;

    courseGrades = [];

    (( el ) => {
        cats = [];
        var course = {
            periods:[]
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
        })

        var periodNum = 0;
        var currentCat = null
        var maxPoints = 0;
        var awardedPoints = 0;
        var firstPer = true;
        var weighted = false;
        function addCat( cat )
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
                    el: currentCat,
                    maxPoints: maxPoints,
                    awardedPoints: awardedPoints,
                    percentage: percentage,
                    weightage: weightage
                });
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
            if( el.classList.contains( 'category-row' ) )
            {
                addCat( el );
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
                    addCat( el )
                    course.periods[periodNum].categories = cats.slice(0);
                    if( weighted )
                    {
                        var totalWeight = 0;
                        var weightedGrade = 0;
                        for( var c = 0; c < cats.length; c++ )
                        {
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

                        course.periods[periodNum].element.querySelector( ".comment-column .td-content-wrapper" ).innerHTML = perGrade + "%"
                        courseGrades.push( perGrade );
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
                        courseGrades.push( perGrade );
                    }

                    currentCat = null;
                    cats = []
                    periodNum++;
                }
                firstPer = false;
            }
        })
        addCat( el )
        course.periods[periodNum].categories = cats
    })( element.querySelector( '.gradebook-course-grades table tbody' ) )

    return { list: courseGrades, grade: getSemesterGrade( courseGrades, document.querySelector( "#thecurrentsem") ) };

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
        var courseGrade = getSemesterGrade( allCoursesGrades[index], parseInt(val) );

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
        allCoursesGrades.push( course.list );
        // console.log( "courses" );
    }
)

chrome.storage.sync.get(['cursem'], r => { 
    setSemesterGrade( r.cursem );
    document.querySelector( "#thecurrentsem" ).value = r.cursem 
})
