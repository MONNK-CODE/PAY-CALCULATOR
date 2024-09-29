// Array to store all calculated days
let days = [];
// Flag to prevent multiple calculations before user confirms
let isCalculating = false;

// Function to calculate pay based on input
function calculatePay(hourlyWage, hoursWorked, isHoliday) {
    // Apply holiday rate if applicable
    if (isHoliday.toLowerCase() === 'yes') {
        hourlyWage += hourlyWage / 2; // 50% increase for holiday
    }

    // Calculate gross pay and taxes
    let grossPay = Number((hoursWorked * hourlyWage).toFixed(2));
    let med = Number((0.0145 * grossPay).toFixed(2));      // Medicare tax
    let osadi = Number((0.062 * grossPay).toFixed(2));     // Social Security tax
    let withhold = Number((0.0495 * grossPay).toFixed(2)); // State income tax
    let totalTax = Number((med + osadi + withhold).toFixed(2));
    let netPay = Number((grossPay - totalTax).toFixed(2));

    return { grossPay, totalTax, netPay };
}

// Function to format date as "Month Day, Year"
function formatDate(dateStr) {
    const dt = new Date(dateStr);
    return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Function to convert decimal hours to hours and minutes format
function decimalToHoursMinutes(decimalHours) {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    return `${hours} hours and ${minutes} minutes`;
}

// Event listener for form submission
document.getElementById('payForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent form from submitting traditionally
    if (!isCalculating) {
        calculateDay(); // Only calculate if not already in process
    }
});

// Main function to calculate and display results for a day
function calculateDay() {
    // Get input values
    const hourlyWage = parseFloat(document.getElementById('hourlyWage').value);
    let hoursWorked = document.getElementById('hoursWorked').value;
    const isHoliday = document.getElementById('isHoliday').value;
    const workDate = document.getElementById('workDate').value;

    // Validate inputs
    if (!validateInputs(hourlyWage, hoursWorked, workDate)) {
        return; // Stop if inputs are invalid
    }

    // Convert hours.minutes format to decimal if necessary
    if (hoursWorked.includes('.')) {
        const [hours, minutes] = hoursWorked.split('.').map(Number);
        hoursWorked = hours + (minutes / 60);
    } else {
        hoursWorked = parseFloat(hoursWorked);
    }

    // Calculate pay
    const { grossPay, totalTax, netPay } = calculatePay(hourlyWage, hoursWorked, isHoliday);

    // Store day data
    const dayData = {
        workDate,
        hoursWorked,
        hourlyWage,
        grossPay,
        totalTax,
        netPay
    };
    days.push(dayData);

    // Format date and hours for display
    const formattedDate = formatDate(workDate);
    const hoursMinutesFormat = decimalToHoursMinutes(hoursWorked);

    // Create and append day result element
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
        </div>
    `;
    results.appendChild(dayElement);

    // Add click event for expanding/collapsing day details
    dayElement.querySelector('.day-header').addEventListener('click', function() {
        const content = this.nextElementSibling;
        content.classList.toggle('expanded');
        this.querySelector('.expand-arrow').textContent = content.classList.contains('expanded') ? '▲' : '▼';
    });

    updateSummary();
    showContinuePrompt();
    showResetButton();
    isCalculating = true; // Prevent further calculations until user confirms
}

// Function to validate user inputs
function validateInputs(hourlyWage, hoursWorked, workDate) {
    let isValid = true;

    // Validate hourly wage
    if (isNaN(hourlyWage) || hourlyWage <= 0) {
        updateErrorMessage('hourlyWage', "Please enter a valid hourly wage.");
        isValid = false;
    } else {
        updateErrorMessage('hourlyWage', "");
    }

    // Validate hours worked
    if (!/^\d+(\.\d{1,2})?$/.test(hoursWorked)) {
        updateErrorMessage('hoursWorked', "Please enter valid hours worked (e.g., 8.5 or 8.30).");
        isValid = false;
    } else {
        updateErrorMessage('hoursWorked', "");
    }

    // Validate work date
    if (!workDate) {
        updateErrorMessage('workDate', "Please select a work date.");
        isValid = false;
    } else {
        updateErrorMessage('workDate', "");
    }

    return isValid;
}

// Function to update error messages
function updateErrorMessage(inputId, message) {
    const errorElement = document.getElementById(inputId + 'Error');
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

// Function to show the reset button
function showResetButton() {
    document.getElementById('resetButton').classList.remove('hidden');
}

// Function to reset all calculations
function resetAllCalculations() {
    days = [];
    document.getElementById('results').innerHTML = '';
    document.getElementById('summary').innerHTML = '';
    document.getElementById('payForm').classList.remove('hidden');
    document.getElementById('continuePrompt').classList.add('hidden');
    document.getElementById('resetButton').classList.add('hidden');
    document.getElementById('payForm').reset();
    isCalculating = false;
    clearErrorMessages();
}

// Function to clear all error messages
function clearErrorMessages() {
    updateErrorMessage('hourlyWage', "");
    updateErrorMessage('hoursWorked', "");
    updateErrorMessage('workDate', "");
}

// Event listener for "Yes" button (add another day)
document.getElementById('yesButton').addEventListener('click', function() {
    document.getElementById('continuePrompt').classList.add('hidden');
    document.getElementById('payForm').reset();
    isCalculating = false;
    clearErrorMessages();
});

// Event listener for "No" button (finish calculations)
document.getElementById('noButton').addEventListener('click', function() {
    document.getElementById('continuePrompt').classList.add('hidden');
    document.getElementById('payForm').classList.add('hidden');
});

// Event listener for reset button
document.getElementById('resetButton').addEventListener('click', resetAllCalculations);

// Set the default date to today
document.getElementById('workDate').valueAsDate = new Date();