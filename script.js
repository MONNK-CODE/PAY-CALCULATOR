// Array to store all calculated days
let days = [];

// Flag to prevent multiple calculations before user confirms
let isCalculating = false;

// Event listener for changes in the 'isHoliday' select element
document.getElementById('isHoliday').addEventListener('change', function () {
    const holidayMultiplier = document.querySelector('.holidayMultiplier');
    const value = this.value.toLowerCase();

    // Simplified code using if-else to show/hide the holiday multiplier
    if (value === 'yes') {
        holidayMultiplier.style.display = 'block'; // Show the multiplier input
    } else {
        holidayMultiplier.style.display = 'none'; // Hide the multiplier input
    }
});

// Function to calculate pay based on input parameters
function calculatePay(hourlyWage, hoursWorked, isHoliday, customTaxRate) {
    // Get the holiday multiplier value
    let holidayMultiplierValue = parseFloat(document.getElementById('holidayMultiplierValues').value);

    // If the multiplier is not a valid number, default to 1
    if (isNaN(holidayMultiplierValue)) {
        holidayMultiplierValue = 1;
    }

    // Apply holiday multiplier if it's a holiday
    if (isHoliday.toLowerCase() === 'yes') {
        hourlyWage *= holidayMultiplierValue; // Adjust the hourly wage
    }

    // Calculate gross pay
    let grossPay = Number((hoursWorked * hourlyWage).toFixed(2));

    // Determine total tax rate
    let totalTaxRate;
    if (customTaxRate !== null) {
        // Use custom tax rate if provided
        totalTaxRate = customTaxRate / 100;
    } else {
        // Default tax rate is 12.6%
        totalTaxRate = 0.126;
    }

    // Calculate total tax
    let totalTax = Number((grossPay * totalTaxRate).toFixed(2));

    // Calculate net pay
    let netPay = Number((grossPay - totalTax).toFixed(2));

    // Return the calculated values
    return { grossPay, totalTax, netPay };
}

// Function to parse hours worked input and convert to decimal hours
function parseHoursWorked(hoursWorked) {
    if (hoursWorked.includes('.')) {
        // If input contains '.', split into hours and minutes
        const [hours, minutes] = hoursWorked.split('.').map(Number);
        return hours + (minutes / 60);
    }
    // If no '.', parse as float
    return parseFloat(hoursWorked);
}

// Function to format date as "Month Day, Year" in local time zone
function formatDate(dateStr) {
    // Create a Date object from the input string
    const dt = new Date(dateStr + 'T00:00:00'); // Add time to ensure date is interpreted in local time zone
    // Format the date as "Month Day, Year"
    return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

// Function to convert decimal hours to "X hours and Y minutes" format
function decimalToHoursMinutes(decimalHours) {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    return `${hours} hours and ${minutes} minutes`;
}

// Event listener for form submission
document.getElementById('payForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent the default form submission behavior
    if (!isCalculating) {
        calculateDay(); // Call the main calculation function
    }
});

// Main function to calculate and display results for a day
function calculateDay() {
    // Get input values from the form
    const hourlyWage = parseFloat(document.getElementById('hourlyWage').value);
    const hoursWorkedInput = document.getElementById('hoursWorked').value;
    const isHoliday = document.getElementById('isHoliday').value;
    const workDate = document.getElementById('workDate').value;

    // Get custom tax rate
    let customTaxRateInput = document.getElementById('customTaxRate').value;
    let customTaxRate = null;
    if (customTaxRateInput !== '') {
        customTaxRate = parseFloat(customTaxRateInput);
    }

    // Validate inputs
    const { isValid, errors } = validateInputs(hourlyWage, hoursWorkedInput, workDate, customTaxRate);
    if (!isValid) {
        // If validation fails, display error messages
        Object.keys(errors).forEach(key => updateErrorMessage(key, errors[key]));
        return;
    }

    // Parse hours worked to decimal format
    const hoursWorked = parseHoursWorked(hoursWorkedInput);

    // Calculate pay
    const { grossPay, totalTax, netPay } = calculatePay(hourlyWage, hoursWorked, isHoliday, customTaxRate);

    // Store day data in an object
    const dayData = {
        workDate,
        hoursWorked,
        hourlyWage,
        grossPay,
        totalTax,
        netPay,
        customTaxRate
    };

    // Add day data to the array
    days.push(dayData);

    // Format date and hours for display
    const formattedDate = formatDate(workDate);
    const hoursMinutesFormat = decimalToHoursMinutes(hoursWorked);

    // Display results on the page
    const results = document.getElementById('results');
    const dayElement = document.createElement('div');
    dayElement.className = 'day-result';

    // Create the inner HTML content
    let dayContent = `
        <div class="day-header">
            <h2>${formattedDate}</h2>
            <span class="expand-arrow">▼</span>
        </div>
        <div class="day-content">
            <p>Hours Worked: ${hoursWorked.toFixed(2)} (${hoursMinutesFormat})</p>
            <p>Hourly Wage: $${hourlyWage.toFixed(2)}</p>
            <p>Gross Pay: $${grossPay.toFixed(2)}</p>
            <p>Total Tax: $${totalTax.toFixed(2)}</p>
            <p>Net Pay: $${netPay.toFixed(2)}</p>
    `;

    // Conditionally add custom tax rate if provided
    if (customTaxRate !== null) {
        dayContent += `<p>Custom Tax Rate: ${customTaxRate}%</p>`;
    }

    dayContent += `</div>`;
    dayElement.innerHTML = dayContent;

    results.appendChild(dayElement);

    // Add event listener to toggle day details
    dayElement.querySelector('.day-header').addEventListener('click', function() {
        this.classList.toggle('expanded');
        const content = this.nextElementSibling;
        content.classList.toggle('expanded');
    });

    // Update the summary of all calculations
    updateSummary();

    // Show prompt to ask if user wants to add another day
    showContinuePrompt();

    // Show the undo button
    showUndoButton();

    // Always show reset button after a calculation
    showResetButton();

    // Set isCalculating flag to true to prevent multiple calculations before user confirms
    isCalculating = true;

    // Show reminder if user tries to calculate again without answering prompt
    document.getElementById('payForm').addEventListener('submit', function(e) {
        if (isCalculating) {
            e.preventDefault();
            showContinueReminder();
        }
    });
}

// Function to validate user inputs
function validateInputs(hourlyWage, hoursWorked, workDate, customTaxRate) {
    let isValid = true;
    let errors = {};

    // Validate hourly wage
    if (isNaN(hourlyWage) || hourlyWage <= 0) {
        errors.hourlyWage = "Please enter a valid hourly wage.";
        isValid = false;
    }

    // Validate hours worked (allow formats like '8.5' or '8.30')
    if (!/^\d+(\.\d{1,2})?$/.test(hoursWorked)) {
        errors.hoursWorked = "Please enter valid hours worked (e.g., 8.5 or 8.30).";
        isValid = false;
    }

    // Validate work date
    if (!workDate) {
        errors.workDate = "Please select a work date.";
        isValid = false;
    }

    // Validate custom tax rate if provided
    if (customTaxRate !== null) {
        if (isNaN(customTaxRate) || customTaxRate < 0 || customTaxRate > 100) {
            errors.customTaxRate = "Please enter a valid tax rate between 0 and 100.";
            isValid = false;
        }
    }

    return { isValid, errors };
}

// Function to update error messages
function updateErrorMessage(inputId, message) {
    let errorElement = document.getElementById(inputId + 'Error');
    if (!errorElement) {
        // Create error message element if it doesn't exist
        errorElement = document.createElement('div');
        errorElement.id = inputId + 'Error';
        errorElement.className = 'error-message';
        const inputElement = document.getElementById(inputId);
        inputElement.parentNode.insertBefore(errorElement, inputElement.nextSibling);
    }
    // Set the error message text
    errorElement.textContent = message;
}

// Function to update the summary of all calculations
function updateSummary() {
    const totalHoursWorked = days.reduce((sum, day) => sum + day.hoursWorked, 0);
    const totalHoursMinutesFormat = decimalToHoursMinutes(totalHoursWorked);
    const totalGrossPay = days.reduce((sum, day) => sum + day.grossPay, 0);
    const totalTax = days.reduce((sum, day) => sum + day.totalTax, 0);
    const totalNetPay = days.reduce((sum, day) => sum + day.netPay, 0);

    const summary = document.getElementById('summary');
    summary.innerHTML = `
        <h2>Summary for all days</h2>
        <p>Total Hours Worked: ${totalHoursWorked.toFixed(2)} (${totalHoursMinutesFormat})</p>
        <p>Total Gross Pay: $${totalGrossPay.toFixed(2)}</p>
        <p>Total Tax: $${totalTax.toFixed(2)}</p>
        <p>Total Net Pay: $${totalNetPay.toFixed(2)}</p>
    `;
}

// Function to show the continue prompt
function showContinuePrompt() {
    document.getElementById('continuePrompt').classList.remove('hidden');
}

// Function to show reminder to answer continue prompt
function showContinueReminder() {
    const reminder = document.createElement('div');
    reminder.id = 'continueReminder';
    reminder.textContent = 'Please choose whether to add another day or finish.';
    reminder.style.color = 'red';
    reminder.style.marginTop = '10px';
    document.getElementById('continuePrompt').appendChild(reminder);

    // Remove the reminder after 5 seconds
    setTimeout(() => {
        const reminderElement = document.getElementById('continueReminder');
        if (reminderElement) {
            reminderElement.remove();
        }
    }, 5000);
}

// Function to show the undo button
function showUndoButton() {
    document.getElementById('undoButton').classList.remove('hidden');
}

// Function to hide the undo button
function hideUndoButton() {
    document.getElementById('undoButton').classList.add('hidden');
}

// Function to show the reset button
function showResetButton() {
    document.getElementById('resetButton').classList.remove('hidden');
}

// Function to undo the last calculation
function undoLastCalculation() {
    if (days.length > 0) {
        days.pop(); // Remove the last day's data
        const results = document.getElementById('results');
        if (results.lastChild) {
            results.removeChild(results.lastChild); // Remove the last result displayed
        }
        updateSummary(); // Update the summary

        if (days.length === 0) {
            hideUndoButton(); // Hide undo button if no more days
        }
    }
}

// Function to reset all calculations and start over
function resetAllCalculations() {
    days = []; // Clear all day data
    document.getElementById('results').innerHTML = ''; // Clear results display
    document.getElementById('summary').innerHTML = ''; // Clear summary
    document.getElementById('payForm').classList.remove('hidden'); // Show the form
    document.getElementById('continuePrompt').classList.add('hidden'); // Hide continue prompt
    hideUndoButton(); // Hide undo button
    document.getElementById('payForm').reset(); // Reset the form inputs
    document.querySelector('.holidayMultiplier').style.display = 'none'; // Reset multiplier visibility
    isCalculating = false; // Reset calculating flag
    clearErrorMessages(); // Clear any error messages
}

// Function to clear all error messages
function clearErrorMessages() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => element.textContent = '');
}

// Event listener for "Yes" button (add another day)
document.getElementById('yesButton').addEventListener('click', function() {
    document.getElementById('continuePrompt').classList.add('hidden'); // Hide continue prompt
    document.getElementById('payForm').reset(); // Reset the form inputs
    isCalculating = false; // Reset calculating flag
    clearErrorMessages(); // Clear error messages

    // Hide the holiday multiplier field when starting a new calculation
    document.querySelector('.holidayMultiplier').style.display = 'none';

    // Remove the event listener that shows the reminder
    document.getElementById('payForm').removeEventListener('submit', showContinueReminder);
});

// Event listener for "No" button (finish calculations)
document.getElementById('noButton').addEventListener('click', function() {
    document.getElementById('continuePrompt').classList.add('hidden'); // Hide continue prompt
    document.getElementById('payForm').classList.add('hidden'); // Hide the form
    showResetButton(); // Ensure reset button is visible

    // Remove the event listener that shows the reminder
    document.getElementById('payForm').removeEventListener('submit', showContinueReminder);
});

// Event listener for reset button
document.getElementById('resetButton').addEventListener('click', resetAllCalculations);

// Event listener for undo button
document.getElementById('undoButton').addEventListener('click', undoLastCalculation);

// Event listener for help button (assuming there's a help modal)
document.getElementById('helpButton').addEventListener('click', function() {
    document.getElementById('helpModal').style.display = 'flex';
});

// Event listener for closing help modal
document.querySelector('.close').addEventListener('click', function() {
    document.getElementById('helpModal').style.display = 'none';
});

// Event listener for clicking outside help modal to close it
window.addEventListener('click', function(event) {
    const modal = document.getElementById('helpModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Set the default date to today in the local time zone
let today = new Date();
today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
document.getElementById('workDate').value = today.toISOString().split('T')[0];
