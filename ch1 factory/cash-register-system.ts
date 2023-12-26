abstract class CashSuper {
  constructor() {}
  abstract acceptCash(money: number): number
}

class CashNormal extends CashSuper {
  acceptCash(money: number): number {
    return money
  }
}

class CashRebate extends CashSuper {
  constructor(public rebate: number) {
    super()
  }
  acceptCash(money: number): number {
    return money * this.rebate
  }
}

class CashReturn extends CashSuper {
  constructor(public moneyCondition: number, public moneyReturn: number) {
    super()
  }
  acceptCash(money: number): number {
    return money - Math.floor(money / this.moneyCondition) * this.moneyReturn
  }
}

class CreateCashFactory {
  static createCashAccept(type: string): CashSuper {
    let res: CashSuper | null = null
    switch (type) {
      case '正常收费':
        res = new CashNormal()
        break
      case '满300返100':
        res = new CashReturn(300, 100)
        break
      case '打8折':
        res = new CashRebate(0.8)
        break
    }
    return res!
  }
}
