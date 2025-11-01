const dayjs = require('dayjs')

console.log(dayjs('2025-03-11').daysInMonth())

console.log(dayjs('2025-11-11').startOf('month').format('YYYY-MM-DD'))

console.log(dayjs('2025-11-11').endOf('month').format('YYYY-MM-DD'))
