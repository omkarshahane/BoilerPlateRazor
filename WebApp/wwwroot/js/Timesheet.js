
function upsertTimeEntry(form) {

    event.preventDefault();
    //console.log(form)
    const formData = new FormData(form);

    // Get the anti-forgery token
    const token = $('input[name="__RequestVerificationToken"]').val();
    if (!token) {
        //console.error('Anti-forgery token not found');
        return;
    }

    var weekStartingDate = $('#calendar__date').text();


    const dataWeekValue = $('.ec-day-btn.active').attr('data-week-value');
    if (dataWeekValue) {
        $('.EntryDateValue').val(dataWeekValue);

    } else {
        event.preventDefault();
        alert('Please select a week date.');
    }
    // Convert FormData to URL-encoded format

    const formBody = new URLSearchParams();
    formData.forEach((value, key) => {
        if (key === 'EntryDateValue') {
            value = $('.EntryDateValue').val(); // Get the correct value
        }
        if (key === 'createTimeEntryRequest.IsOnCall') {
            value = $('#onCall').prop('checked'); // Assuming it's a checkbox
        }

        if (key === 'createTimeEntryRequest.IsWorkingAway') {
            value = $('#workingAway').prop('checked'); // Assuming it's a checkbox
        }

        if (key === 'createTimeEntryRequest.IsBreakFastClaim') {
            value = $('#breakfastClaim').prop('checked'); // Assuming it's a checkbox
        }

        if (key === 'createTimeEntryRequest.IsEveningMealClaim') {
            value = $('#eveningMealClaim').prop('checked'); // Assuming it's a checkbox
        }
        if (key === 'createTimeEntryRequest.IsPerformedEscalatorTest') {
            value = $('#escalatorTest').prop('checked');
        }


        formBody.append(key, value);
    });

    var dateParam = new Date().toISOString(); // Example: Send current date as ISO string
    formBody.append("weekStartingDate", weekStartingDate); // 

    //console.log(formBody.toString())
    // Send the data to the server
    $.ajax({
        url: '/Timesheet?handler=UpsertTimeEntry',
        type: 'POST',
        data: formBody.toString(), // Send as URL-encoded form data
        contentType: 'application/x-www-form-urlencoded', // Required for form submission
        headers: {
            'RequestVerificationToken': token
        },
        success: function (response) {
            if (response != null && response != "") {
                var activeLink = $("a.active");

                activeLink[0].setAttribute("timeSheetId", response.timesheetId);

                $('.add-time-travel').removeClass('open');
                $('.add-time-break').removeClass('open');
                $('.add-time-site').removeClass('open');
                $('.add-time-holiday').removeClass('open');
                $('.add-time-sickness').removeClass('open');
                $('.add-time-unpaid-leave').removeClass('open');
                $('.add-time-standby').removeClass('open');

                $('.add-time').removeClass('open');


                if (response.success) {
                    //console.log(response);
                    // Get the current selected date and details
                    const currentDay = $('#day').val();
                    const currentTimesheetId = $('#TimesheetId').val();
                    const currentEntryDate = dataWeekValue; // Using the dataWeekValue from form submission
                    //const currentEntryDate = entryTime; // Using the dataWeekValue from form submission

                    // Update the hours display
                    $(".ec-day-btn.active + .bodySmallBold").text(response.totalHours);
                    $(".ec-day-btn.active + [data-day-hours='day-hours']").attr('hoursDisplay', response.totalHours);
                    $('#WeekHours').text(response.totalWeeklyHours + 'hrs');
                    //alert(response.totalHours)
                    // First load the allowances for the current day
                    loadAllowances(
                        currentDay,
                        response.timesheetId,
                        response.totalHours,
                        currentEntryDate
                    );

                    // Then calculate weekly hours
                    //CalculateWeeklyHours(false);
                    DisplaySuccessMessage("Success!! TimeEntry Saved");




                } else {

                    //alert('Error: ' + (response.message || 'Failed to update time entries'));
                    if (response.errors != null)
                        response.errors.forEach(error => DisplayErrorMessage(error));
                    else
                        DisplayErrorMessage(response.errors);

                }
            }
        },
        error: function (xhr, status, error) {
            console.error('Error:', error);
            //alert('An error occurred while updating time entries. Please check the console for details.');
            DisplayErrorMessage("An unexpected error occurred.");
        }
    });
}

//function initializeTimePickerNew(startSelector, startOutput, endSelector, endOutput) {
//    // Get values from input fields
//    let startTime = $(startOutput).val();
//    let endTime = $(endOutput).val();

//    // Convert 12-hour format to "HH:mm" with leading zeros
//    function formatTime(time) {
//        // Remove AM/PM and trim spaces
//        let cleanTime = time.replace(/ AM| PM/, "").trim();
//        // Split hours and minutes
//        let [hours, minutes] = cleanTime.split(':');
//        // Add leading zero if needed
//        hours = hours.padStart(2, '0');
//        // Return formatted time
//        return `${hours}:${minutes}`;
//    }

//    let formattedStartTime = formatTime("00:00");
//    let formattedEndTime = formatTime("00:00");
//    //$(startSelector).simpleTimePicker("remove")
//    // Initialize Start Time Picker
//    $(startSelector).simpleTimePicker({
//        css: "body timepicker-dropdown",
//        output: startOutput,
//        interval: 15,
        
//        onSelect: function (el, time) {
//            $(endSelector).simpleTimePicker("setMin", time);
//        },
//    });

//    // Set initial time for Start Time Picker
//    $(startSelector).simpleTimePicker("setTime", formattedStartTime);
//    //$(endSelector).simpleTimePicker("remove")
//    // Initialize End Time Picker
//    $(endSelector).simpleTimePicker({
//        css: "body timepicker-dropdown",
//        output: endOutput,
//        interval: 15,
//        onSelect: function (el, time) {
//            $(startSelector).simpleTimePicker("setMax", time);
//        },
//    });

//    // Set initial time for End Time Picker
//    $(endSelector).simpleTimePicker("setTime", formattedEndTime);
//}

function setUnpaidLeave(unpaidLeaveId, Id, dayType) {
    let dayTypeValue = ""; // Default empty value
    if (dayType.toLowerCase() == "halfday") {
        $('input[name="unpaid-leave"][value="HalfDay"]').prop('checked', true);
        dayTypeValue = "HalfDay";
    }
    if (dayType.toLowerCase() == "fullday") {
        $('input[name="unpaid-leave"][value="FullDay"]').prop('checked', true);
        dayTypeValue = "FullDay";
    }
    //set fields to update
    $('#unpaidLeaveEntryRequest_Id').val(Id);
    //set time to input fields
    $('.dayTypeName').val(dayTypeValue);
    $('.add-time-unpaid-leave').addClass('open');
}
function setStandby(standById, Id, dayType) {
    let dayTypeValue = ""; // Default empty value

    if (dayType.toLowerCase() == "halfday") {
        $('input[name="standby"][value="HalfDay"]').prop('checked', true);
        dayTypeValue = "HalfDay";
    }
    if (dayType.toLowerCase() == "fullday") {
        $('input[name="standby"][value="FullDay"]').prop('checked', true);
        dayTypeValue = "FullDay";
    }
    //set fields to update
    $('#standbyEntryRequest_Id').val(Id);
    //set time to input fields
    $('.dayTypeName').val(dayTypeValue);
    $('.add-time-standby').addClass('open');

}
function setSickness(sicknessId, Id, dayType) {
    let dayTypeValue = ""; // Default empty value
    if (dayType.toLowerCase() == "halfday") {
        $('input[name="sickness"][value="HalfDay"]').prop('checked', true);
        dayTypeValue = "HalfDay";
    }
    if (dayType.toLowerCase() == "fullday") {
        $('input[name="sickness"][value="FullDay"]').prop('checked', true);
        dayTypeValue = "FullDay";
    }

    //set fields to update
    $('#sicknessEntryRequest_Id').val(Id);
    //set time to input fields
    $('.dayTypeName').val(dayTypeValue);
    $('.add-time-sickness').addClass('open');
}
function setHoliday(holidayId, Id, dayType) {
    let dayTypeValue = ""; // Default empty value
    if (dayType.toLowerCase() == "halfday") {
        $('input[name="holiday"][value="HalfDay"]').prop('checked', true);
        dayTypeValue = "HalfDay";
    }
    if (dayType.toLowerCase() == "fullday") {
        $('input[name="holiday"][value="FullDay"]').prop('checked', true);
        dayTypeValue = "FullDay";
    }

    //set fields to update
    $('#holidayEntryRequest_Id').val(Id);
    //set time to input fields
    $('.dayTypeName').val(dayTypeValue);
    $('.add-time-holiday').addClass('open');
}
function removeSeconds(time) {
    // Split the time into hours, minutes, and seconds
    let [hours, minutes] = time.split(":");
    // Return the time without seconds
    return `${hours}:${minutes}`;
}
function SetSite(Id, IsPerformedEscalatorTest, SiteAddress) {
    // Convert the value to lowercase and compare
    IsPerformedEscalatorTest = (IsPerformedEscalatorTest.toLowerCase() === "true");
    var start = removeSeconds($('#_Starttime_' + Id).val());
    var end = removeSeconds($('#_Endtime_' + Id).val());
    initializeTimePicker(
        `#addStartTimeSite`,
        `#addEndTimeSite`,
        `#_Starttime_` + Id,
        `#_Endtime_` + Id

    );
    //set fields to update
    $('#siteEntryRequest_Id').val(Id);

    //set time to input fields
    $('#addStartTimeSite_hide').val(start);
    $('#addEndTimeSite_hide').val(end);

    document.getElementById("escalatorTest").checked = IsPerformedEscalatorTest;
    document.getElementById("site-address").value = SiteAddress;
    $('.add-time-site').addClass('open');
}
function SetBreak(Id) {
    initializeTimePicker(
        `#addStartTimeBreak`,
        `#addEndTimeBreak`,
        `#_Starttime_` + Id,
        `#_Endtime_` + Id
    );
    //set fields to update
    $('#breakEntryRequest_Id').val(Id);

    //set time to input fields
    $('#addStartTimeBreak_hide').val($('#_Starttime_' + Id).val());
    $('#addEndTimeBreak_hide').val($('#_Endtime_' + Id).val());
    $('.add-time-break').addClass('open');
}
function SetTravel(Id) {
    initializeTimePicker(
        `#addStartTimeTravel`,
        `#addEndTimeTravel`,
        `#_Starttime_` + Id,
        `#_Endtime_` + Id
    );
    $('#createTimeEntryRequest_Id').val(Id);

    //set time to input fields
    $('#addStartTimeTravel_hide').val($('#_Starttime_' + Id).val());
    $('#addEndTimeTravel_hide').val($('#_Endtime_' + Id).val());

    $('.add-time-travel').addClass('open');
}

$('#myForm').on('submit', function () {
    // Set the hidden input's value just before form submission
    $('#weekStartDate').val($('#calendar__date').text());
});


function formatDateToYYYYMMDD(inputDate) {
    if (!inputDate) {
        console.error("Invalid input: Date is empty or undefined.");
        return "Invalid Date";
    }

    try {
        // Create a Date object from the ISO string
        const date = new Date(inputDate);

        // Validate the date
        if (isNaN(date.getTime())) {
            console.error("Invalid date format:", inputDate);
            return "Invalid Date";
        }

        // Get year, month, and day
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const day = String(date.getDate()).padStart(2, '0');

        // Format the date as YYYY/MM/DD
        return `${year}/${month}/${day}`;
    } catch (error) {
        console.error("Error parsing date:", error);
        return "Invalid Date";
    }
    alert(`${year}/${month}/${day}`)
}

function hideShowDivs(dayForFetchingEntries) {
    $('._day').addClass("_hidediv");
    $('._day_' + dayForFetchingEntries).removeClass("_hidediv");

}

function loadAllowances(day, TimesheetId, TotalHours, EntryDate) {
    if (TimesheetId == 0) {
        var activeLink = $("#" + day);
        TimesheetId = activeLink.attr("timeSheetId");
    }
    var activeLink = $("#" + day);
    TotalHours = activeLink.next("[data-day-hours='day-hours']").attr('hoursDisplay');
    $('#day').val(day);
    $('#TimesheetId').val(TimesheetId);
    $('#TotalHours').val(TotalHours);
    $('#EntryDate').val(EntryDate);

    var entryDate = formatDateToYYYYMMDD(EntryDate);

    $('#DailyTotalHours').text(TotalHours + 'hrs');
    $('.ec-day-btn').removeClass('active');

    // Find and set active class on the clicked day button
    //console.log('day', day);
    //const clickedDay = $(`[onclick*="loadAllowances(${day}"]`);
    //console.log('EntryDate', EntryDate)
    const clickedDay = $(`[data-week-value="${EntryDate}"]`);;

    //alert('clickdaty' + JSON.stringify( clickedDay))
    //console.log('clickdaty' + JSON.stringify(clickedDay));

    if (clickedDay.length ) {
        clickedDay.addClass('active');
    }
    //else if (clickedDay.length > 1) {
    //    clickedDay.eq(clickedDay.length - 1).addClass('active');
    //}

    const options = {
        weekday: 'long',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    };
    const formattedDate = (new Date(entryDate)).toLocaleDateString('en-GB', options);
    $('#selectedCalendarDate').text(formattedDate)

    $('#submitButton').show()

    $.ajax({
        type: "GET",
        url: './Timesheet?handler=DayClick',
        data: {
            TimesheetId: TimesheetId,
            EntryDate: entryDate
        },
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    }).done(function (response) {
        
        if (!response.success) {
            $('#time-entry-container').empty();
            $('#warningErrorMessage').hide();
            $('#ec-add-time-btn').show()
            $('#allowanceDiv').removeClass('opacity-50 pe-none');
        }
        if (response.success) {
            $('#time-entry-container').empty();

            // Populate time entries
            if (response.timeEntry.timeEntries && response.timeEntry.timeEntries.length) {
                $('#WeekHours').text(response.weeklyHours+'hrs');

                response.timeEntry.timeEntries.forEach(function (entry) {
                    // if (entry.startTime != null && entry.endTime != null) {
                    //     let formattedStartTime = entry.startTime.split(':').slice(0, 2).join(':');
                    //     let formattedEndTime = entry.endTime.split(':').slice(0, 2).join(':');
                    //     entry.startTime = formattedStartTime;
                    //     entry.endTime = formattedEndTime;
                    // }
                    if (entry.hours != null || entry.hours <= 0) {
                        entry.hours = convertToHoursAndMinutes(entry.hours)
                    }

                    let entryHtml = `
                                        <div class="_day logged-item _day_${new Date(entry.entryDate).getDate()} ${entry.entryTypeName === "Travel" ? "dark" : ["Break", "Holiday", "Sickness", "UnpaidLeave", "StandBy"].includes(entry.entryTypeName) ? "outline" : "light"}"
                                                 data-action="add-time-${entry.entryTypeName.toLowerCase()}"
                                        onclick="${getOnClickHandler(entry)}">
                                                <div class="d-flex justify-content-between">
                                            <input type="hidden" id="_Starttime_${entry.id}" value="${entry.startTime}" />
                                            <input type="hidden" id="_Endtime_${entry.id}" value="${entry.endTime}" />`;

                    // Handle different entry types
                    if (entry.entryTypeName === "Travel") {
                        entryHtml += `
                                        <div class="d-flex gap-8 align-items-center">
                                            <span class="icon-ec-car"></span>
                                            <h2 class="logged-item__heading text-primary-dark">Travel</h2>
                                        </div>`;
                    } else if (entry.entryTypeName === "Break") {
                        entryHtml += `
                                        <p class="bodySmall text-primary-light d-flex gap-8">
                                            <span class="icon-ec-cup"></span>
                                            <span>Break</span>
                                        </p>`;
                    } else if (entry.entryTypeName === "Site") {
                        entryHtml += `
                                        <div class="d-flex gap-8 align-items-center">
                                            <h2 class="logged-item__heading text-primary-dark">Site</h2>
                                            ${entry.isPerformedEscalatorTest ? `
                                                <div class="message ec-dark small">
                                                    <p class="d-flex gap-8 align-items-center">
                                                        <span class="icon-ec-escalator-test"></span>
                                                        <span class="bodyExtraSmall">Escalator Test</span>
                                                    </p>
                                                </div>` : ''}
                                        </div>`;
                    } else if (entry.entryTypeName === "Holiday") {
                        entryHtml += `
                                            <p class="bodySmall text-primary-light d-flex gap-8" >
                                                <span class="icon-ec-holiday"></span>
                                                    <span>Holiday</span>
                                                    </p>`;
                    } else if (entry.entryTypeName === "Sickness") {
                        entryHtml += `
                                            <p class="bodySmall text-primary-light d-flex gap-8">
                                            <span class="icon-ec-sickness"></span>
                                            <span>Sickness</span>
                                            </p>`;
                    } else if (entry.entryTypeName === "UnpaidLeave") {
                        entryHtml += `
                                             <p class="bodySmall text-primary-light d-flex gap-8">
                                             <span class="icon-ec-unpaid"></span>
                                             <span>Unpaid Leave</span>
                                             </p>`;
                    } else if (entry.entryTypeName === "StandBy") {
                        entryHtml += `
                                            <p class="bodySmall text-primary-light d-flex gap-8">
                                            <span class="icon-ec-standby"></span>
                                             <span>StandBy</span>
                                            </p>`;
                    }

                    // Add time details based on entry type
                    if (!["Holiday", "Sickness", "StandBy", "UnpaidLeave"].includes(entry.entryTypeName)) {
                        if (entry.entryTypeName === "Break") {
                            entryHtml += `
                                                            <p class="bodySmall text-primary-light align-self-end">${formatTime(entry.startTime)} &ndash; ${formatTime(entry.endTime)} </p>
                                        </div>
                                    </div>`;
                        } else if (entry.entryTypeName === "Site") {
                            entryHtml += `
                                            <p class="body text-primary-dark">${entry.hours}</p>
                                        </div>
                                        <div class="d-flex justify-content-between">
                                            <p class="bodySmall text-primary-light d-flex gap-8">
                                                <span class="icon-ec-location-dot"></span>
                                                <span>${entry.siteAddress}</span>
                                            </p>
                                                                    <p class="bodySmall text-primary-light align-self-end">${formatTime(entry.startTime)} &ndash; ${formatTime(entry.endTime)} </p>
                                                </div>
                                    </div>`;
                        } else {
                            entryHtml += `
                                            <p class="body text-primary-dark">${entry.hours}</p>
                                        </div>
                                                                    <p class="bodySmall text-primary-light align-self-end">${formatTime(entry.startTime)} &ndash; ${formatTime(entry.endTime)} </p>
                                            </div>`;
                        }
                    } else {
                        entryHtml += `
                                        <p class="bodySmall text-primary-light align-self-end">${entry.dayTypeName}</p>
                                    </div>
                                </div>`;
                    }

                    // Append the entry to the container
                    document.getElementById('time-entry-container').innerHTML += entryHtml;
                });

                // Add the "Add Time" button after all entries
                //            let addTimeButton = `
                //<div class="ec-add-time-btn mx-auto fixed" id="ec-add-time-btn">
                //    <span class="icon-ec-plus"></span>
                //</div>`;
                //            document.getElementById('time-entry-container').innerHTML += addTimeButton;
            }


            // Reset all checkboxes first
            $('#onCall, #workingAway, #breakfastClaim, #eveningMealClaim').prop('checked', false);
            // Get allowances array
            const allowances = response.timeEntry.allowances;
            // Check each allowance and set corresponding checkbox
            allowances.forEach(allowance => {
                const allowanceName = allowance.allowanceName.replace(/\s+/g, '').toLowerCase();
                switch (allowanceName) {
                    case 'basiconcallrate':
                    case 'weekendoncallrate':
                        $('#onCall').prop('checked', true);
                        break;
                    case 'workingaway':
                        $('#workingAway').prop('checked', true);
                        break;
                    case 'breakfast':
                        $('#breakfastClaim').prop('checked', true);
                        break;
                    case 'eveningmeal':
                        $('#eveningMealClaim').prop('checked', true);
                        break;
                }
            });
            if (response.timeEntry.isTimesheetSubmitted) {
                $('#warningErrorMessage').text(response.timeEntry.submittedMessage)
                $('#warningErrorMessage').show();
                $('#time-entry-container').addClass('opacity-50 pe-none');
                $('#allowanceDiv').addClass('opacity-50 pe-none');
                $('#submitButton').hide()
                $('#ec-add-time-btn').hide()
            }
            else {
                $('#warningErrorMessage').hide();
                $('#submitButton').show()
                $('#ec-add-time-btn').show()
                $('#time-entry-container').removeClass('opacity-50 pe-none');
                $('#allowanceDiv').removeClass('opacity-50 pe-none');
            }

        } if (!response.success) {
            $('#onCall').prop('checked', false);
            $('#workingAway').prop('checked', false);
            $('#breakfastClaim').prop('checked', false);
            $('#eveningMealClaim').prop('checked', false);

            // console.log('Error:', response.message);
        }
    }).fail(function (xhr, status, error) {
        //console.log('Ajax error:', error);
    });
}

// Function to get the correct onclick handler based on entry type
function getOnClickHandler(entry) {
    switch (entry.entryTypeName) {
        case "Travel":
            return `SetTravel(${entry.id})`;
        case "Break":
            return `SetBreak(${entry.id})`;
        case "Site":
            return `SetSite(${entry.id}, '${entry.isPerformedEscalatorTest}', '${entry.siteAddress}')`;
        case "Holiday":
            return `setHoliday(${entry.dayType}, ${entry.id}, '${entry.dayTypeName}')`;
        case "Sickness":
            return `setSickness(${entry.dayType}, ${entry.id}, '${entry.dayTypeName}')`;
        case "UnpaidLeave":
            return `setUnpaidLeave(${entry.dayType}, ${entry.id}, '${entry.dayTypeName}')`;
        case "StandBy":
            return `setStandby(${entry.dayType}, ${entry.id}, '${entry.dayTypeName}')`;
        default:
            return "";
    }
}
function formatTime(time) {
    if (time != null) {
        // Split time by ':' and take only the hours and minutes
        let formattedTime = time.split(':').slice(0, 2).join(':');
        return formattedTime;
    }
    return null; // Return null if input is invalid
}


function convertToHoursAndMinutes(hours) {
    // Helper function to format hours and minutes
    const formatTime = (time, unit) => time > 0 ? `${time} ${unit}${time > 1 ? 's' : ''}` : '';

    // Separate whole hours and fractional part
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);

    // Build the result string based on hours and minutes
    const hourString = formatTime(wholeHours, 'hr');
    const minuteString = formatTime(minutes, 'min');

    // Combine hour and minute strings with proper spacing
    return [hourString, minuteString].filter(Boolean).join(' ');
}

function submitTimesheet() {
    var currentIndex = $('#calendarWeekSlider').find('.owl-item.active').index();
    var weekStartingDate = $('#calendar__date').text();

    $.ajax({
        url: './Timesheet?handler=SubmitTimesheet',
        type: 'GET',
        data: {
            weekStartingDate: weekStartingDate

        },
        success: function (response) {

            window.PopupModule.closePopup();

            if (!response.success) {
                DisplayErrorMessage(response.errorMessage)
            }
            if (response.success) {
                DisplaySuccessMessage("Success! Your timesheet has been submitted.");
            }

            CalculateWeeklyHours(false)


        },
        error: function (xhr, status, error) {
            console.error("AJAX Error:", xhr.status, xhr.responseText);
        }
    });
    //    loadCalendarData(weekStartingDate, currentIndex)
}
let template = '';

function initializeTimePicker(startSelector, endSelector, startOutput, endOutput) {
    let startTime = $(startOutput).val();
    let endTime = $(endOutput).val();

    // Convert 12-hour format to "HH:mm" with leading zeros
    function formatTime(time) {
        // Remove AM/PM and trim spaces
        let cleanTime = time.replace(/ AM| PM/, "").trim();
        // Split hours and minutes
        let [hours, minutes] = cleanTime.split(':');
        // Add leading zero if needed
        hours = hours.padStart(2, '0');
        // Return formatted time
        return `${hours}:${minutes}`;
    }

    let formattedStartTime = formatTime(startTime);
    let formattedEndTime = formatTime(endTime);
    //$(startSelector).simpleTimePicker("remove")
    // Initialize Start Time Picker
    $(startSelector).simpleTimePicker({
        css: "body timepicker-dropdown",
        output: startOutput,
        interval: 15,

        onSelect: function (el, time) {
            $(endSelector).simpleTimePicker("setMin", time);
        },
    });

    // Set initial time for Start Time Picker
    $(startSelector).simpleTimePicker("setTime", formattedStartTime);
    //$(endSelector).simpleTimePicker("remove")
    // Initialize End Time Picker
    $(endSelector).simpleTimePicker({
        css: "body timepicker-dropdown",
        output: endOutput,
        interval: 15,
        onSelect: function (el, time) {
            $(startSelector).simpleTimePicker("setMax", time);
        },
    });

    // Set initial time for End Time Picker
    $(endSelector).simpleTimePicker("setTime", formattedEndTime);
}

$(document).ready(function () {

    template = document.getElementById("calendarDayTemplate").content;

    const today = new Date();
    $('#calendar__date').text(today.toLocaleDateString());
    const dateText = $('#calendar__date').text();
    const currentDate = new Date(dateText);

    // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const dayOfWeek = currentDate.getDay();

    // Calculate the difference from Monday (assuming Monday is the start of the week)
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    // Get the Monday of the current week
    const mondayDate = new Date(currentDate);
    mondayDate.setDate(currentDate.getDate() + diff);

    const options = {
        weekday: 'long',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    };

    const formattedDate = mondayDate.toLocaleDateString('en-GB', options);

    $('#calendar__date').text(formattedDate);


    loadCalendarData(formattedDate, 21)
    //function for sending weekcommincing date to backend
    $('form').on('submit', function () {
        $('#weekStartDate').val($('#calendar__date').text());
    });



    // var owl = $('#calendarWeekSlider').owlCarousel({
    //     startPosition: 21
    // });
    // owl.trigger('to.owl.carousel', [21, 0, true]);
    // CalculateWeeklyHours(true);
    // owl.on('translated.owl.carousel', function () {
    //     CalculateWeeklyHours(false)
    // });

    if ($("#errorMessageText").length) {
        $("#displayMessage").show();

    }



    // Common initialization function for time pickers


    // set daytypename (halfday or fullday)
    $('[data-trigger="set-dayTypeName"]').change(function () {
        var value = $(this).val();
        $('.dayTypeName').val(value);
    });


    initializeTimePicker("#addStartTimeTravel", "#addEndTimeTravel", "#addStartTimeTravel_hide", "#addEndTimeTravel_hide");

    // Initialize time pickers for break
    initializeTimePicker("#addStartTimeBreak", "#addEndTimeBreak", "#addStartTimeBreak_hide", "#addEndTimeBreak_hide");

    // Initialize time pickers for break
    initializeTimePicker("#addStartTimeSite", "#addEndTimeSite", "#addStartTimeSite_hide", "#addEndTimeSite_hide");

    //LOAD TIME ENTRIES
    function loadTimeEntries(entryDate) {
        const url = `/Timesheet?selectedCalendarDate=${entryDate}`;
        fetch(url, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
            .then(response => response.json())
            .then(data => {
                const container = document.getElementById('time-entry-container');
                container.innerHTML = '';
                data.forEach(entry => {
                    const entryDiv = document.createElement('div');
                    entryDiv.className = `logged-item ${entry.entryTypeName === 'Travel' ? 'dark' : 'light'}`;
                    entryDiv.innerHTML = `
    <div class="d-flex justify-content-between">                                                                                                                                                                                                                                                       `;
                    container.appendChild(entryDiv);
                });
            })
            .catch(error => console.error('Error loading time entries:', error));
    }


    //// Initialize time pickers for travel
    //initializeTimePicker("#addStartTimeTravel", "#addEndTimeTravel", "#addStartTimeTravel_hide", "#addEndTimeTravel_hide");

    //// Initialize time pickers for break
    //initializeTimePicker("#addStartTimeBreak", "#addEndTimeBreak", "#addStartTimeBreak_hide", "#addEndTimeBreak_hide");

    //// Initialize time pickers for break
    //initializeTimePicker("#addStartTimeSite", "#addEndTimeSite", "#addStartTimeSite_hide", "#addEndTimeSite_hide");


    // send Entry date value to request
    $('[data-trigger="add-eventDateFunction"]').click(function (event) {
        const dataWeekValue = $('.ec-day-btn.active').attr('data-week-value');
        if (dataWeekValue) {
            $('.EntryDateValue').val(dataWeekValue);
        } else {
            event.preventDefault();
            //alert('Please select a week date.');
            DisplayErrorMessage('Please select a week date.');
        }
    });



    var forms = document.querySelectorAll('form');
    forms.forEach(function (form) {
        form.addEventListener('submit', updateHiddenFields);
    });


    function updateHiddenFields() {
        var onCallCheckbox = document.getElementById('onCall');
        var workingAwayCheckbox = document.getElementById('workingAway');
        var breakfastClaimCheckbox = document.getElementById('breakfastClaim');
        var eveningMealClaimCheckbox = document.getElementById('eveningMealClaim');

        var hiddenFields = document.querySelectorAll('input[type="hidden"]');
        hiddenFields.forEach(function (hiddenField) {
            if (hiddenField.name === 'createTimeEntryRequest.IsOnCall') {
                hiddenField.value = onCallCheckbox.checked;
            } else if (hiddenField.name === 'createTimeEntryRequest.IsWorkingAway') {
                hiddenField.value = workingAwayCheckbox.checked;
            } else if (hiddenField.name === 'createTimeEntryRequest.IsBreakFastClaim') {
                hiddenField.value = breakfastClaimCheckbox.checked;
            } else if (hiddenField.name === 'createTimeEntryRequest.IsEveningMealClaim') {
                hiddenField.value = eveningMealClaimCheckbox.checked;
            }
        });
    }

    //error message
    const pageState = {
        navigationType: performance.getEntriesByType("navigation")[0].type
    };

    var tempMessage = $('#errorMessage').text();
    // Clear the session storage on page load if there's no message
    if (!tempMessage) {
        sessionStorage.removeItem('messageShown');
    }

    //// Show message if it exists and hasn't been shown
    //if (tempMessage && !sessionStorage.getItem('messageShown')) {

    //    DisplayErrorMessage(tempMessage);
    //    sessionStorage.setItem('messageShown', 'true');
    //}

    // Clear session storage when leaving the page
    window.addEventListener('beforeunload', function () {
        sessionStorage.removeItem('messageShown');
    });
});


function DisplayErrorMessage(message) {
    var errorMessage = $("#errorMessage");
    $("#errorMessageDiv").show();

    if (errorMessage.length) {
        errorMessage
            .text(message)
            .fadeIn();

        setTimeout(function () {
            $("#errorMessageDiv").fadeOut();
        }, 5000);
    }
}

function DisplaySuccessMessage(message) {
    var successMessage = $("#successMessage");
    $("#successMessageDiv").show();

    if (successMessage.length) {
        successMessage
            .text(message)
            .fadeIn();

        setTimeout(function () {
            $("#successMessageDiv").fadeOut();
        }, 5000);
    }
}

let ecLoader = document.querySelector('.ec-loader');
function showLoader() {
    ecLoader.classList.remove('d-none');
}

function hideLoader() {
    ecLoader.classList.add('d-none');
}
function CalculateHours() {
    const elements = document.querySelectorAll('.owl-item.active [data-day-hours]');
    // Initialize a variable to hold the total minutes
    let totalMinutes = 0;
    if (elements.length > 0) {
        elements.forEach(element => {
            // Split the time string (e.g., "1:30" into hours and minutes)
            const timeStr = element.textContent;
            const [hours, minutes] = timeStr.split(':').map(Number);
            // Convert everything to minutes
            totalMinutes += (hours * 60) + minutes;
        });

        // Convert total minutes back to hours and minutes format
        const displayHours = Math.floor(totalMinutes / 60);
        const displayMinutes = totalMinutes % 60;

        // Format the display string
        const formattedTime = `${displayHours}:${displayMinutes.toString().padStart(2, '0')}`;
        $('#WeekHours').text(formattedTime + 'hrs');

    }
}
function CalculateWeeklyHours(firstCall) {
    const elements = document.querySelectorAll('.owl-item.active [data-day-hours]');
    // Initialize a variable to hold the total minutes
    let totalMinutes = 0;
    if (elements.length > 0) {
        elements.forEach(element => {
            // Split the time string (e.g., "1:30" into hours and minutes)
            const timeStr = element.textContent;
            const [hours, minutes] = timeStr.split(':').map(Number);
            // Convert everything to minutes
            totalMinutes += (hours * 60) + minutes;
        });

        // Convert total minutes back to hours and minutes format
        const displayHours = Math.floor(totalMinutes / 60);
        const displayMinutes = totalMinutes % 60;

        // Format the display string
        const formattedTime = `${displayHours}:${displayMinutes.toString().padStart(2, '0')}`;
        $('#WeekHours').text(formattedTime + 'hrs');

    }


    if (!firstCall) {
        var TimesheetId = parseInt(elements[0].getAttribute('timesheetId'));
        var entryTime = elements[0].getAttribute('entryTime');
        var hoursDisplay = elements[0].getAttribute('hoursDisplay');
        var Day = elements[0].getAttribute('Day');
        var SubmissionDate = elements[0].getAttribute('SubmissionDate');

        loadAllowances(Day, TimesheetId, hoursDisplay, entryTime);

        // setTimeout(function () {

        // }, 1000);


    }
    else {
        var dayValue = getDayValue();
        var TimesheetId = parseInt(elements[dayValue].getAttribute('timesheetId'));
        var entryTime = elements[dayValue].getAttribute('entryTime');
        var hoursDisplay = elements[dayValue].getAttribute('hoursDisplay');
        var Day = elements[dayValue].getAttribute('Day');
        var SubmissionDate = elements[dayValue].getAttribute('SubmissionDate');
        loadAllowances(Day, TimesheetId, hoursDisplay, entryTime);

        // setTimeout(function () {

        // }, 1000);

    }
    hideLoader();

}
function getDayValue() {
    const today = new Date();
    const day = today.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6

    // Adjusting the return value to match your requirements
    if (day === 0) return 6;  // Sunday
    return day - 1;  // Monday = 0, Tuesday = 1, ...
}


function navigateWeek(offset) {
    $('#calendar__date').text($('#selectedCalendarDate').text());
}
function loadCalendarData(weekCommencingDate, currentIndex) {
    showLoader();
    $.ajax({
        url: '/Timesheet?handler=GetCalendarData',
        type: 'GET',
        data: { weekCommencingDate: formatDateToYYYYMMDD(weekCommencingDate) },
        success: function (response) {

            const $carousel = $("#calendarWeekSlider");
            $carousel.trigger("destroy.owl.carousel");
            if (response.success) {
                const $container = $("#calendarWeekSlider");
                $container.empty(); // Clear previous items

                response.data.forEach(function (day) {

                    let item = document.importNode(template, true);

                    // Replace placeholders
                    item.querySelector("[data-placeholder='dayOfWeek']").textContent = day.dayOfWeek;
                    item.querySelector("[data-placeholder='dayNumber']").textContent = day.dayNumber;

                    let anchor = item.querySelector("a");
                    anchor.setAttribute("onclick", `loadAllowances(${day.dayNumber}, ${day.timesheetId}, '${day.hoursDisplay}', '${day.date}')`);
                    anchor.setAttribute("data-week-value", day.date);
                    anchor.setAttribute("timeSheetId", day.timesheetId);
                    anchor.setAttribute("id", day.dayNumber);


                    let span = item.querySelector("[data-day-hours='day-hours']");
                    span.setAttribute("SubmissionDate", day.submissionDate || '');
                    span.setAttribute("Day", day.dayNumber);
                    span.setAttribute("entryTime", day.date);
                    span.setAttribute("hoursDisplay", day.hoursDisplay);
                    span.setAttribute("timesheetId", day.timesheetId);
                    span.textContent = day.hoursDisplay;

                    $container.append(item);
                });
                window.calendarWeekSlider.init();
                var owl = $('#calendarWeekSlider').owlCarousel({
                    startPosition: currentIndex
                });
                owl.trigger('to.owl.carousel', [currentIndex, 300]);

                var lastPosition = currentIndex;

                owl.on('translated.owl.carousel', function (event) {
                    CalculateWeeklyHours(false);
                    navigateWeek();

                });

                CalculateWeeklyHours(true);



                // setTimeout(function () {

                // }, 1000);
            } else {
                console.error('Failed to load calendar data');
            }
        },
        error: function (xhr, status, error) {
            console.error('Error loading calendar data:', error);
        }
    });
}
function clearTimePicker() {
    //Travel
    $("#addStartTimeTravel").simpleTimePicker("setMin", "00:00")
    $("#addStartTimeTravel").simpleTimePicker("setMax", "23:00")
    $("#addStartTimeTravel").simpleTimePicker("setTime", "00:00");

    $("#addEndTimeTravel").simpleTimePicker("setMin", "00:00")
    $("#addEndTimeTravel").simpleTimePicker("setMax", "23:00")
    $("#addEndTimeTravel").simpleTimePicker("setTime", "00:00");

    //site
    $("#addStartTimeSite").simpleTimePicker("setMin", "00:00")
    $("#addStartTimeSite").simpleTimePicker("setMax", "23:00")
    $("#addStartTimeSite").simpleTimePicker("setTime", "00:00");

    $("#addEndTimeSite").simpleTimePicker("setMin", "00:00")
    $("#addEndTimeSite").simpleTimePicker("setMax", "23:00")
    $("#addEndTimeSite").simpleTimePicker("setTime", "00:00");

    //break
    $("#addStartTimeBreak").simpleTimePicker("setMin", "00:00")
    $("#addStartTimeBreak").simpleTimePicker("setMax", "23:00")
    $("#addStartTimeBreak").simpleTimePicker("setTime", "00:00");

    $("#addEndTimeBreak").simpleTimePicker("setMin", "00:00")
    $("#addEndTimeBreak").simpleTimePicker("setMax", "23:00")
    $("#addEndTimeBreak").simpleTimePicker("setTime", "00:00");

    //reset input fields
    $("input[name='standby']").prop("checked", false);
    $("input[name='holiday']").prop("checked", false);
    $("input[name='sickness']").prop("checked", false);
    $("input[name='unpaid-leave']").prop("checked", false);

    $('#site-address').val('');
    $('#siteEntryRequest_Id').val('')
    $('#escalatorTest').prop('checked', false);

    $('#createTimeEntryRequest_Id').val('')
    $('#breakEntryRequest_Id').val('')
    $('#holidayEntryRequest_Id').val('')
    $('#sicknessEntryRequest_Id').val('')
    $('#unpaidLeaveEntryRequest_Id').val('')
    $('#standbyEntryRequest_Id').val('')
}

function ResetTimeDropDown(idName) {
    newOptions = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"]; // Define your new options
    minutenewOptions = ["00", "15", "30", "45"];

    var selectBox = $("#" + idName + " select[name = 'hour']");
    // Remove all existing options
    selectBox.empty();
    // Add new options
    newOptions.forEach(time => {
        selectBox.append(`<option value="${time}">${time}</option>`);
    });

    var minute = $("#" + idName + " select[name='minute']");
    minute.empty();
    minutenewOptions.forEach(time => {
        minute.append(`<option value="${time}">${time}</option>`);
    });


    $("#" + idName + "_hide").val("00:00");
}

