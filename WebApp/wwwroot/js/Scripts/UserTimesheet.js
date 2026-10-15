let ecLoader = document.querySelector('.ec-loader');

function showLoader() {
    const ecLoader = document.querySelector('.ec-loader');
    if (ecLoader) {
        ecLoader.classList.remove('d-none');
    }
}

function hideLoader() {
    const ecLoader = document.querySelector('.ec-loader');
    if (ecLoader) {
        ecLoader.classList.add('d-none');
    }
}
const dateText = $('#calendar__date').text();
const currentDate = new Date(dateText);

function navigateWeek(offset) {
    showLoader();
    const dateText = $('#calendar__date').text();
    const currentDate = new Date(dateText);

    // Add the week offset
    currentDate.setDate(currentDate.getDate() + (offset * 7));

    // Add the week offset

    // Format the date back to the original format
    const options = {
        weekday: 'long',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    };

    const newDate = currentDate.toLocaleDateString('en-GB', options);

    $('#calendar__date').text(newDate);
    currentPage = 1;
    loadTimesheet(newDate, $('#employeeId').text());
}
function getLocalDate(dateString) {
    const options = {
        weekday: 'long',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    };

    return dateString.toLocaleDateString('en-GB', options);

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
function loadTimesheet(currentDate, employeeId) {
    showLoader();
    $.ajax({
        url: `?handler=UserTimesheetData`,
        method: 'GET',
        data: {
            weekStartingDate: currentDate,
            employeeId: employeeId
        },
        success: function (response) {
            $('#timesheetTableBody').empty();
            if (response.success) {

                $('#employeeName').text(response.timesheetData.employeeName + " " + "Timesheet")
                $('#calendar__date').text(response.timesheetData.weekStartingDate)
                const dateText = $('#calendar__date').text();
                const currentDate = new Date(dateText);
                const options = {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                };
                const newDate = currentDate.toLocaleDateString('en-GB', options);
                $('#calendar__date').text(newDate);
                renderTimesheet(response.timesheets, response.lookupData, response.allowanceData);

                window.PopupModule.init();
                window.timesheetSlider.init()
            }
            hideLoader();

        },
        error: function (xhr, status, error) {
            hideLoader(); // Add this
            console.error('Error loading edit timesheet:', error);
        }
    });
}

function renderTimesheet(timesheets, lookup, allowanceData) {
    console.log(timesheets)
    const tableBody = $('#timesheetTableBody');
    // Sort the days to ensure Monday comes first
    timesheets.sort((a, b) => {
        const dateA = new Date(a[0].entryDate);
        const dateB = new Date(b[0].entryDate);
        return dateA - dateB;
    });

    timesheets.forEach(dayEntries => {
        if (dayEntries.length === 0) return;

        const date = new Date(dayEntries[0].entryDate);
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });

        // Calculate allowances for the day
        const dailyAllowances = {};
        let dailyTotal = 0;

        dayEntries.forEach(entry => {
            entry.allowances.forEach(allowance => {
                if (!dailyAllowances[allowance.allowanceTypeId]) {
                    dailyAllowances[allowance.allowanceTypeId] = 0;
                }
                dailyAllowances[allowance.allowanceTypeId] += allowance.allowanceAmount;
                dailyTotal += allowance.allowanceAmount;
            });
        });
        const row = `
    <tr>
        <td class="bodySmall fw-700 bg-ec-background">${dayOfWeek}</td>
        <td>
            <div class="timesheet-slider owl-carousel">
                ${dayEntries.map(entry => `
                                    <div class="timesheet-slider__item">
                                        <div class="d-flex flex-column justify-content-center align-items-center">
                                            <p class="bodySmallBold">
                                                ${entry.entryTypeId === lookup.travelId ?
                '<span class="icon-ec-travel-car"></span>' :
                entry.entryTypeId === lookup.siteId ?
                    '<span class="icon-ec-location-dot"></span>' :
                    ''}
                                                <span>${entry.entryTypeName}</span>
                                            </p>
                                            ${entry.entryTypeId === lookup.holidayId ?
                (entry.dayType === lookup.halfDayId ?
                    '<span class="bodySmall">Half Day</span>' :
                    '<span class="bodySmall">Full Day</span>'
                        ) :
                        `<span class="bodySmall">${formatHoursToTime(entry.hours)}</span>`
            }
                                        </div>
                                    </div>
                                `).join('')}
            </div>
        </td>
        <td>
            ${dayEntries.some(entry => entry.allowances && entry.allowances.length > 0) ? `
                                <div class="d-flex flex-column align-items-center gap-8">
                                    <div class="d-flex">
                                        ${dayEntries.some(entry =>
                entry.allowances.some(allowance =>
                    [allowanceData.onCallId, allowanceData.weekendOnCall].includes(allowance.allowanceTypeId)
                )
            ) ? `
                                            <a href="javascript:;" class="text-decoration-none ec-tooltip bodyExtraSmall fw-700 text-primary-dark">
                                                <span class="icon-ec-call"></span>
                                                <p class="ec-tooltiptext"><span class="icon-ec-call"></span>On Call</p>
                                            </a>
                                        ` : ''}
                                        ${dayEntries.some(entry =>
                entry.allowances.some(allowance =>
                    allowance.allowanceTypeId === allowanceData.workingAway
                )
            ) ? `
                                            <a href="javascript:;" class="text-decoration-none ec-tooltip bodyExtraSmall fw-700 text-primary-dark">
                                                <span class="icon-ec-wa"></span>
                                                <p class="ec-tooltiptext"><span class="icon-ec-wa"></span>Working Away</p>
                                            </a>
                                        ` : ''}
                                        ${dayEntries.some(entry =>
                entry.allowances.some(allowance =>
                    allowance.allowanceTypeId === allowanceData.breakfastId
                )
            ) ? `
                                            <a href="javascript:;" class="text-decoration-none ec-tooltip bodyExtraSmall fw-700 text-primary-dark">
                                                <span class="icon-ec-breakfast"></span>
                                                <p class="ec-tooltiptext"><span class="icon-ec-breakfast"></span>Breakfast</p>
                                            </a>
                                        ` : ''}
                                        ${dayEntries.some(entry =>
                entry.allowances.some(allowance =>
                    allowance.allowanceTypeId === allowanceData.eveningMealId
                )
            ) ? `
                                            <a href="javascript:;" class="text-decoration-none ec-tooltip bodyExtraSmall fw-700 text-primary-dark">
                                                <span class="icon-ec-meal"></span>
                                                <p class="ec-tooltiptext"><span class="icon-ec-meal"></span>Evening Meal</p>
                                            </a>
                                        ` : ''}
                                        ${dayEntries.some(entry =>
                entry.allowances.some(allowance =>
                    allowance.allowanceTypeId === allowanceData.escalatorTest
                )
            ) ? `
                                            <a href="javascript:;" class="text-decoration-none ec-tooltip bodyExtraSmall fw-700 text-primary-dark">
                                                <span class="icon-ec-escalator-test"></span>
                                                <p class="ec-tooltiptext"><span class="icon-ec-escalator"></span>Escalator Test</p>
                                            </a>
                                        ` : ''}
                                    </div>
                                    <p class="bodySmall text-ec-light">£${dayEntries.reduce((total, entry) =>
                total + entry.allowances.reduce((allowanceTotal, allowance) =>
                    allowanceTotal + (allowance.amount || 0), 0
                ), 0
            ).toFixed(2)}</p>
                                </div>
                            ` : `
                                <div class="d-flex flex-column align-items-center">
                                    <span class="bodySmall text-ec-light">No</span>
                                    <span class="bodySmall text-ec-light">Allowances</span>
                                </div>
                            `}
        </td>
        <td>
            <div class="d-flex">
                <button onclick="loadEditTimeEntryPopup('${dayEntries[0].entryDate}')"
                    class="text-ec-light text-decoration-none m-auto"
                    data-action="open-admin-modal">
                    <span class="icon-ec-edit" data-action="editTimeSheet"></span>
                </button>
            </div>
        </td>
    </tr>`;
        window.PopupModule.init();
        tableBody.append(row);
    });
}
function formatHoursToTime(hours) {
    const totalMinutes = Math.floor(hours * 60);
    const displayHours = Math.floor(totalMinutes / 60);
    const displayMinutes = totalMinutes % 60;
    return `${displayHours}:${displayMinutes.toString().padStart(2, '0')}`;
}
$(document).ready(function () {
    const weekStartingDate = new URLSearchParams(window.location.search).get('weekStartingDate');
    const employeeId = new URLSearchParams(window.location.search).get('employeeId');
    $('#employeeId').text(employeeId);
    loadTimesheet(weekStartingDate, employeeId);
});
function initializeTimePicker(startSelector, startOutput, endSelector, endOutput) {
    // Get values from input fields
    let startTime = $(startOutput).val();
    let endTime = $(endOutput).val();

    function convertTo24Hour(timeStr) {
        let date = new Date("1970-01-01 " + timeStr);
        return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    }

    let startTime24 = convertTo24Hour(startTime);
    let endTime24 = convertTo24Hour(endTime);

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
    $(startSelector).simpleTimePicker("setTime", startTime24);

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
    $(endSelector).simpleTimePicker("setTime", endTime24);
}
function updateTimeEntry() {
    showLoader(); // Add this
    const timeEntries = [];

    // Loop through each time card
    $('.timeCard').each(function () {
        const $card = $(this);
        const entryId = $card.data('entry-id');

        // Validate required fields
        const siteAddress = $card.find('.site-address').val();
        const startTime = $card.find('.start-time').val();
        const endTime = $card.find('.end-time').val();
        const hours = $card.find('.hourly-rate').val();

        const entry = {
            id: entryId,
            siteAddress: siteAddress,
            isPerformedEscalatorTest: $card.find('.escalator-test').is(':checked'),
            startTime: startTime,
            endTime: endTime,
            hourlyRate: parseFloat(hours),
            dayType: $card.find('.day-type:checked').val()
        };

        timeEntries.push(entry);
    });

    if (timeEntries.length === 0) {
        alert('No valid time entries found to update.');
        return;
    }

    // Get the anti-forgery token
    const token = $('input[name="__RequestVerificationToken"]').val();
    if (!token) {
        console.error('Anti-forgery token not found');
        return;
    }

    // Send the data to the server
    $.ajax({
        url: '/DesktopTimesheet/UserTimesheet?handler=UpdateTimeEntries',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(timeEntries),
        headers: {
            'RequestVerificationToken': token
        },
        success: function (response) {
            hideLoader(); // Add this
            if (response.success) {
                loadTimesheet($('#calendar__date').text(), $('#employeeId').text());
                DisplaySuccessMessage(response.message)
                window.PopupModule.closePopup();
            } else {
                alert('Error: ' + (response.message || 'Failed to update time entries'));
            }
        },
        error: function (xhr, status, error) {
            hideLoader(); // Add this
            console.error('Error:', error);
            alert('An error occurred while updating time entries. Please check the console for details.');
        }
    });
}
function loadEditTimeEntryPopup(date) {
    showLoader();
    const urlParams = new URLSearchParams(window.location.search);
    const employeeId = urlParams.get('employeeId');

    $.ajax({
        url: `?handler=EditTimeEntry`,
        method: 'GET',
        data: {
            entryDate: date,
            employeeId: employeeId
        },
        success: function (response) {
            const modal = document.getElementById('editTimesheetEmployee');
            const innerContainer = modal.querySelector('.edit-timesheet-modal__inner');
            innerContainer.innerHTML = response;
            modal.classList.remove('d-none');
            // Initialize time pickers for travel
            document.querySelectorAll('.timeCard').forEach(card => {
                const entryId = card.getAttribute('data-entry-id');


                initializeTimePicker(
                    `#addStartTimeTravel-${entryId}`,
                    `#addStartTimeTravel_hide-${entryId}`,
                    `#addEndTimeTravel-${entryId}`,
                    `#addEndTimeTravel_hide-${entryId}`
                );

            });
            hideLoader();
        },
        error: function (xhr, status, error) {
            hideLoader(); // Add this
            console.error('Error loading edit timesheet:', error);
        }
    });

}
