
var currentPage = 1;
var totalRecords = 0;
function loadTimesheets() {
    showLoader();
    const currentDate = $('#calendar__date').text();

    $.ajax({
        url: './DesktopTimesheet?handler=TimesheetData',
        method: 'GET',
        data: {
            currentPage: currentPage,
            weekCommencing2: currentDate
        },
        success: function (response) {
            hideLoader();
            const tbody = $('#tableBody');
            totalRecords = response.timesheets.totalItems;
            tbody.empty();

            if (response.success) {
                if (!response.timesheets?.result || response.timesheets.result.length === 0) {
                    tbody.html('<tr><td colspan="10" class="text-center">No data found for this week</td></tr>');
                    handlePagination();
                    return;
                }

                response.timesheets.result.forEach(timesheet => {
                    const weekHours = calculateWeekHours(timesheet);

                    // Use the stored template row
                    const newRow = templateRow.clone()
                        .removeClass('template-row')
                        .css('display', '');

                    // Get the HTML content
                    let rowHtml = newRow.prop('outerHTML');

                    const replacements = {
                        '{employeeName}': timesheet.employeeName || '',
                        '{status}': timesheet.timesheetStatusId === response.timesheetPendingStatusId ? 'Pending' : 'Received',
                        '{statusIcon}': timesheet.timesheetStatusId === response.timesheetPendingStatusId ? 'pending' : 'received',
                        '{monHours}': formatHoursToTime(weekHours[0]),
                        '{tueHours}': formatHoursToTime(weekHours[1]),
                        '{wedHours}': formatHoursToTime(weekHours[2]),
                        '{thuHours}': formatHoursToTime(weekHours[3]),
                        '{friHours}': formatHoursToTime(weekHours[4]),
                        '{satHours}': formatHoursToTime(weekHours[5]),
                        '{sunHours}': formatHoursToTime(weekHours[6]),
                        '{weekStartingDate}': timesheet.weekStartingDate || '',
                        '{employeeId}': timesheet.employeeId || ''
                    };

                    Object.keys(replacements).forEach(placeholder => {
                        rowHtml = rowHtml.replace(new RegExp(placeholder, 'g'), replacements[placeholder]);
                    });

                    tbody.append(rowHtml);
                });
                handlePagination();

            } else {
                tbody.html('<tr><td colspan="10" class="text-center">No timesheets found</td></tr>');
                handlePagination();

            }

        },
        error: function (xhr, status, error) {
            hideLoader();
            console.error('Error loading timesheets:', error);
            $('#tableBody').html('<tr><td colspan="10" class="text-center text-danger">Error loading timesheets. Please try again.</td></tr>');
            handlePagination();
        }
    });
}
function calculateWeekHours(timesheet) {
    const weekHours = new Array(7).fill(0);
    const weekStartDate = new Date(timesheet.weekStartingDate);

    timesheet.timeEntries.forEach(entry => {
        const entryDate = new Date(entry.entryDate);
        const dayIndex = Math.floor((entryDate - weekStartDate) / (1000 * 60 * 60 * 24));
        if (dayIndex >= 0 && dayIndex < 7) {
            weekHours[dayIndex] += (entry.hours || 0);
        }
    });

    return weekHours;
}
function formatHoursToTime(hours) {
    const totalMinutes = Math.floor(hours * 60);
    const displayHours = Math.floor(totalMinutes / 60);
    const displayMinutes = totalMinutes % 60;
    return `${displayHours}:${displayMinutes.toString().padStart(2, '0')}`;
}
function handlePagination() {
    const pageSize = 10;
    const totalPages = Math.ceil(totalRecords / pageSize);

    function updatePagination() {
        // Get the original HTML structure
        let $paginationContainer = $('table tfoot tr td');

        // Update Previous button attributes
        let $prevButton = $paginationContainer.find('a').first();
        $prevButton.attr('onclick', `changePage(${currentPage - 1})`);
        if (currentPage === 1) {
            $prevButton.css({ 'opacity': '0.5', 'pointer-events': 'none' });
        }
        else {
            $prevButton.css({ 'opacity': '', 'pointer-events': '' });
        }

        // Update page numbers
        let $pageNumbersContainer = $paginationContainer.find('.d-flex.gap-1');
        $pageNumbersContainer.html(generatePageNumbers());

        // Update Next button attributes
        let $nextButton = $paginationContainer.find('a').last();
        $nextButton.attr('onclick', `changePage(${currentPage + 1})`);
        if (currentPage === totalPages || totalPages == 0) {
            $nextButton.css({ 'opacity': '0.5', 'pointer-events': 'none' });
        } else {
            $nextButton.css({ 'opacity': '', 'pointer-events': '' });
        }
    }

    function generatePageNumbers() {
        let pages = '';
        const maxVisible = 5;
        let start = Math.max(1, currentPage - 2);
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        // Add ellipsis at start if needed
        if (start > 1) {
            pages += `
                    <div href="javascript:;" class="d-flex align-items-center">
                        <span class="bodySmallBold text-primary-dark">...</span>
                    </div>`;
        }

        // Add page numbers
        for (let i = start; i <= end; i++) {
            pages += `
                    <a href="javascript:;" onclick="changePage(${i})"
                       class="ec-secondary-btn ${i === currentPage ? 'active' : ''} text-decoration-none w-auto">
                        <span class="bodySmallBold text-primary-dark padding-trbl-8">${i}</span>
                    </a>`;
        }

        // Add ellipsis at end if needed
        if (end < totalPages) {
            pages += `
                    <div href="javascript:;" class="d-flex align-items-center">
                        <span class="bodySmallBold text-primary-dark">...</span>
                    </div>`;
        }

        return pages;
    }

    updatePagination();
}
function changePage(newPage) {
    showLoader();
    if (newPage >= 1 && newPage <= Math.ceil(totalRecords / 10)) {
        currentPage = newPage;
        loadTimesheets();
    }
}
function navigateWeek(offset) {
    showLoader();
    const dateText = $('#calendar__date').text();
    const currentDate = new Date(dateText);

    // Add the week offset
    currentDate.setDate(currentDate.getDate() + (offset * 7));

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
    loadTimesheets()
}
let templateRow;
$(document).ready(function () {
    showLoader();
    const today = new Date();
    $('#calendar__date').text(today.toLocaleDateString());
    templateRow = $('#tableBody .template-row').clone();
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
    currentPage = 1;
    loadTimesheets();

});
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