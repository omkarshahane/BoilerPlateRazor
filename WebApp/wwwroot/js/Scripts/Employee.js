var totalRecords = 0;
var currentPage = 1;
function loadEmployees() {
    showLoader();
    $.ajax({
        url: './EmployeeList?handler=EmployeeData',
        method: 'GET',
        data: {
            currentPage: currentPage,
            searchTerm: $('input[name="SearchTerm"]').val(),
            pageSize: $('select[name="PageSize"]').val()
        },
        success: function (response) {
            const tbody = $('#tableBody');
            tbody.empty();
            totalRecords = response.employees.totalItems;

            if (response.success) {
                hideLoader();

                if (!response.employees?.result || response.employees.result.length === 0) {
                    tbody.html('<tr><td colspan="5" class="text-center">No employees found</td></tr>');
                    return;
                }

                response.employees.result.forEach(employee => {
                    const newRow = templateRow.clone()
                        .removeClass('template-row')
                        .css('display', '');

                    // Replace basic text content
                    let rowHtml = newRow.prop('outerHTML');
                    const replacements = {
                        '{fullName}': `${employee.firstName} ${employee.lastName}`,
                        '{employeeCategory}': employee.employeeCategory,
                        '{emailAddress}': employee.emailAddress,
                        '{phoneNumber}': employee.phoneNumber
                    };

                    Object.keys(replacements).forEach(key => {
                        rowHtml = rowHtml.replace(new RegExp(escapeRegExp(key), 'g'), replacements[key]);
                    });

                    const $row = $(rowHtml);

                    // Configure the action links based on employee status
                    if (employee.isActive) {
                        // Show active controls, hide inactive controls
                        $row.find('.active-controls').show();
                        $row.find('.inactive-controls').hide();

                        // Setup edit link
                        $row.find('.edit-link')
                            .attr('href', `/Employee/EditEmployee?id=${employee.id}&returnPage=${currentPage}&searchTerm=${encodeURIComponent($('input[name="SearchTerm"]').val())}&pageSize=${$('select[name="PageSize"]').val()}`);

                        // Setup deactivate link
                        $row.find('.deactivate-link')
                            .attr('onClick', `deactivateEmployeePopup('${employee.firstName} ${employee.lastName}',${employee.id})`);

                        // Setup resend password link
                        $row.find('.resend-password-link')
                            .attr('onClick', `resendPasswordPopup('${employee.firstName} ${employee.lastName}','${employee.emailAddress}')`);
                    } else {
                        // Show inactive controls, hide active controls
                        $row.find('.active-controls').hide();
                        $row.find('.inactive-controls').show();
                        $row.find('.reactivate-link')
                            .attr('href', `/Employee/ReactivateEmployee?id=${employee.id}&returnPage=${currentPage}&searchTerm=${encodeURIComponent($('input[name="SearchTerm"]').val())}&pageSize=${$('select[name="PageSize"]').val()}`);
                    }

                    tbody.append($row);
                });

                window.PopupModule.init();
                handlePagination();

            } else {
                tbody.html('<tr><td colspan="5" class="text-center">No employees found</td></tr>');
            }
        },
        error: function (xhr, status, error) {
            hideLoader();
            console.error('Error loading employees:', error);
            $('#tableBody').html('<tr><td colspan="5" class="text-center text-danger">Error loading employees. Please try again.</td></tr>');
        }
    });
}

function addEmployee() {
    showLoader();
    var searchTerm = encodeURIComponent($('input[name="SearchTerm"]').val());
    var pageSize = $('select[name="PageSize"]').val();
    var returnPage = currentPage;

    var url = `/Employee/AddEmployee?returnPage=${returnPage}&searchTerm=${searchTerm}&pageSize=${pageSize}`;
    window.location.href = url; // This will navigate to the new URL
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function onSearch() {
    showLoader();
    currentPage = 1;
    loadEmployees()
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
    showLoader();
    if (newPage >= 1 && newPage <= Math.ceil(totalRecords / 10)) {
        currentPage = newPage;
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('currentPage', newPage);
        urlParams.set('searchTerm', $('input[name="SearchTerm"]').val());
        urlParams.set('pageSize', $('select[name="PageSize"]').val());

        // Update URL without refreshing the page
        window.history.pushState({}, '', `${window.location.pathname}?${urlParams.toString()}`);

        loadEmployees();
    }
}
let templateRow;

$(document).ready(function () {
    templateRow = $('#tableBody .template-row').clone();

    var currentPath = window.location.pathname;

    // Using jQuery to select nav items with class 'sidebar__nav-item'
    $('.sidebar__nav-item').each(function () {
        var href = $(this).attr('href');
        if (href === currentPath) {
            $(this).addClass('active');
        } else {
            $(this).removeClass('active');
        }
    });
    var rowTemplate = $('#tableRow').html();

    //var currentPage = 1;
    //var totalRecords = 0;
    const pageState = {
        navigationType: performance.getEntriesByType("navigation")[0].type
    };
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('currentPage');
    if (pageParam) {
        currentPage = parseInt(pageParam);
    }

    // Set page size if it exists in URL
    const pageSizeParam = urlParams.get('pageSize');
    if (pageSizeParam) {
        $('#pageSize').val(pageSizeParam);
    }

    // Set search term if it exists in URL
    const searchParam = urlParams.get('searchTerm');
    if (searchParam) {
        $('input[name="SearchTerm"]').val(searchParam);
    }

    var tempMessage = $("#tempSuccessMessage").val();
    // Clear the session storage on page load if there's no message
    if (!tempMessage) {
        sessionStorage.removeItem('messageShown');
    }

    // Show message if it exists and hasn't been shown
    if (tempMessage && !sessionStorage.getItem('messageShown')) {
        DisplaySuccessMessage(tempMessage);
        sessionStorage.setItem('messageShown', 'true');
    }

    // Clear session storage when leaving the page
    window.addEventListener('beforeunload', function () {
        sessionStorage.removeItem('messageShown');
    });
    // let currentPage = 1;
    loadEmployees();


});
function deactivateEmployeePopup(name, id) {
    $('#deletePopupName').text(name);
    $('#deactivateEmployeeBtn').attr('onclick', 'deactivateEmployee(' + id + ')');
}

function resendPasswordPopup(name, email) {
    $('#resendPasswordPopupName').text(name);
    $('#resendPasswordBtn').attr('onclick', 'sendPasswordMail("' + email + '")');
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
function sendPasswordMail(email) {
    showLoader();
    $.ajax({
        type: "GET",
        url: './EmployeeList?handler=SendPasswordMail',
        data: { email: email }
    }).done(function (response) {
        if (response.success) {
            hideLoader()
            window.PopupModule.closePopup();
            DisplaySuccessMessage("Password sent successfully!");
            loadEmployees();
        }
    }).fail(function (xhr, status, error) {
        //console.log('Ajax error:', error);
    });
}
function deactivateEmployee(Id) {
    showLoader();
    $.ajax({
        type: "GET",
        url: './EmployeeList?handler=DeactivateEmployee',
        data: { Id: Id }
    }).done(function (response) {
        //console.log(response);
        if (response.success) {
            hideLoader();
            window.PopupModule.closePopup();
            DisplaySuccessMessage("Employee deactivated successfully!");
            loadEmployees();
        }
    }).fail(function (xhr, status, error) {
        //console.log('Ajax error:', error);
    });

}
function ChangePageSize() {
    showLoader();
    currentPage = 1;
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('currentPage', currentPage);
    urlParams.set('searchTerm', $('input[name="SearchTerm"]').val());
    urlParams.set('pageSize', $('select[name="PageSize"]').val());

    window.history.pushState({}, '', `${window.location.pathname}?${urlParams.toString()}`);
    loadEmployees();
}
