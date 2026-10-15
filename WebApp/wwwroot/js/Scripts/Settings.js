
$(document).ready(function () {
    function validateAmount(input) {
        const value = parseFloat($(input).val());
        const errorSpan = $(input).closest('.d-flex.flex-column').find('.text-invalid');

        if (isNaN(value)) {
            errorSpan.text('Please enter a valid number');
            $(input).addClass('invalid');
            return false;
        }

        if (value <= 0) {
            errorSpan.text('Value must be greater than 0');
            $(input).addClass('invalid');
            return false;
        }

        errorSpan.text(''); // Clear error message
        $(input).removeClass('invalid');
        return true;
    }

    // Add validation on input and blur events
    $("#settingsForm input[type='text']").each(function () {
        $(this).on('input blur', function () {
            validateAmount(this);
        });
    });
    $("#saveButton").click(function (event) {
        event.preventDefault();
        // Validate all inputs before submission
        let isValid = true;
        $("#settingsForm input[type='text']").each(function () {
            if (!validateAmount(this)) {
                isValid = false;
            }
        });

        if (!isValid) {
            return; // Don't submit if validation fails
        }
        var formData = $("#settingsForm").serialize();

        $.ajax({
            url: './Settings?handler=SaveSettings',
            type: 'POST',
            data: formData,
            success: function (response) {
                DisplaySuccessMessage("Settings successfully updated");
            },
            error: function (xhr, status, error) {
                console.error("AJAX Error:", xhr.status, xhr.responseText);
            }
        });

    });
    if (sessionStorage.getItem('messageShown')) {
        DisplaySuccessMessage(tempMessage);
        sessionStorage.setItem('messageShown', 'true');
    }

    // Clear session storage when leaving the page
    window.addEventListener('beforeunload', function () {
        sessionStorage.removeItem('messageShown');
    });

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
});
