export type DecimalEvent = {
    type: 'DECIMAL';
}

export type NumberEvent = {
    type: "NUMBER";
    value: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
}

export type UnaryEvent = {
    type: "UNARY";
    value: "x²" | "√" | "%";
}

export type BinaryEvent = {
    type: "BINARY";
    value: "+" | "-" | "×" | "÷";
}

export type EvaluateEvent = {
    type: 'EVALUATE'
}

export type CalculatorEvent =
    | DecimalEvent
    | NumberEvent
    | UnaryEvent
    | BinaryEvent
    | EvaluateEvent;
