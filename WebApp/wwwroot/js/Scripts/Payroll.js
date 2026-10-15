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
var totalRecords = 0;
var currentPage = 1;

function loadPayroll() {
    showLoader();
    $.ajax({
        type: "GET",
        url: './Payroll?handler=PayrollData',
        data: {
            currentPage: currentPage,
            searchTerm: $('input[name="SearchTerm"]').val(),
            pageSize: $('select[name="PageSize"]').val(),
            weekStartingDate: $('#calendar__date').text()
        }
    }).done(function (response) {
        hideLoader();
        if (response.success) {
            const tableBody = $("#tableBody");
            tableBody.empty();

            totalRecords = response.payrollData.totalItems;

            if (response.payrollData.result.length > 0) {
                response.payrollData.result.forEach(function (item) {
                    let newRowHtml = rowTemplate
                        .replace('{employeeName}', item.employeeName || 'N/A')
                        .replace('{basic}', item.basicHours)
                        .replace('{travel}', item.travelTime)
                        .replace('{rate_1.3}', item.overtime1_3Hours)
                        .replace('{rate_1.5}', item.overtime1_5Hours)
                        .replace('{rate_2.0}', item.overtimeWeekend_2Hours)
                        .replace('{allowances}', `&pound;${item.totalAllowances}`);

                    $('<tr></tr>').html(newRowHtml).appendTo(tableBody);
                });
            } else {
                tableBody.append(`
                        <tr>
                            <td colspan="10" class="text-center">No data found for this week</td>
                        </tr>
                    `);
            }
            handlePagination();
        }
    }).fail(function (xhr, status, error) {
        hideLoader();
        //console.log('Ajax error:', error);
        $("#tableBody").html(`
                <tr>
                    <td colspan="7" class="text-center text-danger">Error loading data. Please try again.</td>
                </tr>
            `);
    });
}

function handlePagination() {
    const pageSize = $('select[name="PageSize"]').val();
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
    if (newPage >= 1 && newPage <= Math.ceil(totalRecords / 10)) {
        currentPage = newPage;
        loadPayroll()
    }
}

function ChangePageSize() {
    currentPage = 1;
    loadPayroll();
}
let rowTemplate = ''; // Declare globally
// Document ready
$(document).ready(function () {
    rowTemplate = $('#rowTemplate').html();
    // Hide the template row
    $('#rowTemplate').hide();
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
    loadPayroll();


    // Add event listener for search input
    $('input[name="SearchTerm"]').on('keyup', function () {
        currentPage = 1;
        loadPayroll();
    });


});
function navigateWeek(offset) {
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
    loadPayroll();
}
