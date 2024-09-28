let days = [];

function calculatePay(hourlyWage, hoursWorked, isHoliday) {
    if (isHoliday.toLowerCase() === 'yes') {
        hourlyWage += hourlyWage / 2;
    }

    let grossPay = Number((hoursWorked * hourlyWage).toFixed(2));
    let med = Number((0.0145 * grossPay).toFixed(2));
    let osadi = Number((0.062 * grossPay).toFixed(2));
    let withhold = Number((0.0495 * grossPay).toFixed(2));
    let totalTax = Number((med + osadi + withhold).toFixed(2));
    let netPay = Number((grossPay - totalTax).toFixed(2));

    return { grossPay, totalTax, netPay };
}

document.getElementById('payForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateDay();
});

function calculateDay() {
    const hourlyWage = parseFloat(document.getElementById('hourlyWage').value);
    let hoursWorked = document.getElementById('hoursWorked').value;
    const isHoliday = document.getElementById('isHoliday').value;

    if (hoursWorked.includes('.')) {
        const [hours, minutes] = hoursWorked.split('.').map(Number);
        hoursWorked = hours + (minutes / 60);
    } else {
        hoursWorked = parseFloat(hoursWorked);
    }

    const { grossPay, totalTax, netPay } = calculatePay(hourlyWage, hoursWorked, isHoliday);

    const dayData = {
        hoursWorked,
        hourlyWage,
        grossPay,
        totalTax,
        netPay
    };

    days.push(dayData);

    const results = document.getElementById('results');
    const dayElement = document.createElement('div');
    dayElement.className = 'day-result';
    dayElement.innerHTML = `
        <div class="day-header">
            <h2>Day ${days.length}</h2>
            <span class="expand-arrow">▼</span>
        </div>
        <div class="day-content">
            <p>Hours Worked: ${hoursWorked.toFixed(2)}</p>
            <p>Hourly Wage: $${hourlyWage.toFixed(2)}</p>
            <p>Gross Pay: $${grossPay.toFixed(2)}</p>
            <p>Total Tax: $${totalTax.toFixed(2)}</p>
            <p>Net Pay: $${netPay.toFixed(2)}</p>
        </div>
    `;
    results.appendChild(dayElement);

    dayElement.querySelector('.day-header').addEventListener('click', function() {
        const content = this.nextElementSibling;
        content.classList.toggle('expanded');
        this.querySelector('.expand-arrow').textContent = content.classList.contains('expanded') ? '▲' : '▼';
    });

    updateSummary();
    showContinuePrompt();
    showResetButton(); 
}

function updateSummary() {
    const totalHoursWorked = days.reduce((sum, day) => sum + day.hoursWorked, 0);
    const totalGrossPay = days.reduce((sum, day) => sum + day.grossPay, 0);
    const totalTax = days.reduce((sum, day) => sum + day.totalTax, 0);
    const totalNetPay = days.reduce((sum, day) => sum + day.netPay, 0);

    const summary = document.getElementById('summary');
    summary.innerHTML = `
        <h2>Summary for all days</h2>
        <p>Total Hours Worked: ${totalHoursWorked.toFixed(2)}</p>
        <p>Total Gross Pay: $${totalGrossPay.toFixed(2)}</p>
        <p>Total Tax: $${totalTax.toFixed(2)}</p>
        <p>Total Net Pay: $${totalNetPay.toFixed(2)}</p>
    `;
}

function showContinuePrompt() {
    document.getElementById('continuePrompt').classList.remove('hidden');
}

document.getElementById('yesButton').addEventListener('click', function() {
    document.getElementById('continuePrompt').classList.add('hidden');
    document.getElementById('payForm').reset();
});

document.getElementById('noButton').addEventListener('click', function() {
    document.getElementById('continuePrompt').classList.add('hidden');
    document.getElementById('payForm').classList.add('hidden');
});

function showResetButton() {
    document.getElementById('resetButton').classList.remove('hidden');
}

function resetAllCalculations() {
    days = [];
    document.getElementById('results').innerHTML = '';
    document.getElementById('summary').innerHTML = '';
    document.getElementById('payForm').classList.remove('hidden');
    document.getElementById('continuePrompt').classList.add('hidden');
    document.getElementById('resetButton').classList.add('hidden');
    document.getElementById('payForm').reset();
}

document.getElementById('resetButton').addEventListener('click', resetAllCalculations);