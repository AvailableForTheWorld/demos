import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { Operation, OperationFactory } from './operation-list'

input.setRawMode(true)
input.resume()
input.setEncoding('utf8')

input.on('data', (key) => {
  const keyStr = key.toString()
  if (keyStr === 'q') {
    process.exit()
  }
})

const rl = readline.createInterface({ input, output })

async function main() {
  const numA = parseFloat(await rl.question('Please input number A: '))
  const numB = parseFloat(await rl.question('Please input number B: '))
  const operator = await rl.question('Please input operator: ')
  const op = OperationFactory.createOperation(operator)
  op.NumberA = Number.isNaN(numA) ? 0 : numA
  op.NumberB = Number.isNaN(numB) ? 0 : numB
  const result = op.getResult()
  console.log(`The result is ${result}`)
  rl.close()
}

// console.log('process.argv: ', process.argv)
main()
