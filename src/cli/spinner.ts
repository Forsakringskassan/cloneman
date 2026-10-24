import yoctoSpinner, {
    type Options,
    type Spinner as YoctoSpinner,
} from "yocto-spinner";
import { isTTY } from "./is-tty";

function createConsoleSpinner(options?: Options): YoctoSpinner {
    let text = options?.text ?? "";

    function log(this: YoctoSpinner, newText?: string): YoctoSpinner {
        if (newText !== undefined) {
            text = newText;
        }
        console.error(text);
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
    if (isTTY()) {
        return yoctoSpinner(options);
    }

    return createConsoleSpinner(options);
}
