import { assign, createMachine, StateNodeConfig, TransitionConfigOrTarget } from 'xstate';
import { CalculatorEvent, EvaluateEvent, UnaryEvent } from './CalculatorEvent';

interface Operand {
    value: number;
    has_decimal: boolean;
    unaryOperators: UnaryEvent['value'][];
}

interface Context {
    first_operand: Operand | null;
    second_operand: Operand | null;
    operator: null | "+" | "-" | "×" | "÷";
    result: number | null;
}

const initial_operand: Operand = {
    value: 0,
    has_decimal: false,
    unaryOperators: []
}

function compute_operand(operand: Operand | null) {
    if (!operand) {
        return 0;
    }
    else {
        let value = operand.value;
        for (const unaryOperator of operand.unaryOperators) {
            if (unaryOperator === 'x²') {
                value = Math.pow(value, 2)
            }
            else if (unaryOperator === '√') {
                value = Math.sqrt(value)
            }
        }
        return value;
    }
}

function getResult(context: Context, event: CalculatorEvent) {
    if (context.operator === '+') {
        return compute_operand(context.first_operand) + compute_operand(context.second_operand)
    }
    else if (context.operator === '×') {
        return compute_operand(context.first_operand) * compute_operand(context.second_operand)
    }
    else if (context.operator === '÷') {
        return compute_operand(context.first_operand) / compute_operand(context.second_operand)
    }
    else if (context.operator === '-') {
        return compute_operand(context.first_operand) - compute_operand(context.second_operand)
    }
    else {
        return compute_operand(context.first_operand)
    }
}

const evaluate_transition: TransitionConfigOrTarget<Context, EvaluateEvent> = {
    target: 'display_result',
    actions: assign({
        // result: (context, event) => ((context.first_operand ?? initial_operand).value + (context.second_operand ?? initial_operand).value)
        result: (context, event) => getResult(context, event)
    })
}

const first_operand_state_transitions: StateNodeConfig<Context, any, CalculatorEvent>['on'] = {
    NUMBER: {
        target: 'input_first_operand',
        actions: assign({
            first_operand: (context, event) => ({
                ...context.first_operand!,
                value: Number(context.first_operand!.value.toString() + event.value.toString()),
            })
        })
    },
    UNARY: {
        target: 'input_first_operand_with_unary',
        actions: assign({
            first_operand: (context, event) => ({
                ...context.first_operand!,
                unaryOperators: [...context.first_operand!.unaryOperators, event.value]
            })
        }),
    },
    DECIMAL: {
        target: 'input_first_operand_decimal_pending',
        actions: assign({
            first_operand: (context, event) => ({
                ...context.first_operand!,
                has_decimal: true
            })
        }),
        cond: (context, event) => !context.first_operand!.has_decimal
    },
    BINARY: {
        target: "input_second_operand",
        actions: assign({
            operator: (context, event) => event.value,
        }),
    },
    EVALUATE: evaluate_transition
}


const second_operand_state_transitions: StateNodeConfig<Context, any, CalculatorEvent>['on'] = {
    NUMBER: {
        target: 'input_second_operand',
        actions: assign({
            second_operand: (context, event) => ({
                ...initial_operand,
                ...context.second_operand,
                value: Number((context.second_operand ?? initial_operand).value.toString() + event.value.toString()),
            })
        })
    },
    UNARY: {
        target: 'input_second_operand_with_unary',
        actions: assign({
            second_operand: (context, event) => ({
                ...context.second_operand!,
                unaryOperators: [...context.second_operand!.unaryOperators, event.value]
            })
        }),
    },
    DECIMAL: {
        target: 'input_second_operand_decimal_pending',
        actions: assign({
            second_operand: (context, event) => ({
                ...context.second_operand!,
                has_decimal: true
            })
        }),
        cond: (context, event) => !context.second_operand!.has_decimal
    },
    BINARY: {
        target: "input_second_operand",
        actions: assign({
            first_operand: (context, event) => ({
                ...initial_operand,
                value: getResult(context, event)
            }),
            second_operand: (context, event) => initial_operand,
            operator: (context, event) => event.value,
        }),
    },
    EVALUATE: evaluate_transition
}

const initial_state_transitions: StateNodeConfig<Context, any, CalculatorEvent>['on'] = {
    NUMBER: {
        target: "input_first_operand",
        actions: assign({
            first_operand: (context, event) => ({
                ...initial_operand,
                value: event.value
            }),
        }),
    },
    UNARY: {
        target: "input_first_operand_with_unary",
        actions: assign({
            first_operand: (context, event) => ({
                value: 0,
                has_decimal: false,
                unaryOperators: [event.value],
            }),
        }),
    },
    BINARY: {
        target: "input_second_operand",
        actions: assign({
            first_operand: (context, event) => ({
                ...initial_operand,
            }),
            operator: (context, event) => event.value,
        }),
    },
    EVALUATE: evaluate_transition
}

export const calculatorMachine = createMachine<Context, CalculatorEvent>({
    id: 'calculator',
    initial: 'initial',
    context: {
        first_operand: null,
        second_operand: null,
        operator: null,
        result: null,
    },
    states: {
        initial: {
            on: {
                ...initial_state_transitions
            }
        },
        input_first_operand: {
            on: {
                ...first_operand_state_transitions
            }
        },
        input_first_operand_decimal_pending: {
            on: {
                ...first_operand_state_transitions,
                NUMBER: {
                    target: 'input_first_operand',
                    actions: assign({
                        first_operand: (context, event) => ({
                            ...context.first_operand!,
                            value: Number(context.first_operand!.value.toString() + '.' + event.value.toString()),
                        })
                    })
                },
            }
        },
        input_first_operand_with_unary: {
            on: {
                ...first_operand_state_transitions,
                NUMBER: {
                    target: 'input_first_operand',
                    actions: assign({
                        first_operand: (context, event) => ({
                            unaryOperators: [],
                            has_decimal: false,
                            value: event.value,
                        })
                    })
                },
            },
        },
        input_second_operand: {
            on: {
                ...second_operand_state_transitions
            }
        },
        input_second_operand_decimal_pending: {
            on: {
                ...second_operand_state_transitions,
                NUMBER: {
                    target: 'input_second_operand',
                    actions: assign({
                        second_operand: (context, event) => ({
                            ...context.second_operand!,
                            value: Number(context.second_operand!.value.toString() + '.' + event.value.toString()),
                        })
                    })
                },
            }
        },
        input_second_operand_with_unary: {
            on: {
                ...second_operand_state_transitions,
                NUMBER: {
                    target: 'input_second_operand',
                    actions: assign({
                        second_operand: (context, event) => ({
                            unaryOperators: [],
                            has_decimal: false,
                            value: event.value
                        })
                    })
                },
            },
        },
        display_result: {
            on: {
                ...initial_state_transitions
            }
        }
    }
})