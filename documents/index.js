module.exports = (data) =>{
    const waypoint = (i) => {
        let flag = true;
        let object;
        if (data.waypointArray[i]) {
            flag = false;
            object = data.waypointArray[i];
        }

        if (flag) {
            return `
            <tr>
                <td>-</td>
                <td>-</td>
                <td>-</td>
            </tr>
        `
        } else {
            return `
                <tr>
                    <td>${object.name}</td>
                    <td>${convertDMSLng(object.latitude)}</td>
                    <td>${convertDMSLng(object.longitude)}</td>
                </tr>
            `
        }
    };
    const hours = (i) => {
        let flag = true;
        let object;
        data.hourlyArray.map(h => {
            if(h.hour === i){
                flag = false;
                object = h
            }
        });
        if(flag){
            return `
            <tr>
            <th scope="row">${i}</th>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            </tr>
        `
        }else {
            return `
                     <tr>
                    <th scope="row">${i}</th>
                    <td>${object.compasCourse}°</td>
                    <td>${convertDMSLat(object.latitude)}</td>
                    <td>${convertDMSLng(object.longitude)}</td>
                    <td>${object.sailsState}</td>
                    <td>${object.engineState}</td>
                    <td>${object.boatSpeed}</td>
                    <td>${object.log}</td>
                    <td>${object.windDirection}</td>
                    <td>${object.windSpeed}</td>
                    <td>${object.seaState}</td>
                    </tr >
                `
        }
    }

    const weather = (table) => {
        let flag = true;
        let object;
        data.weatherArray.forEach(entry => {
            if(table.includes(entry.hour))
            {
                flag = false;
                object = entry;
            }
        })
        if (!flag) {
            return `
            ${object.temperature} °C <br/>
            ${object.pressure} hPa <br/>
            overcast: ${object.overcast} &#x2601; <br/>
            ${object.details}
            `
        }else{
            return ''
        }
    };
    const actionToIcon = (action) => {
        if (action === "leave")
            return `&#x27A1;`;
        if (action === "setSails" || action === "unreefSails" || action==="engineOff")
            return `&#x2B06;`;
        if (action === "dropSails" || action === "reef" || action ==="engineOn")
            return `&#x2B07;`;
        if (action === "tack")
            return `tack`;
        if (action === "gybe")
            return `gybe`;
        if (action === 'anchorDrop')
            return '<span style="font-size: 16px;"> &#x2693; </span>'
        if (action === 'mooring')
            return '<span style="font-size: 16px;">&#x27FF;</span>'
        if (action === 'mooringBuoy')
            return '<span style="font-size: 16px;">&#x235C;</span>'
        return '';
    }

    const actions = (data) => {
        let string = '';
        data.actionsArray.forEach(action => {
            const date = new Date(action.hour).toLocaleTimeString().split(":");
            if (action.actionType === 'other')
                string += `<span style="margin-right: 5px; margin-left: 20px;">${date[0]}:${date[1]}</span> ${action.details} <br/>`
            else
                string += `<span style="margin-right: 5px; margin-left: 20px;">${date[0]}:${date[1]}</span> <span style="color: rgb(28,144,227);"> ${actionToIcon(action.actionType)}</span>  ${action.details} <br/>`
        });
        return string;
    };

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <!-- Required meta tags -->
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;1,700&display=swap" rel="stylesheet">

        <!-- Bootstrap CSS -->
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css" integrity="sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk" crossorigin="anonymous">

        <title>logbook</title>

        <style>
        .leftBorder{
            border-left: 1px solid gray;
        }
        * {
            font-family: Roboto, arial;
            font-size: 10px;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-size: 10px;
            margin: 0;
            padding: 0;
            max-width: 8in;
        }
        .wrapper{
            position: relative;
        }
        .left {
            width: 4in;
            height: 100vh;
        }
        .right {
            position: absolute;
            width: 4in;
            top: 3px;
            left: 4in;
            margin: 3px;
            margin-top: 0px;
            padding: 3px
        }
        .date {
            display: inline-block;
        }
        .from,
        .to {
            display: inline-block;
            float: right;
        }
        .from{
            margin-right: 0.1in;
        }
        .tablecontainer{
            border: 1px solid black;
            border-radius: 3px;
            padding: 3px;
            margin: 3px;
            width: 4in;
            margin-bottom: 0px;
            margin-top: 0px;
            padding-bottom: 0px;
        }
        .header{
            padding: 3px;
            margin: 3px;
            width: 4in;
            margin-bottom: 0px;

        }
        th,
        tr,
        td {
            padding: 1px !important;
            text-align: center !important;
        }
        .strong{
            color: rgb(28,144,227);
            font-style: italic;
        }
        thead{
            font-style: italic;
            color: rgb(245,0,87);
        }
        th[scope]{
            color: gray;
            font-style: italic;
        }
        .tanksTable {
            border: 1px solid black;
            border-radius: 3px;
            padding: 3px;
            margin: 3px;
            width: 4in;
            height: 80px;
            position: relative;
      }
      .waypointTable{
            border: 1px solid black;
            border-radius: 3px;
            padding: 3px;
            margin: 3px;
            margin-top: 0px;
            width: 4in;
            height: 65px;
            position: relative;
      }
      .t1 {
        position: absolute;
        width: 1in;
        top: 3px;
        left: 3px;
      }
      .t2{
        position: absolute;
        width: 2.7in;
        top: 3px;
        right: 3px;
      }
        </style>
    </head>
    <body>
        <div class="wrapper">
        <div class="left">
            <div class="header">
                <span class="date">Date: <strong class="strong">${new Date(data.date).toLocaleDateString()}</strong></span>
                <span class="to">To: <strong class="strong">${data.endHarbor}</strong></span>
                <span class="from">From: <strong class="strong">${data.startHarbor}</strong></span>
            </div>
            <div class="tablecontainer">
                <table id="tablePreview" class="table">
                    <thead>
                        <tr>
                            <th>h.</th>
                            <th>course</th>
                            <th>latitude</th>
                            <th>longitude</th>
                            <th>sails</th>
                            <th>engine</th>
                            <th>kn.</th>
                            <th>log</th>
                            <th>wind</th>
                            <th>°B</th>
                            <th>sea~</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${hours(1)}
                        ${hours(2)}
                        ${hours(3)}
                        ${hours(4)}
                        ${hours(5)}
                        ${hours(6)}
                        ${hours(7)}
                        ${hours(8)}
                        ${hours(9)}
                        ${hours(10)}
                        ${hours(11)}
                        ${hours(12)}
                        ${hours(13)}
                        ${hours(14)}
                        ${hours(15)}
                        ${hours(15)}
                        ${hours(16)}
                        ${hours(17)}
                        ${hours(18)}
                        ${hours(19)}
                        ${hours(20)}
                        ${hours(21)}
                        ${hours(22)}
                        ${hours(23)}
                        ${hours(24)}
                    </tbody>
                </table>
            </div>

             <div class="tanksTable">
                        <div>
                                <table id="tablePreview" class="table t1">
                                    <tbody>
                                        <tr>
                                            <th class="strong">Mth</th>
                                            <td>${data.engineMth}</td>
                                        </tr>
                                        <tr>
                                            <th class="strong">oil check</th>
                                            <td>${data.oil ? "yes" : "no"}</td>
                                        </tr>
                                        <tr>
                                            <th class="strong">fuel</th>
                                            <td>${data.fuel}%</td>
                                        </tr>
                                        <tr>
                                            <th class="strong">water</th>
                                            <td>${data.freshWater}%</td>
                                        </tr>
                                    </tbody>
                                </table>
                        </div>
                        <div>
                                <table id="tablePreview" class="table t2">
                                    <thead>
                                        <tr>
                                            <th>Nautical miles</th>
                                            <th>hours at sea</th>
                                            <th>on Sails</th>
                                            <th>on Engine</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>${data.nauticalMiles}</td>
                                            <td>${floatToHoursPlusMinutes(data.travelHours)}</td>
                                            <td>${floatToHoursPlusMinutes(data.hoursSailedOnSails)}</td>
                                            <td>${floatToHoursPlusMinutes(data.hoursSailedOnEngine)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                        </div>
            </div>
        </div>
            <div class="right">
                <div class="waypointTable">

                                <table id="tablePreview" class="table t1">
                                   <tbody>
                                <tr>
                                    <th class="strong">Marina VHF</th>
                                    <td>${data.marinaVHF !== 0 ? data.marinaVHF : ' - '}</td>
                                </tr>
                                <tr>
                                    <th class="strong">Marina charges</th>
                                    <td>${data.marinaCharges !== '' ? data.marinaCharges : ' - '}</td>
                                </tr>
                            </tbody>
                                </table>

                                <table id="tablePreview" class="table t2">
                                    <thead>
                                        <tr>
                                            <th>Waypoint</th>
                                            <th>latitude</th>
                                            <th>longitude</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${waypoint(0)}
                                        ${waypoint(1)}
                                    </tbody>
                                </table>
                                </div>

                <div class="tablecontainer">
                                <table id="tablePreview" class="table">
                                    <thead>
                                        <tr>
                                            <th>actions</th>
                                            <th>weather</th>
                                            <th>h.</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td rowspan="24" align="left" style="vertical-align:middle;"> <p class="text-left">${actions(data)}</p></td>
                                            <td rowspan="4" style="vertical-align:middle"> ${weather([1,2,3,4])} </td>
                                            <th scope="row">1</th>
                                        </tr>
                                        <tr>
                                            <th scope="row">2</th>
                                        </tr>
                                        <tr>
                                            <th scope="row">3</th>
                                        </tr>
                                        <tr>
                                            <th scope="row">4</th>
                                        </tr>
                                        <tr>
                                            <td rowspan="4" style="vertical-align:middle">${weather([5,6,7,8])}</td>
                                            <th scope="row">5</th>
                                        </tr>
                                        <tr>
                                            <th scope="row">6</th>
                                        </tr>
                                        <tr>
                                            <th scope="row">7</th>
                                        </tr>
                                        <tr>
                                            <th scope="row">8</th>
                                        </tr>
                                        <tr>
                                            <td rowspan="4" style="vertical-align:middle">${weather([9,10,11,12])}</td>
                                            <th scope="row">9</th>
                                        </tr>
                                        <tr>
                                            <th scope="row">10</th>
                                        </tr>
                                        <tr>
                                            <th scope="row">11</th>
                                        </tr>
                                        <tr>
                                            <th scope="row">12</th>
                                        </tr>
                                        <tr>
                                            <td rowspan="4" style="vertical-align:middle">${weather([13, 14, 15, 16])}</td>
                                            <th scope="row">13</th>
                                        </tr>
                                        <tr>
                                            <th scope="row">14</th>
                                        </tr>
                                        <tr>
                                            <th scope="row">15</th>
                                        </tr>
                                        <tr>
                                            <th scope="row">16</th>
                                        </tr>
                                        <tr>
                                            <td rowspan="4" style="vertical-align:middle">${weather([17, 18, 19, 20])}</td>
                                            <th scope="row">17</th>
                                        </tr>
                                        <tr>
                                            <th scope="row">18</th>
                                        </tr>
                                        <tr>
                                            <th scope="row">19</th>
                                        </tr>
                                        <tr>
                                            <th scope="row">20</th>
                                        </tr>
                                        <tr>
                                            <td rowspan="4" style="vertical-align:middle">${weather([21, 22, 23, 24, 0])}</td>
                                            <th scope="row">21</th>
                                        </tr>
                                        <tr>
                                            <th scope="row">22</th>
                                        </tr>
                                        <tr>
                                            <th scope="row">23</th>
                                        </tr>
                                        <tr>
                                            <th scope="row">24</th>
                                        </tr>
                                    </tbody>
                                </table>
                </div>


            </div>
        </div>
    </body>
    </html>`
};


const convertDMSLat = (lat) => {
    var latitude = toDegreesMinutesAndSeconds(lat);
    var latitudeCardinal = lat >= 0 ? "N" : "S";
    return latitude + latitudeCardinal;
}
const convertDMSLng = (lng) => {
    var longitude = toDegreesMinutesAndSeconds(lng);
    var longitudeCardinal = lng >= 0 ? "E" : "W";
    return  longitude + longitudeCardinal;
}
function toDegreesMinutesAndSeconds(coordinate) {
    var absolute = Math.abs(coordinate);
    var degrees = Math.floor(absolute);
    var minutesNotTruncated = (absolute - degrees) * 60;
    var minutes = Math.floor(minutesNotTruncated);
    var seconds = Math.floor((minutesNotTruncated - minutes) * 60);

    return degrees + '°' + minutes + "'" + seconds + "''";
}
const floatToHoursPlusMinutes = (number) => {
    const hour = Math.floor(number);
    const minutes = number - hour;
    return hour + "h " + Math.round(60 * minutes) + "min"
}