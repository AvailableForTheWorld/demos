export class Operation {
  protected numberA = 0
  protected numberB = 0
  public get NumberA() {
    return this.numberA
  }
  public set NumberA(value: number) {
    this.numberA = value
  }
  public get NumberB() {
    return this.numberB
  }
  public set NumberB(value: number) {
    this.numberB = value
  }
  getResult = () => {
    return 0
  }
}

class OperationAdd extends Operation {
  getResult = () => {
    return this.numberA + this.numberB
  }
}

class OperationSub extends Operation {
  getResult = () => {
    return this.numberA - this.numberB
  }
}

class OperationMul extends Operation {
  getResult = () => {
    return this.numberA * this.numberB
  }
}

class OperationDiv extends Operation {
  getResult = () => {
    if (this.numberB === 0) {
      throw new Error('Divisor cannot be 0')
    }
    return this.numberA / this.numberB
  }
}

export class OperationFactory {
  static createOperation: (op: string) => Operation = (operation: string) => {
    switch (operation) {
      case '+':
        return new OperationAdd()
      case '-':
        return new OperationSub()
      case '*':
        return new OperationMul()
      case '/':
        return new OperationDiv()
      default:
        throw new Error(`Unsupported operation: ${operation}`)
    }
  }
}
