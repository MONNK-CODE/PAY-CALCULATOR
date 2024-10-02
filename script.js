// Array to store all calculated days
let days = [];
// Flag to prevent multiple calculations before user confirms
let isCalculating = false;

// Function to calculate pay based on input
function calculatePay(hourlyWage, hoursWorked, isHoliday, customTaxRate) {
    if (isHoliday.toLowerCase() === 'yes') {
        hourlyWage += hourlyWage / 2; // 50% increase for holiday
    }

    let grossPay = Number((hoursWorked * hourlyWage).toFixed(2));

    let totalTaxRate = customTaxRate ? customTaxRate / 100 : 0.121; // Default 12.1% if no custom rate
    let totalTax = Number((grossPay * totalTaxRate).toFixed(2));

    let netPay = Number((grossPay - totalTax).toFixed(2));

    return { grossPay, totalTax, netPay };
}

// Function to format date as "Month Day, Year" in local time zone
function formatDate(dateStr) {
    const dt = new Date(dateStr + 'T00:00:00'); // Add time to ensure date is interpreted in local time zone
    return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

// Function to convert decimal hours to hours and minutes format
function decimalToHoursMinutes(decimalHours) {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    return `${hours} hours and ${minutes} minutes`;
}

// Event listener for form submission
document.getElementById('payForm').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!isCalculating) {
        calculateDay();
    }
});

// Main function to calculate and display results for a day
function calculateDay() {
    const hourlyWage = parseFloat(document.getElementById('hourlyWage').value);
    let hoursWorked = document.getElementById('hoursWorked').value;
    const isHoliday = document.getElementById('isHoliday').value;
    const workDate = document.getElementById('workDate').value;
    const customTaxRate = parseFloat(document.getElementById('customTaxRate').value) || null;

    const { isValid, errors } = validateInputs(hourlyWage, hoursWorked, workDate, customTaxRate);
    if (!isValid) {
        Object.keys(errors).forEach(key => updateErrorMessage(key, errors[key]));
        return;
    }

    if (hoursWorked.includes('.')) {
        const [hours, minutes] = hoursWorked.split('.').map(Number);
        hoursWorked = hours + (minutes / 60);
    } else {
        hoursWorked = parseFloat(hoursWorked);
    }

    const { grossPay, totalTax, netPay } = calculatePay(hourlyWage, hoursWorked, isHoliday, customTaxRate);

    const dayData = {
        workDate,
        hoursWorked,
        hourlyWage,
        grossPay,
        totalTax,
        netPay,
        customTaxRate
    };
    days.push(dayData);

    const formattedDate = formatDate(workDate);
    const hoursMinutesFormat = decimalToHoursMinutes(hoursWorked);

    const results = document.getElementById('results');
    const dayElement = document.createElement('div');
    dayElement.className = 'day-result';
    dayElement.innerHTML = `
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
            ${customTaxRate ? `<p>Custom Tax Rate: ${customTaxRate}%</p>` : ''}
        </div>
    `;
    results.appendChild(dayElement);

    dayElement.querySelector('.day-header').addEventListener('click', function() {
        this.classList.toggle('expanded');
        const content = this.nextElementSibling;
        content.classList.toggle('expanded');
    });

    updateSummary();
    showContinuePrompt();
    showUndoButton();
    showResetButton(); // Always show reset button after a calculation
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

    if (isNaN(hourlyWage) || hourlyWage <= 0) {
        errors.hourlyWage = "Please enter a valid hourly wage.";
        isValid = false;
    }

    if (!/^\d+(\.\d{1,2})?$/.test(hoursWorked)) {
        errors.hoursWorked = "Please enter valid hours worked (e.g., 8.5 or 8.30).";
        isValid = false;
    }

    if (!workDate) {
        errors.workDate = "Please select a work date.";
        isValid = false;
    }

    if (customTaxRate !== null && (isNaN(customTaxRate) || customTaxRate < 0 || customTaxRate > 100)) {
        errors.customTaxRate = "Please enter a valid tax rate between 0 and 100.";
        isValid = false;
    }

    return { isValid, errors };
}

// Function to update error messages
function updateErrorMessage(inputId, message) {
    let errorElement = document.getElementById(inputId + 'Error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = inputId + 'Error';
        errorElement.className = 'error-message';
        const inputElement = document.getElementById(inputId);
        inputElement.parentNode.insertBefore(errorElement, inputElement.nextSibling);
    }
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
        days.pop();
        const results = document.getElementById('results');
        if (results.lastChild) {
            results.removeChild(results.lastChild);
        }
        updateSummary();

        if (days.length === 0) {
            hideUndoButton();
        }
    }
}

// Function to reset all calculations
function resetAllCalculations() {
    days = [];
    document.getElementById('results').innerHTML = '';
    document.getElementById('summary').innerHTML = '';
    document.getElementById('payForm').classList.remove('hidden');
    document.getElementById('continuePrompt').classList.add('hidden');
    hideUndoButton();
    document.getElementById('payForm').reset();
    isCalculating = false;
    clearErrorMessages();
}

// Function to clear all error messages
function clearErrorMessages() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => element.textContent = '');
}

// Event listener for "Yes" button (add another day)
document.getElementById('yesButton').addEventListener('click', function() {
    document.getElementById('continuePrompt').classList.add('hidden');
    document.getElementById('payForm').reset();
    isCalculating = false;
    clearErrorMessages();

    // Remove the event listener that shows the reminder
    document.getElementById('payForm').removeEventListener('submit', showContinueReminder);
});

// Event listener for "No" button (finish calculations)
document.getElementById('noButton').addEventListener('click', function() {
    document.getElementById('continuePrompt').classList.add('hidden');
    document.getElementById('payForm').classList.add('hidden');
    showResetButton(); // Ensure reset button is visible

    // Remove the event listener that shows the reminder
    document.getElementById('payForm').removeEventListener('submit', showContinueReminder);
});

// Event listener for reset button
document.getElementById('resetButton').addEventListener('click', resetAllCalculations);

// Event listener for undo button
document.getElementById('undoButton').addEventListener('click', undoLastCalculation);

// Event listener for help button
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