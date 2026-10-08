import yoctoSpinner, {
    type Options,
    type Spinner as YoctoSpinner,
} from "yocto-spinner";

function createConsoleSpinner(options?: Options): YoctoSpinner {
    let text = options?.text ?? "";

    function log(this: YoctoSpinner, newText?: string): YoctoSpinner {
        if (newText !== undefined) {
            text = newText;
        }
        console.log(text);
        return this;
    }

    const spinner: YoctoSpinner = {
        get text() {
            return text;
        },
        set text(newText) {
            text = newText;
            log.call(spinner);
        },
        color: "cyan",
        start: log,
        stop: log,
        success: log,
        error: log,
        warning: log,
        info: log,
        clear() {
            return spinner;
        },
        get isSpinning(): boolean {
            return false;
        },
    };

    return spinner;
}

export function createSpinner(options?: Options): YoctoSpinner {
    if (process.stdout.isTTY) {
        return yoctoSpinner(options);
    }

    return createConsoleSpinner(options);
}
