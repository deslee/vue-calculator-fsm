import { expect, test } from 'vitest'
import { CalculatorEvent, NumberEvent } from './CalculatorEvent'
import { calculatorMachine } from './Machine'

class Calculator {
    state = calculatorMachine.initialState

    constructor() {
    }

    transition(action: CalculatorEvent) {
        this.state = calculatorMachine.transition(this.state, action);
    }

    number(value: NumberEvent['value']) {
        this.transition({ 'type': 'NUMBER', value })
    }

    decimal() {
        this.transition({ type: 'DECIMAL' })
    }

    plus() {
        this.transition({ 'type': 'BINARY', value: '+' })
    }

    times() {
        this.transition({ 'type': 'BINARY', value: '×' })
    }

    squared() {
        this.transition({ 'type': 'UNARY', value: 'x²' })
    }

    equals() {
        this.transition({ type: 'EVALUATE' })
    }
}

test('1 + 1 =', () => {
    let calculator = new Calculator();
    calculator.number(1)
    expect(calculator.state.value).toBe('input_first_operand')
    calculator.plus()
    expect(calculator.state.value).toBe('input_second_operand')
    calculator.number(1)
    expect(calculator.state.value).toBe('input_second_operand')
    calculator.equals();
    expect(calculator.state.value).toBe('display_result')
    expect(calculator.state.context.result).toBe(2)
})

test('1 =', () => {
    let calculator = new Calculator();
    calculator.number(1)
    expect(calculator.state.value).toBe('input_first_operand')
    calculator.equals();
    expect(calculator.state.value).toBe('display_result')
    expect(calculator.state.context.result).toBe(1)
})

test('=', () => {
    let calculator = new Calculator();
    calculator.equals();
    expect(calculator.state.value).toBe('display_result')
    expect(calculator.state.context.result).toBe(0)
})

test('1.2 + 1.1 = 2.3', () => {
    let calculator = new Calculator();
    calculator.number(1)
    calculator.decimal()
    calculator.number(2)
    expect(calculator.state.value).toBe('input_first_operand')
    calculator.plus()
    expect(calculator.state.value).toBe('input_second_operand')
    calculator.number(1)
    calculator.decimal()
    calculator.number(1)
    expect(calculator.state.value).toBe('input_second_operand')
    calculator.equals();
    expect(calculator.state.value).toBe('display_result')
    expect(calculator.state.context.result).toBe(2.3)
})

test('1.2 squared + 1.1 squared = 2.65', () => {
    let calculator = new Calculator();
    calculator.number(1)
    calculator.decimal()
    calculator.number(2)
    calculator.squared()
    expect(calculator.state.value).toBe('input_first_operand_with_unary')
    calculator.plus()
    expect(calculator.state.value).toBe('input_second_operand')
    calculator.number(1)
    calculator.decimal()
    calculator.number(1)
    calculator.squared()
    expect(calculator.state.value).toBe('input_second_operand_with_unary')
    calculator.equals();
    expect(calculator.state.value).toBe('display_result')
    expect(calculator.state.context.result).toBeCloseTo(2.65)
})

test('2 * 3 = 6', () => {
    let calculator = new Calculator();
    calculator.number(2);
    calculator.times();
    calculator.number(3);
    calculator.equals();
    expect(calculator.state.value).toBe('display_result')
    expect(calculator.state.context.result).toBe(6)
})

test('2 sqrt sqrt sqrt = 256', () => {
    let calculator = new Calculator();
    calculator.number(2);
    calculator.squared()
    calculator.squared()
    calculator.squared()
    expect(calculator.state.value).toBe('input_first_operand_with_unary')
    calculator.equals();
    expect(calculator.state.context.result).toBe(256)
})

test('2 sqrt sqrt sqrt 3 + 3 = 6', () => {
    let calculator = new Calculator();
    calculator.number(2);
    calculator.squared()
    calculator.squared()
    calculator.squared()
    expect(calculator.state.value).toBe('input_first_operand_with_unary')
    calculator.number(3);
    calculator.plus()
    calculator.number(3);
    calculator.equals();
    expect(calculator.state.context.result).toBe(6)
})

test('2 + 2 + 2 = 6', () => {
    let calculator = new Calculator();
    calculator.number(2);
    calculator.plus()
    calculator.number(2);
    calculator.plus()
    calculator.number(2);
    calculator.equals();
    expect(calculator.state.context.result).toBe(6)
})

test('2 + 2 squared squared + 2 = 20', () => {
    let calculator = new Calculator();
    calculator.number(2);
    calculator.plus()
    calculator.number(2);
    calculator.squared()
    calculator.squared()
    calculator.plus()
    calculator.number(2);
    calculator.equals();
    expect(calculator.state.context.result).toBe(20)
})

test('3 squared 4 + 2 = 6', () => {
    let calculator = new Calculator();
    calculator.number(3);
    calculator.squared()
    calculator.number(4);
    calculator.plus()
    calculator.number(2);
    calculator.equals();
    expect(calculator.state.context.result).toBe(6)
})

test('1 + 3 squared 4 + 2 = 7', () => {
    let calculator = new Calculator();
    calculator.number(1);
    calculator.plus()
    calculator.number(3)
    calculator.squared()
    calculator.number(4);
    calculator.plus()
    calculator.number(2);
    calculator.equals();
    expect(calculator.state.context.result).toBe(7)
})

test('2.2....3 + 3 = 5.23', () => {
    let calculator = new Calculator();
    calculator.number(2);
    calculator.decimal()
    calculator.number(2);
    calculator.decimal()
    calculator.decimal()
    calculator.decimal()
    calculator.decimal()
    calculator.number(3);
    calculator.plus()
    calculator.number(3);
    calculator.equals();
    expect(calculator.state.value).toBe('display_result')
    expect(calculator.state.context.result).toBe(5.23)
})
